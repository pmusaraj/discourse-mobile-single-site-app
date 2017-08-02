#!/usr/bin/env node

var replace = require("replace");
require("./global.js");

console.log('Start replacing app variables')

replace({
    regex: "DiscoSingle",
    replacement: global.appName,
    paths: ['app.json', 'ios/Discourse/Info.plist']
});

replace({
    regex: "ONESIGNAL_APP_ID",
    replacement: global.oneSignalAppId,
    paths: ['ios/Discourse/AppDelegate.m']
});

replace({
    regex: "<string>discosingle</string>",
    replacement: "<string>" + global.URLscheme + "</string>",
    paths: ['ios/Discourse/Info.plist']
});

console.log('Done replacing global variables')

