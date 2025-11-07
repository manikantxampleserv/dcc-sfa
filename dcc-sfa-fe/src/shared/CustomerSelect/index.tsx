import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import type { FormikProps } from 'formik';
import { useCustomers } from 'hooks/useCustomers';
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
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCustomerData, setSelectedCustomerData] =
    useState<Customer | null>(null);

  const currentValue = formik ? formik.values[name] : value;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSelecting) {
        setDebouncedSearch(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isSelecting]);

  const { data: customersResponse, isLoading: customersLoading } = useCustomers(
    {
      limit: 20,
      search: debouncedSearch,
    }
  );
  const searchResults: Customer[] = customersResponse?.data || [];

  const selectedCustomer = React.useMemo(() => {
    if (!currentValue) {
      return null;
    }

    const foundInResults = searchResults.find(
      customer => customer.id.toString() === currentValue.toString()
    );

    if (foundInResults) {
      return foundInResults;
    }

    if (
      selectedCustomerData &&
      selectedCustomerData.id.toString() === currentValue.toString()
    ) {
      return selectedCustomerData;
    }

    return null;
  }, [currentValue, searchResults, selectedCustomerData]);

  useEffect(() => {
    if (selectedCustomer && selectedCustomer !== selectedCustomerData) {
      setSelectedCustomerData(selectedCustomer);
    } else if (!currentValue && selectedCustomerData) {
      setSelectedCustomerData(null);
    }
  }, [selectedCustomer, currentValue, selectedCustomerData]);

  const customers: Customer[] = React.useMemo(() => {
    if (!selectedCustomer && !currentValue) return searchResults;

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
  }, [searchResults, selectedCustomer, currentValue]);

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
