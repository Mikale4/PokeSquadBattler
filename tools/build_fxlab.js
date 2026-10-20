// Builds "PokeSquad Battler Move Lab.html": the built game with tools/fxlab.js added, a battle of one to three
// Pokémon a side where any move's animation can be played (build.sh runs this after every build; never edit the output). It sits next to the game so the
// move sounds load the same way.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const game = fs.readFileSync(path.join(root, "PokeSquad Battler.html"), "utf8");
const lab = fs.readFileSync(path.join(__dirname, "fxlab.js"), "utf8");
const at = game.lastIndexOf("</body>");
if (at < 0) throw new Error("no </body> in the game");
const out = game.slice(0, at) + "<script>\n" + lab + "\n</script>\n" + game.slice(at);
fs.writeFileSync(path.join(root, "PokeSquad Battler Move Lab.html"), out);
console.log("wrote PokeSquad Battler Move Lab.html");
