/**
 * ## Select
 *
 * Custom Autocomplete select component with formik integration.
 * Easy to handle when you have using formik, handles errors etc.
 *
 * @param {CustomSelectProps} props - Props for the Select component.
 */

import {
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
  type AutocompleteProps,
} from '@mui/material';
import React, { useMemo, useCallback } from 'react';
import type { FormikProps } from 'formik';

interface Option {
  value: any;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps
  extends Omit<
    AutocompleteProps<any, false, boolean, false>,
    'options' | 'onChange' | 'renderInput'
  > {
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  label?: string;
  children?: React.ReactNode;
  value?: any;
  required?: boolean;
  disableClearable?: boolean;
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
  disableClearable = false,
  ...rest
}) => {
  const options = useMemo(() => {
    if (!children) return [];
    const childrenArray = React.Children.toArray(children);
    interface MenuItemProps {
      value?: any;
      disabled?: boolean;
      children?: React.ReactNode;
    }
    const parsedOptions = childrenArray
      .filter((child): child is React.ReactElement<MenuItemProps> => {
        if (!React.isValidElement(child)) return false;
        const props = child.props as MenuItemProps;
        return props.value !== undefined;
      })
      .map((child: React.ReactElement<MenuItemProps>) => {
        const props = child.props as MenuItemProps;
        const childValue = props.value;
        let childLabel = '';

        const childrenProp = props.children;
        if (typeof childrenProp === 'string') {
          childLabel = childrenProp;
        } else if (React.isValidElement(childrenProp)) {
          const nestedProps = childrenProp.props as MenuItemProps;
          childLabel =
            (typeof nestedProps?.children === 'string'
              ? nestedProps.children
              : nestedProps?.children?.toString()) ||
            childValue?.toString() ||
            '';
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
          disabled: props.disabled || false,
        };
      })
      .filter(option => {
        return option.value !== undefined && option.value !== null;
      });

    return parsedOptions;
  }, [children]);

  // FIXED: Extract only the specific field value instead of watching entire formik object
  const currentValue = useMemo(() => {
    if (value !== undefined) return value;
    if (formik && name) return formik.values[name] || null;
    return null;
  }, [value, formik?.values[name], name]); // Only watch the specific field

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

  // FIXED: Use useCallback to memoize handlers
  const handleChange = useCallback(
    (_event: any, newValue: Option | null) => {
      const newValueToSet = newValue?.value ?? null;
      if (formik && name) {
        formik.setFieldValue(name, newValueToSet);
      } else if (setValue) {
        setValue(newValueToSet);
      } else if (onChange) {
        const syntheticEvent = {
          target: {
            name: name,
            value: newValueToSet,
          },
          currentTarget: {
            name: name,
            value: newValueToSet,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    },
    [formik, name, setValue, onChange]
  ); // FIXED: Proper dependencies

  const handleBlur = useCallback(() => {
    if (formik && name) {
      formik.setFieldTouched(name, true);
      formik.handleBlur({ target: { name } } as any);
    }
    if (onBlur) {
      onBlur({ target: { name } } as any);
    }
  }, [formik, name, onBlur]); // FIXED: Proper dependencies

  // FIXED: Extract error state without watching entire formik
  const error = useMemo(() => {
    if (!formik || !name) return false;
    return formik.touched?.[name] && formik.errors?.[name];
  }, [formik?.touched?.[name], formik?.errors?.[name], name]);

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
        disableClearable={disableClearable ? true : false}
        filterOptions={(options: Option[], state: any) => {
          if (!state.inputValue || state.inputValue.trim() === '') {
            return options;
          }
          return options.filter(option =>
            option.label.toLowerCase().includes(state.inputValue.toLowerCase())
          );
        }}
        sx={{ minWidth: '160px' }}
        slotProps={{
          popper: {
            style: { zIndex: 1300 },
            placement: 'bottom-start',
          },
          listbox: {
            style: { maxHeight: '300px' },
          },
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
            sx={{ minWidth: '160px' }}
            slotProps={{
              input: {
                ...params.InputProps,
                readOnly: false,
              },
              htmlInput: {
                ...params.inputProps,
                required: false,
              },
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
