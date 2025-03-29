
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface Player {
  name: string;
  score: number;
}

interface ScoreCardProps {
  imageUrl: string;
  date: string;
  course: string;
  players: Player[];
}

const ScoreCard: React.FC<ScoreCardProps> = ({ imageUrl, date, course, players }) => {
  // Find the lowest score
  const lowestScore = Math.min(...players.map(player => player.score));
  
  // Determine winners (all players with the lowest score)
  const winners = players.filter(player => player.score === lowestScore);
  const winnerNames = winners.map(winner => winner.name);

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Score Image - Left Side */}
        <div className="md:w-1/3 h-[200px] md:h-auto">
          <img
            src={imageUrl}
            alt={`${course} scorecard`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Score Details - Right Side */}
        <CardContent className="md:w-2/3 p-4">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{course}</h3>
            <p className="text-gray-500">{date}</p>
            {winners.length > 0 && (
              <p className="text-pwga-green font-medium mt-1">
                Winner{winners.length > 1 ? 's' : ''}: {winnerNames.join(', ')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg font-medium">Players</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {players.map((player, index) => (
                <div key={index} className="flex justify-between border-b pb-1">
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
  );
};

export default ScoreCard;
