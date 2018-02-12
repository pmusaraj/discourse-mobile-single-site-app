/** 
* from: https://github.com/dahjelle/react-native-android-webview-file-image-upload
* 
*/

import React, {Component} from 'react';
import {
  WebView,
  requireNativeComponent,
  NativeModules,
  Platform
} from 'react-native';

const {CustomWebViewManager} = NativeModules;

/**
 * React Native's WebView on Android does not allow picture uploads. However, due to [this pull request](https://github.com/facebook/react-native/pull/15016) one can override parts of the built-in WebView to add hooks wherever necessary.
 *
 * This component will:
 *
 *   1. Use the built-in React Native WebView on iOS.
 *   2. Be a drop-in replacement for the Android WebView with the additional functionality for file uploads.
 *
 * This requires several Java files to work: CustomWebViewManager.java, CustomWebViewModule.java, and CustomWebViewPackage.java. 
 * Additionally, the MainApplication.java file needs to be edited to include the new package.
 *
 * Lots of guidance from [the example project for the original PR](https://github.com/cbrevik/webview-native-config-example) and from [a sample Android webview](https://github.com/hushicai/ReactNativeAndroidWebView).
 */
export default class CustomWebView extends Component {
  static propTypes = {
    ...WebView.propTypes
  };

  render() {
    const nativeConfig =
      Platform.OS === 'android'
        ? {
            component: RCTCustomWebView,
            viewManager: CustomWebViewManager
          }
        : null;
    return (
      <WebView
        ref={webview => (this.webview = webview)}
        {...this.props}
        nativeConfig={nativeConfig}
      />
    );
  }

  // unfortunately, the refs don't transfer cleanly, so if you use any of the static methods, you need to handle them here
  injectJavaScript(...args) {
    this.webview.injectJavaScript(...args);
  }

  injectedJavaScript(...args) {
    this.webview.injectedJavaScript(...args);
  }

  reload(...args) {
    this.webview.reload(...args);
  }

  stopLoading(...args) {
    this.webview.stopLoading(...args);
  }

  goBack() {
    this.webview.goBack();
    return true;
  }
}

const RCTCustomWebView = requireNativeComponent(
  'RCTCustomWebView',
  CustomWebView,
  WebView.extraNativeComponentConfig
);