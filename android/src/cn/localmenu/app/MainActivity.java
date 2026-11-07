package cn.localmenu.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import org.json.JSONObject;

/** Android lifecycle, image chooser and the stable local-storage JavaScript bridge. */
public class MainActivity extends Activity {
    private static final int PHOTO_REQUEST = 50;
    private WebView web;
    private SharedPreferences preferences;
    private AppUpdater updater;
    private ValueCallback<Uri[]> photoCallback;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(false);
        else {
            getWindow().getDecorView().setSystemUiVisibility(getWindow().getDecorView().getSystemUiVisibility()
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
            getWindow().setStatusBarColor(Color.TRANSPARENT);
        }
        preferences = getSharedPreferences("menu", 0);
        updater = new AppUpdater(this, preferences, this::showUpdateStatus);
        web = new WebView(this);
        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(Color.rgb(255, 250, 240));
        container.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(container);
        container.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars()
                    | WindowInsets.Type.ime() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                int cutout = insets.getDisplayCutout() == null ? 0 : insets.getDisplayCutout().getSafeInsetTop();
                view.setPadding(insets.getSystemWindowInsetLeft(), Math.max(insets.getSystemWindowInsetTop(), cutout),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            // The container has already applied system insets; do not apply them again in WebView.
            return Build.VERSION.SDK_INT >= 30 ? WindowInsets.CONSUMED
                : insets.replaceSystemWindowInsets(0, 0, 0, 0);
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        web.addJavascriptInterface(new Bridge(), "Native");
        web.setWebViewClient(new LocalWebClient(getAssets()));
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams parameters) {
                if (photoCallback != null) photoCallback.onReceiveValue(null);
                photoCallback = callback;
                try {
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("image/*");
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/jpeg", "image/png", "image/webp"});
                    startActivityForResult(intent, PHOTO_REQUEST);
                    return true;
                } catch (Exception error) { photoCallback = null; return false; }
            }
        });
        try {
            String html = new String(Streams.read(getAssets().open("index.html"), 3000000), "UTF-8");
            web.loadDataWithBaseURL("https://menu.local/", html, "text/html", "UTF-8", null);
        } catch (Exception error) { throw new IllegalStateException("无法读取本地界面", error); }
    }

    private void showUpdateStatus(String text) {
        runOnUiThread(() -> web.evaluateJavascript("window.updateStatus(" + JSONObject.quote(text) + ")", null));
    }

    public final class Bridge {
        @JavascriptInterface public String load() { return preferences.getString("data", ""); }
        @JavascriptInterface public boolean save(String value) {
            try { new JSONObject(value); return preferences.edit().putString("data", value).commit(); }
            catch (Exception error) { return false; }
        }
        @JavascriptInterface public String updateUrl() { return updater.getUrl(); }
        @JavascriptInterface public void setUpdateUrl(String value) { updater.setUrl(value); }
        @JavascriptInterface public void openImageCredit(String value) {
            Uri uri = Uri.parse(value);
            String host = uri.getHost();
            boolean allowed = "commons.wikimedia.org".equals(host) || "creativecommons.org".equals(host)
                || ("github.com".equals(host) && uri.getPath() != null
                    && (uri.getPath().equals("/wang189327-wq/meiwei-menu")
                        || uri.getPath().startsWith("/wang189327-wq/meiwei-menu/")));
            if (!"https".equals(uri.getScheme()) || uri.getUserInfo() != null
                || (uri.getPort() != -1 && uri.getPort() != 443) || !allowed) return;
            runOnUiThread(() -> {
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                catch (Exception error) { new AlertDialog.Builder(MainActivity.this)
                    .setMessage("没有可用的浏览器，无法打开图片来源。")
                    .setPositiveButton("知道了", null).show(); }
            });
        }
        @JavascriptInterface public void check() { updater.check(); }
        @JavascriptInterface public void install() { updater.install(); }
    }

    @Override protected void onActivityResult(int request, int result, Intent intent) {
        super.onActivityResult(request, result, intent);
        if (request == PHOTO_REQUEST && photoCallback != null) {
            photoCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, intent));
            photoCallback = null;
        }
    }
    @Override protected void onDestroy() {
        if (photoCallback != null) { photoCallback.onReceiveValue(null); photoCallback = null; }
        super.onDestroy();
    }
    @Override protected void onResume() { super.onResume(); if (updater != null) updater.onResume(); }
    @Override public void onBackPressed() {
        web.evaluateJavascript("window.handleBack?window.handleBack():false", result -> {
            if (!"true".equals(result)) new AlertDialog.Builder(this).setMessage("退出美味餐饮？")
                .setNegativeButton("取消", null).setPositiveButton("退出", (dialog, which) -> finish()).show();
        });
    }
}

