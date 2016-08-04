"use strict";

module.exports = (server, callback) => {
  this.io = this.io || require("socket.io")(server);
  if (callback) {
    callback();
    return;
  }
  return this.io;
}
