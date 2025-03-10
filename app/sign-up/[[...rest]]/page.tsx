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
