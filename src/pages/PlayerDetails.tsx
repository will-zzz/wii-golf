
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Award, Calendar, Calculator } from "lucide-react";
import { getPlayerById } from "@/utils/rankUtils";
import { PlayerData } from "@/utils/fetchUtils";

const PlayerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true);
      try {
        if (id) {
          const playerData = await getPlayerById(id);
          setPlayer(playerData);
        }
      } catch (error) {
        console.error("Error fetching player:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  if (loading || !player) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading player...</p>
      </div>
    );
  }

  // Use stats from player object
  const stats = player.stats || {
    gamesPlayed: 0,
    wins: 0,
    averageScore: 0,
  };

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
                src={player.image || ''}
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
                    {player.rank}
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
                      <p className="text-gray-700 leading-relaxed">
                        {player.hero}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">
                        Greatest Foe
                      </h2>
                      <p className="text-gray-700 leading-relaxed">
                        {player.foe}
                      </p>
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
                          <h3 className="font-semibold text-gray-800">
                            Games Played
                          </h3>
                          <p className="text-2xl font-bold text-pwga-green">
                            {stats.gamesPlayed}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-yellow-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-800">Wins</h3>
                          <p className="text-2xl font-bold text-pwga-green">
                            {stats.wins}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calculator className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Average Score
                          </h3>
                          <p className="text-2xl font-bold text-pwga-green">
                            {stats.averageScore}
                          </p>
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
