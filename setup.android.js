#!/usr/bin/env node

var replace = require("replace");
require("./global.js");

console.log('Start replacing app variables')

replace({
    regex: "ONESIGNAL_APP_ID",
    replacement: global.oneSignalAppId,
    paths: ['android/app/build.gradle']
});

replace({
    regex: "ONESIGNAL_GOOGLE_PROJECT_NUMBER",
    replacement: global.googleProjectNumber,
    paths: ['android/app/build.gradle']
});

replace({
    regex: "DiscoSingle",
    replacement: global.appName,
    paths: ['android/app/src/main/res/values/strings.xml']
});

console.log('Done replacing app variables')

