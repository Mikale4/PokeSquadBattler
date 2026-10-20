// Builds "PokeSquad Battler Online.html": the built game with tools/online.js added, the online battle page (Showdown-style: the
// Teambuilder and battles against other players through server/server.js). build.sh runs this after every build; never edit the
// output. GitHub Pages serves it as online.html (.github/workflows/pages.yml).
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const game = fs.readFileSync(path.join(root, "PokeSquad Battler.html"), "utf8");
const page = fs.readFileSync(path.join(__dirname, "online.js"), "utf8");
const at = game.lastIndexOf("</body>");
if (at < 0) throw new Error("no </body> in the game");
const out = game.slice(0, at) + "<script>\n" + page + "\n</script>\n" + game.slice(at);
fs.writeFileSync(path.join(root, "PokeSquad Battler Online.html"), out);
console.log("wrote PokeSquad Battler Online.html");
