// PokeSquad Battler on Showdown's client: lays the game's data (PokeSquadData, above) over Showdown's as the "gen9pokesquad" mod
// (the format [Gen 9] PokeSquad: battle-dex-data.ts gives it this mod). Showdown's data loads by itself, often from
// play.pokemonshowdown.com, so this waits until all of it is there. What it sets:
//  - BattleTeambuilderTable.gen9pokesquad: the Pokémon the game has (tiers, by generation; the PvP groups as their tier), what
//    each learns (learnsets), each move's slot (slots), each Pokémon's Abilities (abilities: [id, hidden]), the held items (items),
//    the moves', Pokémon's numbers where the game's differ (overrideMoveData, overrideSpeciesData), the Stadium's rules
//  - BattleText.en: the game's texts for its moves, Abilities and held items, under the mod
//  - BattleMovedex and the search index: the slotted Sketch, Copycat and Mirror Move ("Sketch (S1)"...)
// (tools/showdown_data_loader.js in Mikale4/PokeSquadBattler; tools/build_showdown_data.js puts it in pokesquad/data.js.)
(function () {
	var D = window.PokeSquadData, MOD = 'gen9pokesquad';
	var CAT = { P: 'Physical', S: 'Special', X: 'Status' };
	var GROUP = { legendary: 'Legend', mythical: 'Mythical', ultraBeast: 'UB', paradox: 'Paradox' };
	function loaded() {
		var W = window;
		return W.BattleTeambuilderTable && W.BattleTeambuilderTable.learnsets && W.BattleTeambuilderTable.gen8 && W.BattleMovedex && W.BattleMovedex.tackle &&
			W.BattlePokedex && W.BattlePokedex.bulbasaur && W.BattleItems && W.BattleItems.leftovers &&
			W.BattleAbilities && W.BattleAbilities.static && W.BattleText && W.BattleText.en && W.BattleText.en.Moves;
	}
	// (the search index is the teambuilder's: a replay has none, so its new entries go in whenever it's there)
	var unindexed = [];
	function indexReady() {
		return window.BattleSearchIndex && BattleSearchIndex.length && window.BattleSearchIndexOffset && BattleSearchIndexOffset.length;
	}
	function text(table, id, name, shortDesc, desc) {
		var t = BattleText.en[table] || (BattleText.en[table] = {}), e = t[id] || (t[id] = {});
		if (name && !e.name) e.name = name;
		e[MOD] = { shortDesc: shortDesc, desc: desc || shortDesc };
	}
	// a new entry in the search index, in its sorted place (aliases point at entries by index: move them along)
	function addToIndex(id, type) {
		var idx = BattleSearchIndex, off = BattleSearchIndexOffset, lo = 0, hi = idx.length;
		for (var i = 0; i < idx.length; i++) if (idx[i][0] === id && idx[i].length <= 2) return;
		while (lo < hi) { var mid = (lo + hi) >> 1; if (idx[mid][0] <= id) lo = mid + 1; else hi = mid; }
		for (var j = 0; j < idx.length; j++) if (idx[j].length > 2 && idx[j][2] >= lo) idx[j][2]++;
		idx.splice(lo, 0, [id, type]);
		off.splice(lo, 0, '');
	}
	function apply() {
		var T = {
			learnsets: {}, slots: {}, abilities: {}, tiers: [], items: [], formatSlices: {},
			overrideMoveData: {}, overrideSpeciesData: {}, overrideAbilityData: {}, overrideItemData: {}, overrideTier: {},
			cd: D.cd, iv: D.iv, level: D.level, limits: D.limits, itemClause: D.itemClause, ban: D.ban, version: D.v, rage: [],
		};
		var banned = function (list, id) { return list.indexOf(id) >= 0; };
		var ids = [];
		D.moves.forEach(function (m) {
			// [id, its own name (a slotted copy) or 0, slot, type, category, power, accuracy (0: never misses), priority, short text, text, base id,
			// 1 for the moves that work like Rage Fist here (T.rage: Stored Power, Rage, Punishment, Payback)]
			var id = m[0];
			ids.push(id);
			if (m[10] && !BattleMovedex[id] && BattleMovedex[m[10]]) {
				var copy = {};
				for (var key in BattleMovedex[m[10]]) copy[key] = BattleMovedex[m[10]][key];
				copy.name = m[1];
				BattleMovedex[id] = copy;
				unindexed.push(id);
			}
			T.slots[id] = m[2];
			if (m[11]) T.rage.push(id);
			T.overrideMoveData[id] = { type: m[3], category: CAT[m[4]] || 'Status', basePower: m[5], accuracy: m[6] || true, priority: m[7] };
		});
		var gen = 0;
		D.species.forEach(function (s) {
			var id = s[0];
			if (s[1] !== gen) { gen = s[1]; T.tiers.push(['header', 'Generation ' + gen]); }
			T.tiers.push(id);
			var groups = s[2] ? s[2].split(',') : [];
			T.overrideTier[id] = banned(D.ban.pokemon, id) ? 'Banned' : groups.length ? groups.map(function (g) { return GROUP[g] || g; }).join('/') : '';
			var learn = {};
			(D.learn[id] || '').split(',').forEach(function (n) {
				if (!n) return;
				var mid = ids[parseInt(n, 36)];
				if (mid && !banned(D.ban.moves, mid)) learn[mid] = '9a';
			});
			T.learnsets[id] = learn;
			var abs = D.abil[id] || [], keys = ['0', '1', 'H', 'S'], regular = [], hidden = [], o = {};
			abs.forEach(function (a) { (a[1] ? hidden : regular).push(a[0]); });
			var order = [regular[0], regular[1], hidden[0], hidden[1] || regular[2]].concat(regular.slice(hidden[1] ? 2 : 3), hidden.slice(2));
			var n = 0;
			order.forEach(function (a, i) {
				if (!a) return;
				var ab = BattleAbilities[a];
				o[i < 4 ? keys[i] : String(2 + n++)] = ab ? ab.name : a;
			});
			T.abilities[id] = abs.filter(function (a) { return !banned(D.ban.abilities, a[0]); });
			var fix = { abilities: o };
			if (D.fix[id]) for (var f in D.fix[id]) fix[f] = D.fix[id][f];
			T.overrideSpeciesData[id] = fix;
		});
		var berries = false, rest = false;
		D.items.forEach(function (it) {
			var id = it[0];
			if (banned(D.ban.items, id)) return;
			if (/berry$/.test(id)) { if (!berries) T.items.push(['header', 'Berries']); berries = true; }
			else if (!rest) { T.items.push(['header', 'Held items']); rest = true; }
			T.items.push(id);
		});
		BattleTeambuilderTable[MOD] = T;
		applyTexts();
		// (anything Showdown already looked up for the mod, it looks up again)
		if (window.Dex && Dex.moddedDexes) delete Dex.moddedDexes[MOD];
	}
	/** The game's texts for its moves, Abilities and held items (Showdown's English text file can load more than once: each time
	 * it replaces them, and they're laid on again) */
	function applyTexts() {
		// (a round, every Pokémon on the field acting once: the battle log's heading and the box on the battlefield, the owner's ask)
		var dt = BattleText.en.Default && BattleText.en.Default.default; if (dt) dt.turn = '== Round {NUMBER} ==';
		D.moves.forEach(function (m) { text('Moves', m[0], m[1] || null, m[8], m[9]); });
		D.abText.forEach(function (a) {
			// [id, name, text, works]
			text('Abilities', a[0], a[1], a[3] ? a[2] : 'No effect in PokeSquad Battler. ' + a[2], null);
		});
		D.items.forEach(function (it) { text('Items', it[0], null, it[1], null); });
	}
	function textsOn() {
		var first = D.moves[0] && BattleText.en.Moves[D.moves[0][0]];
		return !!(first && first[MOD]);
	}
	(function wait() {
		if (!loaded()) return setTimeout(wait, 50);
		// (a data file that loads again replaces Showdown's tables or texts: lay the game's back over them)
		var redraw = !BattleTeambuilderTable[MOD] || !textsOn();
		if (!BattleTeambuilderTable[MOD]) apply();
		else if (!textsOn()) applyTexts();
		// (anything drawn before it, such as a team open as the page loads, is drawn again on the game's data)
		if (redraw && window.PS && PS.update) PS.update();
		if (unindexed.length && indexReady()) { unindexed.forEach(function (id) { addToIndex(id, 'move'); }); unindexed = []; }
		setTimeout(wait, 1000);
	})();
})();
