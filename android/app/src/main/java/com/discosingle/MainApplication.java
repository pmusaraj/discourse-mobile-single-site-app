package com.discosingle;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.geektime.rnonesignalandroid.ReactNativeOneSignalPackage;
import com.RNKeyPair.RNKeyPairPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new CustomWebViewPackage(),
            new ReactNativeOneSignalPackage(),
            new RNKeyPairPackage(),
            new RNDeviceInfo(),
            new CookieManagerPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
