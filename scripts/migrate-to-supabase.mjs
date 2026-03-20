import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

const projectRoot = process.cwd();

const DEFAULT_PLAYERS_CSV = "/Users/willzzz/Downloads/PWGA - Players.csv";
const DEFAULT_SCORES_CSV = "/Users/willzzz/Downloads/PWGA - Scores.csv";
const DEFAULT_EVENTS_CSV = "/Users/willzzz/Downloads/PWGA - Events.csv";

function loadEnvFromFile(fileName) {
  const envPath = path.join(projectRoot, fileName);
  if (!fs.existsSync(envPath)) {
    return;
  }

  const fileContent = fs.readFileSync(envPath, "utf8");
  const lines = fileContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile(".env");
loadEnvFromFile(".env.local");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const rawArgs = process.argv.slice(2);
const resetFirst = rawArgs.includes("--reset");
const positionalArgs = rawArgs.filter((arg) => !arg.startsWith("--"));
const playersCsvPath = positionalArgs[0] || DEFAULT_PLAYERS_CSV;
const scoresCsvPath = positionalArgs[1] || DEFAULT_SCORES_CSV;
const eventsCsvPath = positionalArgs[2] || DEFAULT_EVENTS_CSV;

function parseCsvFile(filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(projectRoot, filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`CSV file not found: ${absolutePath}`);
  }

  const fileContent = fs.readFileSync(absolutePath, "utf8");
  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length) {
    throw new Error(
      `CSV parse error in ${absolutePath}: ${parsed.errors[0].message}`
    );
  }

  return parsed.data;
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseTimestamp(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseScore(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const normalized = String(value).replace("+", "").trim();
  if (!normalized) {
    return null;
  }
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseBuyIn(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isApproved(value) {
  return String(value || "")
    .trim()
    .toLowerCase() === "yes";
}

async function migratePlayers(playersRows) {
  const preparedPlayers = playersRows
    .map((row) => ({
      full_name: String(row.Name || "").trim(),
      slug: slugifyName(String(row.Name || "")),
      photo_url: row.Photo || null,
      bio: row.Bio || null,
      favorite_golf_shot: row["Favorite Golf Shot"] || null,
      biggest_hero: row["Biggest Hero"] || null,
      greatest_foe: row["Greatest Foe"] || null,
      approved: isApproved(row.Approved),
      source_timestamp: parseTimestamp(row.Timestamp),
    }))
    .filter((row) => row.full_name.length > 0);

  if (!preparedPlayers.length) {
    throw new Error("No player rows found in players CSV.");
  }

  const { error } = await supabase.from("players").upsert(preparedPlayers, {
    onConflict: "full_name",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`Failed to upsert players: ${error.message}`);
  }

  const { data: playerLookup, error: playerLookupError } = await supabase
    .from("players")
    .select("id, full_name");

  if (playerLookupError) {
    throw new Error(
      `Failed to fetch players for lookup: ${playerLookupError.message}`
    );
  }

  const nameToPlayerId = new Map(
    (playerLookup || []).map((player) => [player.full_name.trim(), player.id])
  );

  return nameToPlayerId;
}

async function migrateScores(scoresRows, nameToPlayerId) {
  for (const row of scoresRows) {
    const sourceTimestamp = parseTimestamp(row.Timestamp);
    const roundPhoto = row.Photo || null;

    const participants = [1, 2, 3, 4]
      .map((slot) => {
        const name = String(row[`Player ${slot} Name`] || "").trim();
        const score = parseScore(row[`Player ${slot} Score`]);
        return { slot, name, score };
      })
      .filter((participant) => participant.name && participant.score !== null);

    if (participants.length < 2) {
      continue;
    }

    const { data: roundInsert, error: roundError } = await supabase
      .from("score_rounds")
      .insert({
        source_timestamp: sourceTimestamp,
        photo_url: roundPhoto,
      })
      .select("id")
      .single();

    if (roundError) {
      throw new Error(`Failed to insert score_round: ${roundError.message}`);
    }

    const scoreRowsToInsert = participants
      .map((participant) => {
        const playerId = nameToPlayerId.get(participant.name);
        if (!playerId) {
          return null;
        }
        return {
          round_id: roundInsert.id,
          player_id: playerId,
          player_slot: participant.slot,
          score: participant.score,
        };
      })
      .filter(Boolean);

    if (scoreRowsToInsert.length < 2) {
      continue;
    }

    const { error: roundScoresError } = await supabase
      .from("round_scores")
      .insert(scoreRowsToInsert);

    if (roundScoresError) {
      throw new Error(`Failed to insert round_scores: ${roundScoresError.message}`);
    }
  }
}

async function migrateEvents(eventsRows, nameToPlayerId) {
  const preparedEvents = eventsRows
    .map((row) => {
      const winnerName = String(row.Winner || "").trim();
      return {
        title: row.Title || "Untitled Event",
        event_date_text: row.Date || null,
        location: row.Location || null,
        description: row.Description || null,
        registration_open:
          String(row["Registration open?"] || "")
            .trim()
            .toLowerCase() === "yes",
        buy_in: parseBuyIn(row["Buy-in"]),
        image_url: row.Image || null,
        registration_link: row["Registration Link"] || null,
        registered_players_url: row["Registered Players"] || null,
        winner_name: winnerName || null,
        winner_player_id: winnerName ? nameToPlayerId.get(winnerName) || null : null,
      };
    })
    .filter((row) => row.title && String(row.title).trim().length > 0);

  if (!preparedEvents.length) {
    return;
  }

  const { error } = await supabase.from("events").insert(preparedEvents);
  if (error) {
    throw new Error(`Failed to insert events: ${error.message}`);
  }
}

async function refreshRankingCache() {
  const { error } = await supabase.rpc("refresh_player_rankings_cache");
  if (error) {
    throw new Error(`Failed to refresh rankings cache: ${error.message}`);
  }
}

async function resetTables() {
  const deleteOps = [
    supabase.from("round_scores").delete().gte("id", 0),
    supabase.from("score_rounds").delete().gte("id", 0),
    supabase.from("events").delete().gte("id", 0),
    supabase.from("players").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
  ];

  for (const op of deleteOps) {
    const { error } = await op;
    if (error) {
      throw new Error(`Failed reset step: ${error.message}`);
    }
  }
}

async function main() {
  const playersRows = parseCsvFile(playersCsvPath);
  const scoresRows = parseCsvFile(scoresCsvPath);
  const eventsRows = parseCsvFile(eventsCsvPath);

  console.log("Starting migration...");
  console.log(`Players rows: ${playersRows.length}`);
  console.log(`Scores rows: ${scoresRows.length}`);
  console.log(`Events rows: ${eventsRows.length}`);

  if (resetFirst) {
    console.log("Resetting existing rows from players/scores/events tables...");
    await resetTables();
  }

  const nameToPlayerId = await migratePlayers(playersRows);
  await migrateScores(scoresRows, nameToPlayerId);
  await migrateEvents(eventsRows, nameToPlayerId);
  await refreshRankingCache();

  console.log("Migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
