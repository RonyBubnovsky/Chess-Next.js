import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Next.js Chess App',
  description: 'A modern chess experience with Clerk authentication.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
