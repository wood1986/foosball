let request = require("request"),
  should = require("should"),
  async = require("async"),
  mainUtils = require("../../common/mainUtils.js"),
  testUtils = require("../../common/testUtils.js");
    
let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  uri = `${require("../../../configs/configs.js").mocha.uri}/1.0/${name}`;

describe(`/1.0/${name}`, () => {
  let players = null;
  let settings = null;

  before((done) => {
    async.auto({
      "settings": (callback) => {
        testUtils.createSettings(32, [1, 1, 1, 1, 1, 1], [0, Date.now() + 86400000 * 365], callback);
      },
      "players": (callback) => {
        testUtils.createPlayers(
          4,
          callback
        );
      },
    }, (err, results) => {
      players = results.players;
      settings = results.settings;
      done();
    });
  });

  describe("POST", () => {
    describe("should return", () => {
      it("200", (done) => {
        let reqs = [
          {
            "body": {
              "winners": [players[0]._id],
              "losers": [players[1]._id],
              "score": 2,
              "playedAt": Date.now(),
              "K": settings._id,
              "G": settings._id
            },
            "qs": {
              "accessToken": players[0].accessToken
            }
          },
          {
            "body": {
              "winners": [players[0]._id],
              "losers": [players[1]._id],
              "score": 2,
              "playedAt": Date.now(),
              "K": settings._id,
              "G": settings._id
            },
            "qs": {
              "accessToken": mainUtils.obtainAppToken()
            }
          }
        ];

        async.each(
          reqs,
          (req, callback) => {
            request(
              {
                "method": "POST",
                uri,
                "json": true,
                "body": req.body,
                "qs": req.qs
              },
              (err, res) => {
                should(err).be.equal(null);
                should(res.statusCode).equal(200);
                callback();
              }
            )
          },
          done
        );
      });

      it("400", (done) => {
        let bodies = [
          null,
          {},
          { "winners": [players[1]._id], "losers": [players[0]._id] },
          { "winners": [], "losers": [] },
          { "winners": [players[0]._id, players[0]._id], "losers": [players[0]._id, players[0]._id] },
          { "winners": [players[0]._id, players[0]._id], "losers": [players[1]._id, players[2]._id] },
          { "winners": [players[0]._id, players[1]._id], "losers": [players[0]._id, players[1]._id] },
          { "winners": [players[0]._id, "0000000000000000000000"], "losers": [players[0]._id, players[1]._id] },
          { "winners": [players[0]._id, players[1]._id, "0000000000000000000000"], "losers": [players[2]._id, players[3]._id] },
          { "winners": [players[0]._id], "losers": [players[1]._id, players[2]._id] },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 0 },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 0 },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 1, "playedAt": Date.now() - 86400000 * 2 },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 1, "playedAt": Date.now() + 86400000 * 2 },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 1, "playedAt": Date.now() },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 1, "playedAt": Date.now(), K: settings._id },
          { "winners": [players[0]._id], "losers": ["1111111111111111111111"], "score": 1, "playedAt": Date.now(), K: settings._id, G: settings._id },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 1, "playedAt": Date.now(), K: "0000000000000000000000", G: settings._id },
          { "winners": [players[0]._id], "losers": [players[1]._id], "score": 1, "playedAt": Date.now(), K: settings._id, G: "0000000000000000000000" },
        ];

        async.each(
          bodies,
          (body, callback) => {
            request(
              {
                "method": "POST",
                uri,
                "json": true,
                "body": body,
                "qs": {
                  "accessToken": players[0].accessToken
                }
              },
              (err, res) => {
                should(err).be.equal(null);
                should(res.statusCode).equal(400);
                callback(null);
              }
            );
          },
          done
        );
      });
    });
  });
});