import { RawScoreData, PlayerData, PlayerStats, fetchScoresData, fetchPlayersData } from "./fetchUtils";

// Calculate points for each player based on their scores
export const calculatePlayerPoints = (scoresData: RawScoreData[]): Record<string, number> => {
  const playerPoints: Record<string, number> = {};

  scoresData.forEach((row) => {
    const playersInRound = [
      {
        name: row["Player 1 Name"],
        score: parseInt(row["Player 1 Score"]) || Infinity,
      },
      {
        name: row["Player 2 Name"],
        score: parseInt(row["Player 2 Score"]) || Infinity,
      },
      {
        name: row["Player 3 Name"],
        score: parseInt(row["Player 3 Score"]) || Infinity,
      },
      {
        name: row["Player 4 Name"],
        score: parseInt(row["Player 4 Score"]) || Infinity,
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

    // Assign points based on position
    playersInRound.forEach((player, index) => {
      const position = index + 1; // 1-based position
      const points =
        position === 1
          ? 10
          : position === 2
            ? 5
            : position === 3
              ? 3
              : 1; // Weighted scoring

      // If the player is tied for the lowest score, assign them the same points as the first position
      if (player.score === lowestScore) {
        playerPoints[player.name] = (playerPoints[player.name] || 0) + 10;
      } else {
        playerPoints[player.name] = (playerPoints[player.name] || 0) + points;
      }
    });
  });

  return playerPoints;
};

// Calculate statistics for each player (games played, wins, average score)
export const calculatePlayerStats = (scoresData: RawScoreData[]): Record<string, PlayerStats> => {
  const playerStats: Record<string, PlayerStats> = {};

  scoresData.forEach((row) => {
    const playersInRound = [
      {
        name: row["Player 1 Name"],
        score: parseInt(row["Player 1 Score"]) || Infinity,
      },
      {
        name: row["Player 2 Name"],
        score: parseInt(row["Player 2 Score"]) || Infinity,
      },
      {
        name: row["Player 3 Name"],
        score: parseInt(row["Player 3 Score"]) || Infinity,
      },
      {
        name: row["Player 4 Name"],
        score: parseInt(row["Player 4 Score"]) || Infinity,
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
      if (!playerStats[player.name]) {
        playerStats[player.name] = {
          gamesPlayed: 0,
          wins: 0,
          totalScore: 0,
          averageScore: 0,
        };
      }

      // Update player stats
      playerStats[player.name].gamesPlayed += 1;
      playerStats[player.name].totalScore += player.score;

      // Check if this player is a winner (has the lowest score)
      if (player.score === lowestScore) {
        playerStats[player.name].wins += 1;
      }
    });
  });

  // Calculate average scores
  Object.keys(playerStats).forEach((playerName) => {
    const stats = playerStats[playerName];
    if (stats.gamesPlayed > 0) {
      stats.averageScore = Math.round((stats.totalScore / stats.gamesPlayed) * 10) / 10;
    }
  });

  return playerStats;
};

// Process player data with ranks and stats
export const processPlayers = (playersData: any[], playerPoints: Record<string, number>, playerStats: Record<string, PlayerStats>): PlayerData[] => {
  const formattedPlayers = playersData
    .filter((row) => row["Approved"] === "yes") // Only include approved players
    .map((row) => {
      const photoId =
        row.Photo && row.Photo.includes("id=")
          ? row.Photo.split("id=")[1]
          : null;

      const playerName = row.Name;
      const points = playerPoints[playerName] || 0; // Get the total points or default to 0

      return {
        id: playerName.replace(/\s+/g, ""), // Remove spaces from the player's name to use as the ID
        name: playerName,
        image: photoId
          ? `https://drive.google.com/thumbnail?id=${photoId}&sz=w1000` // Convert to direct image link
          : null, // Set to null if no valid photo
        bio: row.Bio,
        favoriteShot: row["Favorite Golf Shot"],
        hero: row["Biggest Hero"],
        foe: row["Greatest Foe"],
        points, // Store points for sorting
        stats: playerStats[playerName] || {
          gamesPlayed: 0,
          wins: 0,
          totalScore: 0,
          averageScore: 0,
        },
      };
    })
    .filter((player) => player.image); // Filter out players without an image

  // Sort players by points (descending)
  formattedPlayers.sort((a, b) => b.points - a.points);

  // Assign rank based on position in the sorted list, handling ties
  let currentRank = 1;
  formattedPlayers.forEach((player, index) => {
    if (
      index > 0 &&
      formattedPlayers[index].points === formattedPlayers[index - 1].points
    ) {
      // If tied with the previous player, assign the same rank
      player.rank = formattedPlayers[index - 1].rank;
    } else {
      // Otherwise, assign the current rank
      player.rank = player.points > 0 ? `Rank #${currentRank}` : "Unranked";
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
      fetchScoresData()
    ]);

    // Calculate points and stats for each player
    const playerPoints = calculatePlayerPoints(scoresData);
    const playerStats = calculatePlayerStats(scoresData);

    // Process the players with ranks and stats
    const rankedPlayers = processPlayers(playersData, playerPoints, playerStats);

    return rankedPlayers;
  } catch (error) {
    console.error("Error fetching ranked players:", error);
    return [];
  }
};

// Get a specific player by ID
export const getPlayerById = async (playerId: string): Promise<PlayerData | null> => {
  const players = await fetchRankedPlayers();
  return players.find((p) => p.id === playerId) || null;
};
