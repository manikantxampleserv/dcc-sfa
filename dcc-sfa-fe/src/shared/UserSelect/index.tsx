import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import type { FormikProps } from 'formik';
import { useUsers } from 'hooks/useUsers';
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
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);

  const currentValue = formik ? formik.values[name] : value;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSelecting) {
        setDebouncedSearch(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isSelecting]);

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    limit: 20,
    search: debouncedSearch,
  });
  const searchResults: User[] = usersResponse?.data || [];

  const selectedUser = React.useMemo(() => {
    if (!currentValue) {
      return null;
    }

    const foundInResults = searchResults.find(
      user => user.id.toString() === currentValue.toString()
    );

    if (foundInResults) {
      return foundInResults;
    }

    if (
      selectedUserData &&
      selectedUserData.id.toString() === currentValue.toString()
    ) {
      return selectedUserData;
    }

    return null;
  }, [currentValue, searchResults, selectedUserData]);

  useEffect(() => {
    if (selectedUser && selectedUser !== selectedUserData) {
      setSelectedUserData(selectedUser);
    } else if (!currentValue && selectedUserData) {
      setSelectedUserData(null);
    }
  }, [selectedUser, currentValue, selectedUserData]);

  const users: User[] = React.useMemo(() => {
    if (!selectedUser && !currentValue) return searchResults;

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
  }, [searchResults, selectedUser, currentValue]);

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
