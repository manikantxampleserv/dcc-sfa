/**
 * ## SearchInput
 *
 * A customizable search input component with search icon and optional clear functionality.
 * Built on top of MUI TextField with consistent styling and behavior.
 *
 * @param {SearchInputProps} props - Props for the SearchInput component.
 *
 * #### Example
 *
 * ```tsx
 * import React, { useState } from 'react';
 * import SearchInput from 'shared/SearchInput';
 *
 * const MyComponent: React.FC = () => {
 *   const [searchValue, setSearchValue] = useState('');
 *
 *   const handleSearch = (value: string) => {
 *     setSearchValue(value);
 *     // This will be called after 300ms delay (debounced)
 *     console.log('Searching for:', value);
 *   };
 *
 *   const handleInputChange = (value: string) => {
 *     // This is called immediately on every keystroke
 *     console.log('Typing:', value);
 *   };
 *
 *   return (
 *     <div>
 *       <SearchInput
 *         value={searchValue}
 *         onChange={handleSearch}
 *         onInputChange={handleInputChange}
 *         placeholder="Search users..."
 *         showClear={true}
 *         fullWidth={true}
 *         size="small"
 *         debounceMs={300}
 *       />
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */

import { Search, Clear } from '@mui/icons-material';
import { InputAdornment, TextField } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';

export interface SearchInputProps {
  /** Current search value (controlled input) */
  value?: string;
  /** Placeholder text displayed when input is empty (default: 'Search...') */
  placeholder?: string;
  /** Callback function called when input value changes (debounced if debounceMs > 0) */
  onChange?: (value: string) => void;
  /** Callback function called immediately on every keystroke (not debounced) */
  onInputChange?: (value: string) => void;
  /** Callback function called when Enter key is pressed */
  onEnterPress?: (value: string) => void;
  /** Additional CSS className for custom styling */
  className?: string;
  /** Input field size (default: 'small') */
  size?: 'small' | 'medium';
  /** Whether to show the clear button when input has value (default: true) */
  showClear?: boolean;
  /** Whether the input is disabled (default: false) */
  disabled?: boolean;
  /** Whether the input should take full width of container (default: false) */
  fullWidth?: boolean;
  /** Debounce delay in milliseconds (default: 300, set to 0 to disable debouncing) */
  debounceMs?: number;
}

/**
 * SearchInput component with search icon and optional clear functionality
 * @param props - SearchInputProps containing all component configuration
 * @returns JSX.Element - Rendered search input field
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  placeholder = 'Search...',
  onChange,
  onInputChange,
  onEnterPress,
  className = '',
  size = 'small',
  showClear = true,
  disabled = false,
  fullWidth = false,
  debounceMs = 300,
}) => {
  const [internalValue, setInternalValue] = useState(value || '');

  /**
   * Debounced effect that calls onChange after the specified delay
   */
  useEffect(() => {
    if (debounceMs === 0) {
      // No debouncing, call onChange immediately
      onChange?.(internalValue);
      return;
    }

    const timeoutId = setTimeout(() => {
      onChange?.(internalValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [internalValue, debounceMs, onChange]);

  /**
   * Sync internal value with external value prop
   */
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  /**
   * Handles input value changes with debouncing
   * @param event - Input change event
   */
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);

      // Call immediate callback if provided
      onInputChange?.(newValue);
    },
    [onInputChange]
  );

  /**
   * Clears the input value immediately (no debouncing for clear action)
   */
  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange?.('');
    onInputChange?.('');
  }, [onChange, onInputChange]);

  /**
   * Handles Enter key press to trigger search action
   * @param event - Keyboard event
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && onEnterPress) {
        event.preventDefault();
        onEnterPress(internalValue);
      }
    },
    [onEnterPress, internalValue]
  );

  return (
    <TextField
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
      variant="outlined"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search className="!text-gray-400 !text-xl" />
            </InputAdornment>
          ),
          endAdornment: showClear && internalValue && (
            <InputAdornment position="end">
              <Clear
                className="!text-gray-400 !text-xl !cursor-pointer hover:!text-gray-600"
                onClick={handleClear}
              />
            </InputAdornment>
          ),
          className: '!text-sm',
        },
      }}
    />
  );
};

export default SearchInput;
