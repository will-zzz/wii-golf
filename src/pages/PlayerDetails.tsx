
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Award, Calendar, Calculator } from "lucide-react";
import Papa from "papaparse";

const PlayerDetails = () => {
  const { id } = useParams();
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState(null);
  const [rank, setRank] = useState("Unranked"); // State to store the player's rank
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    averageScore: 0,
  });

  useEffect(() => {
    const fetchPlayersAndScores = async () => {
      const playersCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?gid=509577262&single=true&output=csv";
      const scoresCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?gid=1898345264&single=true&output=csv";

      // Fetch players data
      const playersResponse = await fetch(playersCsvUrl);
      const playersCsvText = await playersResponse.text();

      // Fetch scores data
      const scoresResponse = await fetch(scoresCsvUrl);
      const scoresCsvText = await scoresResponse.text();

      // Parse scores data
      const playerPoints = {};
      const playerStats = {};
      
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

              // Track player stats
              if (!playerStats[player.name]) {
                playerStats[player.name] = {
                  gamesPlayed: 0,
                  wins: 0,
                  totalScore: 0,
                };
              }
              
              playerStats[player.name].gamesPlayed += 1;
              playerStats[player.name].totalScore += player.score;
              
              // Check if this player is a winner (has the lowest score)
              if (player.score === lowestScore) {
                playerStats[player.name].wins += 1;
                playerPoints[player.name] = (playerPoints[player.name] || 0) + 10;
              } else {
                playerPoints[player.name] = (playerPoints[player.name] || 0) + points;
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
            } else {
              // Otherwise, assign the current rank
              player.rank =
                player.points > 0 ? `Rank #${currentRank}` : "Unranked";
              currentRank++; // Increment rank for the next player
            }
          });

          setPlayers(formattedPlayers);

          // Find the player after the players state is updated
          const foundPlayer = formattedPlayers.find((p) => p.id === id);
          setPlayer(foundPlayer);

          // Set the player's rank
          if (foundPlayer) {
            setRank(foundPlayer.rank);
            
            // Set the player's stats
            const playerName = foundPlayer.name;
            if (playerStats[playerName]) {
              const playerStat = playerStats[playerName];
              setStats({
                gamesPlayed: playerStat.gamesPlayed,
                wins: playerStat.wins,
                averageScore: playerStat.gamesPlayed > 0 
                  ? Math.round((playerStat.totalScore / playerStat.gamesPlayed) * 10) / 10
                  : 0
              });
            }
          }
        },
      });
    };

    fetchPlayersAndScores();
  }, [id]);

  if (!player) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading player...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/players"
          className="inline-flex items-center text-pwga-blue mb-8 hover:underline"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to All Players
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:w-2/5 h-80 md:h-auto relative">
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:hidden">
                <h1 className="text-2xl font-bold text-white">{player.name}</h1>
              </div>
            </div>

            <div className="md:w-3/5 p-6 md:p-8">
              <div className="hidden md:block">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {player.name}
                  </h1>
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
                    {rank}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Bio</h2>
                  <p className="text-gray-700 leading-relaxed">{player.bio}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        Favorite Golf Shot
                      </h2>
                      <p className="text-gray-700 leading-relaxed">
                        {player.favoriteShot}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        Biggest Hero
                      </h2>
                      <p className="text-gray-700 leading-relaxed">{player.hero}</p>
                    </div>

                    <div className="mt-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        Greatest Foe
                      </h2>
                      <p className="text-gray-700 leading-relaxed">{player.foe}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Player Stats
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-pwga-blue mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-800">Games Played</h3>
                          <p className="text-2xl font-bold text-pwga-green">{stats.gamesPlayed}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-yellow-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-800">Wins</h3>
                          <p className="text-2xl font-bold text-pwga-green">{stats.wins}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calculator className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-800">Average Score</h3>
                          <p className="text-2xl font-bold text-pwga-green">{stats.averageScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayerDetails;
