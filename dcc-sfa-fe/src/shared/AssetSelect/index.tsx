import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import type { FormikProps } from 'formik';
import {
  useAssetMaster,
  useAssetMasterById,
  type AssetMaster,
} from 'hooks/useAssetMaster';
import React, { useCallback, useEffect, useState, useRef } from 'react';

interface AssetSelectProps {
  name: string;
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  value?: string | number;
  onChange?: (event: any, value: AssetMaster | null) => void;
  nameToSearch?: string;
  placeholder?: string;
  onlyAvailable?: boolean;
}

const AssetSelect: React.FC<AssetSelectProps> = ({
  name,
  label,
  required = false,
  fullWidth = true,
  disabled = false,
  formik,
  setValue,
  value,
  nameToSearch = '',
  onChange,
  placeholder = 'Select Asset',
  onlyAvailable = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedAssetData, setSelectedAssetData] =
    useState<AssetMaster | null>(null);
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

  const assetId = normalizedValue ? Number(normalizedValue) : undefined;

  const { data: dropdownResponse, isFetching } = useAssetMaster({
    search: effectiveSearch,
    limit: 100,
    status: 'active',
    only_available: onlyAvailable,
  });

  const { data: singleAssetData, isFetching: isFetchingSingle } =
    useAssetMasterById(assetId || 0, {
      enabled: !!assetId && !effectiveSearch,
    });

  const searchResults: AssetMaster[] = React.useMemo(() => {
    const results = dropdownResponse?.data || [];
    if (
      singleAssetData &&
      !results.some((r: { id: number }) => r.id === singleAssetData.id)
    ) {
      return [singleAssetData, ...results];
    }
    return results;
  }, [dropdownResponse?.data, singleAssetData]);

  const loading = isFetching || isFetchingSingle;

  useEffect(() => {
    if (isInitializingRef.current) return;

    if (
      normalizedValue &&
      (!selectedAssetData ||
        selectedAssetData.id.toString() !== normalizedValue) &&
      !loading &&
      searchResults.length > 0
    ) {
      const found = searchResults.find(
        asset => asset.id.toString() === normalizedValue
      );
      if (found) {
        isInitializingRef.current = true;
        setSelectedAssetData(found);
        if (!inputValue || inputValue !== found.name) {
          setInputValue(found.name);
        }
        setHasInitialized(true);
        setTimeout(() => {
          isInitializingRef.current = false;
        }, 100);
      }
    }
  }, [normalizedValue, loading, searchResults, selectedAssetData, inputValue]);

  const selectedAsset = React.useMemo(() => {
    if (!normalizedValue) return null;

    const foundInResults = searchResults.find(
      asset => asset.id.toString() === normalizedValue
    );

    if (foundInResults) return foundInResults;
    if (
      selectedAssetData &&
      selectedAssetData.id.toString() === normalizedValue
    ) {
      return selectedAssetData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedAssetData]);

  useEffect(() => {
    if (!normalizedValue) {
      if (selectedAssetData || inputValue || hasInitialized) {
        setInputValue('');
        setSelectedAssetData(null);
        setHasInitialized(false);
      }
    } else if (
      selectedAssetData &&
      selectedAssetData.id.toString() !== normalizedValue
    ) {
      // If the ID changed externally (e.g. form re-initialization), reset local state
      // to allow the initialization effect to fetch and set the new asset name.
      setInputValue('');
      setSelectedAssetData(null);
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  const assets: AssetMaster[] = React.useMemo(() => {
    const allAssets: AssetMaster[] = [];

    if (selectedAsset) {
      const isSelectedInResults = searchResults.some(
        asset => asset.id === selectedAsset.id
      );
      if (!isSelectedInResults) {
        allAssets.push(selectedAsset);
      }
    }

    const seenIds = new Set<number>();
    if (selectedAsset) {
      seenIds.add(selectedAsset.id);
    }

    searchResults.forEach(asset => {
      if (!seenIds.has(asset.id)) {
        allAssets.push(asset);
        seenIds.add(asset.id);
      }
    });

    return allAssets;
  }, [searchResults, selectedAsset]);

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const helperText = typeof error === 'string' ? error : undefined;

  const handleChange = useCallback(
    (event: any, newValue: AssetMaster | null) => {
      setIsSelecting(true);
      setSelectedAssetData(newValue);

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
      options={assets}
      getOptionLabel={(option: AssetMaster) => option.name}
      value={selectedAsset}
      loading={isFetching}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option: AssetMaster, value: AssetMaster) =>
        option.id === value.id
      }
      size="small"
      fullWidth={fullWidth}
      disabled={disabled}
      filterOptions={options => options}
      renderOption={(props, option: AssetMaster) => (
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
          >
            {option.name?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Box>
            <p className="!text-gray-900 !text-sm">{option.name || ''}</p>
            {option.serial_number && (
              <p className="!text-gray-500 !text-xs">
                SN: {option.serial_number}{' '}
                {option.code ? `| Code: ${option.code}` : ''}
              </p>
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
          helperText={helperText}
          onBlur={formik?.handleBlur}
          name={name}
          size="small"
          placeholder={placeholder}
        />
      )}
      noOptionsText={
        debouncedSearch && !isFetching
          ? 'No assets found'
          : 'Type to search assets'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          assets...
        </span>
      }
    />
  );
};

export default AssetSelect;
