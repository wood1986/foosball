let fs = require("fs"),
  async = require("async"),
  _ = require("lodash"),
  spawn = require("child_process").spawn,
  mm = require("micromatch");

let file = null,
    spawnOptions = {
      "cwd": `${__dirname}`,
      "stdio": ["ignore", process.stdout, process.stderr]
    },
    tasks = {
      "eslint": {
        "spawn": (callback) => {
          spawn(
            "./node_modules/eslint/bin/eslint.js",
            ["**/*.js"],
            spawnOptions
          ).on("exit", (code) => {
            callback(code != 0 ? true : null);
          });
        },
      },
      "mocha": {
        "spawn": (callback) => {
          spawn(
            "./node_modules/mocha/bin/mocha",
            [file],
            spawnOptions
          ).on("exit", (code) => {
            callback(code != 0 ? true : null);
          });
        }
      },
      "node": {
        "spawn": (callback) => {
          if (this.process) {
            this.process.kill();
          }

          this.process = spawn(
            "node",
            ["./apiMain/app.js"],
            spawnOptions
          );

          this.process.on("exit", (code) => {
            callback(code != 0 ? true : null);
          });
        } 
      }
    },
    triggers = [
      {
        "glob": ["**/apiTest/**.js", "**/common/testUtils.js"],
        "tasks": ["eslint", "mocha"],
      },
      {
        "glob": ["**/apiMain/**.js", "**/common/**.js", "!**/common/testUtils.js"],
        "tasks": ["eslint", "node", "mocha"]
      }
    ];

fs.watch(
  "./",
  { "recursive": true },
  (eventType, filename) => {
    if (eventType !== "change")
      return;
    
    file = `${__dirname}/${filename}`;
    
    let i = 0;
    
    while (i < triggers.length && mm([file], triggers[i].glob).length === 0)
      i++;
    
    if (i === triggers.length)
      return;

    async.waterfall(_.map(triggers[i].tasks, (task) => { return tasks[task].spawn; }));
  }
);


