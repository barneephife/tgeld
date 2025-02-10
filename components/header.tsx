// This component is deprecated. Use AppShell's header instead.
// Will be removed in a future update.
import { Button } from '@/components/ui/button';
import { Menu, User, Cog } from 'lucide-react';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  console.warn('Header component is deprecated. Use AppShell instead.');
  return (
    <header className='flex items-center justify-between px-4 py-2 bg-primary text-primary-foreground'>
      <div className='flex items-center'>
        <Button
          variant='ghost'
          size='icon'
          onClick={onMenuClick}
          className='md:hidden text-primary-foreground hover:text-muted-foreground'
        >
          <Menu className='h-8 w-8' />
        </Button>
        <h1 className='text-xl font-bold ml-2 text-primary-foreground hover:text-muted-foreground'>
          Taschengeld
        </h1>
      </div>
      <div className='flex items-center space-x-6'>
        <Button
          variant='ghost'
          size='icon'
          className='text-primary-foreground hover:text-muted-foreground'
        >
          <User className='h-8 w-8' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='text-primary-foreground hover:text-muted-foreground'
        >
          <Cog className='h-8 w-8' />
        </Button>
      </div>
    </header>
  );
}
