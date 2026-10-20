// Builds "PokeSquad Battler Team Config.html": the built game with tools/teamcfg.js added, the page that edits how Trainer
// teams are made (roles, archetypes, rules, tiers, modes) and exports config/team_config.json, which the next build embeds.
// build.sh runs this after every build; never edit the output. It carries config/team_config.default.json (the original, as
// first made from the game's code) for its "back to the original" button.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const game = fs.readFileSync(path.join(root, "PokeSquad Battler.html"), "utf8");
const page = fs.readFileSync(path.join(__dirname, "teamcfg.js"), "utf8");
const defFile = path.join(root, "config", "team_config.default.json");
const def = fs.existsSync(defFile) ? fs.readFileSync(defFile, "utf8") : "null";
const at = game.lastIndexOf("</body>");
if (at < 0) throw new Error("no </body> in the game");
const out = game.slice(0, at) + "<script>\nconst TEAM_CONFIG_DEFAULT = " + JSON.stringify(JSON.parse(def)) + ";\n" + page + "\n</script>\n" + game.slice(at);
fs.writeFileSync(path.join(root, "PokeSquad Battler Team Config.html"), out);
console.log("wrote PokeSquad Battler Team Config.html");
