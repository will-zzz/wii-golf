
import { supabase } from "@/lib/supabaseClient";
import { PlayerData, normalizePlayerName } from "./fetchUtils";

type SupabaseRankingRow = {
  full_name: string | null;
  slug: string | null;
  photo_url: string | null;
  bio: string | null;
  favorite_golf_shot: string | null;
  biggest_hero: string | null;
  greatest_foe: string | null;
  total_points: number | null;
  rank_label: string | null;
  games_played: number | null;
  wins: number | null;
  total_score: number | null;
  average_score: number | null;
};

const toGoogleThumbnailUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
  }
  return url;
};

// Main function to fetch all player data with ranks and stats
export const fetchRankedPlayers = async (): Promise<PlayerData[]> => {
  try {
    const { data, error } = await supabase
      .from("player_rankings")
      .select("*")
      .order("rank_position", { ascending: true, nullsFirst: false })
      .order("average_score", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as SupabaseRankingRow[]).map((row) => ({
      id: row.slug || normalizePlayerName(row.full_name || ""),
      name: row.full_name ?? "",
      image: toGoogleThumbnailUrl(row.photo_url),
      bio: row.bio ?? "",
      favoriteShot: row.favorite_golf_shot ?? "",
      hero: row.biggest_hero ?? "",
      foe: row.greatest_foe ?? "",
      points: Number(row.total_points ?? 0),
      rank: row.rank_label ?? "Unranked",
      stats: {
        gamesPlayed: Number(row.games_played ?? 0),
        wins: Number(row.wins ?? 0),
        totalScore: Number(row.total_score ?? 0),
        averageScore: Number(row.average_score ?? 0),
      },
    }));
  } catch (error) {
    console.error("Error fetching ranked players:", error);
    return [];
  }
};

// Get a specific player by ID
export const getPlayerById = async (
  playerId: string
): Promise<PlayerData | null> => {
  const players = await fetchRankedPlayers();
  const decodedId = decodeURIComponent(playerId).toLowerCase();
  const normalizedId = normalizePlayerName(decodedId).toLowerCase();

  return (
    players.find((p) => {
      const playerSlug = p.id.toLowerCase();
      const normalizedSlug = normalizePlayerName(playerSlug).toLowerCase();
      const normalizedName = normalizePlayerName(p.name).toLowerCase();

      return (
        playerSlug === decodedId ||
        normalizedSlug === normalizedId ||
        normalizedName === normalizedId
      );
    }) || null
  );
};
