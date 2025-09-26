/**
 * ## SearchSelect
 *
 * Custom searchable select component with formik integration using MUI Autocomplete.
 * Easy to handle when you have using formik, handles errors etc.
 *
 * @param {SearchSelectProps} props - Props for the SearchSelect component.
 *
 * #### Example
 *
 * ```ts
 *import { Button } from '@mui/material'
 *import { useFormik } from 'formik'
 *import React from 'react'
 *import SearchSelect from 'shared/SearchSelect'
 *import * as Yup from 'yup'
 *
 *const MyComponent: React.FC = () => {
 *  const formik = useFormik({
 *    initialValues: {
 *      value: '',
 *    },
 *    validationSchema: Yup.object({
 *      value: Yup.string().required(),
 *    }),
 *    onSubmit: (values) => {
 *      console.log(values)
 *    },
 *  })
 *
 *  const options = [
 *    { value: 'item1', label: 'Item 1' },
 *    { value: 'item2', label: 'Item 2' },
 *    { value: 'item3', label: 'Item 3' },
 *    { value: 'item4', label: 'Item 4' },
 *    { value: 'item5', label: 'Item 5' },
 *  ];
 *
 *  return (
 *    <form onSubmit={formik.handleSubmit}>
 *      <SearchSelect
 *        name="value"
 *        label="Test"
 *        formik={formik}
 *        options={options}
 *        placeholder="Search and select..."
 *      />
 *      <Button type="submit">Submit</Button>
 *    </form>
 *  )
 *}
 *
 *export default MyComponent
 *
 * ```
 */

import {
  Autocomplete,
  FormControl,
  FormHelperText,
  type AutocompleteProps,
} from '@mui/material';
import type { FormikProps } from 'formik';
import React from 'react';
import Input from 'shared/Input';

export interface SearchSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SearchSelectProps
  extends Omit<
    AutocompleteProps<SearchSelectOption, false, false, false>,
    'options' | 'renderInput' | 'value' | 'onChange' | 'onBlur'
  > {
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  onChange?: (value: SearchSelectOption | null) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  options: SearchSelectOption[];
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  formik,
  name = '',
  label,
  placeholder = 'Search...',
  options = [],
  setValue,
  onChange,
  onBlur,
  fullWidth = true,
  size = 'small',
  error: externalError,
  helperText: externalHelperText,
  ...rest
}) => {
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: SearchSelectOption | null
  ) => {
    const value = newValue?.value || '';

    if (formik) {
      formik.setFieldValue(name, value);
    } else if (setValue) {
      setValue(value);
    } else if (onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (formik) {
      formik.setFieldTouched(name, true);
      formik.handleBlur(event);
    } else if (onBlur) {
      onBlur(event);
    }
  };

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const errorMessage = typeof error === 'string' ? error : undefined;

  // Find the selected option based on current value
  const currentValue = formik?.values[name] || '';
  const selectedOption =
    options.find(option => option.value === currentValue) || null;

  const hasError = !!(externalError || errorMessage);
  const displayHelperText = externalHelperText || errorMessage;

  return (
    <FormControl fullWidth={fullWidth} error={hasError}>
      <Autocomplete
        options={options}
        value={selectedOption}
        onChange={handleChange}
        onBlur={handleBlur}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionDisabled={option => option.disabled || false}
        renderInput={params => (
          <Input
            {...params}
            label={label}
            placeholder={placeholder}
            size={size}
            error={hasError}
            name={name}
          />
        )}
        size={size}
        fullWidth={fullWidth}
        {...rest}
      />
      {displayHelperText && (
        <FormHelperText>{displayHelperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default SearchSelect;
