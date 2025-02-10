import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from 'components/client-layout';
import { ToastProvider } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ModeProvider } from '@/components/context/mode-context';
import { LanguageProvider } from '@/components/context/language-context';
import { ThemeProvider } from '@/contexts/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tascheged - Allowance Tracker',
  description: 'A kid-friendly allowance and task tracking application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ToastProvider>
          <ModeProvider>
            <LanguageProvider>
              <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
                <ClientLayout>{children}</ClientLayout>
              </ThemeProvider>
            </LanguageProvider>
          </ModeProvider>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
