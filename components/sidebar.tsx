'use client';

import Link from 'next/link';
import { useMode } from '@/components/context/mode-context';
import { CheckSquare, HandCoins, Banknote, ClipboardList, Users } from 'lucide-react';
import { ParentModeToggle } from './parent-mode-toggle';

export function Sidebar() {
  const { hasFullAccess } = useMode();

  return (
    <div className='w-64 bg-background-primary h-full flex flex-col border-r border-border-primary'>
      <nav className='flex-1 p-4'>
        <ul className='space-y-1'>
          {/* Always visible items */}
          <li>
            <Link
              href='/task-completion'
              className='flex items-center space-x-3 p-3 rounded-xl hover:bg-background-secondary transition-colors duration-200'
            >
              <CheckSquare className='h-5 w-5 text-content-primary' />
              <span className='text-content-primary font-medium'>Task Completion</span>
            </Link>
          </li>
          <li>
            <Link
              href='/piggy-bank'
              className='flex items-center space-x-3 p-3 rounded-xl hover:bg-background-secondary transition-colors duration-200'
            >
              <HandCoins className='h-5 w-5 text-content-primary' />
              <span className='text-content-primary font-medium'>Sparkässeli</span>
            </Link>
          </li>

          {/* First divider */}
          <li className='py-2'>
            <div className='border-t border-border-primary'></div>
          </li>

          {/* Parent-only items */}
          {hasFullAccess && (
            <>
              <li>
                <Link
                  href='/payday'
                  className='flex items-center space-x-3 p-3 rounded-xl hover:bg-background-secondary transition-colors duration-200'
                >
                  <Banknote className='h-5 w-5 text-content-primary' />
                  <span className='text-content-primary font-medium'>Payday</span>
                </Link>
              </li>

              {/* Divider between Payday and Task Management */}
              <li className='py-2'>
                <div className='border-t border-border-primary'></div>
              </li>

              <li>
                <Link
                  href='/task-management'
                  className='flex items-center space-x-3 p-3 rounded-xl hover:bg-background-secondary transition-colors duration-200'
                >
                  <ClipboardList className='h-5 w-5 text-content-primary' />
                  <span className='text-content-primary font-medium'>Task Management</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/user-management'
                  className='flex items-center space-x-3 p-3 rounded-xl hover:bg-background-secondary transition-colors duration-200'
                >
                  <Users className='h-5 w-5 text-content-primary' />
                  <span className='text-content-primary font-medium'>Family</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className='p-4'>
        <ParentModeToggle />
      </div>
    </div>
  );
}
