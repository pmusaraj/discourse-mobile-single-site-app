package com.discosingle;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CustomWebViewPackage implements ReactPackage {
    private CustomWebViewManager manager;
    private CustomWebViewModule module;

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        manager = new CustomWebViewManager();
        manager.setPackage(this);
        return Arrays.<ViewManager>asList(manager);
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        module = new CustomWebViewModule(reactContext);
        module.setPackage(this);
        modules.add(module);
        return modules;
    }

    public CustomWebViewManager getManager() {
        return manager;
    }

    public CustomWebViewModule getModule() {
        return module;
    }
}