import { AppProvider } from '@/providers/AppProvider';
import { AppSetup } from './AppSetup';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Layout/Navbar';
import { PageLoadMetrics } from '@/components/Analytics/PageLoadMetrics';
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
      <body className={inter.className}>
        <AppProvider>
          <AppSetup />
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
          <PageLoadMetrics />
        </AppProvider>
      </body>
    </html>
  );
}