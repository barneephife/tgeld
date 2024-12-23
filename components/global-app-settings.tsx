'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Download,
  Upload,
  Save,
  AlertCircle,
  Loader2,
  Settings2,
  Shield,
  Coins,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { saveAs } from 'file-saver';
import { useMode } from '@/components/context/mode-context';
import { Input } from '@/components/ui/input';
import { PinSetupDialog } from '@/components/pin-setup-dialog';
import Link from 'next/link';
import { ResetTransactionsDialog } from '@/components/reset-transactions-dialog';

type ResetType = 'users' | 'tasks' | 'transactions' | 'all';

interface ResetDialogState {
  isOpen: boolean;
  type: ResetType | null;
}

interface TaskBackup {
  title: string;
  description: string;
  icon_name: string;
  sound_url: string;
  payout_value: string;
  is_active: boolean;
}

interface CompletedTaskBackup {
  user_id: number;
  description: string;
  payout_value: string;
  comment: string;
  attachment: string;
  payment_status: string;
}

interface AccountBackup {
  account_number: string;
  balance: string;
  user_name: string;
}

interface TransactionBackup {
  amount: string;
  transaction_type: string;
  description: string;
  photo: string | null;
  user_name: string;
  transaction_date: string;
}

interface BackupData {
  timestamp: string;
  type: 'tasks' | 'piggybank' | 'all';
  data: {
    tasks?: {
      tasks: TaskBackup[];
      completed_tasks: CompletedTaskBackup[];
    };
    piggybank?: {
      accounts: AccountBackup[];
      transactions: TransactionBackup[];
      piggybank?: {
        data?: {
          piggybank?: {
            accounts: AccountBackup[];
            transactions: TransactionBackup[];
          };
        };
      };
    };
    all?: {
      tasks: TaskBackup[];
      accounts: AccountBackup[];
      transactions: TransactionBackup[];
    };
  };
}

export function GlobalAppSettings() {
  const { enforceRoles, setEnforceRoles, pin, setPin, verifyPin } = useMode(); // Add verifyPin
  const { addToast: toast } = useToast();
  const [loadingStates, setLoadingStates] = useState({
    users: false,
    tasks: false,
    all: false,
    transactions: false,
  });
  const [resetDialog, setResetDialog] = useState<ResetDialogState>({
    isOpen: false,
    type: null,
  });
  const [loadingBackup, setLoadingBackup] = useState({
    tasks: false,
    piggybank: false,
    all: false,
  });
  const [loadingRestore, setLoadingRestore] = useState({
    tasks: false,
    piggybank: false,
    all: false,
  });
  const [disableRolesDialog, setDisableRolesDialog] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [showPin, setShowPin] = useState(false);
  const [isPinClearDialogOpen, setIsPinClearDialogOpen] = useState(false);
  const [isConfigureFlashing, setIsConfigureFlashing] = useState(false);
  const [isResetTransactionsOpen, setIsResetTransactionsOpen] = useState(false);
  const [loadingCurrency, setLoadingCurrency] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('symbol');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [currencyResponse, formatResponse] = await Promise.all([
          fetch('/api/settings/currency'),
          fetch('/api/settings/currency-format'),
        ]);

        if (currencyResponse.ok) {
          const { currency } = await currencyResponse.json();
          setSelectedCurrency(currency === null ? 'none' : currency);
        }

        if (formatResponse.ok) {
          const { format } = await formatResponse.json();
          setSelectedFormat(format || 'symbol'); // Default to symbol if not set
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
      }
    };

    loadSettings();
  }, [toast]);

  const handleRoleEnforcementChange = (checked: boolean) => {
    if (!checked && enforceRoles) {
      setDisableRolesDialog(true);
    } else {
      setEnforceRoles(checked);
      toast({
        title: 'Settings Updated',
        description: `Parent/Child role enforcement is now ${checked ? 'enabled' : 'disabled'}`,
      });
    }
  };

  const getResetDialogProps = (type: ResetType) => {
    const props = {
      users: {
        title: 'Reset All Users',
        description:
          'This will delete all users from the system, including their piggy bank accounts, completed tasks, and transaction history. This action cannot be undone.',
      },
      tasks: {
        title: 'Reset All Tasks',
        description:
          'This will delete all tasks and their completion history. Existing transactions will remain unchanged with their original descriptions and amounts. You will need to create new tasks. This action cannot be undone.',
      },
      transactions: {
        title: 'Reset Transaction History',
        description: (
          <>
            This will delete all transaction history from{' '}
            <Link href='/piggy-bank' className='text-blue-600 hover:underline'>
              all accounts
            </Link>{' '}
            and reset their balances to zero. Not reversible.
          </>
        ),
      },
      all: {
        title: 'Reset Entire Database',
        description: (
          <>
            This will delete all data from the database. This includes all users, tasks, accounts,
            and their related data. This action cannot be undone.
          </>
        ),
      },
    };
    return props[type];
  };

  const handleResetClick = (type: ResetType) => {
    if (type === 'transactions') {
      setIsResetTransactionsOpen(true);
    } else {
      setResetDialog({ isOpen: true, type });
    }
  };

  const handleResetConfirm = async () => {
    const type = resetDialog.type;
    if (!type) return;

    setLoadingStates((prev) => ({ ...prev, [type]: true }));
    setResetDialog({ isOpen: false, type: null });

    try {
      const response = await fetch(`/api/reset/${type}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Reset failed');
      }

      toast({
        title: 'Reset Successful',
        description: `Successfully reset ${type}. You may need to refresh the page to see the changes.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Reset failed:', error);
      toast({
        title: 'Reset Failed',
        description: `Failed to reset ${type}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleCurrencyChange = async (value: string) => {
    setLoadingCurrency(true);
    try {
      const response = await fetch('/api/settings/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: value === 'none' ? null : value }),
      });

      if (!response.ok) throw new Error('Failed to update currency');

      setSelectedCurrency(value);
      toast({
        title: 'Currency Updated',
        description:
          value === 'none'
            ? 'Default currency has been cleared'
            : `Default currency has been set to ${value}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to update currency:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update currency setting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingCurrency(false);
    }
  };

  const handleFormatChange = async (value: string) => {
    try {
      const response = await fetch('/api/settings/currency-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: value }),
      });

      if (!response.ok) throw new Error('Failed to update currency format');

      setSelectedFormat(value);
      toast({
        title: 'Display Format Updated',
        description: 'Currency display format has been updated',
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to update currency format:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update display format. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBackup = async (type: 'tasks' | 'piggybank' | 'all') => {
    setLoadingBackup((prev) => ({ ...prev, [type]: true }));

    try {
      // Fetch data based on type
      const response = await fetch(`/api/backup/${type}`);
      if (!response.ok) throw new Error(`Failed to backup ${type} data`);

      const data = await response.json();

      // Create backup data structure
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        type,
        data: {
          [type]: data,
        },
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      saveAs(blob, `taschengeld-${type}-backup-${new Date().toISOString()}.json`);

      toast({
        title: 'Backup Successful',
        description: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } data has been backed up successfully.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Backup failed:', error);
      toast({
        title: 'Backup Failed',
        description: `Failed to backup ${type} data. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setLoadingBackup((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleRestore = async (type: 'tasks' | 'piggybank' | 'all') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoadingRestore((prev) => ({ ...prev, [type]: true }));

      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });

        // Parse and validate the backup data
        let backupData: BackupData;
        try {
          backupData = JSON.parse(content);
        } catch {
          throw new Error('Invalid backup file format. File must be a valid JSON file.');
        }

        // Validate backup data structure
        if (!backupData.type || !backupData.timestamp || !backupData.data) {
          throw new Error(
            'Invalid backup file structure. File appears to be corrupted or not a valid backup.'
          );
        }

        // Validate backup type
        if (backupData.type !== type) {
          throw new Error(
            `Please select a ${type} backup file. You selected a ${backupData.type} backup file.`
          );
        }

        // Extract the correct data structure based on type
        let dataToRestore;
        switch (type) {
          case 'tasks':
            if (!backupData.data.tasks?.tasks) {
              throw new Error('Invalid tasks backup file. No task data found.');
            }
            dataToRestore = backupData.data.tasks;
            break;
          case 'piggybank':
            // Handle nested piggybank structure
            const piggyData =
              backupData.data.piggybank?.piggybank?.data?.piggybank || backupData.data.piggybank;
            if (!piggyData?.accounts) {
              throw new Error('Invalid piggy bank backup file. No account data found.');
            }
            dataToRestore = piggyData;
            break;
          case 'all':
            if (!backupData.data.all?.tasks || !backupData.data.all?.accounts) {
              throw new Error('Invalid full backup file. Missing required data.');
            }
            dataToRestore = backupData.data.all;
            break;
        }

        // If we get here, the file is valid - proceed with restore
        const response = await fetch(`/api/restore/${type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToRestore),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to restore data');
        }

        toast({
          title: 'Restore Successful',
          description: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } data has been restored successfully.`,
          variant: 'default',
        });
      } catch (error) {
        console.error('Restore failed:', error);
        toast({
          title: 'Restore Failed',
          description: error instanceof Error ? error.message : 'Failed to restore data',
          variant: 'destructive',
        });
      } finally {
        setLoadingRestore((prev) => ({ ...prev, [type]: false }));
      }
    };

    input.click();
  };

  const handleTestPin = () => {
    const inputPin = prompt('Enter PIN to test:');
    if (inputPin) {
      if (verifyPin(inputPin)) {
        toast({
          title: 'PIN Test Successful',
          description: 'The entered PIN is correct.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'PIN Test Failed',
          description: 'The entered PIN is incorrect.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleClearPin = () => {
    setIsPinClearDialogOpen(true);
  };

  const confirmClearPin = () => {
    setPin(null);
    setIsPinClearDialogOpen(false);
    toast({
      title: 'PIN Removed',
      description: 'The global PIN has been cleared.',
      variant: 'default',
    });
  };

  const handlePinFieldClick = () => {
    if (!pin) {
      console.log('PIN field clicked, triggering animation'); // Add this line
      setIsConfigureFlashing(true);
      setTimeout(() => {
        console.log('Animation should end now'); // Add this line
        setIsConfigureFlashing(false);
      }, 1000);
    }
  };

  const handleResetTransactions = async (selectedAccountIds: number[]) => {
    setLoadingStates((prev) => ({ ...prev, transactions: true }));

    try {
      const response = await fetch('/api/reset/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountIds: selectedAccountIds }),
      });

      if (!response.ok) throw new Error('Reset failed');

      toast({
        title: 'Reset Successful',
        description: `Successfully reset ${selectedAccountIds.length} account${
          selectedAccountIds.length === 1 ? '' : 's'
        }.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Reset failed:', error);
      toast({
        title: 'Reset Failed',
        description: 'Failed to reset selected accounts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, transactions: false }));
      setIsResetTransactionsOpen(false);
    }
  };

  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col bg-[#EFF5FF]'>
      {/* Fixed Header */}
      <div className='p-8 bg-[#FBFBFB]'>
        <div className='flex items-center space-x-4 pb-6 border-b border-gray-200'>
          <Settings2 className='h-8 w-8 text-gray-700' />
          <h1 className='text-3xl font-medium text-gray-800'>Global Application Settings</h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto p-8 pt-4 bg-[#FBFBFB]'>
        <div className='space-y-8'>
          {/* Access Control and Currency Grid */}
          <div className='grid grid-cols-3 gap-8'>
            {/* Access Control Section */}
            <section className='col-span-2 bg-white rounded-2xl p-8 shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg'>
              <div className='flex items-center gap-4 mb-8'>
                <Shield className='h-6 w-6 text-gray-700' />
                <h2 className='text-xl font-medium text-gray-800'>Access Control</h2>
              </div>

              <div className='space-y-8'>
                <div className='flex items-center justify-between space-x-4 p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                  <div>
                    <Label htmlFor='role-enforcement' className='text-base font-medium text-gray-700'>
                      Enforce Parent/Child Roles
                    </Label>
                    <p className='text-sm text-gray-600'>
                      Prevent accidental access to parent-only features
                    </p>
                  </div>
                  <Switch
                    id='role-enforcement'
                    checked={enforceRoles}
                    onCheckedChange={handleRoleEnforcementChange}
                    className='data-[state=checked]:bg-blue-600'
                  />
                </div>

                {enforceRoles && (
                  <div className='p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                    <h3 className='text-base font-medium text-gray-700 mb-4'>Global PIN</h3>
                    <div className='flex items-center space-x-3'>
                      <div className='relative'>
                        <Input
                          type={showPin ? 'text' : 'password'}
                          value={pin || ''}
                          placeholder='Not configured'
                          className='w-32 pr-8 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                          readOnly
                          onClick={handlePinFieldClick}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-2 text-gray-400 hover:text-gray-600'
                          onClick={() => setShowPin(!showPin)}
                        >
                          {showPin ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </Button>
                      </div>
                      {!pin ? (
                        <PinSetupDialog
                          onSetPin={setPin}
                          className={`${
                            isConfigureFlashing ? 'animate-pulse scale-105 bg-blue-100' : ''
                          } bg-blue-600 text-white hover:bg-blue-700 transition-colors`}
                        />
                      ) : (
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors'
                            onClick={handleTestPin}
                          >
                            Test PIN
                          </Button>
                          <PinSetupDialog
                            onSetPin={setPin}
                            existingPin={pin}
                            buttonText='Change PIN'
                            dialogTitle='Change Global PIN'
                            className='bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                          />
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={handleClearPin}
                            className='text-[#FFCCEA] border-[#FFCCEA] hover:bg-[#FFCCEA]/10 transition-colors'
                          >
                            Remove PIN
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Currency Section */}
            <section className='bg-white rounded-2xl p-8 shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg'>
              <div className='flex items-center gap-4 mb-8'>
                <Coins className='h-6 w-6 text-gray-700' />
                <h2 className='text-xl font-medium text-gray-800'>Currency</h2>
              </div>

              <div className='space-y-6'>
                <div>
                  <Label
                    htmlFor='currency-select'
                    className='text-sm font-medium text-gray-700 mb-2 block'
                  >
                    Default Currency
                  </Label>
                  <Select
                    onValueChange={handleCurrencyChange}
                    value={selectedCurrency}
                    disabled={loadingCurrency}
                  >
                    <SelectTrigger
                      id='currency-select'
                      className={`w-full border-gray-200 ${
                        selectedCurrency ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      <SelectValue placeholder={loadingCurrency ? 'Loading...' : 'Select Currency'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>None</SelectItem>
                      <SelectItem value='USD'>USD</SelectItem>
                      <SelectItem value='EUR'>EUR</SelectItem>
                      <SelectItem value='GBP'>GBP</SelectItem>
                      <SelectItem value='CHF'>CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor='format-select'
                    className='text-sm font-medium text-gray-700 mb-2 block'
                  >
                    Display Format
                  </Label>
                  <Select
                    onValueChange={handleFormatChange}
                    value={selectedFormat}
                    disabled={!selectedCurrency || selectedCurrency === 'none'}
                  >
                    <SelectTrigger id='format-select' className='w-full border-gray-200'>
                      <SelectValue placeholder='Select Format' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='symbol'>Symbol Only ($10.00)</SelectItem>
                      <SelectItem value='code'>Code Only (10.00 USD)</SelectItem>
                      <SelectItem value='both'>Both ($10.00 USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>

          {/* Backup and Reset Grid */}
          <div className='grid grid-cols-2 gap-8'>
            {/* Backup Section */}
            <section className='bg-white rounded-2xl p-8 shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg'>
              <div className='flex items-center gap-4 mb-8'>
                <Save className='h-6 w-6 text-gray-700' />
                <h2 className='text-xl font-medium text-gray-800'>Backup and Restore</h2>
              </div>

              <div className='space-y-8'>
                {/* Tasks Backup/Restore */}
                <div className='p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                  <h3 className='text-base font-medium text-gray-700 mb-4'>Tasks</h3>
                  <div className='flex gap-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleBackup('tasks')}
                      disabled={loadingBackup.tasks}
                      className='flex-1 border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors'
                    >
                      {loadingBackup.tasks ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Download className='h-4 w-4 mr-2' />
                      )}
                      Download
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRestore('tasks')}
                      disabled={loadingRestore.tasks}
                      className='flex-1 border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                    >
                      {loadingRestore.tasks ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Upload className='h-4 w-4 mr-2' />
                      )}
                      Restore
                    </Button>
                  </div>
                  <p className='text-sm text-gray-600 mt-2'>Download or restore all task definitions</p>
                </div>

                {/* Accounts Backup/Restore */}
                <div className='p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                  <h3 className='text-base font-medium text-gray-700 mb-4'>Sparkässeli Accounts</h3>
                  <div className='flex gap-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleBackup('piggybank')}
                      disabled={loadingBackup.piggybank}
                      className='flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors'
                    >
                      {loadingBackup.piggybank ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Download className='h-4 w-4 mr-2' />
                      )}
                      Download
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRestore('piggybank')}
                      disabled={loadingRestore.piggybank}
                      className='flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors'
                    >
                      {loadingRestore.piggybank ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Upload className='h-4 w-4 mr-2' />
                      )}
                      Restore
                    </Button>
                  </div>
                  <p className='text-sm text-gray-600 mt-2'>
                    Download or restore all account balances and transaction history
                  </p>
                </div>

                {/* Full Database Backup/Restore */}
                <div className='p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                  <h3 className='text-base font-medium text-gray-700 mb-4'>Full Database Backup</h3>
                  <div className='flex gap-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleBackup('all')}
                      disabled={loadingBackup.all}
                      className='flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors'
                    >
                      {loadingBackup.all ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Download className='h-4 w-4 mr-2' />
                      )}
                      Download
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRestore('all')}
                      disabled={loadingRestore.all}
                      className='flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors'
                    >
                      {loadingRestore.all ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Upload className='h-4 w-4 mr-2' />
                      )}
                      Restore
                    </Button>
                  </div>
                  <p className='text-sm text-gray-600 mt-2'>Download or restore the entire database</p>
                </div>
              </div>
            </section>

            {/* Reset Section */}
            <section className='bg-white rounded-2xl p-8 shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg'>
              <div className='flex items-center gap-4 mb-8'>
                <RotateCcw className='h-6 w-6 text-gray-700' />
                <h2 className='text-xl font-medium text-gray-800'>Reset Options</h2>
              </div>

              {/* Warning Box */}
              <div className='p-4 mb-6 rounded-xl bg-red-50/80 border border-red-200'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='h-5 w-5 text-red-500 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-[#6C4E31]'>Warning</p>
                    <p className='text-sm text-[#603F26]'>These actions cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div className='space-y-6'>
                <div className='p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                    onClick={() => handleResetClick('tasks')}
                    disabled={loadingStates.tasks}
                  >
                    {loadingStates.tasks && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Delete All Tasks
                  </Button>
                  <p className='text-sm text-gray-600 mt-2'>
                    Removes all tasks from the task list. Completed tasks and transactions remain
                    unchanged.
                  </p>
                </div>

                <div className='p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                    onClick={() => handleResetClick('transactions')}
                    disabled={loadingStates.transactions}
                  >
                    {loadingStates.transactions && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Reset Transaction History
                  </Button>
                  <p className='text-sm text-gray-600 mt-2'>
                    Clears all transaction history and resets account balances to zero.
                  </p>
                </div>

                <div className='p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                    onClick={() => handleResetClick('all')}
                    disabled={loadingStates.all}
                  >
                    {loadingStates.all && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Reset Entire Database
                  </Button>
                  <p className='text-sm text-gray-600 mt-2'>
                    Removes all data including users, tasks, accounts, and related data.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {resetDialog.type && (
        <ConfirmDialog
          isOpen={resetDialog.isOpen}
          onClose={() => setResetDialog({ isOpen: false, type: null })}
          onConfirm={handleResetConfirm}
          {...getResetDialogProps(resetDialog.type)}
          confirmText='Yes, Reset'
          cancelText='Cancel'
        />
      )}

      {/* Add the disable roles confirmation dialog */}
      <ConfirmDialog
        isOpen={disableRolesDialog}
        onClose={() => setDisableRolesDialog(false)}
        onConfirm={() => {
          setEnforceRoles(false);
          setDisableRolesDialog(false);
        }}
        title='Disable Role Enforcement?'
        description='This will clear the current PIN and disable role-based access control. This means that children will be able to access this settings page and all parts of the application. Are you sure?'
        confirmText='Yes, Disable'
        cancelText='Cancel'
      />

      {/* Add PIN Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isPinClearDialogOpen}
        onClose={() => setIsPinClearDialogOpen(false)}
        onConfirm={confirmClearPin}
        title='Remove Global PIN?'
        description='This will remove the PIN protection from the global settings. Anyone will be able to access the settings page when role enforcement is enabled. Are you sure you want to continue?'
        confirmText='Yes, Remove PIN'
        cancelText='Cancel'
      />

      {/* Add ResetTransactionsDialog */}
      <ResetTransactionsDialog
        isOpen={isResetTransactionsOpen}
        onClose={() => setIsResetTransactionsOpen(false)}
        onConfirm={handleResetTransactions}
        isLoading={loadingStates.transactions}
      />
    </div>
  );
}
