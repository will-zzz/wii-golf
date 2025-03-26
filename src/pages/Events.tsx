
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Event data
const upcomingEvents = [
  {
    id: 1,
    title: "PWGA Championship",
    date: "June 15-18, 2023",
    location: "Virtual Pebble Beach",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    description: "The flagship event of the PWGA season, featuring the top 50 players competing for the coveted Green Wiimote.",
    prize: "$50,000",
    status: "Registration Open"
  },
  {
    id: 2,
    title: "Mii Open",
    date: "July 8-11, 2023",
    location: "Alpine Resort",
    image: "https://images.unsplash.com/photo-1560740583-0664e57560e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
    description: "A challenging tournament set in the mountains, testing players' abilities to adjust to elevation changes.",
    prize: "$35,000",
    status: "Coming Soon"
  },
  {
    id: 3,
    title: "Island Classic",
    date: "August 5-8, 2023",
    location: "Tropical Paradise",
    image: "https://images.unsplash.com/photo-1590464837792-56c235cc8f3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1480&q=80",
    description: "A fan-favorite event played on a beautiful island course with water hazards on every hole.",
    prize: "$40,000",
    status: "Coming Soon"
  }
];

const pastEvents = [
  {
    id: 4,
    title: "Spring Invitational",
    date: "April 12-15, 2023",
    location: "Cherry Blossom Course",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    winner: "Alex Johnson",
    score: "-12"
  },
  {
    id: 5,
    title: "Desert Challenge",
    date: "March 18-21, 2023",
    location: "Cactus Canyon",
    image: "https://images.unsplash.com/photo-1631922085734-c0874408b1b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
    winner: "Mia Rodriguez",
    score: "-9"
  },
  {
    id: 6,
    title: "Winter Classic",
    date: "January 20-23, 2023",
    location: "Snowy Peaks",
    image: "https://images.unsplash.com/photo-1611811151107-a0033e0ec1b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
    winner: "Hiroshi Tanaka",
    score: "-8"
  }
];

const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

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
                activeTab === 'upcoming'
                  ? 'bg-pwga-green text-white border-pwga-green'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Events
            </button>
            <button
              type="button"
              className={`px-6 py-3 text-sm font-medium border rounded-r-lg focus:z-10 ${
                activeTab === 'past'
                  ? 'bg-pwga-blue text-white border-pwga-blue'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past Events
            </button>
          </div>
        </div>

        {activeTab === 'upcoming' && (
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
                onClick={() => setSelectedEvent(event.id)}
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
                    <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'Registration Open' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{event.date}</p>
                  <p className="text-gray-700 mb-3">{event.location}</p>
                  <p className="text-gray-600 line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-pwga-green">{event.prize}</span>
                    <button
                      className="px-4 py-2 bg-pwga-green text-white rounded-md hover:bg-pwga-green/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event.id);
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'past' && (
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
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="font-bold text-xl">{event.winner}</p>
                      <p className="text-sm">Winner • {event.score}</p>
                    </div>
                  </div>
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
                  <p className="text-gray-600 mb-2">{event.date}</p>
                  <p className="text-gray-700">{event.location}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-3xl w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              {upcomingEvents.filter(e => e.id === selectedEvent).map(event => (
                <div key={event.id} className="flex flex-col md:flex-row">
                  <div className="md:w-2/5">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="md:w-3/5 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === 'Registration Open' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{event.date}</p>
                    <p className="text-gray-700 mb-4">{event.location}</p>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700">{event.description}</p>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Prize Pool</p>
                        <p className="font-bold text-xl text-pwga-green">{event.prize}</p>
                      </div>
                      {event.status === 'Registration Open' && (
                        <button 
                          className="px-6 py-2 bg-pwga-green text-white rounded-md hover:bg-pwga-green/90 transition-colors"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                    <button 
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => setSelectedEvent(null)}
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

export default Events;
