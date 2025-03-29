import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface Player {
  name: string;
  score: number;
}

interface ScoreCardProps {
  imageUrl: string;
  date: string;
  players: Player[];
}

const ScoreCard: React.FC<ScoreCardProps> = ({ imageUrl, date, players }) => {
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

  // Find the lowest score
  const lowestScore = Math.min(...players.map((player) => player.score));

  // Determine winners (all players with the lowest score)
  const winners = players.filter((player) => player.score === lowestScore);
  const winnerNames = winners.map((winner) => winner.name);

  return (
    <>
      {/* Main ScoreCard */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Score Image - Left Side */}
          <div
            className="md:w-1/3 h-[200px] md:h-[200px] overflow-hidden cursor-pointer"
            onClick={() => setIsImagePopupOpen(true)} // Open popup on click
          >
            <img
              src={imageUrl}
              alt="scorecard"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Score Details - Right Side */}
          <CardContent className="md:w-2/3 p-4">
            <div className="mb-4">
              <p className="text-gray-500">{date}</p>
              {winners.length > 0 && (
                <p className="text-pwga-green text-lg mt-1">
                  Winner{winners.length > 1 ? "s" : ""}:{" "}
                  {winnerNames.join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-medium">Players</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b pb-1"
                  >
                    <span className="flex items-center gap-1">
                      {player.score === lowestScore && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                      {player.name}
                    </span>
                    <span className="font-bold">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Image Popup */}
      {isImagePopupOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsImagePopupOpen(false)} // Close popup on click
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden max-w-full max-h-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
          >
            <img
              src={imageUrl}
              alt="scorecard full image"
              className="w-auto h-auto max-w-full max-h-screen object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ScoreCard;
