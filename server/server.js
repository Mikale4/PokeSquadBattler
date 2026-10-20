// PokeSquad Battler: the online battle server (the owner's ask, 2026-10-19). Plain Node, no packages.
//
// It pairs two players (a random queue, or a room code for a friend) and passes their choices between them. The battle itself
// runs on both phones: the game's own engine, built from the same seed, so only the choices travel (each one a move slot and
// target, a switch, or a pick after a faint). The server keeps each match's choice log, so a phone that drops out (a locked
// screen, a lost signal) rejoins and replays it; the two phones' state checks (a hash after each choice) catch a battle that
// went out of sync. A player gone for AWAY_MS loses.
//
//   node server.js            listens on $PORT (8787 locally)
//
// Messages are JSON, { t: type, ... }. From a phone: hello { name, look, token, v }, find, cancel, room { code? }, team { team },
// order { order }, choice { n, c }, hash { n, h }, over { win }, forfeit, ping. To a phone: welcome { token, n }, count { n },
// queued, room { code }, nocode, match { id, side, seed, opp }, teams { A, E }, start { orders }, choice { n, c }, desync { n },
// away, back, left, forfeit, resume { ... }, old.
const http = require("http"), crypto = require("crypto");
const PORT = +process.env.PORT || 8787, PROTO = 1, AWAY_MS = 60000, MAX_MSG = 256 * 1024;

// ---------- WebSocket (RFC 6455), just what browsers need ----------
function wsAccept(req, socket) {
  const key = req.headers["sec-websocket-key"];
  if (!key || (req.headers.upgrade || "").toLowerCase() !== "websocket") { socket.destroy(); return null; }
  const acc = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + acc + "\r\n\r\n");
  socket.setNoDelay(true);
  const ws = { socket, open: true, onmessage: null, onclose: null, buf: Buffer.alloc(0), frag: [] };
  ws.send = obj => { if (!ws.open) return; const data = Buffer.from(JSON.stringify(obj)); socket.write(Buffer.concat([frameHead(1, data.length), data])); };
  ws.close = () => { if (!ws.open) return; ws.open = false; try { socket.write(frameHead(8, 0)); socket.end(); } catch (e) { /* gone */ } };
  socket.on("data", chunk => {
    ws.buf = Buffer.concat([ws.buf, chunk]);
    if (ws.buf.length > MAX_MSG * 2) { ws.close(); return; }
    for (;;) {
      const b = ws.buf; if (b.length < 2) return;
      const fin = b[0] & 0x80, op = b[0] & 0x0f, masked = b[1] & 0x80;
      let len = b[1] & 0x7f, at = 2;
      if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); at = 4; }
      else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); at = 10; }
      if (len > MAX_MSG) { ws.close(); return; }
      const need = at + (masked ? 4 : 0) + len; if (b.length < need) return;
      let data = b.subarray(at + (masked ? 4 : 0), need);
      if (masked) { const m = b.subarray(at, at + 4); data = Buffer.from(data); for (let i = 0; i < data.length; i++) data[i] ^= m[i & 3]; }
      ws.buf = b.subarray(need);
      if (op === 8) { ws.close(); return; }
      if (op === 9) { socket.write(Buffer.concat([frameHead(10, data.length), data])); continue; }
      if (op === 10) continue;
      if (op === 0 || op === 1) {
        ws.frag.push(Buffer.from(data));
        if (!fin) continue;
        const text = Buffer.concat(ws.frag).toString("utf8"); ws.frag = [];
        let msg; try { msg = JSON.parse(text); } catch (e) { continue; }
        if (msg && typeof msg === "object" && ws.onmessage) ws.onmessage(msg);
      }
    }
  });
  const gone = () => { if (ws.dead) return; ws.dead = true; ws.open = false; if (ws.onclose) ws.onclose(); };
  socket.on("close", gone); socket.on("error", gone); socket.on("end", gone);
  return ws;
}
function frameHead(op, len) {
  if (len < 126) return Buffer.from([0x80 | op, len]);
  if (len < 65536) { const h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(len, 2); return h; }
  const h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(len), 2); return h;
}

// ---------- players, the queue, rooms, matches ----------
const players = new Map();   // token -> player { token, name, look, ws, match, side, away }
const queue = [], rooms = new Map(), matches = new Map();
const rid = n => crypto.randomBytes(n).toString("hex");
const code = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c; do { c = Array.from(crypto.randomBytes(5), b => A[b % A.length]).join(""); } while (rooms.has(c)); return c; };
const clean = s => String(s || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 18) || "Trainer";
const send = (p, m) => { if (p && p.ws && p.ws.open) p.ws.send(m); };
const online = () => [...players.values()].filter(p => p.ws && p.ws.open).length;
const tellCount = () => { const n = online(); for (const p of players.values()) if (!p.match) send(p, { t: "count", n }); };
const other = (m, side) => m.p[side === "A" ? "E" : "A"];
function leaveLobby(p) {
  const i = queue.indexOf(p); if (i >= 0) queue.splice(i, 1);
  for (const [c, q] of rooms) if (q === p) rooms.delete(c);
}
function startMatch(a, b) {
  leaveLobby(a); leaveLobby(b);
  const m = { id: rid(6), seed: crypto.randomBytes(4).readUInt32BE(0) || 1, p: { A: a, E: b }, team: {}, order: {}, log: [], hash: {}, over: false };
  matches.set(m.id, m);
  for (const [side, p] of [["A", a], ["E", b]]) {
    p.match = m; p.side = side;
    const o = other(m, side);
    send(p, { t: "match", id: m.id, side, seed: m.seed, opp: { name: o.name, look: o.look } });
  }
}
function endMatch(m) {
  if (m.over) return; m.over = true;
  for (const p of Object.values(m.p)) if (p.match === m) { p.match = null; p.side = null; if (p.awayT) { clearTimeout(p.awayT); p.awayT = null; } }
  setTimeout(() => matches.delete(m.id), 10 * 60000);
  tellCount();
}
function onMessage(p, msg) {
  const m = p.match;
  switch (msg.t) {
    case "ping": send(p, { t: "pong" }); break;
    case "find":
      if (m) break; leaveLobby(p);
      { const q = queue.find(x => x !== p && x.ws && x.ws.open); if (q) startMatch(q, p); else { queue.push(p); send(p, { t: "queued" }); } }
      break;
    case "cancel": leaveLobby(p); send(p, { t: "cancelled" }); break;
    case "room":
      if (m) break; leaveLobby(p);
      if (msg.code) { const c = String(msg.code).toUpperCase().trim(), q = rooms.get(c); if (!q || q === p || !q.ws || !q.ws.open) { send(p, { t: "nocode" }); break; } rooms.delete(c); startMatch(q, p); }
      else { const c = code(); rooms.set(c, p); send(p, { t: "room", code: c }); }
      break;
    case "team":   // (the phones check each other's team against the game's rules: the server only passes it on)
      if (!m || m.over || m.team[p.side] || JSON.stringify(msg.team || null).length > 64 * 1024) break;
      m.team[p.side] = msg.team;
      if (m.team.A && m.team.E) for (const q of Object.values(m.p)) send(q, { t: "teams", A: m.team.A, E: m.team.E });
      break;
    case "order":
      if (!m || m.over || m.order[p.side] || !Array.isArray(msg.order)) break;
      m.order[p.side] = msg.order.slice(0, 6);
      if (m.order.A && m.order.E) for (const q of Object.values(m.p)) send(q, { t: "start", orders: m.order });
      break;
    case "choice":   // (in order: the n-th choice of the battle; a repeat after a rejoin is ignored)
      if (!m || m.over || msg.n !== m.log.length) break;
      m.log.push(msg.c); send(other(m, p.side), { t: "choice", n: msg.n, c: msg.c });
      break;
    case "hash": {
      if (!m || m.over) break;
      const h = m.hash[msg.n] = m.hash[msg.n] || {}; h[p.side] = msg.h;
      if (h.A != null && h.E != null && h.A !== h.E) for (const q of Object.values(m.p)) send(q, { t: "desync", n: msg.n });
      break;
    }
    case "over": if (m) endMatch(m); break;
    case "forfeit": if (m && !m.over) { send(other(m, p.side), { t: "forfeit" }); endMatch(m); } break;
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*" });
  res.end(`PokeSquad Battler server: ${online()} online\n`);
});
server.on("upgrade", (req, socket) => {
  const ws = wsAccept(req, socket); if (!ws) return;
  let p = null;
  ws.onmessage = msg => {
    if (!p) {
      if (msg.t !== "hello") return;
      if (msg.v !== PROTO) { ws.send({ t: "old" }); ws.close(); return; }
      // (a token from before: the same player coming back, into its match if it's still on)
      p = msg.token && players.get(msg.token);
      if (p) { if (p.ws && p.ws !== ws) p.ws.close(); }
      else { p = { token: rid(16), match: null, side: null }; players.set(p.token, p); }
      p.ws = ws;
      p.name = clean(msg.name); p.look = String(msg.look || "red").slice(0, 24); p.seen = Date.now();
      ws.send({ t: "welcome", token: p.token, n: online() });
      const m = p.match;
      if (m && !m.over) {
        if (p.awayT) { clearTimeout(p.awayT); p.awayT = null; }
        const o = other(m, p.side);
        ws.send({ t: "resume", id: m.id, side: p.side, seed: m.seed, opp: { name: o.name, look: o.look }, teams: m.team, orders: m.order, log: m.log });
        send(o, { t: "back" });
      }
      tellCount();
      return;
    }
    p.seen = Date.now();
    onMessage(p, msg);
  };
  ws.onclose = () => {
    if (!p || p.ws !== ws) return;
    p.ws = null; leaveLobby(p);
    const m = p.match;
    if (m && !m.over) {
      send(other(m, p.side), { t: "away", secs: AWAY_MS / 1000 });
      p.awayT = setTimeout(() => { p.awayT = null; if (p.match === m && !m.over && !(p.ws && p.ws.open)) { send(other(m, p.side), { t: "left" }); endMatch(m); } }, AWAY_MS);
    }
    tellCount();
  };
});
// (a ping every 25 s keeps the connection open through proxies; players gone for a day are forgotten)
setInterval(() => {
  for (const p of players.values()) if (p.ws && p.ws.open) { try { p.ws.socket.write(frameHead(9, 0)); } catch (e) { /* gone */ } }
  const old = Date.now() - 864e5;
  for (const [t, p] of players) if (!(p.ws && p.ws.open) && !p.match && (p.seen || 0) < old) players.delete(t);
}, 25000);
server.listen(PORT, () => console.log(`PokeSquad Battler server on port ${PORT}`));
