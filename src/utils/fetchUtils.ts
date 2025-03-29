
import Papa from "papaparse";

// URLs for the Google Sheets data
const PLAYERS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?output=csv";
const SCORES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?gid=1898345264&single=true&output=csv";

export type RawPlayerData = {
  Name: string;
  Photo: string;
  Bio: string;
  "Favorite Golf Shot": string;
  "Biggest Hero": string;
  "Greatest Foe": string;
  Approved: string;
};

export type RawScoreData = {
  Timestamp: string;
  Photo: string;
  "Player 1 Name": string;
  "Player 1 Score": string;
  "Player 2 Name": string;
  "Player 2 Score": string;
  "Player 3 Name": string;
  "Player 3 Score": string;
  "Player 4 Name": string;
  "Player 4 Score": string;
};

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
  rank?: string;
  stats?: PlayerStats;
};

// Function to fetch player data from the Google Sheet
export const fetchPlayersData = async (): Promise<RawPlayerData[]> => {
  const response = await fetch(PLAYERS_CSV_URL);
  const csvText = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve(result.data as RawPlayerData[]);
      },
    });
  });
};

// Function to fetch scores data from the Google Sheet
export const fetchScoresData = async (): Promise<RawScoreData[]> => {
  const response = await fetch(SCORES_CSV_URL);
  const csvText = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve(result.data as RawScoreData[]);
      },
    });
  });
};

// Convert a raw score entry into a processed score entry with player data
export const processScoreEntry = (row: RawScoreData, index: number): ScoreEntry | null => {
  const players = [
    { name: row["Player 1 Name"], score: parseInt(row["Player 1 Score"]) || Infinity },
    { name: row["Player 2 Name"], score: parseInt(row["Player 2 Score"]) || Infinity },
    { name: row["Player 3 Name"], score: parseInt(row["Player 3 Score"]) || Infinity },
    { name: row["Player 4 Name"], score: parseInt(row["Player 4 Score"]) || Infinity },
  ].filter((player) => player.name && player.score !== Infinity); // Filter out players with no name or invalid scores

  // Skip this match if there are fewer than 2 players with valid scores
  if (players.length < 2) {
    return null;
  }

  // Extract the file ID from the Google Drive link
  const photoId = row.Photo && row.Photo.includes("id=")
    ? row.Photo.split("id=")[1]
    : null;

  // Find the lowest score
  const lowestScore = Math.min(...players.map(player => player.score));
  
  // Get winners (anyone with the lowest score)
  const winners = players.filter(player => player.score === lowestScore);

  return {
    id: index,
    image: photoId
      ? `https://drive.google.com/thumbnail?id=${photoId}&sz=w1000` // Convert to direct image link
      : "/images/bg.png", // Use a placeholder if no valid photo
    date: row.Timestamp
      ? new Date(row.Timestamp).toLocaleDateString()
      : "Unknown Date",
    players,
    winners,
  };
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
