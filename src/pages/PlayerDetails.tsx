import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Papa from "papaparse"; // Install with `npm install papaparse`

const PlayerDetails = () => {
  const { id } = useParams();
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState(null);

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

          // Find the player after the players state is updated
          const foundPlayer = formattedPlayers.find((p) => p.id === id);
          setPlayer(foundPlayer);
        },
      });
    };

    fetchPlayers();
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
                <p className="text-white/90">{player.nickname}</p>
              </div>
            </div>

            <div className="md:w-3/5 p-6 md:p-8">
              <div className="hidden md:block">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {player.name}
                  </h1>
                  <span className="px-3 py-1 bg-pwga-green/10 text-pwga-green rounded-full text-sm font-medium">
                    Rank #
                  </span>
                </div>
                {/* <p className="text-pwga-blue font-medium text-lg mb-6">
                  {player.nickname} • {player.country}
                </p> */}
              </div>

              <div className="md:hidden flex justify-end mt-2 mb-4">
                <span className="px-3 py-1 bg-pwga-green/10 text-pwga-green rounded-full text-sm font-medium">
                  Rank #
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Bio</h2>
                  <p className="text-gray-700 leading-relaxed">{player.bio}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Favorite Golf Shot
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {player.favoriteShot}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Biggest Hero
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{player.hero}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Greatest Foe
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{player.foe}</p>
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
