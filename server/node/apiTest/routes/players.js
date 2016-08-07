let request = require("request"),
  async = require("async"),  
  should = require("should"),
  configs = require("../../../configs/configs.js");
    
let name = __filename.replace(new RegExp(`(^${__dirname.replace("/", "\/")}\/|\.js$)`, "g"), ""),
  uri = `${configs.node.test.protocol}://${configs.node.test.host}/1.0/${name}`;  

describe(`/1.0/${name}`, () => {
  describe("POST", () => {
    describe("should return", () => {
      it("200", (done) => {
        let body = {
          "email": `${Math.random().toString(36).substring(2)}@${Math.random().toString(36).substring(2)}.com`,
          "displayName": Math.random().toString(36).substring(2).repeat(16)
        };

        request(
          {
            "method": "POST",
            uri,
            "json": true,
            "body": body
          },
          (err, res, body) => {
            should(err).be.equal(null);
            should(res.statusCode).equal(200);
            should(body).have.properties("_id", "accessToken");
            done();
          }
        )
      });

      it("400", (done) => {
        let bodies = [
          null,
          {},
          { "displayName": "" },
          { "email": "" },
          { "displayName": "400", "email": "400" }
        ];
        
        async.each(
          bodies,
          (body, callback) => {
            request(
              {
                "method": "POST",
                uri,
                "json": true,
                "body": body
              },
              (err, res) => {
                should(err).be.equal(null);
                should(res.statusCode).equal(400);
                callback(null);
              });
          },
          done
        );
      });
    });
  });
});
