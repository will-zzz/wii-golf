
import {
  RawScoreData,
  PlayerData,
  PlayerStats,
  fetchScoresData,
  fetchPlayersData,
  normalizePlayerName,
} from "./fetchUtils";

// Calculate points for each player based on their scores
export const calculatePlayerPoints = (
  scoresData: RawScoreData[]
): Record<string, number> => {
  const playerPoints: Record<string, number> = {};

  scoresData.forEach((row) => {
    const playersInRound = [
      {
        name: row["Player 1 Name"],
        score: isNaN(parseInt(row["Player 1 Score"]))
          ? Infinity
          : parseInt(row["Player 1 Score"]),
      },
      {
        name: row["Player 2 Name"],
        score: isNaN(parseInt(row["Player 2 Score"]))
          ? Infinity
          : parseInt(row["Player 2 Score"]),
      },
      {
        name: row["Player 3 Name"],
        score: isNaN(parseInt(row["Player 3 Score"]))
          ? Infinity
          : parseInt(row["Player 3 Score"]),
      },
      {
        name: row["Player 4 Name"],
        score: isNaN(parseInt(row["Player 4 Score"]))
          ? Infinity
          : parseInt(row["Player 4 Score"]),
      },
    ].filter((player) => player.name && player.score !== Infinity); // Filter out players with no name or invalid scores

    // Skip this match if there are fewer than 2 players with valid scores
    if (playersInRound.length < 2) {
      return;
    }

    // Sort players by score (ascending)
    playersInRound.sort((a, b) => a.score - b.score);

    // First, group players by their scores to handle ties properly
    const scoreGroups: Record<number, string[]> = {};

    playersInRound.forEach((player) => {
      if (!scoreGroups[player.score]) {
        scoreGroups[player.score] = [];
      }
      scoreGroups[player.score].push(player.name);
    });

    // Now assign points based on positions, accounting for ties correctly
    let currentPosition = 1;

    // Process scores in ascending order (since lower is better in golf)
    const uniqueScores = Object.keys(scoreGroups)
      .map(Number)
      .sort((a, b) => a - b);

    uniqueScores.forEach((score) => {
      const playersWithThisScore = scoreGroups[score];

      // Determine points for the current position
      const points =
        currentPosition === 1
          ? 10 // 1st place gets 10 points
          : currentPosition === 2
            ? 5 // 2nd place gets 5 points
            : currentPosition === 3
              ? 3 // 3rd place gets 3 points
              : 1; // Everyone else gets 1 point

      // Assign the same points to all players with this score
      playersWithThisScore.forEach((playerName) => {
        playerPoints[playerName] = (playerPoints[playerName] || 0) + points;
      });

      // Advance position by the number of players in this group
      // This ensures the next group gets the correct position
      currentPosition += playersWithThisScore.length;
    });
  });

  return playerPoints;
};

// Calculate statistics for each player (games played, wins, average score)
export const calculatePlayerStats = (
  scoresData: RawScoreData[]
): Record<string, PlayerStats> => {
  const playerStats: Record<string, PlayerStats> = {};
  // Create mapping of normalized to original player names to handle quotation marks
  const playerNamesMap: Record<string, string[]> = {};

  // First, process all players from scoresData to build the mapping
  scoresData.forEach((row) => {
    const players = [
      row["Player 1 Name"],
      row["Player 2 Name"],
      row["Player 3 Name"],
      row["Player 4 Name"],
    ].filter(name => name && name.trim() !== '');

    players.forEach(name => {
      const normalized = name.trim();
      if (!playerNamesMap[normalized]) {
        playerNamesMap[normalized] = [];
      }
      if (!playerNamesMap[normalized].includes(name)) {
        playerNamesMap[normalized].push(name);
      }
    });
  });

  scoresData.forEach((row) => {
    const playersInRound = [
      {
        name: row["Player 1 Name"],
        score: isNaN(parseInt(row["Player 1 Score"]))
          ? Infinity
          : parseInt(row["Player 1 Score"]),
      },
      {
        name: row["Player 2 Name"],
        score: isNaN(parseInt(row["Player 2 Score"]))
          ? Infinity
          : parseInt(row["Player 2 Score"]),
      },
      {
        name: row["Player 3 Name"],
        score: isNaN(parseInt(row["Player 3 Score"]))
          ? Infinity
          : parseInt(row["Player 3 Score"]),
      },
      {
        name: row["Player 4 Name"],
        score: isNaN(parseInt(row["Player 4 Score"]))
          ? Infinity
          : parseInt(row["Player 4 Score"]),
      },
    ].filter((player) => player.name && player.score !== Infinity); // Filter out players with no name or invalid scores

    // Skip this match if there are fewer than 2 players with valid scores
    if (playersInRound.length < 2) {
      return;
    }

    // Sort players by score (ascending)
    playersInRound.sort((a, b) => a.score - b.score);

    // Find the lowest score in the round
    const lowestScore = playersInRound[0].score;

    // Update stats for each player
    playersInRound.forEach((player) => {
      const playerName = player.name.trim();
      
      // Initialize player stats if not yet created
      if (!playerStats[playerName]) {
        playerStats[playerName] = {
          gamesPlayed: 0,
          wins: 0,
          totalScore: 0,
          averageScore: 0,
        };
      }

      // Update player stats
      playerStats[playerName].gamesPlayed += 1;
      playerStats[playerName].totalScore += player.score;

      // Check if this player is a winner (has the lowest score)
      if (player.score === lowestScore) {
        playerStats[playerName].wins += 1;
      }
    });
  });

  // Calculate average scores
  Object.keys(playerStats).forEach((playerName) => {
    const stats = playerStats[playerName];
    if (stats.gamesPlayed > 0) {
      stats.averageScore =
        Math.round((stats.totalScore / stats.gamesPlayed) * 10) / 10;
    }
  });

  return playerStats;
};

// Process player data with ranks and stats
export const processPlayers = (
  playersData: any[],
  playerPoints: Record<string, number>,
  playerStats: Record<string, PlayerStats>
): PlayerData[] => {
  const formattedPlayers = playersData
    .filter((row) => row["Approved"] === "yes") // Only include approved players
    .map((row) => {
      const photoId =
        row.Photo && row.Photo.includes("id=")
          ? row.Photo.split("id=")[1]
          : null;

      const playerName = row.Name;
      const exactPlayerName = playerName.trim();
      
      // Use the exact player name to get stats
      const playerStat = playerStats[exactPlayerName] || {
        gamesPlayed: 0,
        wins: 0,
        totalScore: 0,
        averageScore: 0,
      };
      
      // Also get points by exact name
      const points = playerPoints[exactPlayerName] || 0;

      return {
        // Use normalized player name for consistent ID generation
        id: normalizePlayerName(playerName),
        name: playerName,
        image: photoId
          ? `https://drive.google.com/thumbnail?id=${photoId}&sz=w1000` // Convert to direct image link
          : null, // Set to null if no valid photo
        bio: row.Bio,
        favoriteShot: row["Favorite Golf Shot"],
        hero: row["Biggest Hero"],
        foe: row["Greatest Foe"],
        points, // Store points for sorting
        stats: playerStat,
        rank: "", // Add the rank property with an empty string as default
      };
    })
    .filter((player) => player.image); // Filter out players without an image

  // Debug - help identify players and their stats 
  console.log("Player stats before sorting:", playerStats);
  console.log("Formatted players before sorting:", formattedPlayers.map(p => ({ 
    name: p.name, 
    games: p.stats?.gamesPlayed, 
    avg: p.stats?.averageScore 
  })));

  // Sort players by average score (ascending, since lower is better in golf)
  // Only consider players who have played at least one game
  formattedPlayers.sort((a, b) => {
    // If a player hasn't played any games, they should rank lower
    if (a.stats?.gamesPlayed === 0 && b.stats?.gamesPlayed > 0) return 1;
    if (b.stats?.gamesPlayed === 0 && a.stats?.gamesPlayed > 0) return -1;
    
    // If both players have played games, sort by average score (lower is better)
    return (a.stats?.averageScore || Infinity) - (b.stats?.averageScore || Infinity);
  });

  // Assign rank based on position in the sorted list, handling ties
  let currentRank = 1;
  formattedPlayers.forEach((player, index) => {
    if (
      index > 0 &&
      player.stats?.gamesPlayed > 0 &&
      formattedPlayers[index - 1].stats?.gamesPlayed > 0 &&
      player.stats?.averageScore === formattedPlayers[index - 1].stats?.averageScore
    ) {
      // If tied with the previous player on average score, assign the same rank
      player.rank = formattedPlayers[index - 1].rank;
    } else {
      // Otherwise, assign the current rank, but only if they've played at least one game
      player.rank = player.stats?.gamesPlayed > 0 ? `Rank #${currentRank}` : "Unranked";
      currentRank++; // Increment rank for the next player
    }
  });

  return formattedPlayers;
};

// Main function to fetch all player data with ranks and stats
export const fetchRankedPlayers = async (): Promise<PlayerData[]> => {
  try {
    // Fetch players and scores data
    const [playersData, scoresData] = await Promise.all([
      fetchPlayersData(),
      fetchScoresData(),
    ]);

    // Calculate points and stats for each player
    const playerPoints = calculatePlayerPoints(scoresData);
    const playerStats = calculatePlayerStats(scoresData);

    // Process the players with ranks and stats
    const rankedPlayers = processPlayers(
      playersData,
      playerPoints,
      playerStats
    );

    return rankedPlayers;
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
  // Use case-insensitive matching to be more forgiving with IDs
  return players.find((p) => p.id.toLowerCase() === playerId.toLowerCase()) || null;
};
