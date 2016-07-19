"use strict";

let configs = require("../configs.js"),
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
    .replace(/[\+\/]/g, (c) => { return {
      "+": "-",
       "/": "_"
      }[c];
    })
    .slice(0, -2);
}

module.exports.obtainAccessToken = (id) => {
  let object = {
    id,
    "expiresAt": Date.now() + 86400000
  };
  
  return this.encrypt(JSON.stringify(object));
};

module.exports.parseAccessToken = (req, res, next) => {
  let accessToken = null;

  try {
    if (req.query.accessToken) {
      accessToken = JSON.parse(this.decrypt(req.query.accessToken));

      if (Date.now() > accessToken.expiresAt) {
        accessToken = null;
      }
    }
  } finally {
    req.query.accessToken = accessToken;
    next();
  }
};

module.exports.log = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    let log = {
      body: req.body,
      header: req.header,
      method: req.method,
      param: req.param,
      query: req.query,
      url: req.url
    };

    console.log(JSON.stringify(log)); // eslint-disable-line no-console
  }

  next();
};

