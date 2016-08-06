"use strict";

let configs = require("../../configs/configs.js"),
  crypto = require("crypto"),
  uuid = require("node-uuid");
  

const algorithm = "aes-256-ctr",
      password = configs.node.password;


module.exports.encrypt = (string) => {
  let cipher = crypto.createCipher(algorithm, password);

  return cipher.update(string, "ascii", "base64") + cipher.final("base64");
};

module.exports.decrypt = (string) => {
  let decipher = crypto.createDecipher(algorithm, password);

  return decipher.update(string, "base64", "ascii") + decipher.final("ascii");
};

module.exports.uuid = () => {
  return uuid
    .v4(null, new Buffer(16))
    .toString("base64")
    .replace("+", "-")
    .replace("/", "_")
    .slice(0, -2);
}

module.exports.obtainAccessToken = (id) => {
  let object = {
    id,
    "expiresAt": Date.now() + 86400000
  };
  
  return this.encrypt(JSON.stringify(object));
};

module.exports.isProduction = () => {
  return process.env.NODE_ENV === "production";
}

module.exports.appId = "0000000000000000000000";

module.exports.isAppToken = (accessToken) => {
  return accessToken.id === this.appId;
}

module.exports.obtainAppToken = () => {
  return this.obtainAccessToken(this.appId);
}