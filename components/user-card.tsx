import React from 'react';
import { User } from '@/app/types/user';
import { IconComponent } from './icon-component';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  onClick: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg shadow-md cursor-pointer',
        'overflow-hidden backdrop-blur-sm',
        'bg-green-100/50 hover:bg-green-200/50 border-green-200',
        'dark:bg-green-900/20 dark:hover:bg-green-800/30 dark:border-green-800',
        'transition-all duration-200'
      )}
      onClick={onClick}
    >
      <div className='flex items-center space-x-4'>
        <div className='w-16 h-16 flex items-center justify-center'>
          <IconComponent
            icon={user.icon}
            className={cn('w-12 h-12', 'text-green-700 dark:text-green-300')}
          />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-green-900 dark:text-green-100'>{user.name}</h3>
          <p className='text-sm text-green-700 dark:text-green-300'>
            {user.role === 'parent' ? 'Parent' : 'Child'}
          </p>
        </div>
      </div>
    </div>
  );
}
