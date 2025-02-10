'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage } from '@/components/context/language-context';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { getTermFor } = useLanguage();

  return (
    <div className='h-screen flex flex-col'>
      {/* Fixed Header */}
      <header className='h-16 bg-primary text-primary-foreground px-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50'>
        <Link
          href='/home'
          className='text-2xl font-bold hover:text-muted-foreground transition-colors'
        >
          {getTermFor('Taschengeld', 'Pocket Money')}
        </Link>
        <div className='flex items-center space-x-6'>
          <ThemeToggle />
          <Link href='/global-settings'>
            <Settings className='h-8 w-8 text-primary-foreground hover:text-muted-foreground transition-colors' />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className='flex flex-1 pt-16'>
        {' '}
        {/* Add padding-top to account for fixed header */}
        {/* Fixed Sidebar */}
        <div className='w-64 fixed left-0 top-16 bottom-0 bg-background border-r border-border'>
          <Sidebar />
        </div>
        {/* Scrollable Content Area */}
        <div className='flex-1 ml-64 overflow-y-auto'>{children}</div>
      </div>
    </div>
  );
}
