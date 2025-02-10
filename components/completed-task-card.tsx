import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IconComponent } from './icon-component';
import { cn } from '@/lib/utils';
import { CompletedTask } from '@/app/types/completedTask';

interface CompletedTaskCardProps {
  task: CompletedTask;
  onUpdateStatus: (taskId: number, status: 'Paid' | 'Unpaid', isRejection?: boolean) => void;
  onSelect?: (taskId: number) => void;
  isSelected?: boolean;
  newestTaskId?: number;
}

export function CompletedTaskCard({
  task,
  onUpdateStatus,
  onSelect,
  isSelected = false,
  newestTaskId,
}: CompletedTaskCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const confirmAction = async () => {
    setIsDialogOpen(false);
    try {
      await onUpdateStatus(task.c_task_id, 'Paid', false);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  return (
    <>
      <Card
        className={cn(
          'relative transition-all duration-200',
          'hover:shadow-md cursor-pointer',
          isSelected && 'ring-2 ring-[hsl(var(--task-active))]',
          task.payment_status === 'Paid'
            ? 'bg-[hsl(var(--task-inactive))] text-[hsl(var(--task-inactive-foreground))]'
            : 'bg-[hsl(var(--task-active))] text-[hsl(var(--task-active-foreground))]',
          newestTaskId === task.c_task_id && 'animate-highlight'
        )}
        onClick={() => onSelect?.(task.c_task_id)}
      >
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='flex-shrink-0'>
                <IconComponent
                  icon={task.icon_name}
                  className={cn(
                    'w-8 h-8',
                    task.payment_status === 'Paid'
                      ? 'text-[hsl(var(--task-inactive-foreground))]'
                      : 'text-[hsl(var(--task-active-foreground))]'
                  )}
                />
              </div>
              <div>
                <h3 className='font-medium text-foreground'>{task.task_title}</h3>
                {task.comment && <p className='text-sm text-muted-foreground'>{task.comment}</p>}
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-right'>
                <CurrencyDisplay
                  value={parseFloat(task.payout_value)}
                  className={cn(
                    'font-semibold',
                    task.payment_status === 'Paid'
                      ? 'text-[hsl(var(--task-inactive-foreground))]'
                      : 'text-[hsl(var(--task-active-foreground))]'
                  )}
                />
              </div>
              {onSelect && (
                <Checkbox
                  checked={isSelected}
                  className='data-[state=checked]:bg-[hsl(var(--task-active))] data-[state=checked]:text-[hsl(var(--task-active-foreground))]'
                  onCheckedChange={() => onSelect(task.c_task_id)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this payment of{' '}
              <CurrencyDisplay value={parseFloat(task.payout_value)} /> for {task.task_title}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction} className='bg-green-500 hover:bg-green-600 text-white'>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
