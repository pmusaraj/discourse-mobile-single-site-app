## Discourse Mobile App for a Single Site (with support for Push Notifications)

Whitelisted iOS/Android app for a single Discourse site that supports push notifications via OneSignal.

For a demonstration check out SWAPD or TekInvestor on the App Store or Google Play.

### Getting Started

1. Install your packages:

```bash
yarn install
```

2. Link the iOS libraries via

```bash
cd ios && pod install
```

3. And run the app in the simulator using:

```bash
react-native run-ios
# or
react-native run-android
```

See the [React Native](https://facebook.github.io/react-native/docs/getting-started.html) docs for more details.

### OneSignal setup

You need to open an account at OneSignal to be able to send Push Notifications (PNs) from your Discourse site, and receive them in the app. Steps:

- Register an App ID on the Apple portal (developer.apple.com)
- Open an account with [OneSignal](https://www.onesignal.com) (free), create a new app, and generate certificates for iOS and Android (see Onesignal documentation for steps on each platform)
- Add the [discourse-onesignal](https://github.com/pmusaraj/discourse-onesignal/) plugin to your Discourse instance and configure it: enable notifications, add your OneSignal App ID and the OneSignal REST API key.
- in your app's `app.variables.js` file, add the OneSignal App ID

### Build and release using Fastlane

To simplify managing your app and keeping up with changes in the repo, you can use the included Fastlane scripts.

#### Initial setup

- Create a private git repository that Fastlane's `match` script uses to generate and update your app's certificates.
- Copy the `fastlane/example1` folder and the `.env.example1` file and rename them using your app's name (for this guide, we will assume the copied items are `fastlane/yourapp` and `.env.yourapp`).
- Update the variables in the folder and the ENV file, as well as the logo.png and splash.png images.
- **iOS**: Create an App Store Connect API Key and follow the instructions in https://docs.fastlane.tools/app-store-connect-api/, and update the `fastlane/yourapp/key.json` file with the key
  details.
- **Android**: generate or copy over your app's keystore and secrets in the respective files in `fastlane/yourapp`.

You should now be ready to run Fastlane scripts for your app's environment. by appending `--env yourapp` to any Fastlane commands.

To update the app name and assets, run:

```
cd fastlane
fastlane switch --env yourapp
```

To generate (or update) iOS certificates, run:

```
cd fastlane
fastlane ios certificates --env yourapp
```

To build your app for iOS, run:

```
cd fastlane
fastlane ios install --env yourapp
# will install the app on a connected device or simulator

fastlane ios release --env yourapp
# will build and upload the app to TestFlight

```

To build your app for Android, run:

```
cd fastlane
fastlane android apk --env yourapp
# will build an apk in android/app/build/outputs/apk/

fastlane android release --env yourapp
# will create a bundle android/app/build/outputs/bundle/

```
