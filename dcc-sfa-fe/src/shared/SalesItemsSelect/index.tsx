import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useSalespersonInventoryItemsDropdown } from 'hooks/useVanInventoryItems';
import type { SalespersonInventoryItemDropdown } from 'services/masters/VanInventoryItems';
import React, { useEffect, useState, useRef } from 'react';

type SalesItem = SalespersonInventoryItemDropdown;

interface SalesItemsSelectProps {
  salespersonId: number;
  name?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  value?: string | number;
  onChange?: (event: any, value: SalesItem | null) => void;
  nameToSearch?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const SalesItemsSelect: React.FC<SalesItemsSelectProps> = ({
  salespersonId,
  name = 'product_id',
  label = 'Sales Item',
  required = false,
  fullWidth = true,
  size = 'small',
  formik,
  setValue,
  value,
  nameToSearch = '',
  onChange,
  className,
  placeholder = 'Search for a product',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState<SalesItem | null>(
    null
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  const isInitializingRef = useRef(false);

  const currentValue = formik ? formik.values[name] : value;
  const normalizedValue = currentValue
    ? typeof currentValue === 'number'
      ? currentValue.toString()
      : String(currentValue).trim()
    : '';

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

  const { data: salesItemsData, isLoading } =
    useSalespersonInventoryItemsDropdown(salespersonId, effectiveSearch, {
      enabled: !disabled && !!salespersonId,
    });

  const options = React.useMemo(() => {
    if (!salesItemsData?.data) return [];
    return salesItemsData.data;
  }, [salesItemsData]);

  useEffect(() => {
    if (
      normalizedValue &&
      options.length > 0 &&
      !selectedItemData &&
      !isInitializingRef.current
    ) {
      isInitializingRef.current = true;
      const found = options.find(p => String(p.product_id) === normalizedValue);
      if (found) {
        setSelectedItemData(found);
      }
      isInitializingRef.current = false;
    }
  }, [normalizedValue, options, selectedItemData]);

  useEffect(() => {
    if (normalizedValue && options.length > 0) {
      const found = options.find(p => String(p.product_id) === normalizedValue);
      if (found) {
        setSelectedItemData(found);
        if (!hasInitialized && !inputValue) {
          setInputValue(found.name);
          setHasInitialized(true);
        }
      }
    }
  }, [options, normalizedValue, hasInitialized, inputValue]);

  const selectedItem = React.useMemo(() => {
    if (!normalizedValue) return null;
    const found = options.find(p => String(p.product_id) === normalizedValue);
    if (found) return found;
    if (selectedItemData && String(selectedItemData.id) === normalizedValue) {
      return selectedItemData;
    }
    return null;
  }, [normalizedValue, options, selectedItemData]);

  useEffect(() => {
    if (!normalizedValue && (selectedItemData || inputValue)) {
      setInputValue('');
      setSelectedItemData(null);
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  const handleChange = (event: any, newValue: SalesItem | null) => {
    setIsSelecting(true);
    setSelectedItemData(newValue);

    if (formik) {
      formik.setFieldValue(name, newValue?.product_id || '');
    } else if (setValue) {
      setValue(newValue?.product_id || '');
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

    // Reset selecting state after a delay to allow render
    setTimeout(() => setIsSelecting(false), 100);
  };

  const handleInputChange = (
    _event: any,
    newInputValue: string,
    reason: string
  ) => {
    if (reason === 'input') {
      if (!isSelecting) {
        setInputValue(newInputValue);
        setSearchValue(newInputValue);
      } else {
        setInputValue(newInputValue);
      }
    }
    if (reason === 'clear') {
      setInputValue('');
      setSearchValue('');
      setDebouncedSearch('');
    }
  };

  return (
    <Autocomplete
      id={`sales-items-select-${name}`}
      options={options}
      getOptionLabel={(option: SalesItem) => option.name}
      loading={isLoading}
      value={selectedItem}
      onChange={handleChange}
      onInputChange={handleInputChange}
      inputValue={inputValue}
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      className={className}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={opts => opts}
      renderOption={(props, option: SalesItem) => (
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
      noOptionsText={
        !salespersonId
          ? 'Select a salesperson first'
          : debouncedSearch && !isLoading
            ? 'No items found'
            : 'Type to search items'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          items...
        </span>
      }
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={formik && Boolean(formik.touched[name] && formik.errors[name])}
          helperText={
            formik && formik.touched[name] && (formik.errors[name] as string)
          }
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default SalesItemsSelect;
