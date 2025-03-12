import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'RonyChess',
  description: 'A modern chess experience with Clerk authentication.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <ClerkProvider>
          {children}
          {/* Toaster component for global notifications */}
          <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
        </ClerkProvider>
      </body>
    </html>
  );
}
