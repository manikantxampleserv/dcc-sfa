import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useProductsLookup } from 'hooks/useSubUnitOfMeasurement';
import type { SearchSelectOption } from 'shared/SearchSelect';

interface SubUnitProductSelectProps {
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  onChange?: (value: SearchSelectOption | null) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

/**
 * SubUnitProductSelect component for selecting products in Sub Unit of Measurement
 * Uses MUI Autocomplete with search functionality and lookup endpoint
 */
export const SubUnitProductSelect = ({
  formik,
  setValue,
  onChange,
  name = 'product_id',
  label = 'Product',
  placeholder = 'Select product...',
  fullWidth = true,
  size = 'small',
  disabled = false,
  error = false,
  helperText,
}: SubUnitProductSelectProps) => {
  const { data: products = [], isLoading } = useProductsLookup();

  // Convert products to SearchSelectOption format
  const options: SearchSelectOption[] = products.map((product: any) => ({
    value: product.id,
    label: `${product.name} (${product.code})`,
    disabled: false,
  }));

  // Get current value
  const currentValue = formik?.values[name] || '';
  const selectedOption = options.find(option => option.value === currentValue) || null;

  // Handle change
  const handleChange = (option: SearchSelectOption | null) => {
    if (formik) {
      formik.setFieldValue(name, option?.value || '');
      formik.setFieldTouched(name, true);
    }
    if (setValue) {
      setValue(option?.value || '');
    }
    if (onChange) {
      onChange(option);
    }
  };

  // Get error state
  const hasError = error || (formik?.touched[name] && Boolean(formik?.errors[name]));
  const errorMessage = helperText || (formik?.touched[name] && formik?.errors[name] as string);

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      onChange={(_, option) => handleChange(option)}
      loading={isLoading}
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={hasError}
          helperText={errorMessage}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {selectedOption && (
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '0.75rem',
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                      mr: 1,
                    }}
                  >
                    {selectedOption.label.charAt(0).toUpperCase()}
                  </Avatar>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            '& > img': { mr: 2, flexShrink: 0 },
          }}
        >
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: '0.75rem',
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              mr: 2,
            }}
          >
            {option.label.charAt(0).toUpperCase()}
          </Avatar>
          {option.label}
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.value === value?.value}
      getOptionLabel={(option) => option.label}
      noOptionsText="No products found"
      loadingText="Loading products..."
    />
  );
};

export default SubUnitProductSelect;
