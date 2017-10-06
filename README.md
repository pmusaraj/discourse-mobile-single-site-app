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

Install your packages:
```
cd DiscoSingle
% npm install
```

Edit `global.js` to set your app's variables (site URL, OneSignal ID, app id, colors, marketing text, etc.) then run the following command to update your app code with the global variables:
```
node setup.ios.js
node setup.android.js
```

If you change the ID of the app, you also need to run a project rename: 
```
npm install react-native-rename -g
react-native-rename "NewName" -b com.yourco.yourappid
```

To run the app locally, start with:

```
react-native run-ios
react-native run-android
```

See the [React Native](https://facebook.github.io/react-native/docs/getting-started.html) docs for more details. 

### Discourse setup

See this [meta entry](https://meta.discourse.org/t/whiltelisted-discourse-app-with-push-notifications-via-onesignal/58247?u=pmusaraj) for details on how to set up your Discourse instance to send Push Notifications via OneSignal.  

### Android-specific Configuration

You need to set Gradle variables in your user's home folder, under ~/.gradle/gradle.properties for your keychain, OneSignal ID and Google Project Number. Ssee list of variables to set in **DiscoSingle Gradle Variables** section of android/gradle.properties.

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

### Features
A list of possible new features (if interested to fund, please contact me): 

- reply directly to a Push Notification
- ipad/tablet UI
- inApp signup form
- ios: swipe to go back/forward
