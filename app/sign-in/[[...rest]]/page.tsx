'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SignInPage() {
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
            ease: "easeInOut",
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
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
        >
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M300 0C465.685 0 600 134.315 600 300C600 465.685 465.685 600 300 600C134.315 600 0 465.685 0 300C0 134.315 134.315 0 300 0Z" fill="url(#paint0_radial)" />
            <path d="M300 50C437.875 50 550 162.125 550 300C550 437.875 437.875 550 300 550C162.125 550 50 437.875 50 300C50 162.125 162.125 50 300 50Z" stroke="white" strokeOpacity="0.2" />
            <path d="M150 300H450" stroke="white" strokeOpacity="0.2" />
            <path d="M300 150V450" stroke="white" strokeOpacity="0.2" />
            <defs>
              <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(300 300) rotate(90) scale(300)">
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
            Welcome Back
          </span>
        </motion.h1>

        {/* Clerk Sign In component with delayed fade in */}
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
              white-space: nowrap !important;
              overflow: visible !important;
              text-overflow: clip !important;
              font-size: 14px !important;
            }

            /* Fix overflow issues */
            .cl-formButtonPrimary,
            .cl-socialButtonsBlockButton,
            .cl-formFieldInput {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            
            /* Ensure social buttons text is fully visible */
            .cl-socialButtonsBlockButton__text {
              width: auto !important;
              min-width: 100px !important;
              overflow: visible !important;
              white-space: nowrap !important;
              text-overflow: initial !important;
            }
            
            /* Make social buttons container wider */
            .cl-socialButtonsIconButton,
            .cl-socialButtonsBlockButton {
              min-width: 120px !important;
              padding-left: 6px !important;
              padding-right: 6px !important;
            }
            
            /* Make the social buttons row have proper spacing */
            .cl-socialButtonsGroup {
              justify-content: space-between !important;
              gap: 8px !important;
            }

            /* Make borders more visible for social buttons */
            .cl-socialButtonsBlockButton {
              border: 2px solid #3A4074 !important;
              box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
              transition: all 0.3s ease-out !important;
              position: relative !important;
              overflow: hidden !important;
            }
            
            /* Modern hover effect for social buttons */
            .cl-socialButtonsBlockButton:hover {
              border-color: rgba(124, 58, 237, 0.7) !important;
              box-shadow: 0 0 20px rgba(124, 58, 237, 0.3) !important;
              transform: translateY(-2px) !important;
            }
            
            /* Add shine effect on hover */
            .cl-socialButtonsBlockButton:before {
              content: '' !important;
              position: absolute !important;
              top: -100% !important;
              left: -100% !important;
              width: 300% !important;
              height: 300% !important;
              background: linear-gradient(
                115deg,
                transparent 0%,
                transparent 40%,
                rgba(255, 255, 255, 0.15) 50%,
                transparent 60%,
                transparent 100%
              ) !important;
              transition: all 0.6s ease-out !important;
            }
            
            .cl-socialButtonsBlockButton:hover:before {
              top: -50% !important;
              left: -50% !important;
            }

            /* Enhanced GitHub icon visibility */
            .cl-socialButtonsBlockButton[data-provider='github'] img,
            .cl-socialButtonsProviderIcon[data-provider='github'] {
              filter: brightness(0) invert(1) !important;
              opacity: 1 !important;
              transform: scale(1.2) !important;
            }

            /* Make the form field input border more visible */
            .cl-formFieldInput {
              border: 2px solid #3A4074 !important;
              box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
              transition: all 0.3s ease-out !important;
            }
            
            /* Modern hover and focus effects for input fields */
            .cl-formFieldInput:hover {
              border-color: rgba(124, 58, 237, 0.6) !important;
              box-shadow: 0 0 15px rgba(124, 58, 237, 0.2) !important;
            }
            
            .cl-formFieldInput:focus {
              border-color: rgba(124, 58, 237, 0.8) !important;
              box-shadow: 0 0 20px rgba(124, 58, 237, 0.3) !important;
              transform: translateY(-1px) !important;
            }
            
            /* Fix button text wrapping issue */
            .cl-socialButtonsBlockButton[data-provider='facebook'] .cl-socialButtonsBlockButton__text,
            .cl-socialButtonsBlockButton[data-provider='github'] .cl-socialButtonsBlockButton__text,
            .cl-socialButtonsBlockButton[data-provider='google'] .cl-socialButtonsBlockButton__text {
              font-size: 14px !important;
              width: auto !important;
              overflow: visible !important;
              white-space: nowrap !important;
              text-overflow: initial !important;
              display: inline-block !important;
              min-width: initial !important;
            }
            
            /* Specific layout adjustments for social buttons group */
            .cl-socialButtonsGroup {
              display: flex !important;
              flex-direction: row !important; 
              justify-content: space-between !important;
              width: 100% !important;
            }
            
            /* Enhanced primary button styling */
            .cl-formButtonPrimary {
              background: linear-gradient(135deg, #7c3aed, #4f46e5) !important;
              position: relative !important;
              overflow: hidden !important;
              transition: all 0.4s ease !important;
            }
            
            .cl-formButtonPrimary:hover {
              background: linear-gradient(135deg, #8b5cf6, #6366f1) !important;
              box-shadow: 0 0 25px rgba(124, 58, 237, 0.5) !important;
            }
            
            /* Add shine effect on primary button hover */
            .cl-formButtonPrimary:before {
              content: '' !important;
              position: absolute !important;
              top: -100% !important;
              left: -100% !important;
              width: 300% !important;
              height: 300% !important;
              background: linear-gradient(
                115deg,
                transparent 0%,
                transparent 40%,
                rgba(255, 255, 255, 0.2) 50%,
                transparent 60%,
                transparent 100%
              ) !important;
              transition: all 0.8s ease-out !important;
            }
            
            .cl-formButtonPrimary:hover:before {
              top: -50% !important;
              left: -50% !important;
            }
          `}</style>

          <SignIn
            path="/sign-in"
            routing="path"
            appearance={{
              elements: {
                card: `
                  bg-[#0A0E24]/95
                  backdrop-blur-md
                  shadow-[0_10px_50px_-12px_rgba(0,0,0,0.9)]
                  border border-[#2A2F52]
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
                  bg-[#171B3A]
                  border-2 border-[#3A4074]
                  rounded-xl
                  text-white
                  placeholder:text-gray-400
                  focus:border-purple-500
                  focus:ring-purple-500/30
                  focus:outline-none
                  px-4
                  py-3
                  max-w-full
                  w-full
                  shadow-[0_0_0_1px_rgba(124,58,237,0.1)]
                `,
                formFieldLabel: `
                  text-white/90
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
                  bg-[#2A2F52]
                `,
                dividerText: `
                  text-white/50
                `,
                socialButtonsBlockButton: `
                  border-2 border-[#3A4074]
                  bg-[#171B3A]
                  hover:bg-[#1E234A]
                  rounded-xl
                  transition-all
                  text-white
                  px-2
                  py-3
                  font-medium
                  flex items-center justify-center
                  gap-2
                  [&>*]:text-white
                  w-full
                  min-width-[120px]
                  shadow-[0_0_0_1px_rgba(124,58,237,0.1)]
                  text-sm
                `,
                socialButtonsIconButton: `
                  text-white
                  [&>*]:text-white
                  min-width-[120px]
                  text-sm
                `,
                socialButtonsProviderIcon: `
                  filter brightness(0) invert(1)
                `,
                formFieldAction: `
                  text-purple-400
                  hover:text-purple-300
                `,
                formFieldErrorText: `
                  text-red-400
                  mt-1
                `,
                formResendCodeLink: `
                  text-purple-400
                  hover:text-purple-300
                `,
                identityPreviewEditButton: `
                  text-purple-400
                  hover:text-purple-300
                `,
                alternativeMethodsBlockButton: `
                  text-white
                  bg-[#171B3A]
                  hover:bg-[#1E234A]
                  border-2 border-[#3A4074]
                  rounded-xl
                `,
                socialButtonsIconRow: `
                  justify-content-between
                  gap-3
                `,
                socialButtonsBlockButtonArrow: `
                  hidden
                `,
                socialButtonsBlockButtonText: `
                  whitespace-nowrap
                  overflow-visible
                  text-sm
                `,
                socialButtonsGroup: `
                  flex
                  flex-row
                  justify-between
                  gap-2
                `,
              },
              layout: {
                socialButtonsVariant: 'blockButton',
                socialButtonsPlacement: 'top',
              },
              variables: {
                colorPrimary: '#7c3aed',
                colorText: 'white',
                colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
                colorBackground: 'transparent',
                colorInputText: 'white',
                colorInputBackground: '#171B3A',
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
