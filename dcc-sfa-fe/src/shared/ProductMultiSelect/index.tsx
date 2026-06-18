import { Autocomplete, Box, TextField } from '@mui/material';
import type { FormikProps } from 'formik';
import { useProductsDropdown } from 'hooks/useProducts';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchProductsDropdown } from 'services/masters/Products';

interface Product {
  id: number;
  name: string;
  code: string;
}

interface ProductMultiSelectProps {
  name: string;
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  formik?: FormikProps<any>;
  className?: string;
  disabled?: boolean;
}

const ProductMultiSelect: React.FC<ProductMultiSelectProps> = ({
  name,
  label,
  required = false,
  fullWidth = true,
  size = 'small',
  formik,
  className,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cachedSelectedProducts, setCachedSelectedProducts] = useState<
    Product[]
  >([]);
  const attemptedFetchIds = useRef<Set<number>>(new Set());

  const currentValue = formik?.values[name] || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: dropdownResponse, isFetching } = useProductsDropdown({
    search: debouncedSearch,
  });

  const searchResults: Product[] = (dropdownResponse?.data || []).map(
    (p: any) => ({
      id: p.id,
      name: p.name,
      code: p.code,
    })
  );

  // Capture selections from the search results to keep their name/code cached even when query changes
  useEffect(() => {
    if (searchResults.length > 0) {
      setCachedSelectedProducts(prev => {
        const newItems = searchResults.filter(p => currentValue.includes(p.id));
        const merged = [...prev];
        newItems.forEach(item => {
          if (!merged.some(m => m.id === item.id)) {
            merged.push(item);
          }
        });
        return merged;
      });
    }
  }, [searchResults, currentValue]);

  // Fetch product names/codes for any selected IDs not present in current search results or cached list
  useEffect(() => {
    const missingIds = currentValue.filter(
      (id: number) =>
        !cachedSelectedProducts.some(p => p.id === id) &&
        !searchResults.some(p => p.id === id) &&
        !attemptedFetchIds.current.has(id)
    );
    if (missingIds.length > 0) {
      missingIds.forEach(async (id: number) => {
        attemptedFetchIds.current.add(id);
        try {
          const res = await fetchProductsDropdown({ product_id: id });
          if (res.data && res.data.length > 0) {
            const p = res.data[0];
            setCachedSelectedProducts(prev => {
              if (prev.some(m => m.id === p.id)) return prev;
              return [...prev, { id: p.id, name: p.name, code: p.code }];
            });
          }
        } catch (err) {
          console.error('Error fetching selected product details:', err);
        }
      });
    }
  }, [currentValue, cachedSelectedProducts, searchResults]);

  const selectedProducts = useMemo(() => {
    const combined = [...searchResults, ...cachedSelectedProducts];
    const seen = new Set<number>();
    return combined.filter(p => {
      if (currentValue.includes(p.id) && !seen.has(p.id)) {
        seen.add(p.id);
        return true;
      }
      return false;
    });
  }, [searchResults, cachedSelectedProducts, currentValue]);

  const autocompleteOptions = useMemo(() => {
    const combined = [...searchResults, ...selectedProducts];
    const seen = new Set<number>();
    return combined.filter(p => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        return true;
      }
      return false;
    });
  }, [searchResults, selectedProducts]);

  const handleChange = (_event: any, newValue: Product[]) => {
    setInputValue('');
    if (formik) {
      formik.setFieldValue(
        name,
        newValue.map(v => v.id)
      );
    }
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      filterOptions={x => x}
      options={autocompleteOptions}
      getOptionLabel={(option: Product) => option.name}
      value={selectedProducts}
      loading={isFetching}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_e, val, reason) => {
        if (reason === 'input') {
          setInputValue(val);
        } else if (reason === 'clear') {
          setInputValue('');
        }
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      size={size}
      fullWidth={fullWidth}
      className={className}
      disabled={disabled}
      renderOption={(props, option: Product) => (
        <li {...props} key={option.id}>
          <Box>
            <span className="!block !text-sm !text-gray-900">
              {option.name}
            </span>
            <span className="!block !text-xs !text-gray-500">
              {option.code}
            </span>
          </Box>
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          required={required}
          name={name}
          size={size}
          error={formik?.touched[name] && Boolean(formik?.errors[name])}
          helperText={formik?.touched[name] && (formik?.errors[name] as string)}
        />
      )}
    />
  );
};

export default ProductMultiSelect;
