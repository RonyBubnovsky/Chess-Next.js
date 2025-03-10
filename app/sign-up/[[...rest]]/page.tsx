'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F2A] to-[#1E2340] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Only the Clerk sign-up card, no extra heading/container */}
        <SignUp
          path="/sign-up"
          routing="path"
          appearance={{
            elements: {
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
