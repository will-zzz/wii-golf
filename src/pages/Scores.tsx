
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ScoreCard from "@/components/ScoreCard";

// Mock data for scores
const mockScores = [
  {
    id: 1,
    imageUrl: "https://picsum.photos/id/1/600/400",
    date: "June 15, 2023",
    course: "Wii Sports Resort - Classic 18",
    players: [
      { name: "John Doe", score: -2 },
      { name: "Jane Smith", score: +1 },
      { name: "Mike Johnson", score: -3 },
      { name: "Sarah Williams", score: +4 }
    ]
  },
  {
    id: 2,
    imageUrl: "https://picsum.photos/id/2/600/400",
    date: "May 28, 2023",
    course: "Wii Sports - Beginner Course",
    players: [
      { name: "Alex Thompson", score: 0 },
      { name: "Chris Wilson", score: -1 }
    ]
  },
  {
    id: 3,
    imageUrl: "https://picsum.photos/id/3/600/400",
    date: "April 10, 2023",
    course: "Wii Sports Resort - Expert Challenge",
    players: [
      { name: "Taylor Jones", score: +2 },
      { name: "Jordan Clark", score: -5 },
      { name: "Casey Brown", score: +3 }
    ]
  }
];

const Scores: React.FC = () => {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-24 max-w-6xl"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Scores</h1>
        <Button className="bg-pwga-green hover:bg-pwga-green-dark text-white">
          Submit Score
        </Button>
      </div>
      
      <div className="space-y-6">
        {mockScores.map((score) => (
          <ScoreCard
            key={score.id}
            imageUrl={score.imageUrl}
            date={score.date}
            course={score.course}
            players={score.players}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Scores;
