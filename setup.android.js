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
    paths: ['android/app/build.gradle']
});

replace({
    regex: "DISCOSINGLE_ONESIGNAL_APP_ID",
    replacement: global.oneSignalAppId,
    paths: ['android/app/build.gradle']
});

replace({
    regex: "DISCOSINGLE_GOOGLE_PROJECT_NUMBER",
    replacement: global.googleProjectNumber,
    paths: ['android/app/build.gradle']
});

replace({
    regex: "DiscoSingle",
    replacement: global.appName,
    paths: ['android/app/src/main/res/values/strings.xml']
});

console.log('## Done replacing app variables ##')

