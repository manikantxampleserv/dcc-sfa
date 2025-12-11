import {
  Autocomplete,
  CircularProgress,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useProductCategoriesDropdown } from 'hooks/useProductCategories';
import React, { useCallback, useEffect, useState } from 'react';

interface ProductCategory {
  id: number;
  category_name: string;
}

interface ProductCategorySelectProps {
  name?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  value?: string | number;
  onChange?: (event: any, value: ProductCategory | null) => void;
  nameToSearch?: string;
  className?: string;
  disabled?: boolean;
}

const ProductCategorySelect: React.FC<ProductCategorySelectProps> = ({
  name = 'category_id',
  label = 'Product Category',
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
  const [selectedCategoryData, setSelectedCategoryData] = useState<ProductCategory | null>(null);
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

  const categoryId = normalizedValue ? Number(normalizedValue) : undefined;

  const { data: dropdownResponse, isLoading: isLoading } = useProductCategoriesDropdown({
    search: effectiveSearch,
    category_id: categoryId && !effectiveSearch ? categoryId : undefined,
  });

  const searchResults: ProductCategory[] = (dropdownResponse?.data || []).map(category => ({
    id: category.id,
    category_name: category.category_name,
  }));

  useEffect(() => {
    if (
      normalizedValue &&
      !selectedCategoryData &&
      !isLoading &&
      searchResults.length > 0
    ) {
      const found = searchResults.find(
        category => category.id.toString() === normalizedValue
      );
      if (found) {
        setSelectedCategoryData(found);
        if (!inputValue) {
          setInputValue(found.category_name);
        }
        setHasInitialized(true);
      }
    }
  }, [normalizedValue, selectedCategoryData, inputValue, searchResults, isLoading]);

  const selectedCategory = React.useMemo(() => {
    if (!normalizedValue) {
      return null;
    }

    const foundInResults = searchResults.find(
      category => category.id.toString() === normalizedValue
    );

    if (foundInResults) {
      return foundInResults;
    }

    if (
      selectedCategoryData &&
      selectedCategoryData.id.toString() === normalizedValue
    ) {
      return selectedCategoryData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedCategoryData]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== selectedCategoryData) {
      setSelectedCategoryData(selectedCategory);
      if (!inputValue && selectedCategory.category_name) {
        setInputValue(selectedCategory.category_name);
      }
    } else if (!normalizedValue && selectedCategoryData) {
      setSelectedCategoryData(null);
      setInputValue('');
    } else if (selectedCategoryData && !inputValue && normalizedValue) {
      setInputValue(selectedCategoryData.category_name);
    }
  }, [selectedCategory, normalizedValue, selectedCategoryData, inputValue]);

  useEffect(() => {
    if (!normalizedValue) {
      if (selectedCategoryData || inputValue) {
        setInputValue('');
        setSelectedCategoryData(null);
        setHasInitialized(false);
      }
    } else if (
      selectedCategoryData &&
      selectedCategoryData.id.toString() !== normalizedValue
    ) {
      setSelectedCategoryData(null);
      setInputValue('');
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  const categories: ProductCategory[] = React.useMemo(() => {
    const allCategories: ProductCategory[] = [];

    if (selectedCategory) {
      const isSelectedInResults = searchResults.some(
        category => category.id === selectedCategory.id
      );

      if (!isSelectedInResults) {
        allCategories.push(selectedCategory);
      }
    }

    const seenIds = new Set<number>();
    if (selectedCategory) {
      seenIds.add(selectedCategory.id);
    }

    searchResults.forEach(category => {
      if (!seenIds.has(category.id)) {
        allCategories.push(category);
        seenIds.add(category.id);
      }
    });

    return allCategories;
  }, [searchResults, selectedCategory, normalizedValue]);

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const helperText = typeof error === 'string' ? error : undefined;

  const handleChange = useCallback(
    (event: any, newValue: ProductCategory | null) => {
      setIsSelecting(true);
      setSelectedCategoryData(newValue);

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
      options={categories}
      getOptionLabel={(option: ProductCategory) => option.category_name}
      value={selectedCategory}
      loading={isLoading}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(option: ProductCategory, value: ProductCategory) =>
        option.id === value.id
      }
      size={size}
      fullWidth={fullWidth}
      className={className}
      disabled={disabled}
      filterOptions={options => options}
      renderOption={(props, option: ProductCategory) => (
        <Box component="li" {...props} key={option.id}>
          <Typography>{option.category_name}</Typography>
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
          ? 'No categories found'
          : 'Type to search categories'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          categories...
        </span>
      }
    />
  );
};

export default ProductCategorySelect;

