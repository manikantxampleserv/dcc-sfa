/**
 * ## Select
 *
 * Custom select component with formik integration.
 * Easy to handle when you have using formik, handles errors etc.
 *
 * @param {CustomSelectProps} props - Props for the Select component.
 *
 * #### Example
 *
 * ```ts
 *import { Button, MenuItem } from '@mui/material'
 *import { useFormik } from 'formik'
 *import React from 'react'
 *import Select from 'react-mkx-components'
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
 *  return (
 *    <form onSubmit={formik.handleSubmit}>
 *      <Select
 *        name="value"
 *        className="w-72"
 *        label="Test"
 *        formik={formik}
 *      >
 *        <MenuItem value="Item 1">Item 1</MenuItem>
 *        <MenuItem value="Item 2">Item 2</MenuItem>
 *        <MenuItem value="Item 3">Item 3</MenuItem>
 *        <MenuItem value="Item 4">Item 4</MenuItem>
 *        <MenuItem value="Item 5">Item 5</MenuItem>
 *      </Select>
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
  FormControl,
  FormHelperText,
  InputLabel,
  Select as MuiSelect,
  type SelectProps as MuiSelectProps,
  type SelectChangeEvent,
} from '@mui/material';
import React from 'react';
import type { FormikProps } from 'formik';

interface CustomSelectProps extends Omit<MuiSelectProps, 'onChange'> {
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  onChange?: (event: SelectChangeEvent<any>) => void;
}

const Select: React.FC<CustomSelectProps> = ({
  formik,
  name = '',
  size = 'small',
  setValue,
  label,
  value,
  required,
  children,
  fullWidth = false,
  onBlur,
  onChange,
  ...rest
}) => {
  const handleChange = (event: SelectChangeEvent<any>) => {
    const newValue = event.target.value;
    if (formik) {
      formik.setFieldValue(name, newValue);
    } else if (setValue) {
      setValue(newValue);
    } else if (onChange) {
      onChange(event);
    }
  };

  const error = formik?.touched?.[name] && formik?.errors?.[name];

  // Convert error to string for helperText (only strings are valid ReactNode for helperText)
  const errorMessage = typeof error === 'string' ? error : undefined;

  return (
    <FormControl fullWidth={fullWidth} error={!!error}>
      <InputLabel id={`${name}-label`} size={size} required={required}>
        {label}
      </InputLabel>
      <MuiSelect
        fullWidth={fullWidth}
        labelId={`${name}-label`}
        name={name}
        required={required}
        size={size}
        slotProps={{
          input: {
            required: false,
          },
        }}
        onBlur={formik?.handleBlur || onBlur}
        value={value || formik?.values[name] || ''}
        label={label}
        onChange={handleChange}
        {...rest}
      >
        {children}
      </MuiSelect>
      {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
