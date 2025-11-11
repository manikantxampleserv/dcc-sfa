import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import type { FormikProps } from 'formik';
import { useUser, useUsers } from 'hooks/useUsers';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * User data structure
 */
interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Props for UserSelect component
 */
interface UserSelectProps {
  /** Field name for form integration */
  name?: string;
  /** Label text displayed above the input */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the input should take full width */
  fullWidth?: boolean;
  /** Size of the input */
  size?: 'small' | 'medium';
  /** Formik form instance for form integration */
  formik?: FormikProps<any>;
  /** Callback to set value when not using Formik */
  setValue?: (value: any) => void;
  /** Controlled value when not using Formik */
  value?: string | number;
  /** Callback fired when selection changes */
  onChange?: (event: any, value: User | null) => void;
  /** User Name to search */
  nameToSearch?: string;
  /** Class name for the input */
  className?: string;
}

/**
 * UserSelect Component
 *
 * A searchable autocomplete component for selecting users with debounced search,
 * Formik integration, and persistent selection handling.
 *
 * Features:
 * - Debounced search (300ms delay) to reduce API calls
 * - Prevents API calls when selecting from existing options
 * - Maintains selected user visibility even when not in search results
 * - Full Formik integration with error handling
 * - Server-side filtering only (no client-side filtering)
 * - Defaults to "Sales Person" label and "salesperson_id" field name
 *
 * @param {UserSelectProps} props - Component props
 * @returns {JSX.Element} UserSelect component
 *
 * @example
 * ```tsx
 * // With Formik (default Sales Person)
 * <UserSelect formik={formik} required />
 *
 * // With Formik (custom field)
 * <UserSelect
 *   name="assigned_to"
 *   label="Assigned To"
 *   formik={formik}
 *   required
 * />
 *
 * // Without Formik
 * <UserSelect
 *   name="user_id"
 *   label="User"
 *   value={userId}
 *   setValue={setUserId}
 *   onChange={(event, user) => {
 *     // Handle user selection
 *   }}
 * />
 * ```
 */
const UserSelect: React.FC<UserSelectProps> = ({
  name = 'salesperson_id',
  label = 'Sales Person',
  required = false,
  fullWidth = true,
  size = 'small',
  formik,
  setValue,
  value,
  nameToSearch = '',
  onChange,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const currentValue = formik ? formik.values[name] : value;

  // Normalize currentValue to handle both number and string
  const normalizedValue = currentValue
    ? typeof currentValue === 'number'
      ? currentValue.toString()
      : String(currentValue).trim()
    : '';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSelecting) {
        setDebouncedSearch(inputValue);
        // Once user starts typing, mark as initialized
        if (inputValue) {
          setHasInitialized(true);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isSelecting]);

  // Use nameToSearch only on initial mount when we have a value but haven't initialized yet
  // Once user types or component is initialized, use debouncedSearch
  const effectiveSearch = React.useMemo(() => {
    if (hasInitialized || inputValue) {
      return debouncedSearch;
    }
    // On initial mount with value, use nameToSearch if provided
    if (normalizedValue && nameToSearch && !hasInitialized) {
      return nameToSearch;
    }
    return debouncedSearch;
  }, [
    debouncedSearch,
    nameToSearch,
    hasInitialized,
    normalizedValue,
    inputValue,
  ]);

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    limit: 20,
    search: effectiveSearch,
  });
  const searchResults: User[] = usersResponse?.data || [];

  // Only fetch individual user if not found in list and we have a value
  const userId = normalizedValue ? Number(normalizedValue) : 0;
  const userFoundInList = searchResults.some(
    user => user.id.toString() === normalizedValue
  );
  const shouldFetchIndividual =
    normalizedValue && !userFoundInList && !usersLoading && !selectedUserData;

  const { data: initialUserResponse } = useUser(
    shouldFetchIndividual ? userId : 0
  );

  useEffect(() => {
    // First, try to find user in the list results
    if (
      normalizedValue &&
      !selectedUserData &&
      !usersLoading &&
      searchResults.length > 0
    ) {
      const found = searchResults.find(
        user => user.id.toString() === normalizedValue
      );
      if (found) {
        setSelectedUserData(found);
        if (!inputValue) {
          setInputValue(found.name);
        }
        setHasInitialized(true);
        return; // Found in list, no need to check individual fetch
      }
    }

    // Fallback: if not found in list, use individual fetch result
    if (initialUserResponse?.data && normalizedValue) {
      const user = initialUserResponse.data as any;
      const userData = user.user || user;
      if (
        userData &&
        userData.id &&
        userData.id.toString() === normalizedValue &&
        (!selectedUserData || selectedUserData.id !== userData.id)
      ) {
        setSelectedUserData({
          id: userData.id,
          name: userData.name,
          email: userData.email || '',
        });
        // Set input value to show the user name
        if (!inputValue) {
          setInputValue(userData.name);
        }
        setHasInitialized(true);
      }
    }
  }, [
    initialUserResponse,
    normalizedValue,
    selectedUserData,
    inputValue,
    searchResults,
    usersLoading,
  ]);

  const selectedUser = React.useMemo(() => {
    if (!normalizedValue) {
      return null;
    }

    const foundInResults = searchResults.find(
      user => user.id.toString() === normalizedValue
    );

    if (foundInResults) {
      return foundInResults;
    }

    if (
      selectedUserData &&
      selectedUserData.id.toString() === normalizedValue
    ) {
      return selectedUserData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedUserData]);

  useEffect(() => {
    if (selectedUser && selectedUser !== selectedUserData) {
      setSelectedUserData(selectedUser);
      if (!inputValue && selectedUser.name) {
        setInputValue(selectedUser.name);
      }
    } else if (!normalizedValue && selectedUserData) {
      setSelectedUserData(null);
      setInputValue('');
    } else if (selectedUserData && !inputValue && normalizedValue) {
      // Set input value when component mounts with existing value
      setInputValue(selectedUserData.name);
    }
  }, [selectedUser, normalizedValue, selectedUserData, inputValue]);

  // Reset inputValue when normalizedValue changes externally (e.g., formik reinitializes)
  useEffect(() => {
    if (!normalizedValue) {
      if (selectedUserData || inputValue) {
        setInputValue('');
        setSelectedUserData(null);
        setHasInitialized(false);
      }
    } else if (
      selectedUserData &&
      selectedUserData.id.toString() !== normalizedValue
    ) {
      // Value changed externally, reset to allow new fetch
      setSelectedUserData(null);
      setInputValue('');
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  const users: User[] = React.useMemo(() => {
    if (!selectedUser && !normalizedValue) return searchResults;

    if (selectedUser) {
      const isSelectedInResults = searchResults.some(
        user => user.id === selectedUser.id
      );

      if (isSelectedInResults) {
        return searchResults;
      }

      return [selectedUser, ...searchResults];
    }

    return searchResults;
  }, [searchResults, selectedUser, normalizedValue]);

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const helperText = typeof error === 'string' ? error : undefined;

  const handleChange = useCallback(
    (event: any, newValue: User | null) => {
      setIsSelecting(true);
      setSelectedUserData(newValue);

      const selectedValue = newValue ? newValue.id.toString() : '';

      if (formik) {
        formik.setFieldValue(name, selectedValue);
      } else if (setValue) {
        setValue(selectedValue);
      }

      if (onChange) {
        onChange(event, newValue);
      }

      if (!newValue) {
        setInputValue('');
        setDebouncedSearch('');
      }

      setTimeout(() => setIsSelecting(false), 100);
    },
    [formik, name, setValue, onChange]
  );

  const handleInputChange = useCallback(
    (_event: any, newInputValue: string, reason: string) => {
      if (reason === 'reset' || reason === 'clear') {
        setIsSelecting(true);
        setInputValue('');
        setDebouncedSearch('');
        setTimeout(() => setIsSelecting(false), 100);
        return;
      }

      setInputValue(newInputValue);
    },
    []
  );

  return (
    <Autocomplete
      options={users}
      getOptionLabel={(option: User) => option.name}
      value={selectedUser}
      loading={usersLoading}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option: User, value: User) =>
        option.id === value.id
      }
      size={size}
      fullWidth={fullWidth}
      className={className}
      filterOptions={options => options}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={!!error}
          helperText={helperText}
          onBlur={formik?.handleBlur}
          name={name}
          size={size}
          className={className}
        />
      )}
      noOptionsText={
        debouncedSearch && !usersLoading
          ? 'No users found'
          : 'Type to search users'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          users...
        </span>
      }
    />
  );
};

export default UserSelect;
