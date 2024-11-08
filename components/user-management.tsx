'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserCard } from './user-card';
import { AddUserModal } from './add-user-modal';
import { User, CreateUserInput } from '@/app/types/user';
import { Plus, UsersIcon } from 'lucide-react';

// UserManagement component: Handles user profile management
// Allows creating, editing, and deleting user profiles
export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      console.log('Fetched users:', JSON.stringify(data, null, 2));
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (newUser: CreateUserInput) => {
    try {
      console.log('Attempting to add user:', newUser);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }
      const user = await response.json();
      setUsers((prevUsers) => [...prevUsers, user]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user. Please try again.');
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    try {
      console.log('Sending updated user to API:', updatedUser);
      const response = await fetch(`/api/users/${updatedUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const user = await response.json();
      console.log('Received updated user from API:', user);
      setUsers((prevUsers) => prevUsers.map((u) => (u.user_id === user.user_id ? user : u)));
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      console.log('Deleting user with ID:', userId);
      if (!userId) {
        throw new Error('User ID is undefined');
      }
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== userId));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='p-8 bg-[#FBFBFB] rounded-2xl space-y-8 max-w-7xl mx-auto'>
      <div className='flex justify-between items-center pb-6 border-b border-gray-200'>
        <h1 className='text-3xl font-bold flex items-center text-gray-900'>
          <UsersIcon className='mr-3 h-8 w-8 text-gray-700' />
          Family Management
        </h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className='bg-gray-900 hover:bg-gray-700 text-white transition-colors'
        >
          <Plus className='mr-2 h-4 w-4' /> Add User
        </Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {users.map((user) => (
          <div
            key={user.user_id}
            className='backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300'
            onClick={() => {
              console.log('Opening edit modal for user:', JSON.stringify(user, null, 2));
              setEditingUser(user);
              setIsEditModalOpen(true);
            }}
          >
            <UserCard
              user={user}
              onClick={() => {
                setEditingUser(user);
                setIsEditModalOpen(true);
              }}
            />
          </div>
        ))}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingUser(null);
        }}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        user={undefined}
      />

      {editingUser && (
        <AddUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          onAddUser={(updatedUser) => handleEditUser({ ...editingUser, ...updatedUser })}
          onDeleteUser={handleDeleteUser}
          user={editingUser}
        />
      )}
    </div>
  );
}
