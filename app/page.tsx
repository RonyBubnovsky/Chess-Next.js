'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeDScene from '../components/ThreeDScene';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Display name logic
  const displayName = user?.firstName || user?.username || 'Friend';

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
    // Set initial theme based on user preference
    setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    // Simulate loading state
    const timer = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Generate ambient particles - only after component is mounted
  const particles = useMemo(() => {
    if (!isMounted) return [];
    
    return Array.from({ length: 30 }).map(() => {
      const size = Math.random() * 8 + 2;
      return {
        size,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        xMovement: Math.random() * 30 - 15,
        yMovement: Math.random() * 30 - 15,
        duration: Math.random() * 15 + 20,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.5 + 0.1,
      };
    });
  }, [isMounted]);

  // Theme toggle
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Early return before client-side hydration to prevent mismatch
  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  return (
    <main 
      className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}
    >
      {/* Theme toggle */}
      <motion.button
        className={`fixed top-5 right-5 z-50 p-2 rounded-full ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="sr-only">Toggle theme</span>
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-800">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </motion.button>

      {/* Ambient particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              isDarkMode ? 'bg-blue-500' : 'bg-indigo-600'
            }`}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.initialX}%`,
              top: `${particle.initialY}%`,
              opacity: particle.opacity,
            }}
            animate={{
              x: [0, particle.xMovement, 0],
              y: [0, particle.yMovement, 0],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content container */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div 
            className="flex flex-col lg:flex-row h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Left side: Hero and call to action */}
            <motion.section 
              className="w-full lg:w-3/5 flex flex-col items-center justify-center p-6 lg:p-16 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="max-w-lg text-center lg:text-left">
                <motion.h1 
                  className={`text-5xl md:text-6xl font-bold leading-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Elevate Your 
                  <span className={`block bg-clip-text text-transparent ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400' 
                      : 'bg-gradient-to-r from-indigo-600 via-blue-700 to-violet-800'
                  }`}>
                    Chess Game
                  </span>
                </motion.h1>
                
                <motion.p 
                  className={`mt-6 text-lg md:text-xl ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  Want to play chess? You&apos;re at the right place!
                </motion.p>
                
                <motion.div 
                  className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  {isSignedIn ? (
                    <>
                      <Link href="/chess">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-8 py-4 w-full sm:w-auto rounded-xl font-medium ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                              : 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/20'
                          } transition`}
                        >
                          Start Playing
                        </motion.button>
                      </Link>
                      <motion.button
                        onClick={() => signOut()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-8 py-4 w-full sm:w-auto rounded-xl font-medium transition ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-200 border border-gray-700'
                            : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                        }`}
                      >
                        Sign Out
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-up">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-8 py-4 w-full sm:w-auto rounded-xl font-medium ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                              : 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/20'
                          } transition`}
                        >
                          Join Now
                        </motion.button>
                      </Link>
                      <Link href="/sign-in">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-8 py-4 w-full sm:w-auto rounded-xl font-medium transition ${
                            isDarkMode 
                              ? 'bg-gray-800 text-gray-200 border border-gray-700'
                              : 'bg-white text-gray-800 border border-gray-200 shadow-md'
                          }`}
                        >
                          Sign In
                        </motion.button>
                      </Link>
                    </>
                  )}
                </motion.div>
                
                {isSignedIn && (
                  <motion.p 
                    className={`mt-6 ${isDarkMode ? 'text-blue-300' : 'text-indigo-600'} font-medium`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    Welcome back, {displayName}
                  </motion.p>
                )}
              </div>
            </motion.section>

            {/* Right side: 3D chess visualization */}
            <motion.section 
              className={`w-full lg:w-2/5 relative flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-950' : 'bg-gradient-to-b from-gray-100 to-white'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Decorative ring around 3D scene */}
              <motion.div 
                className={`absolute rounded-full w-3/5 h-3/5 border-4 ${
                  isDarkMode ? 'border-blue-900/30' : 'border-indigo-200'
                } animate-pulse`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 1 }}
              />
              
              {/* 3D Scene container*/}
              <motion.div 
                className="relative w-3/5 h-2/5 flex items-center justify-center ml-8"
                initial={{ opacity: 0, rotateY: -20 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {/*3D chess piece component*/}
                <div className="w-4/5 h-4/5">
                  <ThreeDScene />
                </div>
              </motion.div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}