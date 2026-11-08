package cn.localmenu.app;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.JSONObject;

/** Owns update checking, verified downloads, installation and cache cleanup. */
final class AppUpdater {
    interface Status { void show(String message); }
    private final Activity activity;
    private final SharedPreferences preferences;
    private final Status status;
    private final AtomicBoolean busy = new AtomicBoolean(false);
    private final AtomicBoolean cancelled = new AtomicBoolean(false);
    private volatile JSONObject latest;
    private volatile HttpURLConnection transfer;
    private boolean pendingInstall;
    private static final long DOWNLOAD_LIMIT_MS = 180000;
    private static final long CHECK_LIMIT_MS = 60000;

    AppUpdater(Activity activity, SharedPreferences preferences, Status status) {
        this.activity = activity;
        this.preferences = preferences;
        this.status = status;
        if (preferences.getInt("installed", 0) != BuildInfo.VERSION_CODE) {
            cached("update.apk").delete();
            cached("update.part").delete();
            preferences.edit().putInt("installed", BuildInfo.VERSION_CODE).apply();
        }
    }

    String getUrl() {
        String saved = preferences.getString("updateUrl", "").trim();
        return saved.isEmpty() ? BuildInfo.UPDATE_URL : saved;
    }
    void setUrl(String value) {
        preferences.edit().putString("updateUrl", value.trim()).apply();
        latest = null;
    }
    void resetUrl() { preferences.edit().remove("updateUrl").apply(); latest = null; }
    void cancelInstall() {
        if (!busy.get()) return;
        cancelled.set(true);
        HttpURLConnection connection = transfer;
        if (connection != null) connection.disconnect();
    }
    private File cached(String name) { return new File(activity.getCacheDir(), name); }

    private static void checkCancelled(boolean cancelled) throws IOException {
        if (cancelled) throw new IOException("已取消");
    }

    private HttpURLConnection connect(String address, long deadline) throws Exception {
        URL url = new URL(address);
        for (int redirects = 0; redirects <= 5; redirects++) {
            long left = deadline - System.currentTimeMillis();
            if (left <= 0) throw new IOException("连接超时，请稍后重试");
            if (!"https".equals(url.getProtocol()) || url.getUserInfo() != null)
                throw new IOException("仅支持 HTTPS 地址");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout((int) Math.min(15000, left));
            connection.setReadTimeout((int) Math.min(30000, left));
            connection.setInstanceFollowRedirects(false);
            connection.setRequestProperty("Cache-Control", "no-cache");
            transfer = connection;
            int statusCode = connection.getResponseCode();
            if (statusCode == 200) return connection;
            if (statusCode == 301 || statusCode == 302 || statusCode == 303 || statusCode == 307 || statusCode == 308) {
                String location = connection.getHeaderField("Location");
                connection.disconnect();
                if (location == null || redirects == 5) throw new IOException("更新地址重定向异常");
                url = new URL(url, location);
            } else {
                connection.disconnect();
                throw new IOException("服务器返回状态 " + statusCode);
            }
        }
        throw new IOException("更新地址重定向过多");
    }

    void check() {
        if (BuildInfo.DEBUG) { status.show("开发版不接收正式版更新"); return; }
        if (!busy.compareAndSet(false, true)) return;
        latest = null;
        status.show("正在检测更新…");
        new Thread(() -> {
            try {
                HttpURLConnection connection = connect(getUrl(), System.currentTimeMillis() + CHECK_LIMIT_MS);
                JSONObject manifest;
                try { manifest = new JSONObject(new String(Streams.read(connection.getInputStream(), 65536), "UTF-8")); }
                finally { connection.disconnect(); transfer = null; }
                if (manifest.getLong("versionCode") <= BuildInfo.VERSION_CODE) { status.show("当前已是最新版本 " + BuildInfo.VERSION_NAME); return; }
                if (!manifest.getString("sha256").matches("[a-fA-F0-9]{64}")) throw new IOException("更新清单校验值无效");
                URL apk = new URL(manifest.getString("apkUrl"));
                if (!"https".equals(apk.getProtocol()) || apk.getUserInfo() != null) throw new IOException("安装包必须使用 HTTPS 地址");
                latest = manifest;
                status.show("发现新版本 " + manifest.getString("versionName") + "。" + manifest.optString("notes", "") + " 点击下载安装。");
            } catch (Exception error) { status.show("检测失败：" + error.getMessage()); }
            finally { transfer = null; busy.set(false); }
        }, "menu-update-check").start();
    }

    void install() {
        if (!busy.compareAndSet(false, true)) return;
        JSONObject manifest = latest;
        if (manifest == null) { busy.set(false); status.show("请先检测到新版本"); return; }
        status.show("正在下载安装包…");
        cancelled.set(false);
        new Thread(() -> {
            File part = cached("update.part"), target = cached("update.apk");
            try {
                long deadline = System.currentTimeMillis() + DOWNLOAD_LIMIT_MS;
                target.delete();
                HttpURLConnection connection = connect(manifest.getString("apkUrl"), deadline);
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(part)) {
                    byte[] buffer = new byte[32768];
                    int length;
                    long size = 0;
                    while ((length = input.read(buffer)) != -1) {
                        checkCancelled(cancelled.get());
                        if (System.currentTimeMillis() > deadline) throw new IOException("下载超时，请稍后重试");
                        size += length;
                        if (size > 100L * 1024 * 1024) throw new IOException("安装包过大");
                        digest.update(buffer, 0, length);
                        output.write(buffer, 0, length);
                    }
                } finally { connection.disconnect(); transfer = null; }
                checkCancelled(cancelled.get());
                StringBuilder hash = new StringBuilder();
                for (byte value : digest.digest()) hash.append(String.format("%02x", value & 255));
                if (!hash.toString().equalsIgnoreCase(manifest.getString("sha256"))) throw new IOException("SHA-256 校验失败");
                PackageManager manager = activity.getPackageManager();
                PackageInfo archive = manager.getPackageArchiveInfo(part.getPath(), PackageManager.GET_SIGNING_CERTIFICATES);
                PackageInfo own = manager.getPackageInfo(activity.getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
                if (archive == null || archive.signingInfo == null || !activity.getPackageName().equals(archive.packageName)
                    || archive.getLongVersionCode() != manifest.getLong("versionCode")
                    || !Arrays.equals(archive.signingInfo.getApkContentsSigners(), own.signingInfo.getApkContentsSigners()))
                    throw new IOException("安装包包名、版本或签名不匹配");
                checkCancelled(cancelled.get());
                if (!part.renameTo(target)) throw new IOException("无法保存安装包");
                activity.runOnUiThread(this::launchInstall);
            } catch (Exception error) {
                part.delete(); target.delete();
                status.show(cancelled.get() ? "已取消下载" : "更新失败：" + error.getMessage());
            } finally { transfer = null; busy.set(false); }
        }, "menu-update-download").start();
    }

    private void launchInstall() {
        // 下载末尾点了取消，可能已经走到改名之后，这里再确认一次
        if (cancelled.get()) {
            cached("update.apk").delete();
            status.show("已取消下载");
            return;
        }
        try {
            if (!activity.getPackageManager().canRequestPackageInstalls()) {
                pendingInstall = true;
                status.show("请允许安装此来源的应用，返回后继续安装");
                activity.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.getPackageName())));
                return;
            }
            pendingInstall = false;
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(Uri.parse("content://" + activity.getPackageName() + ".update/update.apk"), "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            activity.startActivity(intent);
            status.show("请在系统界面确认更新。成功后重新打开应用会清理旧安装包。");
        } catch (Exception error) { status.show("无法启动安装：" + error.getMessage()); }
    }

    void onResume() { if (pendingInstall && activity.getPackageManager().canRequestPackageInstalls()) launchInstall(); }
}
