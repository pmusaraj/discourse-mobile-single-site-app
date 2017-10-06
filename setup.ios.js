#!/usr/bin/env node

var replace = require("replace");
require("./global.js");

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

replace({
    regex: "<string>discosingle</string>",
    replacement: "<string>" + global.URLscheme + "</string>",
    paths: ['ios/DiscoSingle/Info.plist']
});

console.log('## Done replacing global variables ##')

