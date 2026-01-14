import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  TextField,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useUsersDropdown } from 'hooks/useUsers';
import React, { useCallback, useEffect, useState } from 'react';
import { cn } from 'utils/stringUtils';

/**
 * User data structure
 */
interface User {
  profile_image: string;
  id: number;
  name: string;
  email: string;
}

/**
 * Props for MultiUserSelect component
 */
interface MultiUserSelectProps {
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
  value?: number[];
  /** Callback fired when selection changes */
  onChange?: (event: any, value: User[]) => void;
  /** User Name to search */
  nameToSearch?: string;
  /** Class name for the input */
  className?: string;
  /** Placeholder for the input */
  placeholder?: string;
  /** Color pattern for chips */
  colorPattern?:
    | 'blue'
    | 'green'
    | 'orange'
    | 'red'
    | 'purple'
    | 'default'
    | 'blueish';
}

const MultiUserSelect: React.FC<MultiUserSelectProps> = ({
  name,
  label,
  required = false,
  fullWidth = true,
  size = 'small',
  formik,
  setValue,
  value,
  onChange,
  className,
  placeholder = 'Select Users...',
  colorPattern = 'blue',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const {
    data: usersResponse,
    isFetching,
    refetch,
  } = useUsersDropdown({
    search: inputValue,
  });

  const users = usersResponse?.data || [];

  const getColorClasses = (pattern: string) => {
    const configs = {
      blue: {
        chip: '!bg-blue-100 !text-blue-700 !border-blue-300',
        avatar: '!bg-blue-200 !text-blue-800',
        deleteIcon: '!text-blue-600 hover:!bg-blue-200',
      },
      green: {
        chip: '!bg-green-100 !text-green-700 !border-green-300',
        avatar: '!bg-green-200 !text-green-800',
        deleteIcon: '!text-green-600 hover:!bg-green-200',
      },
      orange: {
        chip: '!bg-orange-100 !text-orange-700 !border-orange-300',
        avatar: '!bg-orange-200 !text-orange-800',
        deleteIcon: '!text-orange-600 hover:!bg-orange-200',
      },
      red: {
        chip: '!bg-red-100 !text-red-700 !border-red-300',
        avatar: '!bg-red-200 !text-red-800',
        deleteIcon: '!text-red-600 hover:!bg-red-200',
      },
      purple: {
        chip: '!bg-purple-100 !text-purple-700 !border-purple-300',
        avatar: '!bg-purple-200 !text-purple-800',
        deleteIcon: '!text-purple-600 hover:!bg-purple-200',
      },
      blueish: {
        chip: '!bg-sky-100 !text-sky-700 !border-sky-300',
        avatar: '!bg-sky-200 !text-sky-800',
        deleteIcon: '!text-sky-600 hover:!bg-sky-200',
      },
      default: {
        chip: '!bg-gray-100 !text-gray-700 !border-gray-300',
        avatar: '!bg-gray-200 !text-gray-800',
        deleteIcon: '!text-gray-600 hover:!bg-gray-200',
      },
    };
    return configs[pattern as keyof typeof configs] || configs.default;
  };

  const colorClasses = getColorClasses(colorPattern);

  useEffect(() => {
    if (formik && name) {
      const formikValue = formik.values[name];
      if (Array.isArray(formikValue) && formikValue.length > 0) {
        const userIds = formikValue;
        const existingUsers = users.filter(user => userIds.includes(user.id));
        setSelectedUsers(existingUsers);
      }
    } else if (value && Array.isArray(value)) {
      const existingUsers = users.filter(user => value.includes(user.id));
      setSelectedUsers(existingUsers);
    }
  }, [formik, name, value, users]);

  const handleChange = useCallback(
    (_: any, newValue: User[]) => {
      setSelectedUsers(newValue);

      const userIds = newValue.map(user => user.id);

      if (formik && name) {
        formik.setFieldValue(name, userIds);
      }

      if (setValue) {
        setValue(userIds);
      }

      if (onChange) {
        onChange(_, newValue);
      }
    },
    [formik, name, setValue, onChange]
  );

  const handleInputChange = useCallback(
    (_: any, newInputValue: string) => {
      setInputValue(newInputValue);
      if (newInputValue.length > 0) {
        refetch();
      }
    },
    [refetch]
  );

  const getError = useCallback(() => {
    if (formik && name) {
      const touched = formik.touched[name];
      const error = formik.errors[name];
      return touched && error ? String(error) : '';
    }
    return '';
  }, [formik, name]);

  const error = getError();

  return (
    <Autocomplete
      multiple
      id={`multi-user-select-${name || 'default'}`}
      options={users}
      getOptionLabel={option => option.name || ''}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={selectedUsers}
      onChange={handleChange}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      loading={isFetching}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option.id}
          className="!flex !items-center !gap-2 cursor-pointer py-1 px-2 hover:!bg-gray-50"
        >
          <Avatar
            src={option.profile_image || 'mkx'}
            alt={option.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box>
            <p className="!text-gray-900 !text-sm">{option.name || ''}</p>
            {option.email && (
              <p className="!text-gray-500 !text-xs">{option.email}</p>
            )}
          </Box>
        </Box>
      )}
      renderValue={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip
            avatar={
              <Avatar
                src={option.profile_image}
                alt={option.name}
                className={cn('!w-4 !h-4', colorClasses.avatar)}
              >
                {option.name.charAt(0).toUpperCase()}
              </Avatar>
            }
            size="small"
            label={option.name}
            {...getTagProps({ index })}
            onDelete={() => {
              const newSelected = selected.filter((_, i) => i !== index);
              setSelectedUsers(newSelected);
              const userIds = newSelected.map(user => user.id);
              if (formik && name) {
                formik.setFieldValue(name, userIds);
              }
              if (setValue) {
                setValue(userIds);
              }
              if (onChange) {
                onChange({}, newSelected);
              }
            }}
            className={cn(
              '!m-1 !py-1 !border',
              colorClasses.chip,
              '[&_.MuiChip-deleteIcon]:!text-inherit [&_.MuiChip-deleteIcon:hover]:!bg-inherit'
            )}
          />
        ))
      }
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={!!error}
          helperText={error}
          placeholder={placeholder}
          size={size}
          fullWidth={fullWidth}
          className={className}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      filterSelectedOptions
      noOptionsText={inputValue ? 'No users found' : 'Type to search users'}
      className={cn('w-full', className)}
    />
  );
};

export default MultiUserSelect;
