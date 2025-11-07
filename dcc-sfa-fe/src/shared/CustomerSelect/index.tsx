import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import type { FormikProps } from 'formik';
import { useCustomer, useCustomers } from 'hooks/useCustomers';
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

  const { data: customersResponse, isLoading: customersLoading } = useCustomers(
    {
      limit: 20,
      search: effectiveSearch,
    }
  );
  const searchResults: Customer[] = customersResponse?.data || [];

  // Only fetch individual customer if not found in list and we have a value
  const customerId = normalizedValue ? Number(normalizedValue) : 0;
  const customerFoundInList = searchResults.some(
    customer => customer.id.toString() === normalizedValue
  );
  const shouldFetchIndividual =
    normalizedValue &&
    !customerFoundInList &&
    !customersLoading &&
    !selectedCustomerData;

  const { data: initialCustomerResponse } = useCustomer(
    shouldFetchIndividual ? customerId : 0
  );

  useEffect(() => {
    // First, try to find customer in the list results
    if (
      normalizedValue &&
      !selectedCustomerData &&
      !customersLoading &&
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
        return; // Found in list, no need to check individual fetch
      }
    }

    // Fallback: if not found in list, use individual fetch result
    if (initialCustomerResponse?.data && normalizedValue) {
      const customer = initialCustomerResponse.data as any;
      const customerData = customer.customer || customer;
      if (
        customerData &&
        customerData.id &&
        customerData.id.toString() === normalizedValue &&
        (!selectedCustomerData || selectedCustomerData.id !== customerData.id)
      ) {
        setSelectedCustomerData({
          id: customerData.id,
          name: customerData.name,
          code: customerData.code || '',
        });
        // Set input value to show the customer name
        if (!inputValue) {
          setInputValue(customerData.name);
        }
        setHasInitialized(true);
      }
    }
  }, [
    initialCustomerResponse,
    normalizedValue,
    selectedCustomerData,
    inputValue,
    searchResults,
    customersLoading,
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
      // Set input value when component mounts with existing value
      setInputValue(selectedCustomerData.name);
    }
  }, [selectedCustomer, normalizedValue, selectedCustomerData, inputValue]);

  // Reset inputValue when normalizedValue changes externally (e.g., formik reinitializes)
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
      // Value changed externally, reset to allow new fetch
      setSelectedCustomerData(null);
      setInputValue('');
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  const customers: Customer[] = React.useMemo(() => {
    if (!selectedCustomer && !normalizedValue) return searchResults;

    if (selectedCustomer) {
      const isSelectedInResults = searchResults.some(
        customer => customer.id === selectedCustomer.id
      );

      if (isSelectedInResults) {
        return searchResults;
      }

      return [selectedCustomer, ...searchResults];
    }

    return searchResults;
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
      loading={customersLoading}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option: Customer, value: Customer) =>
        option.id === value.id
      }
      size="small"
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
          size="small"
        />
      )}
      noOptionsText={
        debouncedSearch && !customersLoading
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
