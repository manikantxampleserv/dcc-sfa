import {
  Autocomplete,
  CircularProgress,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useCustomersDropdown } from 'hooks/useCustomers';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * Customer data structure
 */
interface Customer {
  id: number;
  name: string;
  code: string;
}

/**
 * Props for CustomerSelect component
 */
interface CustomerSelectProps {
  /** Field name for form integration */
  name: string;
  /** Label text displayed above the input */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the input should take full width */
  fullWidth?: boolean;
  /** Formik form instance for form integration */
  formik?: FormikProps<any>;
  /** Callback to set value when not using Formik */
  setValue?: (value: any) => void;
  /** Controlled value when not using Formik */
  value?: string | number;
  /** Callback fired when selection changes */
  onChange?: (event: any, value: Customer | null) => void;
  /** Customer Name to search */
  nameToSearch?: string;
}

/**
 * CustomerSelect Component
 *
 * A searchable autocomplete component for selecting customers with debounced search,
 * Formik integration, and persistent selection handling.
 *
 * Features:
 * - Debounced search (300ms delay) to reduce API calls
 * - Prevents API calls when selecting from existing options
 * - Maintains selected customer visibility even when not in search results
 * - Full Formik integration with error handling
 * - Server-side filtering only (no client-side filtering)
 *
 * @param {CustomerSelectProps} props - Component props
 * @returns {JSX.Element} CustomerSelect component
 *
 * @example
 * ```tsx
 * // With Formik
 * <CustomerSelect
 *   name="customer_id"
 *   label="Customer"
 *   required
 *   formik={formik}
 * />
 *
 * // Without Formik
 * <CustomerSelect
 *   name="customer_id"
 *   label="Customer"
 *   value={customerId}
 *   setValue={setCustomerId}
 *   onChange={(event, customer) => {
 *     // Handle customer selection
 *   }}
 * />
 * ```
 */
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] =
    useState<Customer | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const currentValue = formik ? formik.values[name] : value;

  const normalizedValue = currentValue
    ? typeof currentValue === 'number'
      ? currentValue.toString()
      : String(currentValue).trim()
    : '';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSelecting) {
        setDebouncedSearch(inputValue);
        if (inputValue) {
          setHasInitialized(true);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isSelecting]);

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

  const { data: dropdownResponse, isLoading: isLoading } = useCustomersDropdown(
    {
      search: effectiveSearch,
      customer_id: customerId && !effectiveSearch ? customerId : undefined,
    }
  );

  const searchResults: Customer[] = (dropdownResponse?.data || []).map(
    customer => ({
      id: customer.id,
      name: customer.name,
      code: customer.code,
    })
  );

  useEffect(() => {
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
        setSelectedCustomerData(found);
        if (!inputValue) {
          setInputValue(found.name);
        }
        setHasInitialized(true);
      }
    }
  }, [
    normalizedValue,
    selectedCustomerData,
    inputValue,
    searchResults,
    isLoading,
  ]);

  const selectedCustomer = React.useMemo(() => {
    if (!normalizedValue) {
      return null;
    }

    const foundInResults = searchResults.find(
      customer => customer.id.toString() === normalizedValue
    );

    if (foundInResults) {
      return foundInResults;
    }

    if (
      selectedCustomerData &&
      selectedCustomerData.id.toString() === normalizedValue
    ) {
      return selectedCustomerData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedCustomerData]);

  useEffect(() => {
    if (selectedCustomer && selectedCustomer !== selectedCustomerData) {
      setSelectedCustomerData(selectedCustomer);
      if (!inputValue && selectedCustomer.name) {
        setInputValue(selectedCustomer.name);
      }
    } else if (!normalizedValue && selectedCustomerData) {
      setSelectedCustomerData(null);
      setInputValue('');
    } else if (selectedCustomerData && !inputValue && normalizedValue) {
      setInputValue(selectedCustomerData.name);
    }
  }, [selectedCustomer, normalizedValue, selectedCustomerData, inputValue]);

  useEffect(() => {
    if (!normalizedValue) {
      if (selectedCustomerData || inputValue) {
        setInputValue('');
        setSelectedCustomerData(null);
        setHasInitialized(false);
      }
    } else if (
      selectedCustomerData &&
      selectedCustomerData.id.toString() !== normalizedValue
    ) {
      setSelectedCustomerData(null);
      setInputValue('');
      setHasInitialized(false);
    }
  }, [normalizedValue]);

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
  }, [searchResults, selectedCustomer, normalizedValue]);

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
        <Box component="li" {...props} key={option.id}>
          <Typography>{option.name}</Typography>
        </Box>
      )}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={!!error}
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
