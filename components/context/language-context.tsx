'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  showGermanTerms: boolean;
  setShowGermanTerms: (show: boolean) => Promise<boolean>;
  getTermFor: (germanTerm: string, englishTerm: string) => string;
  settings?: { language: string };
}

const LanguageContext = createContext<LanguageContextType>({
  showGermanTerms: true,
  setShowGermanTerms: async () => false,
  getTermFor: (germanTerm) => germanTerm,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [showGermanTerms, setShowGermanTermsState] = useState(true);
  const [settings, setSettings] = useState<{ language: string }>({ language: 'de' });

  // Load initial language preference
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const response = await fetch('/api/settings/language');
        if (!response.ok) throw new Error('Failed to load language settings');
        const { showGerman } = await response.json();
        
        // Update both states together
        setShowGermanTermsState(showGerman);
        setSettings({ language: showGerman ? 'de' : 'en' });
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };
    loadLanguagePreference();
  }, []);

  const setShowGermanTerms = async (show: boolean): Promise<boolean> => {
    try {
      const response = await fetch('/api/settings/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showGerman: show }),
      });

      if (!response.ok) {
        throw new Error('Failed to update language setting');
      }

      const { showGerman } = await response.json();
      
      // Update both states together
      setShowGermanTermsState(showGerman);
      setSettings({ language: showGerman ? 'de' : 'en' });
      
      return showGerman;
    } catch (error) {
      console.error('Error saving language preference:', error);
      throw error;
    }
  };

  const getTermFor = (germanTerm: string, englishTerm: string): string => {
    return showGermanTerms ? germanTerm : englishTerm;
  };

  return (
    <LanguageContext.Provider value={{ showGermanTerms, setShowGermanTerms, getTermFor, settings }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
