import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bantText, setBantText] = useState("");
  const [bants, setBants] = useState([
    "Moohawmen has the best swing!", 
    "Daniel is going to win it all!", 
    "What a tournament!", 
    "Let's go Tigers!", 
    "Best Wii Golf event ever!",
    "Can't wait to see the putts!",
    "Who's bringing the snacks?",
    "My money's on Salim!",
    "Hole in one incoming!",
    "Nathan's form is immaculate"
  ]);

  const mockRegisteredPlayers = [
    "Moohawmen Shaw",
    "Daniel Duarte",
    "Michael Zhou",
    "Nathan Han",
    "Salim Hasanin",
    "Tristan Perkins",
    "Will Zakielarz"
  ];

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
        complete: (result) => {
          const events = result.data.map((row, index) => ({
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
            prize: row["Prize Pool"],
            image:
              row.Image && row.Image.includes("id=")
                ? `https://drive.google.com/thumbnail?id=${row.Image.split("id=")[1]}&sz=w1000`
                : "/images/bg.png",
          }));

          const upcoming = events.filter(
            (event) =>
              event.status === "Registration Open" ||
              event.status === "Coming Soon"
          );
          const past = events.filter((event) => event.status === "Closed");

          setUpcomingEvents(upcoming);
          setPastEvents(past);
          setLoading(false);
        },
      });
    };

    fetchEvents();
  }, []);

  const handleBantSubmit = (e) => {
    e.preventDefault();
    if (bantText.trim() !== "") {
      setBants([...bants, bantText]);
      setBantText("");
    }
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
                  <p className="text-gray-700 mb-3">{event.location}</p>
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
                className="bg-white rounded-lg shadow-lg overflow-hidden"
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
                  <p className="text-gray-700">{event.location}</p>
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
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="md:w-3/5 p-6">
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
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Prize Pool</p>
                      <p className="font-bold text-xl text-pwga-green">
                        {selectedEvent.prize}
                      </p>
                    </div>
                    {selectedEvent.status === "Registration Open" && (
                      <Button className="bg-pwga-green hover:bg-pwga-green/90">
                        Register Now
                      </Button>
                    )}
                  </div>

                  <div className="mt-6 mb-6">
                    <h3 className="text-lg font-semibold mb-3">Registered Players</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player Name</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockRegisteredPlayers.map((player, index) => (
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
                    <div className="bg-gray-50 p-4 rounded-lg h-64 relative overflow-hidden mb-4">
                      <FloatingBants bants={bants} />
                    </div>
                    
                    <form onSubmit={handleBantSubmit} className="flex gap-2">
                      <Input 
                        value={bantText}
                        onChange={(e) => setBantText(e.target.value)}
                        placeholder="Add your bant..."
                        className="flex-1"
                      />
                      <Button type="submit" className="bg-pwga-blue hover:bg-pwga-blue/90">
                        Submit
                      </Button>
                    </form>
                  </div>
                  
                  <Button
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    variant="secondary"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const FloatingBants = ({ bants }) => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
    >
      {bants.map((bant, index) => {
        const initialX = Math.random() * 80 + 10;
        const initialY = Math.random() * 80 + 10;
        
        return (
          <motion.div
            key={index}
            className="absolute text-sm md:text-base font-medium text-pwga-blue inline-block whitespace-nowrap"
            style={{
              left: `${initialX}%`,
              top: `${initialY}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              x: mousePosition.x ? (mousePosition.x / 20) * (index % 5 - 2) : 0,
              y: mousePosition.y ? (mousePosition.y / 20) * (index % 3 - 1) : 0,
              rotate: index % 2 === 0 ? [0, 2, 0, -2, 0] : [0, -2, 0, 2, 0],
            }}
            transition={{
              x: { type: "spring", stiffness: 50, damping: 20 },
              y: { type: "spring", stiffness: 50, damping: 20 },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {bant}
          </motion.div>
        );
      })}
    </div>
  );
};

export default Events;
