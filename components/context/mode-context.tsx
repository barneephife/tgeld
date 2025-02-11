'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ModeContextType {
  enforceRoles: boolean;
  setEnforceRoles: (value: boolean) => void;
  isParentMode: boolean;
  setIsParentMode: (value: boolean) => void;
  hasFullAccess: boolean;
  pin: string | null;
  setPin: (pin: string | null) => void;
  verifyPin: (inputPin: string) => boolean;
  toggleParentMode: () => Promise<boolean>;
  isInitialized: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [enforceRoles, setEnforceRolesState] = useState(true);
  const [isParentMode, setIsParentMode] = useState(true);
  const [pin, setPin] = useState<string | null>(null);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to load settings');
        const settings = await response.json();

        setEnforceRolesState(settings.enforce_roles === 'true');
        setPin(settings.global_pin);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading settings:', error);
        setIsInitialized(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to database when they change
  const updateSetting = async (key: string, value: string | null) => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  // Only update database after initial load
  useEffect(() => {
    if (!isInitialized) return;
    updateSetting('global_pin', pin);
  }, [pin, isInitialized]);

  const hasFullAccess = !enforceRoles || isParentMode;

  const verifyPin = useCallback(
    (inputPin: string) => {
      if (!pin) return true;
      return inputPin === pin;
    },
    [pin]
  );

  const toggleParentMode = useCallback(async () => {
    if (!isParentMode) {
      // Switching to Parent mode
      if (enforceRoles && pin) {
        const inputPin = prompt('Enter PIN to switch to Parent mode:');
        if (!inputPin || !verifyPin(inputPin)) {
          return false;
        }
      }
      setIsParentMode(true);
      return true;
    } else {
      // Switching to Child mode - check current path and redirect if necessary
      setIsParentMode(false);

      // List of protected paths that require parent mode
      const protectedPaths = [
        '/global-settings',
        '/payday',
        '/task-management',
        '/user-management',
      ];

      // Check if current path is protected
      const currentPath = window.location.pathname;
      if (enforceRoles && protectedPaths.some((path) => currentPath.includes(path))) {
        router.push('/');
        return true;
      }

      return true;
    }
  }, [isParentMode, enforceRoles, pin, verifyPin, router]);

  const setEnforceRoles = async (value: boolean) => {
    try {
      // Update the database first
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'enforce_roles', value: value.toString() }),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      // Only update state if database update was successful
      setEnforceRolesState(value);
    } catch (error) {
      console.error('Error updating enforce roles setting:', error);
      throw error;
    }
  };

  const value = {
    enforceRoles,
    setEnforceRoles,
    isParentMode,
    setIsParentMode,
    hasFullAccess,
    pin,
    setPin,
    verifyPin,
    toggleParentMode,
    isInitialized,
  };

  // Optionally prevent render until initialized
  if (!isInitialized) {
    return null; // Or return a loading spinner
  }

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
