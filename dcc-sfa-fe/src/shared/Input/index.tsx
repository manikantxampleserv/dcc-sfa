/**
 * ## Input
 *
 * Custom input component with formik integration and optional visibility toggle for password fields.
 * Supports text, number, email, password, search, date, time, datetime-local, and year types.
 * Easy to handle when you have using formik, handles errors etc.
 *
 * @param {InputProps} props - Props for Input component.
 */
import { Search, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, TextField, type TextFieldProps } from '@mui/material';
import { DatePicker, DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs, { type Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';
import React, { useMemo, useCallback } from 'react';

interface InputProps extends Omit<TextFieldProps, 'onChange'> {
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  setValue,
  name,
  formik,
  size = 'small',
  onBlur,
  fullWidth = true,
  slotProps,
  label,
  ...rest
}) => {
  const [isVisible, setIsVisible] = React.useState<{ [key: string]: boolean }>({
    [name || '']: false,
  });

  // FIXED: Use useCallback to memoize handlers
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      if (formik && name) {
        formik.setFieldValue(name as string, newValue);
      } else if (setValue) {
        setValue(newValue);
      } else if (onChange) {
        onChange(event);
      }
    },
    [formik, name, setValue, onChange]
  ); // FIXED: Proper dependencies

  const handleDateChange = useCallback(
    (newValue: Dayjs | null) => {
      const dateValue = newValue ? newValue.format('YYYY-MM-DD') : '';
      if (formik && name) {
        formik.setFieldValue(name as string, dateValue);
      } else if (setValue) {
        setValue(dateValue);
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: dateValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    },
    [formik, name, setValue, onChange]
  );

  const handleTimeChange = useCallback(
    (newValue: Dayjs | null) => {
      const timeValue = newValue ? newValue.format('HH:mm') : '';
      if (formik && name) {
        formik.setFieldValue(name as string, timeValue);
      } else if (setValue) {
        setValue(timeValue);
      }
    },
    [formik, name, setValue]
  );

  const handleDateBlur = useCallback(() => {
    const syntheticEvent = {
      target: {
        name: name,
        id: name,
      },
    } as React.FocusEvent<HTMLInputElement>;

    if (formik?.handleBlur && name) {
      formik.handleBlur(syntheticEvent);
    } else if (onBlur) {
      onBlur(syntheticEvent);
    }
  }, [formik, name, onBlur]);

  const handleDateTimeChange = useCallback(
    (newValue: Dayjs | null) => {
      const dateTimeValue = newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '';
      if (formik && name) {
        formik.setFieldValue(name as string, dateTimeValue);
      } else if (setValue) {
        setValue(dateTimeValue);
      }
    },
    [formik, name, setValue]
  );

  // FIXED: Extract error state without watching entire formik
  const error = useMemo(() => {
    if (!formik || !name) return false;
    return formik.touched?.[name as string] && formik.errors?.[name as string];
  }, [
    formik?.touched?.[name as string],
    formik?.errors?.[name as string],
    name,
  ]);

  const errorMessage = typeof error === 'string' ? error : undefined;

  // FIXED: Extract only the specific field value instead of watching entire formik object
  const currentValue = useMemo(() => {
    if (value !== undefined) return value;
    if (formik && name) return formik.values[name as string];
    return '';
  }, [value, formik?.values[name as string], name]); // Only watch the specific field

  const dateValue = useMemo(
    () =>
      currentValue && dayjs(currentValue).isValid()
        ? dayjs(currentValue)
        : null,
    [currentValue]
  );

  const timeValue = useMemo(
    () =>
      currentValue &&
      typeof currentValue === 'string' &&
      currentValue.includes(':')
        ? dayjs(currentValue, 'HH:mm')
        : null,
    [currentValue]
  );

  if (type === 'year') {
    return (
      <DatePicker
        label={label}
        value={dateValue}
        onChange={handleDateChange}
        onClose={handleDateBlur}
        views={['year']}
        format="YYYY"
        disabled={rest.disabled}
        slotProps={{
          desktopPaper: {
            elevation: 0,
            className: '!shadow-lg',
          },
          textField: {
            fullWidth,
            size,
            error: !!error,
            helperText: errorMessage,
            name,
            id: name,
            disabled: rest.disabled,
            slotProps: {
              htmlInput: {
                required: false,
              },
            },
            InputLabelProps: {
              shrink: true,
            },
            className: rest.className,
            ...rest,
          },
        }}
      />
    );
  }

  if (type === 'date') {
    return (
      <DatePicker
        label={label}
        value={dateValue}
        onChange={handleDateChange}
        onClose={handleDateBlur}
        format="DD/MM/YYYY"
        disabled={rest.disabled}
        slotProps={{
          desktopPaper: {
            elevation: 0,
            className: '!shadow-lg',
          },
          textField: {
            fullWidth,
            size,
            error: !!error,
            helperText: errorMessage,
            name,
            id: name,
            disabled: rest.disabled,
            slotProps: {
              htmlInput: {
                required: false,
              },
            },
            InputLabelProps: {
              shrink: true,
            },
            className: rest.className,
            ...rest,
          },
        }}
      />
    );
  }

  if (type === 'time') {
    return (
      <TimePicker
        label={label}
        value={timeValue}
        onChange={handleTimeChange}
        onClose={handleDateBlur}
        disabled={rest.disabled}
        slotProps={{
          textField: {
            fullWidth,
            size,
            error: !!error,
            helperText: errorMessage,
            name,
            id: name,
            disabled: rest.disabled,
            slotProps: {
              htmlInput: {
                required: false,
              },
            },
            InputLabelProps: {
              shrink: true,
            },
            ...rest,
          },
        }}
      />
    );
  }

  if (type === 'datetime-local') {
    return (
      <DateTimePicker
        label={label}
        value={dateValue}
        onChange={handleDateTimeChange}
        onClose={handleDateBlur}
        disabled={rest.disabled}
        slotProps={{
          textField: {
            fullWidth,
            size,
            error: !!error,
            helperText: errorMessage,
            name,
            id: name,
            disabled: rest.disabled,
            slotProps: {
              htmlInput: {
                required: false,
              },
            },
            InputLabelProps: {
              shrink: true,
            },
            ...rest,
          },
        }}
      />
    );
  }

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (formik?.handleBlur) {
        formik.handleBlur(e);
      }
      if (onBlur) {
        onBlur(e);
      }
    },
    [formik, onBlur]
  );

  return (
    <TextField
      fullWidth={fullWidth}
      type={
        type !== 'password'
          ? type
          : isVisible[name as string]
            ? 'text'
            : 'password'
      }
      label={label}
      size={size}
      name={name}
      slotProps={{
        htmlInput: {
          required: false,
        },
        input: {
          ...(type === 'search' && {
            endAdornment: <Search />,
          }),
          ...(type === 'password' && {
            endAdornment: (
              <IconButton
                size="small"
                onClick={() =>
                  setIsVisible({ [name || '']: !isVisible[name as string] })
                }
              >
                {isVisible[name as string] ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }),
        },
        ...slotProps,
      }}
      helperText={errorMessage}
      error={!!error}
      onBlur={handleBlur}
      value={currentValue}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default Input;
