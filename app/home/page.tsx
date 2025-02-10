import Image from 'next/image';
import { AppShell } from 'components/app-shell';
import { MainLayout } from '@/components/main-layout';

export default function HomePage() {
  return (
    <AppShell>
      <MainLayout>
        <div className='max-w-4xl mx-auto w-full p-8 space-y-12'>
          {/* Hero Image */}
          <div className='relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl'>
            <Image
              src='/images/taschengeld-landing.jpg'
              alt='Family doing household tasks together'
              fill
              priority
              sizes='(max-width: 896px) 100vw, 896px'
              className='object-cover transition-transform duration-700 hover:scale-105'
            />
          </div>

          {/* Welcome Text */}
          <div className='text-center space-y-3'>
            <h1 className='text-3xl font-bold text-foreground'>Welcome to Taschengeld</h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Your family&apos;s allowance and task management app
            </p>
          </div>

          {/* Feature Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[
              {
                title: 'Task Management',
                description: 'Create and manage household tasks easily',
                icon: '✓',
              },
              {
                title: 'Piggy Bank',
                description: 'Track allowances and savings',
                icon: '🐷',
              },
              {
                title: 'Family Friendly',
                description: 'Designed for parents and children',
                icon: '👨‍👩‍👧‍👦',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className='bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200'
              >
                <div className='text-4xl mb-4'>{feature.icon}</div>
                <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    </AppShell>
  );
}
