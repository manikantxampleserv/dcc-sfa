import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useDepots } from 'hooks/useDepots';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * Depot data structure
 */
interface Depot {
  id: number;
  name: string;
  code: string;
}

/**
 * Props for DepotSelect component
 */
interface DepotSelectProps {
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
  onChange?: (event: any, value: Depot | null) => void;
  /** Depot Name to search */
  nameToSearch?: string;
  /** Class name for the input */
  className?: string;
  /** Placeholder for the input */
  placeholder?: string;
}

/**
 * DepotSelect Component
 *
 * A searchable autocomplete component for selecting depots with debounced search,
 * Formik integration, and persistent selection handling.
 *
 * Features:
 * - Debounced search (300ms delay) to reduce API calls
 * - Prevents API calls when selecting from existing options
 * - Maintains selected depot visibility even when not in search results
 * - Full Formik integration with error handling
 * - Server-side filtering only (no client-side filtering)
 * - Defaults to "Depot" label and "depot_id" field name
 *
 * @param {DepotSelectProps} props - Component props
 * @returns {JSX.Element} DepotSelect component
 *
 * @example
 * ```tsx
 * // With Formik (default Depot)
 * <DepotSelect formik={formik} required />
 *
 * // With Formik (custom field)
 * <DepotSelect
 *   name="depot_id"
 *   label="Depot"
 *   formik={formik}
 *   required
 * />
 *
 * // Without Formik
 * <DepotSelect
 *   name="depot_id"
 *   label="Depot"
 *   value={depotId}
 *   setValue={setDepotId}
 *   onChange={(event, depot) => {
 *     // Handle depot selection
 *   }}
 * />
 * ```
 */
const DepotSelect: React.FC<DepotSelectProps> = ({
  name = 'depot_id',
  label = 'Depot',
  required = false,
  fullWidth = true,
  size = 'small',
  formik,
  setValue,
  value,
  nameToSearch = '',
  onChange,
  className,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedDepotData, setSelectedDepotData] = useState<Depot | null>(
    null
  );
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

  const depotId = normalizedValue ? Number(normalizedValue) : undefined;

  const { data: dropdownResponse, isLoading: isLoading } = useDepots({
    page: 1,
    limit: 50,
    search: effectiveSearch,
    isActive: 'Y',
    depot_id: depotId && !effectiveSearch ? depotId : undefined,
  });

  const searchResults: Depot[] = (dropdownResponse?.data || []).map(depot => ({
    id: depot.id,
    name: depot.name,
    code: depot.code,
  }));

  useEffect(() => {
    if (
      normalizedValue &&
      !selectedDepotData &&
      !isLoading &&
      searchResults.length > 0
    ) {
      const found = searchResults.find(
        depot => depot.id.toString() === normalizedValue
      );
      if (found) {
        setSelectedDepotData(found);
        if (!inputValue) {
          setInputValue(found.name);
        }
        setHasInitialized(true);
      }
    }
  }, [
    normalizedValue,
    selectedDepotData,
    inputValue,
    searchResults,
    isLoading,
  ]);

  const selectedDepot = React.useMemo(() => {
    if (!normalizedValue) {
      return null;
    }

    const foundInResults = searchResults.find(
      depot => depot.id.toString() === normalizedValue
    );

    if (foundInResults) {
      return foundInResults;
    }

    if (
      selectedDepotData &&
      selectedDepotData.id.toString() === normalizedValue
    ) {
      return selectedDepotData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedDepotData]);

  useEffect(() => {
    if (selectedDepot && selectedDepot !== selectedDepotData) {
      setSelectedDepotData(selectedDepot);
      if (!inputValue && selectedDepot.name) {
        setInputValue(selectedDepot.name);
      }
    } else if (!normalizedValue && selectedDepotData) {
      setSelectedDepotData(null);
      setInputValue('');
    } else if (selectedDepotData && !inputValue && normalizedValue) {
      setInputValue(selectedDepotData.name);
    }
  }, [selectedDepot, normalizedValue, selectedDepotData, inputValue]);

  useEffect(() => {
    if (!normalizedValue) {
      if (selectedDepotData || inputValue) {
        setInputValue('');
        setSelectedDepotData(null);
        setHasInitialized(false);
      }
    } else if (
      selectedDepotData &&
      selectedDepotData.id.toString() !== normalizedValue
    ) {
      setSelectedDepotData(null);
      setInputValue('');
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  const depots: Depot[] = React.useMemo(() => {
    const allDepots: Depot[] = [];

    if (selectedDepot) {
      const isSelectedInResults = searchResults.some(
        depot => depot.id === selectedDepot.id
      );

      if (!isSelectedInResults) {
        allDepots.push(selectedDepot);
      }
    }

    const seenIds = new Set<number>();
    if (selectedDepot) {
      seenIds.add(selectedDepot.id);
    }

    searchResults.forEach(depot => {
      if (!seenIds.has(depot.id)) {
        allDepots.push(depot);
        seenIds.add(depot.id);
      }
    });

    return allDepots;
  }, [searchResults, selectedDepot, normalizedValue]);

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const helperText = typeof error === 'string' ? error : undefined;

  const handleChange = useCallback(
    (event: any, newValue: Depot | null) => {
      setIsSelecting(true);
      setSelectedDepotData(newValue);

      const selectedValue = newValue ? newValue.id.toString() : '';

      if (formik) {
        formik.setFieldValue(name, selectedValue);
      } else if (setValue) {
        setValue(selectedValue);
      }

      if (onChange) {
        onChange(event, newValue);
      }

      if (newValue) {
        // Update input value to show the full selected name
        setInputValue(newValue.name);
        setSearchValue('');
        setDebouncedSearch('');
      } else {
        setInputValue('');
        setSearchValue('');
        setDebouncedSearch('');
      }

      setTimeout(() => setIsSelecting(false), 100);
    },
    [formik, name, setValue, onChange]
  );

  const handleInputChange = useCallback(
    (_event: any, newInputValue: string) => {
      setInputValue(newInputValue);
      setSearchValue(newInputValue);
    },
    []
  );

  return (
    <Autocomplete
      fullWidth={fullWidth}
      size={size}
      options={depots}
      getOptionLabel={option => option.name}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option.id}
          className="!flex !items-center !gap-2 cursor-pointer py-1 px-2 hover:!bg-gray-50"
        >
          <Avatar
            src="mkx"
            alt={option.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box>
            <p className="!text-gray-900 !text-sm">{option.name || ''}</p>
            <p className="!text-gray-500 !text-xs">{option.code}</p>
          </Box>
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={`${label + (required ? ' *' : '')}`}
          required={false}
          placeholder={placeholder}
          error={!!error}
          helperText={helperText}
          className={className}
        />
      )}
      inputValue={inputValue}
      value={selectedDepot}
      onInputChange={handleInputChange}
      onChange={handleChange}
      noOptionsText={
        debouncedSearch && !isLoading
          ? 'No depots found'
          : 'Type to search depots'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          depots...
        </span>
      }
      loading={isLoading}
      filterOptions={options => options}
    />
  );
};

export default DepotSelect;
