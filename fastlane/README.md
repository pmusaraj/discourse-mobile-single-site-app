fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
### switch
```
fastlane switch
```
Switch to environment

----

## iOS
### ios certificates
```
fastlane ios certificates
```
Generate certificates
### ios release
```
fastlane ios release
```
Submit a new build to Testflight
### ios install
```
fastlane ios install
```
Install on connected device
### ios prep
```
fastlane ios prep
```
Prep iOS app

----

## Android
### android apk
```
fastlane android apk
```
Build an APK for testing
### android release
```
fastlane android release
```
Generate a bundle for uploading to Google Play Store

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
