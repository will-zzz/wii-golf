import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-golf-course bg-cover bg-center bg-no-repeat"
        style={{
          filter: "brightness(0.9)",
          backgroundPosition: "50% 30%",
        }}
      />

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-6">
              Professional Wii Golfers' Association
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-xl md:text-2xl text-white drop-shadow-md mb-8 max-w-2xl mx-auto">
              Real Players. Real Wii. Real Golf.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/about"
                className="px-6 py-3 bg-pwga-green text-white rounded-md font-medium shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
              >
                Learn More
              </a>
              <a
                href="/events"
                className="px-6 py-3 bg-white/90 text-gray-800 rounded-md font-medium shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
              >
                Upcoming Events
              </a>
            </div>
          </motion.div>
        </div>

        {/* Subtle footer */}
        <motion.div
          className="absolute bottom-4 w-full text-center text-white/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          © {new Date().getFullYear()} Professional Wii Golfers' Association
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
