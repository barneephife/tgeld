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
  Coins,
  Download,
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
  Save,
  Settings2,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/use-toast';
import { saveAs } from 'file-saver';
import { useMode } from '@/components/context/mode-context';
import { Input } from '@/components/ui/input';
import { PinSetupDialog } from '@/components/pin-setup-dialog';
import Link from 'next/link';
import { ResetTransactionsDialog } from '@/components/reset-transactions-dialog';
import { useLanguage } from '@/components/context/language-context';

type ResetType = 'users' | 'tasks' | 'transactions' | 'all';

interface ResetDialogState {
  isOpen: boolean;
  type: ResetType | null;
}

interface UserBackup {
  name: string;
  icon?: string;
  sound_url?: string | null;
  birthday?: string;
}

interface TaskBackup {
  title: string;
  description: string;
  icon_name: string;
  sound_url: string | null;
  payout_value: string;
  is_active: boolean;
}

interface CompletedTaskBackup {
  user_id: number;
  description: string;
  payout_value: string;
  comment: string | null;
  attachment: string | null;
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

interface AllBackupData {
  users: UserBackup[];
  tasks: TaskBackup[];
  completed_tasks: CompletedTaskBackup[];
  accounts: AccountBackup[];
  transactions: TransactionBackup[];
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
    all?: AllBackupData;
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
  const { showGermanTerms, setShowGermanTerms, settings } = useLanguage();
  const [loadingLanguage, setLoadingLanguage] = useState(false);

  // Load initial currency and format settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load currency
        const currencyResponse = await fetch('/api/settings/currency');
        if (currencyResponse.ok) {
          const { currency } = await currencyResponse.json();
          setSelectedCurrency(currency);
        }

        // Load format
        const formatResponse = await fetch('/api/settings/currency-format');
        if (formatResponse.ok) {
          const { format } = await formatResponse.json();
          setSelectedFormat(format || 'symbol');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleRoleEnforcementChange = async (checked: boolean) => {
    if (!checked && enforceRoles) {
      setDisableRolesDialog(true);
    } else {
      try {
        await setEnforceRoles(checked);
        toast({
          title: 'Settings Updated',
          description: `Parent/Child role enforcement is now ${checked ? 'enabled' : 'disabled'}`,
        });
      } catch (error) {
        toast({
          title: 'Update Failed',
          description: 'Failed to update role enforcement setting. Please try again.',
          variant: 'destructive',
        });
      }
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
        body: JSON.stringify({ currency: value }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update currency');
      }

      const data = await response.json();
      setSelectedCurrency(data.currency);
      toast({
        title: 'Currency Updated',
        description:
          data.currency === 'none'
            ? 'Default currency has been cleared'
            : `Default currency has been set to ${data.currency}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to update currency:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update currency setting. Please try again.',
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
            // Validate all required fields exist
            if (!backupData.data.all) {
              throw new Error('Invalid full backup file. Missing all data section.');
            }
            const allData: AllBackupData = backupData.data.all;
            
            // Check each required field
            if (!Array.isArray(allData.users)) {
              throw new Error('Invalid full backup file. Users data is missing or invalid.');
            }
            if (!Array.isArray(allData.tasks)) {
              throw new Error('Invalid full backup file. Tasks data is missing or invalid.');
            }
            if (!Array.isArray(allData.completed_tasks)) {
              throw new Error('Invalid full backup file. Completed tasks data is missing or invalid.');
            }
            if (!Array.isArray(allData.accounts)) {
              throw new Error('Invalid full backup file. Accounts data is missing or invalid.');
            }
            if (!Array.isArray(allData.transactions)) {
              throw new Error('Invalid full backup file. Transactions data is missing or invalid.');
            }

            // Validate required fields in each array
            allData.users.forEach((user: UserBackup, index: number) => {
              if (!user.name) {
                throw new Error(`Invalid user data at index ${index}. Missing required field: name`);
              }
            });

            allData.tasks.forEach((task: TaskBackup, index: number) => {
              if (!task.title || !task.payout_value) {
                throw new Error(`Invalid task data at index ${index}. Missing required fields: title or payout_value`);
              }
            });

            allData.accounts.forEach((account: AccountBackup, index: number) => {
              if (!account.account_number || !account.user_name) {
                throw new Error(`Invalid account data at index ${index}. Missing required fields: account_number or user_name`);
              }
            });

            dataToRestore = allData;
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

  const handleLanguageToggle = async () => {
    setLoadingLanguage(true);
    const newState = !showGermanTerms;
    
    try {
      // Don't update UI until we know the database update succeeded
      const success = await setShowGermanTerms(newState);
      
      if (success) {
        toast({
          title: 'Language Updated',
          description: `Application terms will now be shown in ${newState ? 'German' : 'English'}.`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error saving language setting:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update language setting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingLanguage(false);
    }
  };

  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col bg-background'>
      {/* Fixed Header */}
      <div className='p-8 bg-background-secondary'>
        <div className='flex items-center space-x-4 pb-6 border-b border-border'>
          <Settings2 className='h-8 w-8 text-content-primary' />
          <h1 className='text-3xl font-medium text-content-primary'>Global Application Settings</h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto p-8 pt-4 bg-background'>
        <div className='space-y-8'>
          {/* Access Control Section */}
          <section className='bg-card dark:bg-[#2f3136] rounded-2xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-none border border-[#e3e5e8] dark:border-[#202225] transition-all duration-200 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:hover:shadow-none w-full'>
            <div className='flex items-center gap-4 mb-8'>
              <Shield className='h-6 w-6 text-content-primary' />
              <h2 className='text-xl font-medium text-content-primary'>Access Control</h2>
            </div>

            <div className='space-y-8'>
              <div className='flex items-center justify-between space-x-4 p-4 rounded-xl bg-background-secondary shadow-sm border border-border'>
                <div>
                  <Label
                    htmlFor='role-enforcement'
                    className='text-base font-medium text-content-primary'
                  >
                    Enforce Parent/Child Roles
                  </Label>
                  <p className='text-sm text-content-secondary'>
                    Prevent accidental access to parent-only features
                  </p>
                </div>
                <Switch
                  id='role-enforcement'
                  checked={enforceRoles}
                  onCheckedChange={handleRoleEnforcementChange}
                  className='data-[state=checked]:bg-primary'
                />
              </div>

              {enforceRoles && (
                <div className='p-4 rounded-xl bg-background-secondary shadow-sm border border-border'>
                  <h3 className='text-base font-medium text-content-primary mb-4'>Global PIN</h3>
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
          <section className='bg-card dark:bg-[#2f3136] rounded-2xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-none border border-[#e3e5e8] dark:border-[#202225] transition-all duration-200 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:hover:shadow-none w-full'>
            <div className='flex items-center gap-4 mb-8'>
              <Coins className='h-6 w-6 text-content-primary' />
              <h2 className='text-xl font-medium text-content-primary'>Currency</h2>
            </div>

            <div className='space-y-6'>
              <div>
                <Label
                  htmlFor='currency-select'
                  className='text-sm font-medium text-content-primary mb-2 block'
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
                  className='text-sm font-medium text-content-primary mb-2 block'
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

          {/* Language Section */}
          <section className='bg-card dark:bg-[#2f3136] rounded-2xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-none border border-[#e3e5e8] dark:border-[#202225] transition-all duration-200 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:hover:shadow-none w-full'>
            <div className='flex items-center gap-4 mb-8'>
              <svg
                className='h-6 w-6 text-content-primary'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'
                  fill='currentColor'
                />
              </svg>
              <h2 className='text-xl font-medium text-content-primary'>Language</h2>
            </div>

            <div className='space-y-6'>
              <div className='rounded-lg border p-4'>
                <div className='flex-1 space-y-1'>
                  <Label>German Terms</Label>
                  <p className='text-sm text-muted-foreground'>
                    Show German terms (Taschengeld, Sparkässeli) instead of English translations
                  </p>
                </div>
                <div className='mt-4'>
                  <Switch
                    id="language-toggle"
                    checked={showGermanTerms}
                    onCheckedChange={handleLanguageToggle}
                    disabled={loadingLanguage}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Backup and Restore Section */}
          <section className='bg-card dark:bg-[#2f3136] rounded-2xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-none border border-[#e3e5e8] dark:border-[#202225] transition-all duration-200 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:hover:shadow-none w-full'>
            <div className='flex items-center gap-4 mb-8'>
              <Save className='h-6 w-6 text-content-primary' />
              <h2 className='text-xl font-medium text-content-primary'>Backup and Restore</h2>
            </div>

            <div className='space-y-8'>
              {/* Tasks Backup/Restore */}
              <div className='p-4 rounded-xl bg-background-secondary shadow-sm border border-border'>
                <h3 className='text-base font-medium text-content-primary mb-4'>Tasks</h3>
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleBackup('tasks')}
                    disabled={loadingBackup.tasks}
                    className='flex-1 border-gray-200 text-content-primary hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors'
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
                    className='flex-1 border-gray-200 text-content-primary hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                  >
                    {loadingRestore.tasks ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Upload className='h-4 w-4 mr-2' />
                    )}
                    Restore
                  </Button>
                </div>
                <p className='text-sm text-content-secondary mt-2'>
                  Download or restore all task definitions
                </p>
              </div>

              {/* Accounts Backup/Restore */}
              <div className='p-4 rounded-xl bg-background-secondary shadow-sm border border-border'>
                <h3 className='text-base font-medium text-content-primary mb-4'>
                  Sparkässeli Accounts
                </h3>
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleBackup('piggybank')}
                    disabled={loadingBackup.piggybank}
                    className='flex-1 border-gray-200 text-content-primary hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors'
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
                    className='flex-1 border-gray-200 text-content-primary hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                  >
                    {loadingRestore.piggybank ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Upload className='h-4 w-4 mr-2' />
                    )}
                    Restore
                  </Button>
                </div>
                <p className='text-sm text-content-secondary mt-2'>
                  Download or restore all account data and transactions
                </p>
              </div>

              {/* Full Backup/Restore */}
              <div className='p-4 rounded-xl bg-background-secondary shadow-sm border border-border'>
                <h3 className='text-base font-medium text-content-primary mb-4'>Full Backup</h3>
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleBackup('all')}
                    disabled={loadingBackup.all}
                    className='flex-1 border-gray-200 text-content-primary hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors'
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
                    className='flex-1 border-gray-200 text-content-primary hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                  >
                    {loadingRestore.all ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Upload className='h-4 w-4 mr-2' />
                    )}
                    Restore
                  </Button>
                </div>
                <p className='text-sm text-content-secondary mt-2'>
                  Download or restore all application data
                </p>
              </div>
            </div>
          </section>

          {/* Reset Options Section */}
          <section className='bg-card dark:bg-[#2f3136] rounded-2xl p-8 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-none border border-[#e3e5e8] dark:border-[#202225] transition-all duration-200 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:hover:shadow-none w-full'>
            <div className='flex items-center gap-4 mb-8'>
              <RotateCcw className='h-6 w-6 text-content-primary' />
              <h2 className='text-xl font-medium text-content-primary'>Reset Options</h2>
            </div>

            <div className='space-y-8'>
              <div className='p-4 rounded-xl bg-background-secondary shadow-sm border border-border'>
                <h3 className='text-base font-medium text-content-primary mb-4'>
                  Reset Transactions
                </h3>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsResetTransactionsOpen(true)}
                  disabled={loadingStates.transactions}
                  className='w-full border-gray-200 text-content-primary hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors'
                >
                  {loadingStates.transactions ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : (
                    <Trash2 className='h-4 w-4 mr-2' />
                  )}
                  Reset Selected Accounts
                </Button>
                <p className='text-sm text-content-secondary mt-2'>
                  Clear transaction history for selected accounts while preserving account data
                </p>
              </div>
            </div>
          </section>
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
