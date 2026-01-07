/**
 * ## Input
 *
 * Custom input component with formik integration and optional visibility toggle for password fields.
 * Easy to handle when you have using formik, handles errors etc.
 *
 * @param {InputProps} props - Props for the Input component.
 *
 * #### Example
 *
 * ```js
 * import React from "react";
 * import { Input } from "react-mkx-components";
 * import { useFormik } from "formik";
 * const MyComponent = () => {
 *   const formik = useFormik({
 *     initialValues: {
 *       username: "",
 *     },
 *     onSubmit: (values) => {
 *       console.log(values);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <Input
 *         name="username"
 *         label="Username"
 *         placeholder="Enter Your Username"
 *         formik={formik}
 *       />
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */
import { Search, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, TextField, type TextFieldProps } from '@mui/material';
import { DatePicker, DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs, { type Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';
import React from 'react';

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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    if (formik) {
      formik.setFieldValue(name as string, newValue);
    } else if (setValue) {
      setValue(newValue);
    } else if (onChange) {
      onChange(event);
    }
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    const dateValue = newValue ? newValue.format('YYYY-MM-DD') : '';
    if (formik) {
      formik.setFieldValue(name as string, dateValue);
    } else if (setValue) {
      setValue(dateValue);
    } else if (onChange) {
      const syntheticEvent = {
        target: { value: dateValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    const timeValue = newValue ? newValue.format('HH:mm') : '';
    if (formik) {
      formik.setFieldValue(name as string, timeValue);
    } else if (setValue) {
      setValue(timeValue);
    }
  };

  const handleDateTimeChange = (newValue: Dayjs | null) => {
    const dateTimeValue = newValue ? newValue.format('YYYY-MM-DDTHH:mm') : '';
    if (formik) {
      formik.setFieldValue(name as string, dateTimeValue);
    } else if (setValue) {
      setValue(dateTimeValue);
    }
  };

  const error =
    formik?.touched?.[name as string] && formik?.errors?.[name as string];

  const errorMessage = typeof error === 'string' ? error : undefined;

  const currentValue = value || formik?.values[name as string];

  const dateValue =
    currentValue && dayjs(currentValue).isValid() ? dayjs(currentValue) : null;

  if (type === 'date') {
    return (
      <DatePicker
        label={label}
        value={dateValue}
        onChange={handleDateChange}
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
            disabled: rest.disabled,
            slotProps: {
              htmlInput: {
                required: false,
              },
            },
            onBlur: formik?.handleBlur || onBlur,
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
        value={dateValue}
        onChange={handleTimeChange}
        disabled={rest.disabled}
        slotProps={{
          textField: {
            fullWidth,
            size,
            error: !!error,
            helperText: errorMessage,
            name,
            disabled: rest.disabled,
            slotProps: {
              htmlInput: {
                required: false,
              },
            },
            onBlur: formik?.handleBlur || onBlur,
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
        disabled={rest.disabled}
        slotProps={{
          textField: {
            fullWidth,
            size,
            error: !!error,
            helperText: errorMessage,
            name,
            disabled: rest.disabled,
            slotProps: {
              htmlInput: {
                required: false,
              },
            },
            onBlur: formik?.handleBlur || onBlur,
            InputLabelProps: {
              shrink: true,
            },
            ...rest,
          },
        }}
      />
    );
  }

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
          style:
            type === 'file'
              ? {
                  paddingTop: '1.5rem',
                  paddingLeft: '1.5rem',
                  paddingBottom: '3rem',
                }
              : undefined,
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
      onBlur={formik?.handleBlur || onBlur}
      value={currentValue}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default Input;
