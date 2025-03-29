import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Papa from "papaparse";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const fetchPlayersAndScores = async () => {
      setLoading(true);

      // Fetch players data
      const playersCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?output=csv";
      const playersResponse = await fetch(playersCsvUrl);
      const playersCsvText = await playersResponse.text();

      // Fetch scores data
      const scoresCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?gid=1898345264&single=true&output=csv";
      const scoresResponse = await fetch(scoresCsvUrl);
      const scoresCsvText = await scoresResponse.text();

      // Parse scores data
      const playerPoints = {};
      Papa.parse(scoresCsvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          result.data.forEach((row) => {
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
            ].filter((player) => player.name); // Filter out empty player entries

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
                playerPoints[player.name] =
                  (playerPoints[player.name] || 0) + 10;
              } else {
                playerPoints[player.name] =
                  (playerPoints[player.name] || 0) + points;
              }
            });
          });
        },
      });

      // Parse players data
      Papa.parse(playersCsvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const formattedPlayers = result.data
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
                  : "/images/bg.png", // Use a placeholder if no valid photo
                bio: row.Bio,
                favoriteShot: row["Favorite Golf Shot"],
                hero: row["Biggest Hero"],
                foe: row["Greatest Foe"],
                points, // Store points for sorting
              };
            });

          // Sort players by points (descending)
          formattedPlayers.sort((a, b) => b.points - a.points);

          console.log(formattedPlayers);

          // Assign rank based on position in the sorted list, handling ties
          let currentRank = 1;
          formattedPlayers.forEach((player, index) => {
            if (
              index > 0 &&
              formattedPlayers[index].points ===
                formattedPlayers[index - 1].points
            ) {
              // If tied with the previous player, assign the same rank
              player.rank = formattedPlayers[index - 1].rank;
              currentRank++;
            } else {
              // Otherwise, assign the current rank
              player.rank =
                player.points > 0 ? `Rank #${currentRank}` : "Unranked";
              currentRank++; // Increment rank for the next player
            }
          });

          setPlayers(formattedPlayers);
          setLoading(false); // Set loading to false after fetching
        },
      });
    };

    fetchPlayersAndScores();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading players...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PWGA Players
          </h1>
          <div className="w-24 h-1 bg-pwga-blue mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our elite competitors who put the P in PWGA.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {players.map((player, index) => (
            <motion.div
              key={player.id || index}
              variants={item}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              onClick={() => handlePlayerClick(player.id)}
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {player.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      player.rank === "Rank #1"
                        ? "bg-yellow-200 text-yellow-600"
                        : player.rank === "Rank #2"
                          ? "bg-gray-200 text-gray-700"
                          : player.rank === "Rank #3"
                            ? "bg-yellow-600 text-yellow-900"
                            : "bg-pwga-green/10 text-pwga-green"
                    }`}
                  >
                    {player.rank}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Players;
