
import { supabase } from "@/lib/supabaseClient";

export type PlayerScore = {
  name: string;
  score: number;
};

export type ScoreEntry = {
  id: number;
  image: string;
  date: string;
  players: PlayerScore[];
  winners: PlayerScore[];
};

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  totalScore: number;
  averageScore: number;
};

export type PlayerData = {
  id: string;
  name: string;
  image: string | null;
  bio: string;
  favoriteShot: string;
  hero: string;
  foe: string;
  points: number;
  rank: string;
  stats?: PlayerStats;
};

export type EventData = {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  status: string;
  buyin: string;
  winner: string;
  image: string;
  link: string;
  playersLink: string;
  players: string[];
  bants: string[];
};

type SupabasePlayerRelation = { full_name?: string } | { full_name?: string }[] | null;

type SupabaseRoundScoreRow = {
  player_slot: number | null;
  score: number | null;
  players: SupabasePlayerRelation;
};

type SupabaseScoreRoundRow = {
  id: number;
  source_timestamp: string | null;
  photo_url: string | null;
  round_scores: SupabaseRoundScoreRow[] | null;
};

type SupabaseEventRow = {
  id: number;
  title: string | null;
  event_date_text: string | null;
  location: string | null;
  description: string | null;
  registration_open: boolean | null;
  buy_in: number | string | null;
  winner_name: string | null;
  image_url: string | null;
  registration_link: string | null;
  registered_players_url: string | null;
};

const toGoogleThumbnailUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.includes("thumbnail?id=") || url.startsWith("http") === false) {
    return url;
  }
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
  }
  return url;
};

const getPlayerNameFromRelation = (players: SupabasePlayerRelation): string => {
  if (!players) return "";
  if (Array.isArray(players)) {
    return players[0]?.full_name ?? "";
  }
  return players.full_name ?? "";
};

export const fetchScoresData = async (): Promise<ScoreEntry[]> => {
  const { data, error } = await supabase
    .from("score_rounds")
    .select(
      `
      id,
      source_timestamp,
      photo_url,
      round_scores (
        player_slot,
        score,
        players (
          full_name
        )
      )
    `
    )
    .order("source_timestamp", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  const rounds = (data ?? []) as SupabaseScoreRoundRow[];
  return rounds
    .map((round) => {
      const players = (round.round_scores ?? [])
        .map((entry) => ({
          name: getPlayerNameFromRelation(entry.players),
          score: Number(entry.score),
          slot: Number(entry.player_slot ?? 99),
        }))
        .filter((entry) => entry.name && Number.isFinite(entry.score))
        .sort((a, b) => a.slot - b.slot)
        .map(({ name, score }) => ({ name, score })) as PlayerScore[];

      if (players.length < 2) {
        return null;
      }

      const lowestScore = Math.min(...players.map((player) => player.score));
      const winners = players.filter((player) => player.score === lowestScore);

      return {
        id: Number(round.id),
        image: toGoogleThumbnailUrl(round.photo_url) || "/images/bg.png",
        date: round.source_timestamp
          ? new Date(round.source_timestamp).toLocaleDateString()
          : "Unknown Date",
        players,
        winners,
      } as ScoreEntry;
    })
    .filter((entry): entry is ScoreEntry => entry !== null);
};

export const fetchEventsData = async (): Promise<EventData[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as SupabaseEventRow[];
  return rows.map((row) => ({
    id: Number(row.id),
    title: row.title ?? "Untitled Event",
    date: row.event_date_text ?? "",
    location: row.location ?? "",
    description: row.description ?? "",
    status: row.registration_open ? "Registration Open" : "Closed",
    buyin: String(row.buy_in ?? 0),
    winner: row.winner_name ?? "",
    image: toGoogleThumbnailUrl(row.image_url) || "/images/bg.png",
    link: row.registration_link ?? "",
    playersLink: row.registered_players_url ?? "",
    players: [],
    bants: [],
  }));
};

// Get all unique player names from scores
export const getAllPlayersFromScores = (scores: ScoreEntry[]): string[] => {
  const playerSet = new Set<string>();
  scores.forEach((score) => {
    score.players.forEach((player) => {
      playerSet.add(player.name);
    });
  });
  return Array.from(playerSet);
};

// New function to normalize player names for consistent ID generation
export const normalizePlayerName = (name: string): string => {
  // Remove special characters and spaces, but preserve the core name
  return name.replace(/[^\w\s]/g, '').replace(/\s+/g, '');
};
