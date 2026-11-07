package cn.localmenu.app;

import android.content.res.AssetManager;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;

/** Serves only the app's bundled resources; never exposes arbitrary file paths. */
final class LocalWebClient extends WebViewClient {
    private final AssetManager assets;

    LocalWebClient(AssetManager assets) { this.assets = assets; }

    @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if (!"https".equals(uri.getScheme()) || !"menu.local".equals(uri.getHost())) return null;
        String path = uri.getPath();
        String mime = null;
        if (path != null) {
            if (path.matches("/photos/(?:preset-20261020-[0-9]{3}|staple-20261020-[0-9]{2}|store-20261020-[0-9]{2}|app-cover)\\.jpg")) mime = "image/jpeg";
            else if (path.matches("/js/(?:version|data|seed-data|asset-credits|validation|store|catalog|catalog-view|planner|draw|takeout|photos|settings|app)\\.js")) mime = "application/javascript";
            else if ("/photos/placeholder.svg".equals(path)) mime = "image/svg+xml";
            else if ("/css/app.css".equals(path)) mime = "text/css";
        }
        if (mime != null) {
            try { return new WebResourceResponse(mime, mime.startsWith("image/") ? null : "UTF-8", assets.open(path.substring(1))); }
            catch (Exception ignored) { /* Return a local 404 instead of making a network request. */ }
        }
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, new ByteArrayInputStream(new byte[0]));
    }

    @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
}
