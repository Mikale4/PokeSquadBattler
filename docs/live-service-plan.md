# Live service: how the gacha event spec becomes Kanto Squad

Update (2026-10-07, the owner's review): there is one server now (no server list, opening rushes, groups or merges); the launch
events became Rookie Week (a new Trainer's 7-day login bonus and Rookie Missions for their first 7 days) and the weekly Ranked Race;
the Journey Rush became Journey Milestones (always on); the Lottery, Auction and daily tallies run every day; the Investment Plan is a
new Trainer's first 7 days; the Check-In follows the calendar and the Poké Pass keeps missed days; and every feature opens with the
Journey (README, "Features open as the adventure goes on"). The phases below describe the original build.

Status: all nine phases are built (src/a6j_live.js, a6k_offers.js, a6l_passes.js, a6m_lucky.js, a6n_festivals.js, plus the Safari Zone changes
in a6_state.js/a6d_safari.js and the Demo in a9g_demo.js). Left out on purpose: watching ads for spins (there are no ads) and "faction" areas
(every Pokémon here is from Kanto).

Source: `pokemon_gacha_live_service_events_expanded.md` (120 sections). This file maps every system in it onto the game and
says in which phase it is built. Visible names follow the game's Pokémon terms (README glossary). There is no real money:
a **Recharge** stands in for every purchase (see Phase 1).

## Words: spec → game

| Spec | Kanto Squad |
|---|---|
| Summon / pull / recruitment | Safari throw (the Safari Zone is the gacha) |
| Banner | Safari area (weekly areas, plus the event areas below) |
| Summon ticket | Safari Ball (1 throw), Safari Pass (10), Master Ball (a sure 5★) |
| Shards / star-up | Duplicates raise IVs (Perfect IVs pay Coins) |
| Selector | a Choice Box: you pick one Pokémon from a list |
| Equipment | Held items |
| Stamina | PP |
| Arena / tiers | Ranked Battles (Beginner … Legend) and Link Battles |
| Campaign / chapters | the Journey |
| Guild | Club |
| Raid / boss | Raid Battles |
| Team Power | Team Power: the CP of your best six |
| Gold | Poké Dollars |
| Skins / frames / titles | Trainer Card titles |
| Paid gems / bonus gems | Recharged Gems / Bonus Gems (both spend as Gems; tracked apart) |

## Phase 1 — the backbone
- **Recharge** (user's rule): once an hour, a Recharge gives a random Gem pack for free; it stands in for buying Gems.
  Packs 60 / 300 / 980 / 1,980 / 3,280 / 6,480 Gems (small ones most likely). The first time each pack comes up it's
  doubled (§27, the double resets for anniversaries and new servers, §28). You, the Demo and every simulated Trainer
  recharge; Trainers keep recharging while the game is closed (worked out from the clock, per Trainer and persona).
- **Gem ledger** (§26): earned (free), recharged (paid), bonus. Recharge events and rankings count recharged Gems only.
- **VIP 0–10** (§73) from lifetime recharged Gems: more PP, Ranked Tickets, daily VIP gift, extra free spins, VIP packs (§74).
- **Event bus** (§84, §116): every action reports itself once (`live(kind, n)`: Safari throw, Gems spent, Recharge, battle
  won, Ranked win, level up, Badge, catch, evolution, Mastery, held item, Raid damage, PP spent...). Every active event
  listens, so one action advances many events at once.
- **Event scheduler and Event Center** (§87, §113): which events run on this server right now, from its age (opening
  schedule), the week (calendar), the date (seasons, anniversary) and surprises; one screen with every event by category,
  exact end times (§118), a calendar with tomorrow's events (§88).
- **Simulated economy** for the 1,500 Trainers: recharges, Gems spent, throws, VIP, from their persona (whale, free-to-play,
  ...) and time online; feeds every ranking below.

## Phase 2 — gacha (§10–20)
Standard area (The Whole Park), weekly areas, Featured, Legendary/Mythical (legendaries join the gacha as rate-up event
areas), Limited (only during its event), Type areas, Step-Up (5 escalating steps with guarantees), Ticket areas (only
Safari Balls), first throw of the day discounted, ×10 discount, soft pity (shown), hard pity (a sure 5★ at 90), featured
guarantee (lose the 50/50 → next 5★ is the featured one), spark: Safari Points per throw, exchange for the featured
Pokémon (§15). Rates and pity rules always shown (§118).

## Phase 3 — rankings and the server (§2–9, §110–111)
New Server Rush rotating by day (§9, §111: Trainer Level, Journey, Safari, Evolution, Team Power, Ranked, Gem Spending,
Pokédex/Legendary, held items, Server Championship) with milestone rewards and ranking pay by Mail at settlement; server
milestones and "first Trainer on the server to..." (§6); Club ranking; server groups and cross-server Ranked (§5); server
merges with merge events (§109). Every ranking includes the 1,500 Trainers.

## Phase 4 — spending and recharge events (§21–25, §43–47, §101–103)
Gem Consumption Rush (points, milestones, ranking), Gem Rebate, Spend & Earn chains, Daily/Cumulative Spending, Daily/
Cumulative Recharge (higher tiers include lower), Recharge Ranking, Recharge Ladder, First Top-Up gift (§37).

## Phase 5 — promotions and packages (§31–37, §69–72, §75–81, §98–108)
Packages are bought with Gems. Level packs (Lv 10–60), Ranked tier packs, Journey chapter packs, boss packs (Giovanni,
Mewtwo), Team Power packs, "You just unlocked this" pop-ups, progress offers (IVs, pity, evolutions, "almost there"),
flash sales, daily and weekly deals, limited stock (shared with the server's Trainers), purchase-count and escalating
bundles, first-24-hour and first-7-day offers, account-age offers, returning-player and catch-up (EXP boost) offers.

## Phase 6 — passes (§38–42, §65, §82)
Monthly Pass (Poké Pass), Battle Pass (free / premium / premium+ tracks), Event Pass (Mewtwo Research Pass), Growth Fund,
Professor Oak's Investment Plan (0-cost purchase), 7/14/30-day login events ("miss a day" variants shown honestly).

## Phase 7 — lucky events (§48–64, §93–97)
Poké Wheel (free spins, VIP spins, progressive), Kanto Adventure Board (dice: normal/lucky/golden, laps, ranking), Champion
Lottery (server pool with the Trainers, drawn at the end), Scratch-Off, Pick-a-Box with reset, Team Rocket Treasure Hunt,
Flip Cards, Choose-Your-Reward, Lucky Bags (pity), progressive and server-wide jackpots, server Auction against Trainers.
The Game Corner's slot machine (HeartGold/SoulSilver's, `a9j_slots.js`): Coins, exact odds from the reels, the Starter Bonus,
Game Corner Fever on Mondays (20 free spins), and the Champion Lottery's draw shown on its reels.

## Phase 8 — the calendar's content (§66–68, §85–92)
Event currencies and limited shops (spend or convert before the end), event missions (daily/weekly/event), event chains,
seasonal events by date, the game's anniversary (1 April), hidden/surprise events, a collaboration-style crossover.

## Phase 9 — everyone plays it
The Demo uses all of it like an expert (recharges hourly, saves Gems for consumption events, buys only good-value packs,
uses free spins/dice...). Trainers chat about events. Tests and README.
