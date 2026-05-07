import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({ 
  value, 
  onChange, 
  prefix, 
  className,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Only update if the parsed value is different to avoid cursor jumps
    const currentNum = parseInt(displayValue.replace(/[^0-9]/g, '')) || 0;
    if (value !== currentNum || (value === 0 && displayValue === '')) {
      setDisplayValue(value === 0 ? '' : new Intl.NumberFormat('id-ID').format(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPosition = e.target.selectionStart;
    const oldLength = e.target.value.length;
    
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue) || 0;
    
    // Format for display
    const formatted = rawValue === '' ? '' : new Intl.NumberFormat('id-ID').format(numValue);
    
    setDisplayValue(formatted);
    onChange(numValue);

    // Try to maintain cursor position (rough approximation for simple cases)
    setTimeout(() => {
      if (cursorPosition !== null && e.target) {
        const newLength = formatted.length;
        const diff = newLength - oldLength;
        e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
      }
    }, 0);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      className={cn(className)}
      value={displayValue}
      onChange={handleChange}
    />
  );
};
