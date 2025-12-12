/**
 * ## Select
 *
 * Custom Autocomplete select component with formik integration.
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
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
  type AutocompleteProps,
} from '@mui/material';
import React, { useMemo } from 'react';
import type { FormikProps } from 'formik';

interface Option {
  value: any;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps extends Omit<
  AutocompleteProps<any, false, false, false>,
  'options' | 'value' | 'onChange' | 'renderInput'
> {
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  onChange?: (event: any, value: any) => void;
  placeholder?: string;
  name?: string;
  label?: string;
  children?: React.ReactNode;
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
  placeholder,
  onBlur,
  onChange,
  disabled,
  ...rest
}) => {
  const options = useMemo(() => {
    if (!children) return [];
    const childrenArray = React.Children.toArray(children);
    const parsedOptions = childrenArray
      .filter((child): child is React.ReactElement => {
        if (!React.isValidElement(child)) return false;
        return child.props.value !== undefined;
      })
      .map((child: React.ReactElement) => {
        const childValue = child.props.value;
        let childLabel = '';

        const childrenProp = child.props.children;
        if (typeof childrenProp === 'string') {
          childLabel = childrenProp;
        } else if (React.isValidElement(childrenProp)) {
          childLabel =
            childrenProp.props?.children || childValue?.toString() || '';
        } else if (Array.isArray(childrenProp)) {
          childLabel =
            childrenProp
              .map((c: any) => (typeof c === 'string' ? c : ''))
              .join('') ||
            childValue?.toString() ||
            '';
        } else if (childrenProp !== null && childrenProp !== undefined) {
          childLabel = String(childrenProp);
        } else {
          childLabel = childValue?.toString() || '';
        }

        return {
          value: childValue,
          label: childLabel || childValue?.toString() || '',
          disabled: child.props.disabled || false,
        };
      })
      .filter(option => {
        return option.value !== undefined && option.value !== null;
      });

    return parsedOptions;
  }, [children]);

  const currentValue =
    value !== undefined ? value : formik?.values[name] || null;

  const selectedOption = useMemo(() => {
    if (
      currentValue === null ||
      currentValue === undefined ||
      currentValue === ''
    ) {
      return null;
    }
    const found = options.find(option => {
      if (option.value === currentValue) return true;
      if (String(option.value) === String(currentValue)) return true;
      return false;
    });
    return found || null;
  }, [currentValue, options]);

  const handleChange = (_event: any, newValue: Option | null) => {
    const newValueToSet = newValue?.value ?? null;
    if (formik) {
      formik.setFieldValue(name, newValueToSet);
    } else if (setValue) {
      setValue(newValueToSet);
    } else if (onChange) {
      const syntheticEvent = {
        target: {
          name: name,
          value: newValueToSet,
        },
      } as any;
      onChange(syntheticEvent, newValueToSet);
    }
  };

  const handleBlur = () => {
    if (formik) {
      formik.setFieldTouched(name, true);
      formik.handleBlur({ target: { name } } as any);
    }
    if (onBlur) {
      onBlur({ target: { name } } as any);
    }
  };

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const errorMessage = typeof error === 'string' ? error : undefined;

  return (
    <FormControl fullWidth={fullWidth} error={!!error}>
      <Autocomplete
        options={options}
        value={selectedOption}
        onChange={handleChange}
        onBlur={handleBlur}
        getOptionLabel={(option: Option) => {
          if (!option) return '';
          return option.label || String(option.value) || '';
        }}
        isOptionEqualToValue={(option: Option, value: Option) => {
          if (!option || !value) return false;
          return (
            option.value === value.value ||
            String(option.value) === String(value.value)
          );
        }}
        getOptionDisabled={(option: Option) => option?.disabled || false}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        openOnFocus
        selectOnFocus
        clearOnBlur={false}
        disableClearable={false}
        filterOptions={(options: Option[], state: any) => {
          if (!state.inputValue || state.inputValue.trim() === '') {
            return options;
          }
          return options.filter(option =>
            option.label.toLowerCase().includes(state.inputValue.toLowerCase())
          );
        }}
        ListboxProps={{
          style: { maxHeight: '300px' },
        }}
        PopperProps={{
          style: { zIndex: 1300 },
          placement: 'bottom-start',
        }}
        renderInput={(params: any) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={!!error}
            name={name}
            size={size}
            InputProps={{
              ...params.InputProps,
              readOnly: false,
            }}
            inputProps={{
              ...params.inputProps,
              required: false,
            }}
          />
        )}
        renderOption={(props: any, option: Option) => (
          <li {...props} key={`${option.value}-${option.label}`}>
            {option.label}
          </li>
        )}
        noOptionsText="No options available"
        {...rest}
      />
      {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
