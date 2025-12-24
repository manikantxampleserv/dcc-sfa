import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useProductsDropdown } from 'hooks/useProducts';
import React, { useCallback, useEffect, useState, useRef } from 'react';

interface Product {
  id: number;
  name: string;
  code: string;
  batch_lot?: {
    id: number;
    batch_number: string;
    lot_number: string;
  };
}

interface ProductSelectProps {
  name?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  value?: string | number;
  onChange?: (event: any, value: Product | null) => void;
  nameToSearch?: string;
  className?: string;
  disabled?: boolean;
}

const ProductSelect: React.FC<ProductSelectProps> = ({
  name = 'product_id',
  label = 'Product',
  required = false,
  fullWidth = true,
  size = 'small',
  formik,
  setValue,
  value,
  nameToSearch = '',
  onChange,
  className,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedProductData, setSelectedProductData] =
    useState<Product | null>(null);
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

  const productId = normalizedValue ? Number(normalizedValue) : undefined;

  const { data: dropdownResponse, isLoading } = useProductsDropdown({
    search: effectiveSearch,
    product_id: productId && !effectiveSearch ? productId : undefined,
  });

  const searchResults: Product[] = (dropdownResponse?.data || []).map(
    product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      batch_lot: product.batch_lot,
    })
  );

  // Initialize selected product from search results - FIXED to prevent loops
  useEffect(() => {
    if (isInitializingRef.current) return;

    if (
      normalizedValue &&
      !selectedProductData &&
      !isLoading &&
      searchResults.length > 0
    ) {
      const found = searchResults.find(
        product => product.id.toString() === normalizedValue
      );
      if (found) {
        isInitializingRef.current = true;
        setSelectedProductData(found);
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

  // Get selected product from state or search results
  const selectedProduct = React.useMemo(() => {
    if (!normalizedValue) return null;

    const foundInResults = searchResults.find(
      product => product.id.toString() === normalizedValue
    );

    if (foundInResults) return foundInResults;
    if (
      selectedProductData &&
      selectedProductData.id.toString() === normalizedValue
    ) {
      return selectedProductData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedProductData]);

  // Reset when value is cleared - SIMPLIFIED to prevent loops
  useEffect(() => {
    if (!normalizedValue && (selectedProductData || inputValue)) {
      setInputValue('');
      setSelectedProductData(null);
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  // Combine selected product with search results
  const products: Product[] = React.useMemo(() => {
    const allProducts: Product[] = [];

    if (selectedProduct) {
      const isSelectedInResults = searchResults.some(
        product => product.id === selectedProduct.id
      );
      if (!isSelectedInResults) {
        allProducts.push(selectedProduct);
      }
    }

    const seenIds = new Set<number>();
    if (selectedProduct) {
      seenIds.add(selectedProduct.id);
    }

    searchResults.forEach(product => {
      if (!seenIds.has(product.id)) {
        allProducts.push(product);
        seenIds.add(product.id);
      }
    });

    return allProducts;
  }, [searchResults, selectedProduct]);

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const helperText = typeof error === 'string' ? error : undefined;

  const handleChange = useCallback(
    (event: any, newValue: Product | null) => {
      setIsSelecting(true);
      setSelectedProductData(newValue);

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
      options={products}
      getOptionLabel={(option: Product) => option.name}
      value={selectedProduct}
      loading={isLoading}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option: Product, value: Product) =>
        option.id === value.id
      }
      size={size}
      fullWidth={fullWidth}
      className={className}
      disabled={disabled}
      filterOptions={options => options}
      renderOption={(props, option: Product) => (
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
          label={label}
          required={required}
          error={!!error}
          helperText={helperText}
          onBlur={formik?.handleBlur}
          name={name}
          size={size}
          className={className}
          disabled={disabled}
        />
      )}
      noOptionsText={
        debouncedSearch && !isLoading
          ? 'No products found'
          : 'Type to search products'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          products...
        </span>
      }
    />
  );
};

export default ProductSelect;
