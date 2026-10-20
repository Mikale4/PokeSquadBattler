// Builds "PokeSquad Battler Reference.html": every move, Ability, item and TM in the game with what it does, searchable,
// filterable and sortable. Everything comes from the built game (the same descriptions it shows), so rerun this after a rebuild.
// Run: node tools/build_reference.js
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const GAME = require('url').pathToFileURL(path.join(ROOT, 'PokeSquad Battler.html')).href;
const OUT = path.join(ROOT, 'PokeSquad Battler Reference.html');
const TEMPLATE = path.join(__dirname, 'reference.html');
// the owner's notes, once Claude has done them: Notes/done/*.md, each note's section with its id and version
// (<!-- note: move:thunderbolt @1760000000000 -->) and a **Done:** or **Not done:** line; the page shows them as replies
const NOTES_DONE = path.join(ROOT, 'Notes', 'done');
function noteReplies() {
  const out = {};
  if (!fs.existsSync(NOTES_DONE)) return out;
  for (const f of fs.readdirSync(NOTES_DONE).filter(f => f.endsWith('.md')).sort()) {
    const s = fs.readFileSync(path.join(NOTES_DONE, f), 'utf8');
    for (const part of s.split('<!-- note: ').slice(1)) {
      const m = part.match(/^(\S+) @(\d+) -->/); if (!m) continue;
      const sec = part.split(/\n## /)[0], d = sec.match(/\*\*(Done|Not done):\*\*\s*([\s\S]*?)\s*(?=\n---|$)/);
      if (d) out[m[1]] = { t: +m[2], kind: d[1], text: d[2].replace(/\s+/g, ' ').trim(), file: f };
    }
  }
  return out;
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, body: '' }));
  await page.goto(GAME);
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const png = b => b ? 'data:image/png;base64,' + b : null;
    // Pokémon, by Pokédex number
    const mons = OP_KEYS.slice().sort((a, b) => OPS[a].id - OPS[b].id);
    const mi = Object.fromEntries(mons.map((k, i) => [k, i]));
    const monList = mons.map(k => ({ k, n: OPS[k].n, id: OPS[k].id, t: OPS[k].types, ic: SPR.icon[k] || null }));
    // who learns what: level-up and TMs
    const lvBy = {}, tmBy = {};
    for (const k of mons) {
      for (const [lv, m] of OPS[k].learn) (lvBy[m] || (lvBy[m] = [])).push([mi[k], lv]);
      for (const n of OPS[k].tms || []) (tmBy[n] || (tmBy[n] = [])).push(mi[k]);
    }
    const tmOf = {};
    for (const [id, , , m] of TMS) (tmOf[m] || (tmOf[m] = [])).push(id);
    const TARGET = { enemy: 'One foe', aoe_enemies: 'All foes', self: 'Itself', team: 'Its team', ally_single: 'One ally', field: 'The field' };
    const moves = Object.keys(MOVES).map(k => {
      const M = MOVES[k], slot = slotOf(k), sk = skillFor(k, slot), flags = [];
      if (M.ct) flags.push('Contact'); if (M.so) flags.push('Sound'); if (M.pu) flags.push('Punch'); if (M.pw) flags.push('Powder');
      if (M.pri > 0 || M.sp === 'grassyglide') flags.push('Priority');   // (Grassy Glide counts for the +30% turn meter, the owner's rule)
      if (M.sp === 'ramp') flags.push('Doubles each use');   // Rollout, Fury Cutter, Echoed Voice, Round: x2 every time they're used in a battle, up to 16x if (M.hit) flags.push('Multi-strike'); if (M.dr > 0) flags.push('Drain'); if (M.dr < 0) flags.push('Recoil');
      if (M.hl) flags.push('Healing'); if (M.ail) flags.push('Status'); if (M.fl) flags.push('Flinch'); if (M.cr) flags.push('High crit'); if (M.st) flags.push('Stat change');
      if (M.crash) flags.push('Crash');
      const by = new Set((lvBy[k] || []).map(x => x[0])); for (const n of tmOf[k] || []) for (const x of tmBy[n] || []) by.add(x);
      const tmLearn = new Set(); for (const n of tmOf[k] || []) for (const x of tmBy[n] || []) tmLearn.add(x);
      return { k, n: M.n, t: M.t, c: M.c, p: M.c === 'X' ? 0 : (sk.pow || M.p || 0), vary: !!(sk.vary || sk.weight), range: sk.range || null, a: M.a || 0, pri: Math.max(0, M.pri || 0), s: slot,
        cd: sk.cd, tg: TARGET[sk.target] || sk.target || '', hits: sk.hits || null, f: flags, d: sk.desc,
        lv: lvBy[k] || [], tms: (tmOf[k] || []).map(n => tmName(n)), tl: [...tmLearn], by: [...by] };
    });
    // Abilities: everything a Kanto Pokémon can have, and who has it
    const abReg = {}, abHid = {};
    for (const k of mons) for (const a of OPS[k].abs) (a.h ? abHid : abReg)[a.k] = [...((a.h ? abHid : abReg)[a.k] || []), mi[k]];
    const abKeys = [...new Set([...Object.keys(ABILITY), ...Object.keys(abReg), ...Object.keys(abHid)])];
    const abilities = abKeys.map(k => { const A = abilityOf(k); return { k, n: A.name, d: A.text, works: A.id !== 'NONE', reg: abReg[k] || [], hid: abHid[k] || [] }; })
      .filter(a => a.reg.length || a.hid.length);
    // where items come from: the shops, and Explore
    const CUR = { lmd: 'Poké Dollars', tokens: 'BP', cert: 'Coins', orundum: 'Gems', prime: 'Max Elixir' };
    const src = {}, price = {};
    const addSrc = (k, s, p) => { (src[k] || (src[k] = [])).includes(s) || src[k].push(s); if (p) (price[k] || (price[k] = [])).push(p); };
    for (const [tab, sh] of Object.entries(SHOP)) {
      if (sh.hidden) continue;
      for (const it of sh.items) {
        const g = it.give, k = g.held || Object.keys(g)[0];
        if (g.op || k === 'sanityMax') continue;
        const n = g.held ? 1 : g[k];
        addSrc(k, `${sh.n}: ${it.cost.toLocaleString('en-US')} ${CUR[sh.cur] || sh.cur}${n > 1 ? ` for ${n}` : ''}`, { cur: CUR[sh.cur] || sh.cur, v: Math.round(it.cost / n) });
      }
    }
    for (const h of HUNTS) {
      const s = `Explore: ${h.n}`, kind = huntKind(h);
      if (kind === 'candy') { for (const k of ['rec1', 'rec2', 'rec3', 'rec4', 'rare']) addSrc(k, s); continue; }
      if (kind === 'money') { addSrc('lmd', s); continue; }
      if (h.stone) addSrc(h.stone, s);
      addSrc('summ', s); addSrc('lmd', s);
      for (const k of h.items || []) addSrc(k, s);
    }
    const icon = k => png(RES_DATA.item[k]);
    const KIND = k => ['lmd', 'orundum', 'cert', 'tokens'].includes(k) ? 'Currency' : ['permit', 'free10', 'gold5'].includes(k) ? 'Poké Ball'
      : ['rec1', 'rec2', 'rec3', 'rec4', 'rare'].includes(k) ? 'Candy' : STONES.includes(k) ? 'Evolution item' : k.startsWith('mint_') ? 'Mint'
      : k.startsWith('ability') ? 'Ability item' : k === 'prime' ? 'Medicine' : k === 'summ' ? 'Training item' : 'Other';
    const items = [];
    for (const k of Object.keys(ITEMS)) {
      if (k === 'sanity') continue;   // PP isn't an item
      items.push({ k, n: ITEMS[k].n, kind: KIND(k), d: ITEMS[k].d || '', ic: icon(k), tags: [], src: src[k] || [], price: price[k] || [], tier: 0 });
    }
    for (const k of HELD_KEYS) {
      const h = HELD[k], tags = [];
      const kind = h.berry ? 'Berry' : h.gem ? 'Gem' : /Plate$/.test(h.n) ? 'Plate' : /Incense$/.test(h.n) ? 'Incense' : h.boost ? 'Type booster' : 'Held item';
      if (h.boost) tags.push(`${h.boost} moves ×1.5`);
      if (h.gem) tags.push(`One ${h.gem} move ×1.3`);
      if (h.resist) tags.push(`Halves a ${h.resist} hit`);
      if (h.only) tags.push('Only ' + h.only.map(x => OPS[x] ? OPS[x].n : x).join(', '));
      if (h.cure) tags.push('Cures ' + h.cure.map(s => ({ PAR: 'paralysis', SLP: 'sleep', PSN: 'poison', TOX: 'bad poison', BRN: 'burn', FRZ: 'freezing', CNF: 'confusion' }[s] || s)).join(', '));
      if (h.berry) tags.push('Unnerve stops it');
      items.push({ k, n: h.n, kind, d: h.d, ic: icon(k), tags, src: src[k] || [], price: price[k] || [], tier: h.t || 0, held: 1 });
    }
    // TMs, HMs and TRs from every generation
    const tms = TMS.map(([id, g, label, m]) => ({ id, g, label, kind: tmKind(id), m, price: tmPrice(id), by: tmBy[id] || [] }));
    const types = Object.fromEntries(MOVE_TYPES.map(t => [t, png(RES_DATA.type[typeFile(t)])]));
    const cats = { P: png(RES_DATA.cat.P), S: png(RES_DATA.cat.S), X: png(RES_DATA.cat.X) };
    return { mons: monList, moves, abilities, items, tms, types, typeColor: TC, cats, catName: CAT_N, typeOrder: MOVE_TYPES };
  });
  await browser.close();
  if (errs.length) console.log('page errors:', errs.slice(0, 5));
  data.built = new Date().toISOString().slice(0, 10);
  data.replies = noteReplies();
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const html = fs.readFileSync(TEMPLATE, 'utf8').replace('__DATA__', () => json);
  fs.writeFileSync(OUT, html);
  console.log(`wrote ${path.basename(OUT)}: ${data.moves.length} moves, ${data.abilities.length} Abilities, ${data.items.length} items, ${data.tms.length} TMs, ${Object.keys(data.replies).length} note replies (${Math.round(html.length / 1024)} KB)`);
})();
