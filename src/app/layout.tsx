import { AppProvider } from '@/providers/AppProvider';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Layout/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Mediaverse',
    template: '%s | Mediaverse',
  },
  description: 'Your universe of media and entertainment',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50`}>
        <AppProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}