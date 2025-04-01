import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bants, setBants] = useState([]);
  const [players, setPlayers] = useState([]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const csvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCxlwW9y1gVgNBYMaVb2WqqGFgrWPPUNvc6SDBp2E2ND1eBzlc5G9rN4h_idIY2xTJdgM8DfJNfz5P/pub?gid=1131600429&single=true&output=csv";
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          const events = await Promise.all(
            result.data.map(async (row, index) => {
              const playersAndBants = row["Registered Players"]
                ? await fetchPlayersAndBants(row["Registered Players"])
                : [];
              const players = playersAndBants
                .filter((entry) => entry.name)
                .map((entry: { name: string; bants: string }) => entry.name);
              const bants = playersAndBants
                .filter((entry) => entry.bants)
                .map((entry) => entry.bants);

              return {
                id: index,
                title: row.Title,
                date: row.Date,
                location: row.Location,
                description: row.Description,
                status:
                  row["Registration open?"] === "yes"
                    ? "Registration Open"
                    : row["Registration open?"] === "coming soon"
                      ? "Coming Soon"
                      : "Closed",
                buyin: row["Buy-in"],
                winner: row["Winner"] || "",
                image:
                  row.Image && row.Image.includes("id=")
                    ? `https://drive.google.com/thumbnail?id=${
                        row.Image.split("id=")[1]
                      }&sz=w1000`
                    : "/images/bg.png",
                link: row["Registration Link"],
                playersLink: row["Registered Players"],
                players,
                bants: shuffleArray(bants), // Shuffle the bants array
              };
            })
          );

          setUpcomingEvents(events.filter((e) => e.status !== "Closed"));
          setPastEvents(events.filter((e) => e.status === "Closed"));
          setLoading(false);
        },
      });
    };

    fetchEvents();
  }, []);

  const fetchPlayersAndBants = async (
    playersLink: string
  ): Promise<{ name: string; bants: string }[]> => {
    if (!playersLink) return [];

    const response = await fetch(playersLink);
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          resolve(
            result.data
              .filter((row) => {
                const name = row["Name"] ? row["Name"].trim() : "";
                const bants = row["Bants"] ? row["Bants"].trim() : "";
                return name !== "" || bants !== "";
              })
              .map((row) => ({
                name: row["Name"] ? row["Name"].trim() : "",
                bants: row["Bants"] ? row["Bants"].trim() : "",
              }))
          );
        },
      });
    });
  };

  // Utility function to shuffle an array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PWGA Events</h1>
          <div className="w-24 h-1 bg-pwga-blue mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the excitement of professional Wii golf competitions.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-6 py-3 text-sm font-medium border rounded-l-lg focus:z-10 ${
                activeTab === "upcoming"
                  ? "bg-pwga-green text-white border-pwga-green"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Events
            </button>
            <button
              type="button"
              className={`px-6 py-3 text-sm font-medium border rounded-r-lg focus:z-10 ${
                activeTab === "past"
                  ? "bg-pwga-blue text-white border-pwga-blue"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("past")}
            >
              Past Events
            </button>
          </div>
        </div>

        {activeTab === "upcoming" && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={item}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === "Registration Open"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{event.date}</p>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-700">{event.location}</p>
                    <p className="text-gray-700">
                      Prize Pool:{" "}
                      <span className="text-pwga-green">
                        ${calculatePrizePool(event)}
                      </span>
                    </p>
                  </div>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "past" && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {pastEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={item}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h2>
                  <p className="text-gray-600 mb-2">{event.date}</p>
                  <p className="text-gray-700 mb-3">{event.location}</p>

                  {/* Display winner if available */}
                  {event.winner && (
                    <div className="mt-2 flex items-center">
                      <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-gray-800 font-medium">
                        Winner: {event.winner}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEvent.title}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEvent.status === "Registration Open"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {selectedEvent.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{selectedEvent.date}</p>
                <p className="text-gray-700 mb-4">{selectedEvent.location}</p>

                {/* Display winner in modal if available */}
                {selectedEvent.status === "Closed" && selectedEvent.winner && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center">
                    <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">
                        Winner
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedEvent.winner}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-auto object-cover object-center rounded-lg"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p
                    style={{ whiteSpace: "pre-wrap" }}
                    className="text-gray-700"
                  >
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className=" text-gray-500">Prize Pool</p>
                    <div>
                      <p className="font-bold text-2xl text-pwga-green">
                        ${calculatePrizePool(selectedEvent)}
                      </p>
                      <p className="text-sm text-gray-500">Buy-in</p>
                      <p className="font-bold text-lg text-gray-700">
                        ${selectedEvent.buyin}
                      </p>
                    </div>
                  </div>
                  {selectedEvent.status === "Registration Open" && (
                    <Button
                      className="bg-pwga-green hover:bg-pwga-green/90"
                      onClick={() => window.open(selectedEvent.link, "_blank")}
                    >
                      Register Now
                    </Button>
                  )}
                </div>

                <div className="mt-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Registered Players
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEvent.players.map((player, index) => (
                          <TableRow key={index}>
                            <TableCell>{player}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="mt-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3">Bants</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <DynamicBantsGrid bants={selectedEvent.bants} />
                  </div>
                </div>

                <Button
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  variant="secondary"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const calculatePrizePool = (event) => {
  const prizePool = event.players.length * parseFloat(event.buyin || 0);
  return prizePool;
};

const DynamicBantsGrid = ({ bants }) => {
  return (
    <div className="flex flex-wrap gap-3 p-4">
      {bants.map((bant, index) => {
        const length = bant.length;
        const padding =
          length < 10 ? "px-3 py-2" : length < 20 ? "px-4 py-3" : "px-5 py-4";
        const width =
          length < 8
            ? "w-auto"
            : length < 15
              ? "max-w-[120px]"
              : length < 25
                ? "max-w-[180px]"
                : length < 35
                  ? "max-w-[240px]"
                  : "max-w-[300px]";
        const bgColors = [
          "bg-pwga-blue/10",
          "bg-pwga-green/10",
          "bg-blue-50",
          "bg-green-50",
          "bg-yellow-50",
          "bg-purple-50",
          "bg-pink-50",
          "bg-orange-50",
        ];
        const bgColor = bgColors[index % bgColors.length];

        return (
          <div
            key={index}
            className={`${bgColor} ${padding} ${width} rounded-lg shadow-sm text-base text-gray-800 flex items-center justify-center text-center transform transition-transform hover:scale-105`}
            style={{
              height: "100px", // Fixed height for all bants
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {bant}
          </div>
        );
      })}
    </div>
  );
};

export default Events;
