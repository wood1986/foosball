let utils = require("./utils.js");

let reqInfo = (req) => {
  return {
    body: req.body,
    header: req.header,
    method: req.method,
    param: req.param,
    query: req.query,
    url: req.url,
  };
}

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
    console.log(JSON.stringify(reqInfo(req)));
  }

  next();
};

module.exports.pong = (req, res) => {
  res.status(200).end();
}

module.exports.defaultGet = (collection) => {
  return (req, res, next) => {
    try {
      collection
        .aggregate(
          JSON.parse(req.query.pipeline),
          {},
          (err, result) => {
            if (err) {
              next(err);
              return;
            }
            
            res.status(result.length ? 404 : 200).json(result);
          }
        );
    }
    catch (err) {
      res.status(400);
      next(err);
    }
  }
}

module.exports.notFound = (req, res, next) => {
  res.status(400);
  next(new Error());
}

module.exports.error = (err, req, res) => {
  let reqInfo = this.reqInfo(req);
  reqInfo.stack = err.stack;
  console.log(JSON.stringify(reqInfo));

  if (!res.statusCode) {
    res.status(500);
  }

  res.end();
}
