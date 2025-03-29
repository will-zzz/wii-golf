
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ScoreCard from "@/components/ScoreCard";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

// Get unique player names from mockScores
const getAllPlayers = () => {
  const playerSet = new Set<string>();
  mockScores.forEach(score => {
    score.players.forEach(player => {
      playerSet.add(player.name);
    });
  });
  return Array.from(playerSet);
};

const Scores: React.FC = () => {
  // States for filters
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [playerFilter, setPlayerFilter] = useState<string>("");
  const [courseSearch, setCourseSearch] = useState<string>("");
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Filter scores based on selected filters
  const filteredScores = mockScores.filter(score => {
    // Filter by date if dateFilter is set
    if (dateFilter) {
      const scoreDate = new Date(score.date);
      const filterDate = new Date(dateFilter);
      if (
        scoreDate.getDate() !== filterDate.getDate() ||
        scoreDate.getMonth() !== filterDate.getMonth() ||
        scoreDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }

    // Filter by player if playerFilter is set
    if (playerFilter) {
      const hasPlayer = score.players.some(player => 
        player.name === playerFilter
      );
      if (!hasPlayer) return false;
    }

    // Filter by course name if courseSearch is set
    if (courseSearch) {
      return score.course.toLowerCase().includes(courseSearch.toLowerCase());
    }

    return true;
  });

  // Reset all filters
  const resetFilters = () => {
    setDateFilter(undefined);
    setPlayerFilter("");
    setCourseSearch("");
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-24 max-w-6xl"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Scores</h1>
        <Button className="bg-pwga-green hover:bg-pwga-green-dark text-white">
          Submit Score
        </Button>
      </div>
      
      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Date Filter */}
          <div className="w-full md:w-auto flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Player Filter */}
          <div className="w-full md:w-auto flex-1">
            <Select value={playerFilter} onValueChange={setPlayerFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Players</SelectItem>
                {getAllPlayers().map((player, index) => (
                  <SelectItem key={index} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Course Search */}
          <div className="w-full md:w-auto flex-1">
            <Input
              placeholder="Search by course"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        {/* Reset Filters Button - Only show if filters are applied */}
        {(dateFilter || playerFilter || courseSearch) && (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" /> Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Show message if no scores found */}
      {filteredScores.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">No scores found matching your filters.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredScores.map((score) => (
            <ScoreCard
              key={score.id}
              imageUrl={score.imageUrl}
              date={score.date}
              course={score.course}
              players={score.players}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Scores;
