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

Edit `global.js` to set your app's variables (site URL, OneSignal ID, app id, colors, marketing text, etc.) then run the following command to update your app code with the global variables:
```
node setup.ios.js
node setup.android.js
```

To run the app locally, start with:

```
react-native run-ios
react-native run-android
```

See the [React Native](https://facebook.github.io/react-native/docs/getting-started.html) docs for more details. 

### OneSignal setup

You need to open an account at OneSignal to be able to send Push Notifications (PNs) from your Discourse site, and receive them in the app. 

- Register an App ID on the Apple portal (developer.apple.com)
- Open an account with [OneSignal](https://www.onesignal.com) (free), create a new app, and generate certificates for iOS and Android
- Create the provisioning profiles on the Apple portal. You need a distribution profile for pushing to TestFlight and the App Store, and likely an ad-hoc profile for testing quickly on your device. (Note that you may also need a development certificate for testing the app on your device. Step 2 above creates only the production certificate.)
- Create an iCloud container and associate it with your App ID.


### Discourse setup

Add the [discourse-onesignal](https://github.com/pmusaraj/discourse-onesignal/) plugin to your Discourse instance and configure it: enable notifications, add your OneSignal App ID and the OneSignal REST API key.

In your Discourse settings, add `discosingle://auth_redirect` to `allowed user api auth redirects`. 

You should now be ready to build and test the app in Xcode our using react-native run-ios on the command line. (To test push notifications, you need to set up your app on your phone, either via ad-hoc or through TestFlight.)

### Android-specific Configuration

You need to set Gradle variables in your user's home folder, under ~/.gradle/gradle.properties for your keychain, OneSignal ID and Google Project Number. Ssee list of variables to set in **DiscoSingle Gradle Variables** section of `android/gradle.properties`.

### Helpful Tools

#### Generating assets
Use the React Native generator to setup icons and splash screens for the app: 

```
// https://github.com/bamlab/generator-rn-toolbox
npm install -g yo generator-rn-toolbox
```
and then 
```
yo rn-toolbox:assets --icon icon.png
yo rn-toolbox:assets --splash splash.png --android
yo rn-toolbox:assets --splash splash.png --ios
```

#### Logo for login screen
The logo file for the login screen is under `js/logo.png`. Replace it with your logo.  

#### Android build using Gradle
```
cd android && ./gradlew assembleRelease
```

#### Changing App ID

You may have to change the ID of the app, in which case, you would need to run a project rename: 
```
npm install react-native-rename -g
react-native-rename "NewName" -b com.yourco.yourappid
```

### Upcoming Features
A list of possible new features (if interested to fund, please contact me via [email](mailto:pmusaraj@gmail.com) or on [meta](https://meta.discourse.org/u/pmusaraj)): 

- reply directly to a Push Notification
- ipad/tablet UI
- inApp signup form
- ios: swipe to go back/forward
