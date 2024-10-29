'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PiggyBankUser } from '@/app/types/piggyBankUser';
import { Loader2 } from 'lucide-react';

interface ResetTransactionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (accountIds: number[]) => Promise<void>;
  isLoading?: boolean;
}

export function ResetTransactionsDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ResetTransactionsDialogProps) {
  const [users, setUsers] = useState<PiggyBankUser[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/piggy-bank/dashboard');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setFetchLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
      setSelectedAccounts([]);
    }
  }, [isOpen]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccounts(users.map((user) => user.account.account_id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleToggleAccount = (accountId: number) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  };

  const handleConfirm = async () => {
    await onConfirm(selectedAccounts);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Transaction History</DialogTitle>
          <DialogDescription>
            Select accounts to reset their transaction history and set balance to 0.
          </DialogDescription>
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedAccounts.length === users.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all">Select All Accounts</Label>
            </div>

            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.user_id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`account-${user.account.account_id}`}
                    checked={selectedAccounts.includes(user.account.account_id)}
                    onCheckedChange={() => handleToggleAccount(user.account.account_id)}
                  />
                  <Label htmlFor={`account-${user.account.account_id}`}>
                    {user.name}&apos;s Account ({formatCurrency(parseFloat(user.account.balance))})
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedAccounts.length === 0 || isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Selected'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}