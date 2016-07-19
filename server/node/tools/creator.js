let program = require("commander");
program
  .option("-m, --num-of-matches <m>", "#Matches", 1)
  .option("-p, --num-of-players <p>", "#Players", 2)
  .option("-u, --url [value]", "url", "http://localhost:3000")
  .parse(process.argv);

let utils = require("../test/utils.js");
utils.apiUrl = program.url;

let async = require("async");

async.waterfall([
  (callback) => {
    utils.createPlayers(
      program.numOfPlayers,
      (err, players) => {
        players.forEach((player) => {
          console.log(`${player.id} ${player.accessToken}`);  // eslint-disable-line no-console
        });
        
        callback(null, players);
      }
    );
  },
  (players, callback) => {
    
    utils.createMatches(
      program.numOfMatches,
      players,
      callback()
    );
  }
]);
