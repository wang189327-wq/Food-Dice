"""Build Android APKs with the Android SDK; no Gradle or bundled private keys required."""
from pathlib import Path
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT / 'android'
VERSION = json.loads((ROOT / 'version.json').read_text(encoding='utf-8'))
ANDROID = '{http://schemas.android.com/apk/res/android}'
ET.register_namespace('android', ANDROID[1:-1])


def find_toolchain():
    sdk = os.environ.get('MENU_TOOLCHAIN') or os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
    candidates = [Path(sdk)] if sdk else [ROOT.parent / '离线构建资源/toolchain', ROOT.parent / 'settings-update/toolchain']
    tools = next((p for p in candidates if p.is_dir()), None)
    if tools is None:
        raise FileNotFoundError('Set ANDROID_HOME (standard SDK) or MENU_TOOLCHAIN (offline tools)')
    java_home = os.environ.get('JAVA_HOME')
    jdk = Path(java_home) if java_home else next((tools / 'jdk').glob('jdk-*'), None)
    if not jdk or not jdk.is_dir():
        raise FileNotFoundError('Set JAVA_HOME to JDK 17 or later')
    custom = tools / 'build-tools/android-15'
    build_tools = custom if custom.is_dir() else tools / 'build-tools' / f"{VERSION['targetSdk']}.0.0"
    platform = tools / f"platforms/android-{VERSION['targetSdk']}/android.jar"
    if not platform.is_file():
        platform = tools / f"platform/android-{VERSION['targetSdk']}/android.jar"
    if not platform.is_file() or not build_tools.is_dir():
        raise FileNotFoundError('Install Android platform and build-tools ' + str(VERSION['targetSdk']))
    return tools.resolve(), jdk.resolve(), build_tools.resolve(), platform.resolve()


def build(debug=False, public_assets=False):
    _, jdk, build_tools, platform = find_toolchain()
    suffix = '.exe' if os.name == 'nt' else ''
    env = {**os.environ, 'JAVA_HOME': str(jdk), 'PATH': str(jdk / 'bin') + os.pathsep + os.environ['PATH']}

    def run(args):
        command = [str(args[0])]
        for arg in args[1:]:
            command.append(os.path.relpath(arg, PROJECT) if isinstance(arg, Path)
                           and arg.drive.lower() == PROJECT.drive.lower() else str(arg))
        subprocess.run(command, cwd=PROJECT, env=env, check=True)

    build_root = PROJECT / 'build'
    build_root.mkdir(exist_ok=True)
    if debug:
        signing = build_root / 'debug-signing'
        signing.mkdir(exist_ok=True)
        keystore = signing / 'debug.p12'
        env['MENU_SIGN_PASSWORD'] = 'android'
        alias = 'androiddebugkey'
        if not keystore.exists():
            run([jdk / f'bin/keytool{suffix}', '-genkeypair', '-keystore', keystore, '-storetype', 'PKCS12',
                 '-alias', alias, '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000',
                 '-dname', 'CN=Android Debug,O=Android,C=US', '-storepass:env', 'MENU_SIGN_PASSWORD'])
    else:
        configured = os.environ.get('MENU_SIGN_DIR')
        candidates = [Path(configured)] if configured else [ROOT.parent / '离线构建资源/签名资料', ROOT.parent / 'local-menu/offline-signing']
        signing = next((p for p in candidates if p.is_dir()), None)
        if not signing:
            raise FileNotFoundError('Release requires the original signing key; use --debug for your own build')
        keystore, password = signing / 'menu-release.p12', signing / 'password.txt'
        if not keystore.is_file() or not password.is_file():
            raise FileNotFoundError('Original release key/password missing; never generate a replacement')
        env['MENU_SIGN_PASSWORD'] = password.read_text(encoding='utf-8').strip()
        alias = 'menu'

    with tempfile.TemporaryDirectory(prefix='release-', dir=build_root) as directory:
        work = Path(directory).resolve()
        if not work.is_relative_to(build_root.resolve()):
            raise RuntimeError('Build directory is outside the project')
        assets = work / 'assets'
        shutil.copytree(PROJECT / 'assets', assets, ignore=shutil.ignore_patterns('photos'))
        (assets / 'photos').mkdir()
        for image in (PROJECT / 'assets/photos').iterdir():
            if image.is_file() and (not public_assets or image.name in {'app-cover.jpg', 'placeholder.svg'}):
                shutil.copy2(image, assets / 'photos' / image.name)
        metadata = {'name': VERSION['name'], 'code': VERSION['code'],
                    'bundledPhotos': sorted(p.name for p in (assets / 'photos').iterdir())}
        (assets / 'js/version.js').write_text('const APP_VERSION = ' + json.dumps(metadata) + ';\nexport { APP_VERSION };\n', encoding='utf-8')
        # Keep browser preview metadata aligned with the full local asset pack.
        browser_meta = {**metadata, 'bundledPhotos': sorted(p.name for p in (PROJECT / 'assets/photos').iterdir() if p.is_file())}
        (PROJECT / 'assets/js/version.js').write_text('const APP_VERSION = ' + json.dumps(browser_meta) + ';\nexport { APP_VERSION };\n', encoding='utf-8')
        manifest = ET.parse(PROJECT / 'AndroidManifest.xml')
        manifest_root = manifest.getroot()
        manifest_root.set(ANDROID + 'versionCode', str(VERSION['code']))
        manifest_root.set(ANDROID + 'versionName', VERSION['name'])
        package = manifest_root.get('package')
        if debug:
            manifest_root.set('package', package + '.debug')
            application = manifest_root.find('application')
            application.set(ANDROID + 'label', '美味餐饮·开发版')
            for component in application:
                name = component.get(ANDROID + 'name', '')
                if name.startswith('.'):
                    component.set(ANDROID + 'name', package + name)
            application.find('provider').set(ANDROID + 'authorities', package + '.debug.update')
        manifest_path = work / 'AndroidManifest.xml'
        manifest.write(manifest_path, encoding='utf-8', xml_declaration=True)
        generated = work / 'generated'
        generated.mkdir()
        (generated / 'BuildInfo.java').write_text(
            'package cn.localmenu.app;\nfinal class BuildInfo {\n'
            f'    static final boolean DEBUG = {str(debug).lower()};\n'
            f'    static final int VERSION_CODE = {VERSION["code"]};\n'
            f'    static final String VERSION_NAME = {json.dumps(VERSION["name"])};\n'
            f'    static final String UPDATE_URL = {json.dumps(VERSION["updateBaseUrl"] + "/update.json")};\n'
            '}\n', encoding='utf-8')
        classes, dex = work / 'classes', work / 'dex'
        classes.mkdir()
        dex.mkdir()
        unsigned = work / 'unsigned.apk'
        run([build_tools / f'aapt2{suffix}', 'compile', '--dir', PROJECT / 'res', '-o', work / 'resources.zip'])
        run([build_tools / f'aapt2{suffix}', 'link', '-I', platform, '--manifest', manifest_path, '-A', assets,
             '--min-sdk-version', VERSION['minimumSdk'], '--target-sdk-version', VERSION['targetSdk'],
             '-o', unsigned, work / 'resources.zip'])
        run([jdk / f'bin/javac{suffix}', '-encoding', 'UTF-8', '-source', '8', '-target', '8', '-classpath', platform,
             '-d', classes, *sorted((PROJECT / 'src').rglob('*.java')), generated / 'BuildInfo.java'])
        with zipfile.ZipFile(work / 'classes.jar', 'w') as archive:
            for file in classes.rglob('*.class'):
                archive.write(file, file.relative_to(classes))
        run([jdk / f'bin/java{suffix}', '-cp', build_tools / 'lib/d8.jar', 'com.android.tools.r8.D8',
             '--min-api', VERSION['minimumSdk'], '--lib', platform, '--output', dex, work / 'classes.jar'])
        with zipfile.ZipFile(unsigned) as archive:
            entries = [(e.filename, archive.read(e), e.compress_type) for e in archive.infolist()]
        with zipfile.ZipFile(unsigned, 'w') as archive:
            for name, data, compression in entries:
                archive.writestr(name, data, compress_type=compression)
            for file in dex.glob('*.dex'):
                archive.write(file, file.name)
        signed = work / 'signed.apk'
        run([build_tools / f'zipalign{suffix}', '-f', '-p', '4', unsigned, work / 'aligned.apk'])
        run([jdk / f'bin/java{suffix}', '-jar', build_tools / 'lib/apksigner.jar', 'sign', '--ks', keystore,
             '--ks-key-alias', alias, '--ks-pass', 'env:MENU_SIGN_PASSWORD', '--out', signed, work / 'aligned.apk'])
        run([jdk / f'bin/java{suffix}', '-jar', build_tools / 'lib/apksigner.jar', 'verify', '--verbose', signed])
        run([build_tools / f'aapt2{suffix}', 'dump', 'badging', signed])
        flavor = '-debug' if debug else '-public' if public_assets else ''
        delivery = ROOT / 'delivery'
        delivery.mkdir(exist_ok=True)
        output_name = f'美味餐饮-{VERSION["name"]}{flavor}.apk'
        shutil.copy2(signed, delivery / output_name)
        digest = hashlib.sha256(signed.read_bytes()).hexdigest()
        (delivery / (output_name + '.sha256')).write_text(digest + '  ' + output_name + '\n', encoding='utf-8')
        if not debug:
            publish = ROOT / 'netlify-publish'
            publish.mkdir(exist_ok=True)
            remote_name = f'menu-{VERSION["name"]}{flavor}.apk'
            shutil.copy2(signed, publish / remote_name)
            (publish / 'update.json').write_text(json.dumps({'versionCode': VERSION['code'], 'versionName': VERSION['name'],
                'apkUrl': VERSION.get('releaseAssetBaseUrl', VERSION['updateBaseUrl']) + '/' + remote_name, 'sha256': digest,
                'notes': VERSION['notes']}, ensure_ascii=False, indent=2), encoding='utf-8')
        print('APK_READY', ascii(output_name), digest)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--debug', action='store_true', help='Use a separate package and local debug key')
    parser.add_argument('--public-assets', action='store_true', help='Exclude third-party photos; use placeholders')
    arguments = parser.parse_args()
    build(arguments.debug, arguments.public_assets)
