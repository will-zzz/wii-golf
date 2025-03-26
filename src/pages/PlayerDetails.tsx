
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

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
    favoriteShot: "Power Drive",
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
    favoriteShot: "Approach Shot",
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
    favoriteShot: "Chip Shot",
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
    favoriteShot: "Long Drive",
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
    favoriteShot: "Putt",
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
    favoriteShot: "Bunker Shot",
    stats: {
      wins: 13,
      topTen: 40,
      avgScore: -5.7
    }
  }
];

const PlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Find the player with the matching ID
    const foundPlayer = players.find(p => p.id === parseInt(id));
    setPlayer(foundPlayer);
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
        <Link to="/players" className="inline-flex items-center text-pwga-blue mb-8 hover:underline">
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
                  <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
                  <span className="px-3 py-1 bg-pwga-green/10 text-pwga-green rounded-full text-sm font-medium">
                    Rank #{player.ranking}
                  </span>
                </div>
                <p className="text-pwga-blue font-medium text-lg mb-6">{player.nickname} • {player.country}</p>
              </div>
              
              <div className="md:hidden flex justify-end mt-2 mb-4">
                <span className="px-3 py-1 bg-pwga-green/10 text-pwga-green rounded-full text-sm font-medium">
                  Rank #{player.ranking}
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Bio</h2>
                  <p className="text-gray-700 leading-relaxed">{player.bio}</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Favorite Golf Shot</h2>
                  <p className="text-gray-700 leading-relaxed">{player.favoriteShot}</p>
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
