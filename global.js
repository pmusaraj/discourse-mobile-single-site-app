//// Application variables ////

// domain name of the site
global.siteDomain = 'example.com'

// the app's name
global.appName = 'DiscoSingle'

global.androidAppId = 'com.namecompany.discosingle'
global.iosAppId = 'com.namecompany.discosingle'

// App ID from OneSignal
global.oneSignalAppId = 'ONESIGNAL_APP_ID'

// Google Project Number - Android only
global.googleProjectNumber = 'ONESIGNAL_GOOGLE_PROJECT_NUMBER'

// URLscheme - optional, iOS only
// Note: if you change this, make sure you also add "discosingle://auth_redirect" to
// your Discourse instance, under Settings > User API > allowed user api auth redirects
global.URLscheme = 'discosingle'

// Styling variables
global.bgColor = '#FFFFFF'
global.textColor = '#333333'
global.buttonColor = '#bb3c2b'
global.introText = 'Welcome! Please log in or signup to get started. Make sure to authenticate the application in order to enable notifications.';
global.loginText = 'Login'
global.skipText = 'Skip'
global.connectText = 'Connect'
global.acctText = 'No account? Click here'
global.acctUrl = '/signup'
global.TOSText = 'By continuing, you agree to our '
global.TOSLinkText = 'Terms of Service'
global.TOSUrl = '/tos'