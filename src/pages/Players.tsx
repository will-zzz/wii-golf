import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Papa from "papaparse"; // Install with `npm install papaparse`

const Players = () => {
  const [players, setPlayers] = useState([]);
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
    const fetchPlayers = async () => {
      const csvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?output=csv";
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      // Parse CSV data
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const formattedPlayers = result.data
            .filter((row) => row["Approved"] === "yes") // Only include approved players
            .map((row) => {
              // Extract the file ID from the Google Drive link
              const photoId =
                row.Photo && row.Photo.includes("id=")
                  ? row.Photo.split("id=")[1]
                  : null;

              return {
                id: row.Name.replace(/\s+/g, ""), // Remove spaces from the player's name to use as the ID
                name: row.Name,
                image: photoId
                  ? `https://drive.google.com/thumbnail?id=${photoId}&sz=w1000` // Convert to direct image link
                  : "/images/bg.png", // Use a placeholder if no valid photo
                bio: row.Bio,
                favoriteShot: row["Favorite Golf Shot"],
                hero: row["Biggest Hero"],
                foe: row["Greatest Foe"],
              };
            });

          setPlayers(formattedPlayers);
        },
      });
    };

    fetchPlayers();
  }, []);

  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

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
              key={player.id || index} // Use player.id if available, otherwise fallback to index
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
                  <span className="px-3 py-1 bg-pwga-green/10 text-pwga-green rounded-full text-sm font-medium">
                    Rank #
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm text-gray-500">Wins</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm text-gray-500">Top 10</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm text-gray-500">Avg</p>
                  </div>
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
