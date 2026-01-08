import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useCustomersDropdown } from 'hooks/useCustomers';
import React, { useCallback, useEffect, useState, useRef } from 'react';

interface Customer {
  id: number;
  name: string;
  code: string;
}

interface CustomerSelectProps {
  name: string;
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  value?: string | number;
  onChange?: (event: any, value: Customer | null) => void;
  nameToSearch?: string;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  name,
  label,
  required = false,
  fullWidth = true,
  formik,
  setValue,
  value,
  nameToSearch = '',
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] =
    useState<Customer | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Track if we're in the process of initializing to avoid loops
  const isInitializingRef = useRef(false);

  const currentValue = formik ? formik.values[name] : value;
  const normalizedValue = currentValue
    ? typeof currentValue === 'number'
      ? currentValue.toString()
      : String(currentValue).trim()
    : '';

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSelecting) {
        setDebouncedSearch(searchValue);
        if (searchValue) {
          setHasInitialized(true);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, isSelecting]);

  const effectiveSearch = React.useMemo(() => {
    if (hasInitialized || inputValue) {
      return debouncedSearch;
    }
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

  const customerId = normalizedValue ? Number(normalizedValue) : undefined;

  const { data: dropdownResponse, isLoading } = useCustomersDropdown({
    search: effectiveSearch,
    customer_id: customerId && !effectiveSearch ? customerId : undefined,
  });

  const searchResults: Customer[] = (dropdownResponse?.data || []).map(
    customer => ({
      id: customer.id,
      name: customer.name,
      code: customer.code,
    })
  );

  // Initialize selected customer from search results - FIXED to prevent loops
  useEffect(() => {
    if (isInitializingRef.current) return;

    if (
      normalizedValue &&
      !selectedCustomerData &&
      !isLoading &&
      searchResults.length > 0
    ) {
      const found = searchResults.find(
        customer => customer.id.toString() === normalizedValue
      );
      if (found) {
        isInitializingRef.current = true;
        setSelectedCustomerData(found);
        if (!inputValue) {
          setInputValue(found.name);
        }
        setHasInitialized(true);
        // Reset the flag after a short delay
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 100);
      }
    }
  }, [normalizedValue, isLoading, searchResults.length]);

  // Get selected customer from state or search results
  const selectedCustomer = React.useMemo(() => {
    if (!normalizedValue) return null;

    const foundInResults = searchResults.find(
      customer => customer.id.toString() === normalizedValue
    );

    if (foundInResults) return foundInResults;
    if (
      selectedCustomerData &&
      selectedCustomerData.id.toString() === normalizedValue
    ) {
      return selectedCustomerData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedCustomerData]);

  // Reset when value is cleared - SIMPLIFIED to prevent loops
  useEffect(() => {
    if (!normalizedValue && (selectedCustomerData || inputValue)) {
      setInputValue('');
      setSelectedCustomerData(null);
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  // Combine selected customer with search results
  const customers: Customer[] = React.useMemo(() => {
    const allCustomers: Customer[] = [];

    if (selectedCustomer) {
      const isSelectedInResults = searchResults.some(
        customer => customer.id === selectedCustomer.id
      );
      if (!isSelectedInResults) {
        allCustomers.push(selectedCustomer);
      }
    }

    const seenIds = new Set<number>();
    if (selectedCustomer) {
      seenIds.add(selectedCustomer.id);
    }

    searchResults.forEach(customer => {
      if (!seenIds.has(customer.id)) {
        allCustomers.push(customer);
        seenIds.add(customer.id);
      }
    });

    return allCustomers;
  }, [searchResults, selectedCustomer]);

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const helperText = typeof error === 'string' ? error : undefined;

  const handleChange = useCallback(
    (event: any, newValue: Customer | null) => {
      setIsSelecting(true);
      setSelectedCustomerData(newValue);

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
      } else {
        setInputValue(newValue.name);
      }

      setTimeout(() => setIsSelecting(false), 100);
    },
    [formik, name, setValue, onChange]
  );

  const handleInputChange = useCallback(
    (_event: any, newInputValue: string, reason: string) => {
      if (reason === 'input') {
        if (!isSelecting) {
          setInputValue(newInputValue);
          setSearchValue(newInputValue);
        } else {
          setInputValue(newInputValue);
        }
        return;
      }

      if (reason === 'clear') {
        setInputValue('');
        setSearchValue('');
        setDebouncedSearch('');
      }
    },
    [isSelecting]
  );

  return (
    <Autocomplete
      options={customers}
      getOptionLabel={(option: Customer) => option.name}
      value={selectedCustomer}
      loading={isLoading}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option: Customer, value: Customer) =>
        option.id === value.id
      }
      size="small"
      fullWidth={fullWidth}
      filterOptions={options => options}
      renderOption={(props, option: Customer) => (
        <Box
          component="li"
          {...props}
          key={option.id}
          className="!flex !items-center !gap-2 cursor-pointer py-1 px-2 hover:!bg-gray-50"
        >
          <Avatar
            src={option.name || 'mkx'}
            alt={option.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box>
            <p className="!text-gray-900 !text-sm">{option.name || ''}</p>
            {option.code && (
              <p className="!text-gray-500 !text-xs">{option.code}</p>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={`${label + (required ? ' *' : '')}`}
          required={false}
          error={!!error}
          require
          helperText={helperText}
          onBlur={formik?.handleBlur}
          name={name}
          size="small"
        />
      )}
      noOptionsText={
        debouncedSearch && !isLoading
          ? 'No customers found'
          : 'Type to search customers'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          customers...
        </span>
      }
    />
  );
};

export default CustomerSelect;
