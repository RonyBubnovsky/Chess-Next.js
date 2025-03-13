'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Protected({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else {
        setIsChecking(false);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isChecking) {
    return (
      <div className="loading-container">
        <div className="loader">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="pulse-overlay"></div>
        </div>
        <p className="loading-text">Loading<span className="dot-animation">...</span></p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #f8fafc;
            padding: 2rem;
            overflow: hidden;
            position: relative;
            z-index: 10;
          }
          
          .loading-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
            z-index: -1;
          }
          
          .loader {
            position: relative;
            width: 12rem;
            height: 12rem;
            margin-bottom: 2rem;
          }
          
          .loader-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 50%;
            border: 0.25rem solid transparent;
            animation: rotate 2s linear infinite;
          }
          
          .loader-ring:nth-child(1) {
            width: 8rem;
            height: 8rem;
            margin: -4rem 0 0 -4rem;
            border-top-color: #60a5fa;
            animation-duration: 2s;
          }
          
          .loader-ring:nth-child(2) {
            width: 6rem;
            height: 6rem;
            margin: -3rem 0 0 -3rem;
            border-right-color: #34d399;
            animation-duration: 1.75s;
            animation-direction: reverse;
          }
          
          .loader-ring:nth-child(3) {
            width: 4rem;
            height: 4rem;
            margin: -2rem 0 0 -2rem;
            border-bottom-color: #f472b6;
            animation-duration: 1.5s;
          }
          
          .pulse-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 2rem;
            height: 2rem;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .loading-text {
            font-size: 1.5rem;
            font-weight: 500;
            letter-spacing: 0.05em;
            margin-top: 1rem;
            position: relative;
            background: linear-gradient(to right, #60a5fa, #34d399, #f472b6);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: shimmer 3s infinite;
          }
          
          .dot-animation {
            display: inline-block;
            animation: dots 1.5s infinite;
            min-width: 2.5rem;
            text-align: left;
          }
          
          @keyframes rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.1;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.3;
              transform: translate(-50%, -50%) scale(1.5);
            }
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }
          
          @keyframes dots {
            0% { content: '.'; }
            25% { content: '..'; }
            50% { content: '...'; }
            75% { content: '..'; }
            100% { content: '.'; }
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .loader {
              width: 10rem;
              height: 10rem;
            }
            
            .loader-ring:nth-child(1) {
              width: 7rem;
              height: 7rem;
              margin: -3.5rem 0 0 -3.5rem;
            }
            
            .loader-ring:nth-child(2) {
              width: 5rem;
              height: 5rem;
              margin: -2.5rem 0 0 -2.5rem;
            }
            
            .loader-ring:nth-child(3) {
              width: 3rem;
              height: 3rem;
              margin: -1.5rem 0 0 -1.5rem;
            }
          }
          
          @media (max-width: 480px) {
            .loader {
              width: 8rem;
              height: 8rem;
            }
            
            .loader-ring:nth-child(1) {
              width: 6rem;
              height: 6rem;
              margin: -3rem 0 0 -3rem;
            }
            
            .loader-ring:nth-child(2) {
              width: 4rem;
              height: 4rem;
              margin: -2rem 0 0 -2rem;
            }
            
            .loader-ring:nth-child(3) {
              width: 2.5rem;
              height: 2.5rem;
              margin: -1.25rem 0 0 -1.25rem;
            }
            
            .loading-text {
              font-size: 1.25rem;
            }
          }
          
          /* Dark mode enhancements */
          @media (prefers-color-scheme: dark) {
            .loading-container {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            }
          }
          
          /* Light mode */
          @media (prefers-color-scheme: light) {
            .loading-container {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              color: #0f172a;
            }
            
            .loading-container::before {
              background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
            }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}