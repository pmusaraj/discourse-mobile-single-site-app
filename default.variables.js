//// Application variables ////
// Copy these to app.variables.js in the root of the project

// domain name of the site
global.siteDomain = "example.com";

// the app's name
global.appName = "DiscoSingle";

// App ID from OneSignal (see readme, needs manual update)
// global.oneSignalAppId = 'ONESIGNAL_APP_ID'

// Google Project Number - Android only (see readme, needs manual update)
// global.googleProjectNumber = 'ONESIGNAL_GOOGLE_PROJECT_NUMBER'

// Show login form on splash screen
global.showLoginForm = true;

// OneSignal in-app focus behaviour
// 0 = no notification, 1 = alert dialog with a message, 2 = regular notification (same as when app is not in focus)
global.inAppNotification = 2;

// URLs to load directly in app
global.internalURLs = ["oauth"];

// Styling variables
global.bgColor = "#FFFFFF";
global.textColor = "#333333";
global.buttonColor = "#bb3c2b";
global.introText =
	"Welcome! Please log in or signup to get started. Make sure to authenticate the application in order to enable notifications.";
global.loginText = "Login";
global.skipText = "Skip";

// if showLoginForm is disabled, the following variables are used
global.primaryStartButtonText = "Launch";
global.primaryStartButtonTextColor = "#FFFFFF";
global.primaryStartUrl = "";
global.secondaryStartButtonText = "";

global.connectText = "Connect";
global.connectButtonBgColor = "#bb3c2b";
global.connectButtonTextColor = "#FFFFFF";
global.acctText = "No account? Click here";
global.acctUrl = "/signup";
global.TOSText = "By continuing, you agree to our ";
global.TOSLinkText = "Terms of Service";
global.TOSUrl = "/tos";
global.TOSTextColor = "#555555";

global.usernamePlaceholder = "Username";
global.passwordPlaceholder = "Password";
