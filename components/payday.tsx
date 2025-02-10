'use client';

import React, { useState, useEffect } from 'react';
import { CompletedTask } from '@/app/types/completedTask';
import { CompletedTaskCard } from './completed-task-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Banknote } from 'lucide-react';

export function Payday() {
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/completed-tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch completed tasks');
      }
      const data = await response.json();
      const unpaidTasks = data.filter((task: CompletedTask) => task.payment_status === 'Unpaid');
      setCompletedTasks(unpaidTasks);
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
      setError('Failed to load completed tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (
    cTaskId: number,
    paymentStatus: 'Paid' | 'Unpaid',
    isRejection: boolean = false
  ) => {
    try {
      const response = await fetch('/api/completed-tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          c_task_id: cTaskId,
          payment_status: paymentStatus,
          is_rejected: isRejection,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process task');
      }

      setCompletedTasks((prevTasks) => prevTasks.filter((task) => task.c_task_id !== cTaskId));
      setSelectedTasks((prev) => prev.filter((id) => id !== cTaskId));

      await fetchCompletedTasks();
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError(error instanceof Error ? error.message : 'Failed to process task');
      await fetchCompletedTasks();
    }
  };

  const handleTaskSelect = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const handleBulkActionClick = () => {
    setIsDialogOpen(true);
  };

  const confirmBulkAction = async () => {
    try {
      const tasksToProcess = [...selectedTasks];
      for (const taskId of tasksToProcess) {
        await handleUpdatePaymentStatus(taskId, 'Paid', false);
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      setError(error instanceof Error ? error.message : 'Failed to process bulk action');
    } finally {
      setSelectedTasks([]);
      setIsDialogOpen(false);
      await fetchCompletedTasks();
    }
  };

  const organizedTasks = completedTasks.reduce(
    (groups: { [key: string]: CompletedTask[] }, task) => {
      const groupKey = 'All Tasks';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
      return groups;
    },
    {}
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col bg-background'>
      {/* Fixed Header */}
      <div className='p-8 bg-background-secondary'>
        <div className='flex items-center justify-between pb-6 border-b border-border'>
          <div className='flex items-center space-x-4'>
            <Banknote className='h-8 w-8 text-content-primary' />
            <h1 className='text-3xl font-medium text-content-primary'>Payday</h1>
          </div>
          {selectedTasks.length > 0 && (
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-content-secondary'>
                {selectedTasks.length} item{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                onClick={handleBulkActionClick}
                className='bg-green-500 hover:bg-green-600 text-white'
              >
                Approve Selected ({selectedTasks.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto p-8 pt-4 bg-background-secondary'>
        {/* Task Groups */}
        <div className='space-y-8'>
          {Object.entries(organizedTasks).map(([groupName, tasks]) => (
            <div key={groupName} className='space-y-4'>
              <h2 className='text-2xl font-semibold'>{groupName}</h2>
              <div className='space-y-4'>
                {tasks.map((task) => (
                  <CompletedTaskCard
                    key={task.c_task_id}
                    task={task}
                    onUpdateStatus={handleUpdatePaymentStatus}
                    onSelect={handleTaskSelect}
                    isSelected={selectedTasks.includes(task.c_task_id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {selectedTasks.length} task
              {selectedTasks.length !== 1 ? 's' : ''} as Paid?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkAction} variant='default'>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
