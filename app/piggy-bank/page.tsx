'use client';

import { AppShell } from '@/components/app-shell';
import { MainLayout } from '@/components/main-layout';
import { PiggyBank } from '@/components/piggy-bank';

export default function PiggyBankPage() {
  return (
    <AppShell>
      <MainLayout>
        <PiggyBank />
      </MainLayout>
    </AppShell>
  );
}
