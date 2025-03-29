import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ScoreCard from "@/components/ScoreCard";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X, Trophy } from "lucide-react";
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
import Papa from "papaparse";

const Scores: React.FC = () => {
  // States for scores and filters
  const [scores, setScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [playerFilter, setPlayerFilter] = useState<string>("all_players");
  const [winnerSearch, setWinnerSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch scores from Google Sheets
  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      const csvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?gid=1898345264&single=true&output=csv";
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedScores = result.data.map((row, index) => {
            // Extract the file ID from the Google Drive link
            const photoId =
              row.Photo && row.Photo.includes("id=")
                ? row.Photo.split("id=")[1]
                : null;

            return {
              id: index,
              image: photoId
                ? `https://drive.google.com/thumbnail?id=${photoId}&sz=w1000` // Convert to direct image link
                : "/images/bg.png", // Use a placeholder if no valid photo
              date: row.Timestamp
                ? new Date(row.Timestamp).toLocaleDateString()
                : "Unknown Date",
              players: [
                {
                  name: row["Player 1 Name"],
                  score: parseInt(row["Player 1 Score"]) || 0,
                },
                {
                  name: row["Player 2 Name"],
                  score: parseInt(row["Player 2 Score"]) || 0,
                },
                {
                  name: row["Player 3 Name"],
                  score: parseInt(row["Player 3 Score"]) || 0,
                },
                {
                  name: row["Player 4 Name"],
                  score: parseInt(row["Player 4 Score"]) || 0,
                },
              ].filter((player) => player.name), // Filter out empty player entries
            };
          });

          setScores(parsedScores);
          setFilteredScores(parsedScores);
          setLoading(false);
        },
      });
    };

    fetchScores();
  }, []);

  // Filter scores based on selected filters
  useEffect(() => {
    const applyFilters = () => {
      const filtered = scores.filter((score) => {
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

        // Filter by player if playerFilter is set and not "all_players"
        if (playerFilter && playerFilter !== "all_players") {
          const hasPlayer = score.players.some(
            (player) => player.name === playerFilter
          );
          if (!hasPlayer) return false;
        }

        // Filter by winner name if winnerSearch is set
        if (winnerSearch) {
          // Find the lowest score
          const lowestScore = Math.min(
            ...score.players.map((player) => player.score)
          );

          // Get winners (anyone with the lowest score)
          const winners = score.players.filter(
            (player) => player.score === lowestScore
          );

          // Check if any winner's name includes the search term
          return winners.some((winner) =>
            winner.name.toLowerCase().includes(winnerSearch.toLowerCase())
          );
        }

        return true;
      });

      setFilteredScores(filtered);
    };

    applyFilters();
  }, [dateFilter, playerFilter, winnerSearch, scores]);

  // Reset all filters
  const resetFilters = () => {
    setDateFilter(undefined);
    setPlayerFilter("all_players");
    setWinnerSearch("");
  };

  // Get unique player names from scores
  const getAllPlayers = () => {
    const playerSet = new Set<string>();
    scores.forEach((score) => {
      score.players.forEach((player) => {
        playerSet.add(player.name);
      });
    });
    return Array.from(playerSet);
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-24 max-w-6xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Scores</h1>
        <a
          href="https://forms.gle/Zm8M1r47Hc7ByMv86"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-pwga-green hover:bg-pwga-green-dark text-white">
            Submit Score
          </Button>
        </a>
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
                  {dateFilter ? (
                    format(dateFilter, "PPP")
                  ) : (
                    <span>Filter by date</span>
                  )}
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
                <SelectItem value="all_players">All Players</SelectItem>
                {getAllPlayers().map((player, index) => (
                  <SelectItem key={index} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Winner Search */}
          <div className="w-full md:w-auto flex-1">
            <div className="relative">
              <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-500" />
              <Input
                placeholder="Search by winner"
                value={winnerSearch}
                onChange={(e) => setWinnerSearch(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
        </div>

        {/* Reset Filters Button - Only show if filters are applied */}
        {(dateFilter || playerFilter !== "all_players" || winnerSearch) && (
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
      {loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">Loading scores...</p>
        </div>
      ) : filteredScores.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">
            No scores found matching your filters.
          </p>
          <Button variant="outline" className="mt-4" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredScores.map((score) => (
            <ScoreCard
              key={score.id}
              imageUrl={score.image}
              date={score.date}
              players={score.players}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Scores;
