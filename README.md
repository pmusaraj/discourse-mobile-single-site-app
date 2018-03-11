Discourse Mobile App for a Single Site (with support for Push Notifications)
--- 

Whitelisted iOS and Android app for a single Discourse site that supports Push Notifications via OneSignal. 

Built with React Native. Inspired by [DiscourseMobile](https://github.com/discourse/DiscourseMobile).

**For a demonstration** check out the SWAPD app on the App Store or Google Play. 

### Getting Started

Install React Native.
```
npm install -g react-native-cli
```

Within the repository folder, install your packages:
```
npm install
```

Copy the contents of `default.variables.js` to `app.variables.js` to set your app's variables (site URL, app name, colors, marketing text, etc.). 

To run the app locally, try either one of these commands:

```
react-native run-ios
react-native run-android
```

See the [React Native](https://facebook.github.io/react-native/docs/getting-started.html) docs for more details. 

### OneSignal setup

You need to open an account at OneSignal to be able to send Push Notifications (PNs) from your Discourse site, and receive them in the app. Steps: 

- Register an App ID on the Apple portal (developer.apple.com)
- Open an account with [OneSignal](https://www.onesignal.com) (free), create a new app, and generate certificates for iOS and Android
- Create the provisioning profiles on the Apple portal. You need a distribution profile for pushing to TestFlight and the App Store, and likely an ad-hoc profile for testing quickly on your device. (Note that you may also need a development certificate for testing the app on your device. Step 2 above creates only the production certificate.)
- Create an iCloud container and associate it with your App ID.

#### OneSignal Discourse Setup

Add the [discourse-onesignal](https://github.com/pmusaraj/discourse-onesignal/) plugin to your Discourse instance and configure it: enable notifications, add your OneSignal App ID and the OneSignal REST API key.

In your Discourse settings, add your site's home URL to `allowed user api auth redirects` (the app will redirect to your home URL once the user authorizes access for the app in Discourse). And add the OneSignal Push Endpoint URL `https://onesignal.com/api/v1/notifications` to `allowed user api push urls`.

#### OneSignal updates to native code

In your app code for either iOS or Android, you need to replace the placeholder OneSignal App ID with your app's. 

For iOS, look for `ONESIGNAL_APP_ID` in `ios/DiscoSingle/AppDelegate.m`. 
For Android, look for `DISCOSINGLE_ONESIGNAL_APP_ID` and `DISCOSINGLE_GOOGLE_PROJECT_NUMBER` in `android/app/build.gradle`.

You should now be ready to build and test the app. Note that in iOS, Push Notifications can only be tested on a real device, but the OneSignal console will show any attempts to enable Push Notifications on a simulator.

### Helpful Tools

#### Generating assets
Use [generator-rn-toolbox](https://github.com/bamlab/generator-rn-toolbox) to setup icons and splash screens for the app: 

```
npm install -g yo generator-rn-toolbox

yo rn-toolbox:assets --icon icon.png
yo rn-toolbox:assets --splash splash.png --android
yo rn-toolbox:assets --splash splash.png --ios
```

#### Logo for login screen
The logo file for the login screen is under `js/logo.png`. Replace it with your logo.  


#### Android build using Gradle
Follow the [official React Native](https://facebook.github.io/react-native/docs/signed-apk-android.html) instructions on generating a key and an APK for release. Then run
```
cd android && ./gradlew assembleRelease
```
and find your release file under `android/app/build/outputs/apk/app-release.apk`. 

#### Renaming your App

You can rename the app using `react-native-rename`. This is necessary for Android, because you also need to change the bundle ID. Steps: 
```
npm install react-native-rename -g
react-native-rename "NewName" -b com.yourco.yourappid
```

(The bundle name specified by `-b` above only applies to Android, to change your iOS bundle ID, use Xcode.)

After renaming the app, you need to manually edit some files in subfolders under `android/app/src/main/java`, and replace `com.discosingle;` at the beginning of every file with your new bundle ID. The rename script does it for `MainActivity.java` and `MainApplication.java`, you need to manually do this for the remaining files. 

### Troubleshooting

- If you are having a `ld: library not found for -lRNDeviceInfo-tvOS` error, try manually deleting `libRNDeviceInfo-tvOS.a` in Xcode -> [Your iOS build target] -> Build Phases -> Link Binary with Libraries.
- Android file uploads may fail. The app uses https://github.com/dahjelle/react-native-android-webview-file-image-upload to enable file uploads in WebView, but it's not tested with all versions of Android.
- If you have already checked out the project, and renamed the app, you may run into a variety of file conflicts if you pull updates. This is especially the case if the React Native version in the project has been updated. This is normal, and a better course of action is to check out a fresh copy, and reapply your changes and the rename. 

### Upcoming Features Wishlist
A list of potential upcoming features (if interested to fund, please contact me via [email](mailto:pmusaraj@gmail.com) or on [meta](https://meta.discourse.org/u/pmusaraj)): 

- reply directly to a Push Notification
- ipad/tablet UI
- inApp signup form
- ios: swipe to go back/forward
- test and support logins via other services (app currently works with Facebook, Patreon, Linkedin)
