'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ListTodo } from 'lucide-react';
import { AddTaskModal } from './add-task-modal';
import { EditTaskModal } from './edit-task-modal';
import { Task } from '@/app/types/task';
import { IconComponent } from './icon-component';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { cn } from '@/lib/utils';

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (error) {
      timeoutId = setTimeout(() => {
        setError(null);
      }, 5000); // Clear error after 5 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [error]);

  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (newTask: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>) => {
    try {
      const taskWithPayoutValue = {
        ...newTask,
        payout_value: newTask.payout_value || 0, // Provide a default value if not set
      };
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithPayoutValue),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      const task = await response.json();
      setTasks((prevTasks) => [...prevTasks, task]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  const handleEditTask = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      console.log('Updating task:', taskId, updatedTask); // Add this log
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
      const task = await response.json();
      setTasks((prevTasks) => prevTasks.map((t) => (t.task_id === task.task_id ? task : t)));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setError(
            'This task has unpaid completed entries and cannot be deleted. Please process (approve or reject) all unpaid entries for this task first.'
          );
          return;
        }
        throw new Error(errorData.error || 'Failed to delete task');
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== taskId));
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(
        'Unable to delete this task. It may have unpaid completed entries that need to be processed first.'
      );
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(
      (task) =>
        statusFilter === 'all' ||
        (statusFilter === 'active' && task.is_active) ||
        (statusFilter === 'inactive' && !task.is_active)
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'payout_value') return b.payout_value - a.payout_value;
      if (sortBy === 'created_at')
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col bg-background'>
      {/* Fixed Header */}
      <div className='p-8 bg-background-secondary'>
        <div className='flex items-center justify-between pb-6 border-b border-border'>
          <div className='flex items-center space-x-4'>
            <ListTodo className='h-8 w-8 text-content-primary' />
            <h1 className='text-3xl font-medium text-content-primary'>Task Management</h1>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className='bg-black hover:bg-black/90 text-white'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Task
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto p-8 pt-4 bg-background-secondary'>
        {/* Filters */}
        <div className='flex flex-wrap gap-4 items-center mb-6'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Filter tasks' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Tasks</SelectItem>
              <SelectItem value='active'>Active Only</SelectItem>
              <SelectItem value='inactive'>Inactive Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Sort tasks' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='title'>Sort by Title</SelectItem>
              <SelectItem value='payout_value'>Sort by Payout</SelectItem>
              <SelectItem value='created_at'>Sort by Created Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {filteredAndSortedTasks.map((task) => (
            <Card
              key={task.task_id}
              className={cn(
                'w-full transition-all duration-300 cursor-pointer shadow-md',
                'dark:hover:shadow-lg',
                task.is_active
                  ? [
                      'bg-blue-100/50 hover:bg-blue-200/50 border-blue-200',
                      'dark:bg-blue-900/20 dark:hover:bg-blue-800/30 dark:border-blue-800',
                    ]
                  : [
                      'bg-gray-100/50 hover:bg-gray-200/50 border-gray-200',
                      'dark:bg-gray-800/20 dark:hover:bg-gray-700/30 dark:border-gray-700',
                    ]
              )}
              onClick={() => {
                setEditingTask(task);
                setIsEditModalOpen(true);
              }}
            >
              <CardContent className='p-4 flex flex-col items-center text-center'>
                <div className='h-20 w-20 mb-2'>
                  <IconComponent
                    icon={task.icon_name}
                    className={cn(
                      'h-full w-full',
                      task.is_active
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  />
                </div>
                <h3
                  className={cn(
                    'text-lg font-semibold mb-1',
                    task.is_active
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-700 dark:text-gray-300 italic'
                  )}
                >
                  {task.title}
                </h3>
                <p className='text-xl font-bold'>
                  <CurrencyDisplay
                    value={task.payout_value}
                    className={cn(
                      'text-xl font-bold',
                      task.is_active
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
      />
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        task={editingTask}
      />
    </div>
  );
}
