import React from "react";
import { Trophy } from "lucide-react";
import { PlayerScore } from "@/utils/fetchUtils";

interface ScoreCardProps {
  imageUrl: string;
  date: string;
  players: PlayerScore[];
  winners?: PlayerScore[];
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  imageUrl,
  date,
  players,
  winners = [],
}) => {
  // Sort players by score (ascending)
  const sortedPlayers = [...players].sort((a, b) => a.score - b.score);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="md:flex">
        <div className="md:w-1/4 h-48 md:h-auto overflow-hidden relative">
          <img
            src={imageUrl}
            alt="Game"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-2 px-4">
            <p className="text-sm">{date}</p>
          </div>
        </div>
        <div className="md:w-3/4 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedPlayers.map((player, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    winners.some((winner) => winner.name === player.name)
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    {winners.some((winner) => winner.name === player.name) && (
                      <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span
                    className={`font-bold ${
                      player.score <= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {player.score > 0 ? `+${player.score}` : player.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
