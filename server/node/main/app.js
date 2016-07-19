"use strict";

let app = require("express")(),
  utils = require("./utils.js");

app.enable("trust proxy");
app.use(require("body-parser").json());
app.listen(3000);

require("./io.js")(app);

require("./mongo.js")(() => {
  app.use("/", utils.log);
  app.use("/", utils.parseAccessToken);

  app.use("/", require("./routes/players.js"));
  app.use("/", require("./routes/matches.js"));
});
