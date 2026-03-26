/**
 * Import match scores from Excel spreadsheet into Firestore.
 * Uses Firebase Admin SDK with Application Default Credentials.
 *
 * Usage: node scripts/import-scores.mjs
 */

import { db, appId } from "./firebase-admin-init.mjs";

// Player name -> ID mapping
const PLAYER_NAMES_TO_ID = {
  "Azeem Muhammad": "player_1", "Iqbal Qasim": "player_2", "Wasef": "player_3",
  "Qavi": "player_4", "Ikram": "player_5", "Sabih": "player_6",
  "Taha R": "player_7", "Anas": "player_8", "Junaid A": "player_9",
  "Qhyam": "player_10", "Adil": "player_11", "Fateh": "player_12",
  "Taha M": "player_13", "Shahrukh": "player_14", "Nasheet": "player_15",
  "Naseer": "player_16", "Junaid M": "player_17", "Saleem": "player_18",
  "Owais": "player_19", "MJ": "player_20", "Madni": "player_21",
  "Salman": "player_22", "Yaseer": "player_23", "Fahad": "player_24",
  "Jabir Bhai": "player_25", "Yousaf": "player_26", "Zafar": "player_27",
  "Naveed": "player_28", "Javed C": "player_29", "Raza D": "player_30",
  "Rafey": "player_31", "Danial S": "player_32",
};
const ID_TO_NAME = Object.fromEntries(Object.entries(PLAYER_NAMES_TO_ID).map(([n, id]) => [id, n]));

// Original seeded schedule for matches that have scores in Excel
const SEEDED = {
  1:  { pA1: "player_1",  pA2: "player_8",  pB1: "player_17", pB2: "player_24" },
  8:  { pA1: "player_3",  pA2: "player_4",  pB1: "player_28", pB2: "player_29" },
  13: { pA1: "player_9",  pA2: "player_15", pB1: "player_17", pB2: "player_23" },
  14: { pA1: "player_16", pA2: "player_14", pB1: "player_24", pB2: "player_22" },
  17: { pA1: "player_1",  pA2: "player_6",  pB1: "player_9",  pB2: "player_14" },
  19: { pA1: "player_8",  pA2: "player_4",  pB1: "player_16", pB2: "player_12" },
  21: { pA1: "player_17", pA2: "player_22", pB1: "player_25", pB2: "player_30" },
  27: { pA1: "player_15", pA2: "player_11", pB1: "player_31", pB2: "player_27" },
  35: { pA1: "player_6",  pA2: "player_2",  pB1: "player_14", pB2: "player_10" },
  40: { pA1: "player_14", pA2: "player_15", pB1: "player_23", pB2: "player_24" },
  45: { pA1: "player_17", pA2: "player_19", pB1: "player_25", pB2: "player_27" },
  46: { pA1: "player_20", pA2: "player_18", pB1: "player_28", pB2: "player_26" },
  48: { pA1: "player_22", pA2: "player_23", pB1: "player_30", pB2: "player_31" },
  51: { pA1: "player_4",  pA2: "player_7",  pB1: "player_28", pB2: "player_31" },
  58: { pA1: "player_10", pA2: "player_15", pB1: "player_19", pB2: "player_24" },
  59: { pA1: "player_11", pA2: "player_14", pB1: "player_20", pB2: "player_23" },
  69: { pA1: "player_1",  pA2: "player_7",  pB1: "player_17", pB2: "player_23" },
  71: { pA1: "player_2",  pA2: "player_5",  pB1: "player_18", pB2: "player_21" },
  74: { pA1: "player_15", pA2: "player_13", pB1: "player_23", pB2: "player_21" },
  75: { pA1: "player_16", pA2: "player_12", pB1: "player_24", pB2: "player_20" },
  76: { pA1: "player_10", pA2: "player_11", pB1: "player_18", pB2: "player_19" },
  77: { pA1: "player_1",  pA2: "player_6",  pB1: "player_17", pB2: "player_21" },
  78: { pA1: "player_7",  pA2: "player_5",  pB1: "player_22", pB2: "player_20" },
  81: { pA1: "player_1",  pA2: "player_5",  pB1: "player_25", pB2: "player_30" },
  86: { pA1: "player_21", pA2: "player_19", pB1: "player_30", pB2: "player_28" },
  89: { pA1: "player_1",  pA2: "player_4",  pB1: "player_9",  pB2: "player_13" },
};

// All 26 matches with scores from Excel
const EXCEL_MATCHES = [
  { id: 1, pA1: "player_1", pA2: "player_8", pB1: "player_17", pB2: "player_24",
    games: [{ scoreA: "7", scoreB: "11" }, { scoreA: "7", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-01-31T00:00:00.000Z" },
  { id: 8, pA1: "player_3", pA2: "player_4", pB1: "player_28", pB2: "player_29",
    games: [{ scoreA: "1", scoreB: "11" }, { scoreA: "2", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-07T00:00:00.000Z" },
  { id: 13, pA1: "player_9", pA2: "player_15", pB1: "player_17", pB2: "player_23",
    games: [{ scoreA: "8", scoreB: "11" }, { scoreA: "8", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-01T00:00:00.000Z" },
  { id: 14, pA1: "player_16", pA2: "player_14", pB1: "player_24", pB2: "player_22",
    games: [{ scoreA: "11", scoreB: "6" }, { scoreA: "11", scoreB: "5" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-07T00:00:00.000Z" },
  { id: 17, pA1: "player_1", pA2: "player_6", pB1: "player_9", pB2: "player_14",
    games: [{ scoreA: "9", scoreB: "11" }, { scoreA: "11", scoreB: "8" }, { scoreA: "4", scoreB: "11" }],
    date: "2026-02-01T00:00:00.000Z" },
  // FLEX: pA1 Anas(p8) -> Sabih(p6)
  { id: 19, pA1: "player_6", pA2: "player_4", pB1: "player_16", pB2: "player_12",
    games: [{ scoreA: "5", scoreB: "11" }, { scoreA: "0", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-01T00:00:00.000Z" },
  // FLEX: pA2 Salman(p22) -> Owais(p19)
  { id: 21, pA1: "player_17", pA2: "player_19", pB1: "player_25", pB2: "player_30",
    games: [{ scoreA: "10", scoreB: "12" }, { scoreA: "11", scoreB: "8" }, { scoreA: "11", scoreB: "8" }],
    date: "2026-02-07T00:00:00.000Z" },
  // FLEX: pB1 Rafey(p31) -> Naveed(p28)
  { id: 27, pA1: "player_15", pA2: "player_11", pB1: "player_28", pB2: "player_27",
    games: [{ scoreA: "11", scoreB: "2" }, { scoreA: "11", scoreB: "7" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 35, pA1: "player_6", pA2: "player_2", pB1: "player_14", pB2: "player_10",
    games: [{ scoreA: "11", scoreB: "8" }, { scoreA: "1", scoreB: "11" }, { scoreA: "12", scoreB: "10" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 40, pA1: "player_14", pA2: "player_15", pB1: "player_23", pB2: "player_24",
    games: [{ scoreA: "11", scoreB: "2" }, { scoreA: "11", scoreB: "3" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-01T00:00:00.000Z" },
  { id: 45, pA1: "player_17", pA2: "player_19", pB1: "player_25", pB2: "player_27",
    games: [{ scoreA: "11", scoreB: "5" }, { scoreA: "11", scoreB: "3" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 46, pA1: "player_20", pA2: "player_18", pB1: "player_28", pB2: "player_26",
    games: [{ scoreA: "11", scoreB: "5" }, { scoreA: "13", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-01-31T00:00:00.000Z" },
  { id: 48, pA1: "player_22", pA2: "player_23", pB1: "player_30", pB2: "player_31",
    games: [{ scoreA: "11", scoreB: "2" }, { scoreA: "11", scoreB: "7" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 51, pA1: "player_4", pA2: "player_7", pB1: "player_28", pB2: "player_31",
    games: [{ scoreA: "12", scoreB: "10" }, { scoreA: "8", scoreB: "11" }, { scoreA: "11", scoreB: "0" }],
    date: "2026-02-14T00:00:00.000Z" },
  // FLEX: pB2 Fahad(p24) -> Saleem(p18)
  { id: 58, pA1: "player_10", pA2: "player_15", pB1: "player_19", pB2: "player_18",
    games: [{ scoreA: "3", scoreB: "11" }, { scoreA: "11", scoreB: "5" }, { scoreA: "11", scoreB: "5" }],
    date: "2026-02-07T00:00:00.000Z" },
  { id: 59, pA1: "player_11", pA2: "player_14", pB1: "player_20", pB2: "player_23",
    games: [{ scoreA: "11", scoreB: "5" }, { scoreA: "11", scoreB: "4" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 69, pA1: "player_1", pA2: "player_7", pB1: "player_17", pB2: "player_23",
    games: [{ scoreA: "11", scoreB: "7" }, { scoreA: "12", scoreB: "14" }, { scoreA: "11", scoreB: "9" }],
    date: "2026-01-31T00:00:00.000Z" },
  { id: 71, pA1: "player_2", pA2: "player_5", pB1: "player_18", pB2: "player_21",
    games: [{ scoreA: "7", scoreB: "11" }, { scoreA: "11", scoreB: "4" }, { scoreA: "7", scoreB: "11" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 74, pA1: "player_15", pA2: "player_13", pB1: "player_23", pB2: "player_21",
    games: [{ scoreA: "7", scoreB: "11" }, { scoreA: "5", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 75, pA1: "player_16", pA2: "player_12", pB1: "player_24", pB2: "player_20",
    games: [{ scoreA: "5", scoreB: "11" }, { scoreA: "11", scoreB: "1" }, { scoreA: "11", scoreB: "3" }],
    date: "2026-02-01T00:00:00.000Z" },
  // FLEX: pB2 Owais(p19) -> Salman(p22)
  { id: 76, pA1: "player_10", pA2: "player_11", pB1: "player_18", pB2: "player_22",
    games: [{ scoreA: "11", scoreB: "4" }, { scoreA: "11", scoreB: "9" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-07T00:00:00.000Z" },
  { id: 77, pA1: "player_1", pA2: "player_6", pB1: "player_17", pB2: "player_21",
    games: [{ scoreA: "12", scoreB: "10" }, { scoreA: "11", scoreB: "5" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-14T00:00:00.000Z" },
  { id: 78, pA1: "player_7", pA2: "player_5", pB1: "player_22", pB2: "player_20",
    games: [{ scoreA: "5", scoreB: "11" }, { scoreA: "8", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-07T00:00:00.000Z" },
  { id: 81, pA1: "player_1", pA2: "player_5", pB1: "player_25", pB2: "player_30",
    games: [{ scoreA: "11", scoreB: "9" }, { scoreA: "9", scoreB: "11" }, { scoreA: "11", scoreB: "4" }],
    date: "2026-02-07T00:00:00.000Z" },
  { id: 86, pA1: "player_21", pA2: "player_19", pB1: "player_30", pB2: "player_28",
    games: [{ scoreA: "5", scoreB: "11" }, { scoreA: "9", scoreB: "11" }, { scoreA: "", scoreB: "" }],
    date: "2026-01-31T00:00:00.000Z" },
  // FLEX: pA2 Qavi(p4) -> Taha R(p7)
  { id: 89, pA1: "player_1", pA2: "player_7", pB1: "player_9", pB2: "player_13",
    games: [{ scoreA: "11", scoreB: "5" }, { scoreA: "12", scoreB: "10" }, { scoreA: "", scoreB: "" }],
    date: "2026-02-14T00:00:00.000Z" },
];

const TEAM_NAMES = {
  team1: "Naan-Stop Picklers", team2: "Striking Falcons",
  team3: "Pickle Warriors", team4: "BadMashers",
};

function getMatchWinner(teamA, teamB, games) {
  const valid = games.filter(g => g.scoreA && g.scoreB);
  let wA = 0, wB = 0;
  for (const g of valid) {
    if (Number(g.scoreA) > Number(g.scoreB)) wA++; else wB++;
  }
  if (wA >= 2) return teamA;
  if (wB >= 2) return teamB;
  return null;
}

function getMatchScore(games) {
  const valid = games.filter(g => g.scoreA && g.scoreB);
  if (!valid.length) return "";
  let wA = 0, wB = 0;
  for (const g of valid) {
    if (Number(g.scoreA) > Number(g.scoreB)) wA++; else wB++;
  }
  return `${wA}-${wB}`;
}

async function main() {
  const now = new Date().toISOString();
  let updated = 0, errors = 0;

  for (const em of EXCEL_MATCHES) {
    const matchRef = db.doc(`artifacts/${appId}/public/data/matches/${em.id}`);

    try {
      const snap = await matchRef.get();
      if (!snap.exists) {
        console.error(`Game ${em.id}: NOT FOUND`);
        errors++;
        continue;
      }

      const current = snap.data();
      const seeded = SEEDED[em.id];
      const hasFlexA = em.pA1 !== seeded.pA1 || em.pA2 !== seeded.pA2;
      const hasFlexB = em.pB1 !== seeded.pB1 || em.pB2 !== seeded.pB2;

      const updateData = {
        games: em.games,
        reportedDate: now,
        reportedBy: "Excel Import",
        reportedById: "excel-import",
        scheduledDate: em.date,
      };

      if (hasFlexA || hasFlexB) {
        updateData.pA1 = em.pA1;
        updateData.pA2 = em.pA2;
        updateData.pB1 = em.pB1;
        updateData.pB2 = em.pB2;
      }

      // Build history entry
      const validGames = em.games.filter(g => g.scoreA && g.scoreB);
      const gamesStr = validGames.map((g, i) => `Game ${i + 1}: ${g.scoreA}-${g.scoreB}`).join(", ");
      const score = getMatchScore(em.games);
      const winner = getMatchWinner(current.teamA, current.teamB, em.games);

      const changes = {
        games: { from: current.games?.length > 0 ? "Previous games" : "Not set", to: gamesStr },
        score: { from: "Not set", to: score },
        winner: { from: "Not set", to: winner || "Not set" },
      };

      if (em.date) {
        changes.scheduledDate = { from: current.scheduledDate || null, to: em.date };
      }

      if (hasFlexA) {
        changes.teamAPlayers = {
          from: `${ID_TO_NAME[seeded.pA1]}, ${ID_TO_NAME[seeded.pA2]}`,
          to: `${ID_TO_NAME[em.pA1]}, ${ID_TO_NAME[em.pA2]} (Flex Used)`,
        };
      }
      if (hasFlexB) {
        changes.teamBPlayers = {
          from: `${ID_TO_NAME[seeded.pB1]}, ${ID_TO_NAME[seeded.pB2]}`,
          to: `${ID_TO_NAME[em.pB1]}, ${ID_TO_NAME[em.pB2]} (Flex Used)`,
        };
      }

      const existingHistory = current.history || [];
      updateData.history = [...existingHistory, {
        timestamp: now,
        userName: "Excel Import",
        userId: "excel-import",
        changes,
      }];

      await matchRef.set(updateData, { merge: true });

      const flexNote = (hasFlexA || hasFlexB)
        ? ` [FLEX: ${hasFlexA ? "TeamA" : ""}${hasFlexA && hasFlexB ? "+" : ""}${hasFlexB ? "TeamB" : ""}]`
        : "";
      console.log(`✓ Game ${em.id}: ${score} → ${TEAM_NAMES[winner] || "TBD"}${flexNote}`);
      updated++;
    } catch (err) {
      console.error(`✗ Game ${em.id}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Errors: ${errors}`);
  process.exit(0);
}

main();
