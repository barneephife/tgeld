'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  showGermanTerms: boolean;
  setShowGermanTerms: (show: boolean) => void;
  getTermFor: (germanTerm: string, englishTerm: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  showGermanTerms: true,
  setShowGermanTerms: () => {},
  getTermFor: (germanTerm) => germanTerm,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [showGermanTerms, setShowGermanTermsState] = useState(true);

  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const response = await fetch('/api/settings/language');
        if (!response.ok) throw new Error('Failed to load language settings');
        const { showGerman } = await response.json();
        setShowGermanTermsState(showGerman !== 'false');
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };
    loadLanguagePreference();
  }, []);

  const setShowGermanTerms = async (show: boolean) => {
    try {
      const response = await fetch('/api/settings/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showGerman: show }),
      });

      if (!response.ok) throw new Error('Failed to update language setting');
      setShowGermanTermsState(show);
    } catch (error) {
      console.error('Error saving language preference:', error);
      throw error;
    }
  };

  const getTermFor = (germanTerm: string, englishTerm: string): string => {
    return showGermanTerms ? germanTerm : englishTerm;
  };

  return (
    <LanguageContext.Provider value={{ showGermanTerms, setShowGermanTerms, getTermFor }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
