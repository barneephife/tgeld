'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/context/language-context';
import { useMode } from '@/components/context/mode-context';
import { CheckSquare, HandCoins, PiggyBank, ListTodo, Users, SwitchCamera } from 'lucide-react';

export function Sidebar() {
  const { getTermFor } = useLanguage();
  const { toggleParentMode, isParentMode, enforceRoles } = useMode();

  return (
    <nav className='h-full flex flex-col'>
      <div className='flex-1 py-4'>
        <div className='space-y-2 px-3'>
          <Link
            href='/task-completion'
            className='flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
          >
            <CheckSquare className='h-5 w-5' />
            <span>Task Completion</span>
          </Link>

          <Link
            href='/piggy-bank'
            className='flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
          >
            <PiggyBank className='h-5 w-5' />
            <span>{getTermFor('Sparkässeli', 'Piggy Bank')}</span>
          </Link>

          {(!enforceRoles || isParentMode) && (
            <>
              <Link
                href='/payday'
                className='flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
              >
                <HandCoins className='h-5 w-5' />
                <span>Payday</span>
              </Link>

              <Link
                href='/task-management'
                className='flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
              >
                <ListTodo className='h-5 w-5' />
                <span>Task Management</span>
              </Link>

              <Link
                href='/family'
                className='flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
              >
                <Users className='h-5 w-5' />
                <span>Family</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Child Mode Link - Fixed to bottom */}
      <div className='px-3 py-4 border-t'>
        <button
          onClick={() => toggleParentMode()}
          className='w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors'
        >
          <SwitchCamera className='h-5 w-5' />
          <span>Switch to {isParentMode ? 'Child' : 'Parent'} Mode</span>
        </button>
      </div>
    </nav>
  );
}
