#!/usr/bin/env node

var replace = require("replace");
var fs = require('fs');

if (fs.existsSync("./app.variables.js")) {
    require("./app.variables.js");
} else {
    require("./default.variables.js");
}

console.log('## Start replacing app variables ##')

replace({
    regex: "com.namecompany.discosingle",
    replacement: global.androidAppId,
    paths: ['ios/DiscoSingle.xcodeproj/project.pbxproj']
});

replace({
    regex: "DiscoSingle",
    replacement: global.appName,
    paths: ['app.json', 'ios/DiscoSingle/Info.plist']
});

replace({
    regex: "ONESIGNAL_APP_ID",
    replacement: global.oneSignalAppId,
    paths: ['ios/DiscoSingle/AppDelegate.m']
});

console.log('## Done replacing global variables ##')

