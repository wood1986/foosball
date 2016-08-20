let program = require("commander");

program
  .option("-m, --num-of-matches [m]", "#Matches", (n) => { return parseInt(n); }, 4)
  .option("-p, --num-of-players [p]", "#Players", (n) => { return parseInt(n); }, 4)
  .option("-K, --K [k]", "K", (n) => { return parseInt(n); }, 32)
  .option("-G, --G [g]", "G", (G) => { return G.split(',').map(parseFloat) }, [1, 1, 1, 1, 1, 1])
  .parse(process.argv);

let utils = require("../common/testUtils.js");

require("async").auto({
  "settings": (callback) => {
    utils.createSettings(program.K, program.G, [0, Date.now() + 86400000 * 365], callback);
  },
  "players": (callback) => {
    utils.createPlayers(
      program.numOfPlayers,
      callback
    );
  },
  "matches": ["players", "settings", (results, callback) => {
    utils.createMatches(
      program.numOfMatches,
      results.players,
      results.settings,
      callback
    );
  }],
  "display": ["players", "settings", (results, callback) => {
    console.log(results.players);  // eslint-disable-line no-console
    console.log(results.settings);  // eslint-disable-line no-console
    callback();
  }]
});
