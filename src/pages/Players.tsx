
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Player data
const players = [
  {
    id: 1,
    name: "Alex Johnson",
    nickname: "The Ace",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    ranking: 1,
    country: "United States",
    bio: "Alex began playing Wii Golf in 2007 and quickly rose to prominence with a perfect game score in 2020.",
    stats: {
      wins: 24,
      topTen: 56,
      avgScore: -7.2
    }
  },
  {
    id: 2,
    name: "Mia Rodriguez",
    nickname: "Precision Queen",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    ranking: 2,
    country: "Spain",
    bio: "Known for her remarkable precision, Mia has the record for most consecutive perfect swings in tournament play.",
    stats: {
      wins: 19,
      topTen: 48,
      avgScore: -6.8
    }
  },
  {
    id: 3,
    name: "Hiroshi Tanaka",
    nickname: "The Strategist",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    ranking: 3,
    country: "Japan",
    bio: "Hiroshi's methodical approach and course management have made him one of the most consistent players on the tour.",
    stats: {
      wins: 17,
      topTen: 52,
      avgScore: -6.5
    }
  },
  {
    id: 4,
    name: "Sophie Bennett",
    nickname: "Power Player",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    ranking: 4,
    country: "Australia",
    bio: "With the longest average drive in PWGA history, Sophie dominates courses with her powerful swing.",
    stats: {
      wins: 15,
      topTen: 45,
      avgScore: -6.2
    }
  },
  {
    id: 5,
    name: "Marcus Williams",
    nickname: "Comeback Kid",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    ranking: 5,
    country: "Canada",
    bio: "Famous for his ability to rally from behind, Marcus has won 8 tournaments after trailing on the final day.",
    stats: {
      wins: 14,
      topTen: 43,
      avgScore: -5.9
    }
  },
  {
    id: 6,
    name: "Elena Petrova",
    nickname: "Ice Queen",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    ranking: 6,
    country: "Russia",
    bio: "Elena's calm demeanor under pressure has earned her the nickname 'Ice Queen' and multiple championship titles.",
    stats: {
      wins: 13,
      topTen: 40,
      avgScore: -5.7
    }
  }
];

const Players = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PWGA Players</h1>
          <div className="w-24 h-1 bg-pwga-blue mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the elite competitors who have mastered the virtual greens and fairways.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {players.map((player) => (
            <motion.div
              key={player.id}
              variants={item}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              onClick={() => setSelectedPlayer(player.id)}
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
                  <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
                  <span className="px-3 py-1 bg-pwga-green/10 text-pwga-green rounded-full text-sm font-medium">
                    Rank #{player.ranking}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{player.nickname} • {player.country}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm text-gray-500">Wins</p>
                    <p className="font-bold text-pwga-green">{player.stats.wins}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm text-gray-500">Top 10</p>
                    <p className="font-bold text-pwga-blue">{player.stats.topTen}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-sm text-gray-500">Avg</p>
                    <p className="font-bold text-gray-900">{player.stats.avgScore}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Player Detail Modal */}
        {selectedPlayer && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-2xl w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              {players.filter(p => p.id === selectedPlayer).map(player => (
                <div key={player.id} className="flex flex-col md:flex-row">
                  <div className="md:w-2/5">
                    <img 
                      src={player.image} 
                      alt={player.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="md:w-3/5 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{player.name}</h2>
                        <p className="text-pwga-blue font-medium">{player.nickname}</p>
                      </div>
                      <span className="px-3 py-1 bg-pwga-green/10 text-pwga-green rounded-full text-sm font-medium">
                        Rank #{player.ranking}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{player.country}</p>
                    <p className="text-gray-700 mb-6">{player.bio}</p>
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Tournament Wins</p>
                        <p className="font-bold text-2xl text-pwga-green">{player.stats.wins}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Top 10 Finishes</p>
                        <p className="font-bold text-2xl text-pwga-blue">{player.stats.topTen}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Avg. Score</p>
                        <p className="font-bold text-2xl text-gray-900">{player.stats.avgScore}</p>
                      </div>
                    </div>
                    <button 
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => setSelectedPlayer(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
