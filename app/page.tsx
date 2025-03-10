'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import ThreeDScene from '../components/ThreeDScene';

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="relative min-h-screen flex overflow-hidden">
      {/* Left side: 3D chess piece */}
      <section className="relative w-1/2 bg-gray-100 overflow-hidden flex items-center justify-center">
        <ThreeDScene />
        {/* Subtle ellipse background on the left side */}
        <svg
          className="absolute w-[150%] h-[150%] pointer-events-none animate-pulse"
          style={{ top: '-25%', left: '-25%' }}
          viewBox="0 0 3787 2842"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter)">
            <ellipse
              cx="1924.71"
              cy="273.501"
              rx="1924.71"
              ry="273.501"
              transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
              fill="black"
              fillOpacity="0.06"
            />
          </g>
          <defs>
            <filter
              id="filter"
              x="0.860352"
              y="0.838989"
              width="3785.16"
              height="2840.26"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="151"
                result="effect1_foregroundBlur_1065_8"
              />
            </filter>
          </defs>
        </svg>
      </section>

      {/* Right side: modern dark-blue gradient with a frosted container */}
      <section className="w-1/2 relative flex flex-col items-center justify-center p-10 bg-gradient-to-br from-[#0B0F2A] to-[#1E2340]">
        {/* Subtle shapes behind the container */}
        <svg
          className="absolute w-[120%] h-[120%] pointer-events-none"
          style={{ top: '-10%', left: '-10%' }}
          viewBox="0 0 3787 2842"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter2)">
            <ellipse
              cx="1924.71"
              cy="273.501"
              rx="1924.71"
              ry="273.501"
              transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
              fill="white"
              fillOpacity="0.04"
            />
          </g>
          <defs>
            <filter
              id="filter2"
              x="0.860352"
              y="0.838989"
              width="3785.16"
              height="2840.26"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="151"
                result="effect1_foregroundBlur_1065_8"
              />
            </filter>
          </defs>
        </svg>

        <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] border border-white/10 p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white tracking-wide">
            Welcome to Next.js Chess
          </h1>
          <p className="text-gray-200 text-lg mb-8">
            A modern chess experience with Clerk authentication.
          </p>

          {isSignedIn ? (
            <Link href="/chess">
              {/* Button with hover zoom & pointer cursor */}
              <button className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-md 
                                 transition shadow-sm transform 
                                 hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                                 cursor-pointer">
                Play Chess
              </button>
            </Link>
          ) : (
            <div className="space-x-4">
              <Link href="/sign-in">
                <button className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-md 
                                   transition shadow-sm transform 
                                   hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                                   cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-md 
                                   transition shadow-sm transform 
                                   hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                                   cursor-pointer">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
