"use strict";

module.exports = (app) => {
  this.io = this.io || require("socket.io")(require('http').Server(app));
  return this.io;
}
