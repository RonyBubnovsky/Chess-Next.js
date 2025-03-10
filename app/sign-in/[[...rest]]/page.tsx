'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F2A] to-[#1E2340] flex items-center justify-center p-6">
      {/* Fade-in effect via Framer Motion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Only the Clerk sign-in card, no extra heading/container */}
        <SignIn
          path="/sign-in"
          routing="path"
          appearance={{
            elements: {
              // Example: add hover scale on the main button if you like
              formButtonPrimary:
                'transform transition-transform duration-300 hover:scale-105'
            },
            variables: {
              colorPrimary: '#7c3aed',
              fontFamily: 'Inter, sans-serif'
            }
          }}
        />
      </motion.div>
    </div>
  );
}
