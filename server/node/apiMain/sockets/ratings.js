"use strict";

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), "");
module.exports = require("../../common/io.js")().of(`/1.0/${name}`);