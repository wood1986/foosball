let request = require("request"),
  should = require("should"),
  utils = require("../utils.js");
    
let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), "");

describe(`/1.0/${name}`, () => {
  let players = null;

  before((done) => {
    utils.createPlayers(4, (err, results) => {
      players = results;
      done();
    });
  });

  describe("Create a match with", () => {
    it("valid parameters should return 200", (done) => {
      request(
        {
          "method": "POST",
          "uri": `http://localhost:3000/1.0/${name}`,
          "json": true,
          "body": {
            "winners": [players[0].id, players[1].id],
            "losers": [players[2].id, players[3].id],
            "score": 4
          },
          "qs": {
            "accessToken": players[0].accessToken
          }
        },
        (err, res) => {
          should(res.statusCode).equal(200);
          done();
        }
      )
    });

    describe("invalid access token", () => {
      it("should return 401", (done) => {
        request(
          {
            "method": "POST",
            "uri": `http://localhost:3000/1.0/${name}`,
            "json": true,
            "body": {
              "winners": [players[0].id, players[1].id],
              "losers": [players[2].id, players[3].id],
              "score": 4
            }
          },
          (err, res) => {
            should(res.statusCode).equal(401);
            done();
          }
        )
      })
    });

    describe("invalid body", () => {
      it("should return 400", (done) => {
        request(
          {
            "method": "POST",
            "uri": `http://localhost:3000/1.0/${name}`,
            "json": true,
            "qs": {
              "accessToken": players[0].accessToken
            }
          },
          (err, res) => {
            should(res.statusCode).equal(400);
            done();
          }
        )
      })
    });

    describe("invalid playedAt", () => {
      it("should return 401", (done) => {
        request(
          {
            "method": "POST",
            "uri": `http://localhost:3000/1.0/${name}`,
            "json": true,
            "body": {
              "winners": [players[0].id, players[1].id],
              "playedAt": "a"
            },
            "qs": {
              "accessToken": players[0].accessToken
            } 
          },
          (err, res) => {
            should(res.statusCode).equal(400);
            done();
          }
        )
      })
    })
  })
})