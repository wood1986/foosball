let utils = require("./utils.js");

module.exports.parseAccessToken = (req, res, next) => {
  let accessToken = null;

  try {
    if (req.query.accessToken) {
      accessToken = JSON.parse(utils.decrypt(req.query.accessToken));

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
  if (!utils.isProduction()) {
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

module.exports.defaultGet = (collection) => {
  return (req, res) => {
    try {
      collection
        .aggregate(JSON.parse(req.query.q))
        .toArray((err, docs) => {
          if (err) {
            res.status(500).end();
            return;
          }

          res.status(docs.length ? 404 : 200).json(docs);
        });
    }
    catch(err) {
      res.status(400).end();
    }
  }
}
