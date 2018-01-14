package com.discosingle;

import android.net.Uri;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.facebook.react.common.build.ReactBuildConfig;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.webview.ReactWebViewManager;

@ReactModule(name = CustomWebViewManager.REACT_CLASS)
public class CustomWebViewManager extends ReactWebViewManager {
    /* This name must match what we're referring to in JS */
    protected static final String REACT_CLASS = "RCTCustomWebView";
    private CustomWebViewPackage aPackage;

    // pulled this code from React Native itself;
    // https://github.com/facebook/react-native/blob/59d9f8ca5eb96b4b455b60ed170dfb05bc9c7251/ReactAndroid/src/main/java/com/facebook/react/views/webview/ReactWebViewManager.java#L361
    // not sure if there is a better way of handling this overriding; ideally, I'd
    // like to **only** add the `onShowFileChooser` method, but I don't know a way
    // to handle that
    @Override
    protected WebView createViewInstance(final ThemedReactContext reactContext) {
        ReactWebView webView = (ReactWebView) super.createViewInstance(reactContext);
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                if (ReactBuildConfig.DEBUG) {
                    return super.onConsoleMessage(message);
                }
                // Ignore console logs in non debug builds.
                return true;
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(
                    String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            // this is the addition method to react-native built-in
            // it calls the photo picker intent in a separate module apparently so all the parts that need to can access other bits in scope. I wish I understood more Java, but this is the way https://github.com/hushicai/ReactNativeAndroidWebView did it, and it seems to work
            public boolean onShowFileChooser(WebView webView,
                                             ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                return getModule().startPhotoPickerIntent(filePathCallback,
                        fileChooserParams);
            }
        });
        // force web content debugging on
        WebView.setWebContentsDebuggingEnabled(true);
        return webView;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected void addEventEmitters(ThemedReactContext reactContext,
                                    WebView view) {
        view.setWebViewClient(new CustomWebViewClient());
    }

    public CustomWebViewPackage getPackage() {
        return this.aPackage;
    }

    public void setPackage(CustomWebViewPackage aPackage) {
        this.aPackage = aPackage;
    }

    public CustomWebViewModule getModule() {
        return this.aPackage.getModule();
    }

    protected static class CustomWebViewClient extends ReactWebViewClient {
    }
}