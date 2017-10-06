#!/usr/bin/env node

var replace = require("replace");
require("./global.js");

console.log('Start replacing app variables')

replace({
    regex: "com.namecompany.discosingle",
    replacement: global.androidAppId,
    paths: ['android/app/build.gradle']
});

replace({
    regex: "DiscoSingle",
    replacement: global.appName,
    paths: ['android/app/src/main/res/values/strings.xml']
});

console.log('Done replacing app variables')

