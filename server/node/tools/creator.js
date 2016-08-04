let program = require("commander");

program
  .option("-m, --num-of-matches [m]", "#Matches", parseInt, 1)
  .option("-p, --num-of-players [p]", "#Players", parseInt, 2)
  .option("-u, --url [url]", "url", "http://localhost:3000")
  .option("-K, --K [k]", "K", parseInt, 32)
  .option("-G, --G [g]", "G", (G) => { return G.split(',').map(parseFloat) }, [1, 1, 1, 1, 1, 1])
  .parse(process.argv);

let utils = require("../api/test/utils.js");
utils.apiUrl = program.url;

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
    console.log(results.players);
    console.log(results.settings);
    callback();
  }]
});
