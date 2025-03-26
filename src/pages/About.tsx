import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About PWGA</h1>
          <div className="w-24 h-1 bg-pwga-green mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The PWGA is the Professional Wii Golfers' Association. Or should I
            say WE are the Professional Wii Golfers' Association.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="h-64 bg-[url('/images/mission.png')] bg-cover bg-center"></div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Our Mission
              </h2>
              <p className="text-gray-600">
                We are a league of refined gentlemen and lovely ladies with a
                shared goal of revitalizing the beloved sport of Wii Golf.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="h-64 bg-[url('/images/weneedyou.png')] bg-cover bg-center"></div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                We Need You
              </h2>
              <p className="text-gray-600">
                We find ourselves in tumultuous times. So there's nothing better
                than kicking back with your friends and playing some golf! With
                the PWGA, the future is bright. Will you sink a monster putt
                from the edge of the green? Or will you read the wind perfectly
                and score a hole-in-one? The decision is up to you. To us.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-16"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            League Rules
          </h2>
          <ol className="list-decimal list-inside space-y-4 text-gray-600">
            <li className="text-lg">Respect all players and officials.</li>
            <li className="text-lg">Conduct yourself with integrity.</li>
            <li className="text-lg">
              If you take another player's shot and miss the hole, you will be
              immediately suspended until the next PWGA event.
            </li>
            <li className="text-lg">Be a gentleman.</li>
            <li className="text-lg">Never throw the Wii remote.</li>
            <li className="text-lg">
              Shake hands before and after every match.
            </li>
            <li className="text-lg">
              If a player requests silence for their swing, that can be done.
            </li>
            <li className="text-lg">Always swing with intensity.</li>
            <li className="text-lg">
              Proper attire must be worn depending on the event.
            </li>
            <li className="text-lg">
              You only get so many strikes before you're out.
            </li>
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <a
            href="/players"
            className="inline-block px-6 py-3 bg-pwga-green text-white rounded-md font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Meet Our Players
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
