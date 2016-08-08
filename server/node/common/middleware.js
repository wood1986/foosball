let utils = require("./mainUtils.js");

let reqInfo = (req) => {
  return {
    body: req.body,
    headers: req.headers,
    method: req.method,
    params: req.params,
    query: req.query,
    ip: req.ip,
    ips: req.ips,
    url: req.url
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
      err.statusCode = 400;
      next(err);
    }
  }
}

module.exports.notFound = (req, res, next) => {
  let err = new Error();
  err.statusCode = 404;
  next(err);
}

module.exports.error = (err, req, res, next) => {
  let _reqInfo = reqInfo(req);
  _reqInfo.stack = err.stack;
  console.log(_reqInfo);
  res.status(err.statusCode).end();
}
