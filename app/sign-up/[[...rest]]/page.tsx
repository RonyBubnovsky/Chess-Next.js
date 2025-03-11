'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SignUpPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate random particles with quicker timings:
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    size: Math.random() * 5 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    // Duration between 2 and 4 seconds
    duration: Math.random() * 2 + 2,
    // Minimal delay: 0 to 0.2 seconds
    delay: Math.random() * 0.2,
  }));

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#0B0F2A] to-[#1E2340]">
      {/* Ambient background particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/20 rounded-full filter blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full filter blur-[100px] animate-float-delay" />

      {/* Back button with animation */}
      <Link href="/">
        <motion.button
          className="fixed top-6 left-6 z-50 flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ x: -5, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </motion.button>
      </Link>

      {/* Main content container */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-full">
        {/* Chess-themed decorative element */}
        <motion.div
          className="absolute z-0 opacity-10"
          initial={{ opacity: 0, rotateZ: 0 }}
          animate={{ opacity: 0.1, rotateZ: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M300 0C465.685 0 600 134.315 600 300C600 465.685 465.685 600 300 600C134.315 600 0 465.685 0 300C0 134.315 134.315 0 300 0Z"
              fill="url(#paint0_radial)"
            />
            <path d="M300 50C437.875 50 550 162.125 550 300C550 437.875 437.875 550 300 550C162.125 550 50 437.875 50 300C50 162.125 162.125 50 300 50Z" stroke="white" strokeOpacity="0.2" />
            <path d="M150 300H450" stroke="white" strokeOpacity="0.2" />
            <path d="M300 150V450" stroke="white" strokeOpacity="0.2" />
            <defs>
              <radialGradient
                id="paint0_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(300 300) rotate(90) scale(300)"
              >
                <stop stopColor="white" stopOpacity="0.1" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Page title */}
        <motion.h1
          className="text-white text-5xl font-bold mb-10 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Create an Account
          </span>
        </motion.h1>

        {/* Clerk Sign Up component with delayed fade in */}
        <motion.div
          className="relative z-10 w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <style jsx global>{`
            /* Override the Clerk card background */
            .cl-card {
              background-color: transparent !important;
              box-shadow: none !important;
              border: none !important;
            }
            
            /* Override the Clerk container */
            .cl-rootBox,
            .cl-containerBox,
            .cl-component {
              background-color: transparent !important;
              max-width: 100% !important;
              width: 100% !important;
            }

            /* Global styles to force white text in social buttons */
            .cl-socialButtonsBlockButton,
            .cl-socialButtonsBlockButton span,
            .cl-socialButtonsBlockButton div {
              color: white !important;
            }

            /* Target the Google button specifically if needed */
            .cl-socialButtonsBlockButton[data-provider='google'],
            .cl-socialButtonsBlockButton[data-provider='google'] * {
              color: white !important;
            }

            /* Additional specific targeting for button text */
            .cl-socialButtonsIconButton__text,
            .cl-socialButtonsBlockButton__text {
              color: white !important;
            }

            /* Fix overflow issues */
            .cl-formButtonPrimary,
            .cl-socialButtonsBlockButton,
            .cl-formFieldInput {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
          `}</style>

          <SignUp
            path="/sign-up"
            routing="path"
            appearance={{
              elements: {
                card: `
                  bg-white/10
                  backdrop-blur-md
                  shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)]
                  border border-white/10
                  p-6
                  rounded-xl
                `,
                headerTitle: `
                  text-xl
                  font-bold
                  text-white
                `,
                headerSubtitle: `
                  text-white/70
                `,
                formFieldInput: `
                  bg-white
                  border border-gray-300
                  rounded-xl
                  text-gray-900
                  placeholder:text-gray-400
                  focus:border-purple-500
                  focus:ring-purple-500/30
                  focus:outline-none
                  px-4
                  py-3
                  max-w-full
                  w-full
                `,
                formFieldLabel: `
                  text-white/80
                  font-medium
                  mb-2
                `,
                formButtonPrimary: `
                  bg-gradient-to-r from-purple-600 to-blue-600
                  hover:from-purple-500 hover:to-blue-500
                  rounded-xl
                  px-6
                  py-3
                  font-medium
                  transform transition-all duration-300
                  hover:scale-[1.02]
                  hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]
                  active:scale-[0.98]
                  text-white
                  w-full
                `,
                footerActionLink: `
                  text-purple-400
                  hover:text-purple-300
                  transition-colors
                  font-medium
                `,
                dividerLine: `
                  bg-white/10
                `,
                dividerText: `
                  text-white/50
                `,
                socialButtonsBlockButton: `
                  border-white/10
                  bg-white/10
                  hover:bg-white/20
                  rounded-xl
                  transition-all
                  text-white
                  px-4
                  py-3
                  font-medium
                  flex items-center justify-center
                  gap-2
                  [&>*]:text-white
                  w-full
                `,
                socialButtonsIconButton: `
                  text-white
                  [&>*]:text-white
                `,
                socialButtonsProviderIcon: `
                  filter brightness(0) invert(1)
                `,
              },
              layout: {
                socialButtonsVariant: 'blockButton',
              },
              variables: {
                colorPrimary: '#7c3aed',
                colorText: 'white',
                colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
                colorBackground: 'transparent',
                colorInputText: 'black',
                colorInputBackground: 'white',
                borderRadius: '0.75rem',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
            }}
          />
        </motion.div>

        {/* Footer text */}
        <motion.div
          className="mt-8 text-white/50 text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p>© RonyChess 2025 • Secured with advanced encryption</p>
        </motion.div>
      </div>
    </div>
  );
}
