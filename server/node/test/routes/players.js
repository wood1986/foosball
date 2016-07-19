let request = require("request"),
  should = require("should");
    
let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), "");

describe(`/1.0/${name}`, () => {
  describe("Create a player profile with vaild parameters", () => {
    it("should return 200", (done) => {
      let body = {
        "email": `${Math.random().toString(36).substring(2)}@${Math.random().toString(36).substring(2)}.com`,
        "displayName": Math.random().toString(36).substring(2)
      };

      request(
        {
          "method": "POST",
          "uri": `http://localhost:3000/1.0/${name}`,
          "json": true,
          "body": body
        },
        (err, res, body) => {
          should(err).not.be.ok;
          should(res.statusCode).equal(200);
          should(body).have.properties("id", "accessToken");
          done();
        }
      )
    });
  });

  describe("Create a player profile with ", () => {
    describe("empty body", () => {
      it("should return 400", (done) => {
        request(
          {
            "method": "POST",
            "uri": "http://localhost:3000/1.0/players",
            "json": true,
            "body": {}
          },
          (err, res) => {
            should(res.statusCode).equal(400);
            done();
          }
        )
      })
    });

    describe("invalid email", () => {
      it("should return 400", (done) => {
        request(
          {
            "method": "POST",
            "uri": "http://localhost:3000/1.0/players",
            "json": true,
            "body": {
              "displayName": Math.random().toString(36).substring(2),
              "email": "invalid"
            }
          },
          (err, res) => {
            should(res.statusCode).equal(400);
            done();
          }
        )
      })
    });
  });

});