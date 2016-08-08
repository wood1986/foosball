let should = require("should"),
    async = require("async"),
    mainUtils = require("../../common/mainUtils.js"),
    testUtils = require("../../common/testUtils.js");

let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), "");

describe(`/1.0/${name}`, () => {
  describe("POST", () => {
    describe("should return", () => {
      it("200", (done) => {
        let body = { "K": 8, "G": [1, 1, 1], "validity": [0, Date.now() + 86400 * 1000 * 30] },
        qs = { "accessToken": mainUtils.obtainAppToken() };

        testUtils.defaultPost(`1.0/${name}`, { body, qs }, (err, res) => {
          should(err).be.equal(null);
          should(res.statusCode).equal(200);
          done();
        });
      });

      it("400", (done) => {
        let bodies = [
          null,
          {},
          { "K": 0 },
          { "K": 1 },
          { "G": [] },
          { "G": 1 },
          { "G": [-1] },
          { "validity": [ 0, Date.now() ] },
          { "K": 2, "G": [1, 1], "validity": [] },
          { "K": 2, "G": [1, 1], "validity": [1] },
          { "K": 2, "G": [1, 1], "validity": [-500, -10] }
        ],
        qs = { "accessToken": mainUtils.obtainAppToken() };

        async.each(
          bodies,
          (body, callback) => {
            testUtils.defaultPost(`1.0/${name}`, { body, qs }, (err, res) => {
              should(err).be.equal(null);
              should(res.statusCode).equal(400);
              callback(null);
            });
          },
          done
        )
      });
    });
  });
});