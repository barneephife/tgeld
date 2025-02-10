'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface CurrencyDisplayProps {
  value: number | string;
  className?: string;
  symbolPosition?: 'before' | 'after';
  locale?: string;
  showZeroDecimals?: boolean;
}

const DEFAULT_PROPS = {
  symbolPosition: 'before' as const,
  locale: 'en-US',
  showZeroDecimals: true,
};

// Add a list of currencies that use their code as symbol
const CURRENCIES_WITHOUT_SYMBOL = ['CHF'];

export function CurrencyDisplay({
  value,
  className = '',
  symbolPosition = DEFAULT_PROPS.symbolPosition,
  locale = DEFAULT_PROPS.locale,
  showZeroDecimals = DEFAULT_PROPS.showZeroDecimals,
}: CurrencyDisplayProps) {
  const { currency, format, isLoading } = useCurrency();

  // Convert value to number and handle invalid values
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof numericValue !== 'number' || isNaN(numericValue)) {
    return <span className={className}>0.00</span>;
  }

  // Handle loading state
  if (isLoading) {
    return <span className={className}>{numericValue.toFixed(showZeroDecimals ? 2 : 0)}</span>;
  }

  // Handle no currency or 'none' selected
  if (!currency || currency === 'none') {
    return <span className={className}>{numericValue.toFixed(showZeroDecimals ? 2 : 0)}</span>;
  }

  // For currencies that use their code as symbol, always use code format
  if (CURRENCIES_WITHOUT_SYMBOL.includes(currency)) {
    const formattedValue = numericValue.toFixed(showZeroDecimals ? 2 : 0);
    return (
      <span className={className}>
        {symbolPosition === 'before'
          ? `${currency} ${formattedValue}`
          : `${formattedValue} ${currency}`}
      </span>
    );
  }

  // Format the number based on saved format preference
  if (format === 'symbol') {
    return (
      <span className={className}>
        {new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: showZeroDecimals ? 2 : 0,
        }).format(numericValue)}
      </span>
    );
  }

  if (format === 'code') {
    const formattedValue = numericValue.toFixed(showZeroDecimals ? 2 : 0);
    return (
      <span className={className}>
        {symbolPosition === 'before'
          ? `${currency} ${formattedValue}`
          : `${formattedValue} ${currency}`}
      </span>
    );
  }

  // format === 'both'
  const formattedWithSymbol = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: showZeroDecimals ? 2 : 0,
  }).format(numericValue);

  return (
    <span className={className}>
      {symbolPosition === 'before'
        ? `${formattedWithSymbol} ${currency}`
        : `${currency} ${formattedWithSymbol}`}
    </span>
  );
}
