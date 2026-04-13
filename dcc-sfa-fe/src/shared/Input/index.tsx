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
  compact?: boolean;
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
  compact = false,
  sx: propsSx,
  ...rest
}) => {
  const [isVisible, setIsVisible] = React.useState<{ [key: string]: boolean }>({
    [name || '']: false,
  });

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
  );

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

  const error = useMemo(() => {
    if (!formik || !name) return false;
    return formik.touched?.[name as string] && formik.errors?.[name as string];
  }, [
    formik?.touched?.[name as string],
    formik?.errors?.[name as string],
    name,
  ]);

  const errorMessage = typeof error === 'string' ? error : undefined;

  const currentValue = useMemo(() => {
    if (value !== undefined) return value;
    if (formik && name) return formik.values[name as string];
    return '';
  }, [value, formik?.values[name as string], name]);

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

  const compactSx = useMemo(
    () => ({
      ...(compact && {
        '& .MuiInputBase-root': {
          height: '28px !important',
          minHeight: '28px !important',
          fontSize: '0.75rem',
          paddingRight: '4px !important',
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          fontFamily: "'Poppins', sans-serif !important",
        },
        '& .MuiInputBase-input': {
          padding: '0px 8px !important',
          height: '28px !important',
          lineHeight: '28px !important',
          boxSizing: 'border-box',
          fontSize: '0.75rem',
          fontFamily: "'Poppins', sans-serif !important",
        },
        '& .MuiOutlinedInput-root': {
          height: '28px !important',
          minHeight: '28px !important',
          paddingRight: '4px !important',
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
          },
        },
        '& .MuiOutlinedInput-input': {
          padding: '0px 8px !important',
          height: '28px !important',
          lineHeight: '28px !important',
          boxSizing: 'border-box',
        },
        '& .MuiInputAdornment-root': {
          margin: 0,
          height: '28px !important',
          maxHeight: '28px !important',
          display: 'flex',
          alignItems: 'center',
          padding: '0 5px !important',
          '& .MuiIconButton-root': {
            padding: '2px !important',
            '& .MuiSvgIcon-root': {
              fontSize: '1rem !important',
            },
          },
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.75rem',
          transform: 'translate(14px, 5px) scale(1)',
          fontFamily: "'Poppins', sans-serif !important",
        },
        '& .MuiInputLabel-shrink': {
          transform: 'translate(14px, -8px) scale(0.75)',
        },
        // Targeting DatePicker sections container from inspector
        '& .MuiPickersInputBase-sectionsContainer': {
          padding: '0 !important',
          paddingTop: '1px !important',
          display: 'flex !important',
          flexWrap: 'nowrap !important',
          overflow: 'hidden !important',
          alignItems: 'center !important',
          width: '111px !important',
        },
        '& .MuiPickersSectionList-root': {
          padding: '0 !important',
          width: '111px !important',
        },
        '& .MuiPickersSectionList-section': {
          fontSize: '14px !important',
          display: 'inline-block !important',
          whiteSpace: 'nowrap !important',
        },
        '& .MuiPickersInputBase-section': {
          fontSize: '14px !important',
          display: 'inline-block !important',
          whiteSpace: 'nowrap !important',
        },
      }),
      ...propsSx,
    }),
    [compact, propsSx]
  );

  if (type === 'year') {
    return (
      <DatePicker
        label={label}
        value={dateValue}
        onChange={handleDateChange}
        views={['year']}
        format="YYYY"
        disabled={rest.disabled}
        sx={compactSx}
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
              ...slotProps,
            },
            InputLabelProps: {
              shrink: true,
            },
            className: rest.className,
            ...rest,
            sx: compactSx,
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
        format="DD/MM/YYYY"
        disabled={rest.disabled}
        sx={compactSx}
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
              ...slotProps,
            },
            InputLabelProps: {
              shrink: true,
            },
            className: rest.className,
            ...rest,
            sx: compactSx,
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
        disabled={rest.disabled}
        sx={compactSx}
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
              ...slotProps,
            },
            InputLabelProps: {
              shrink: true,
            },
            ...rest,
            sx: compactSx,
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
        sx={compactSx}
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
              ...slotProps,
            },
            InputLabelProps: {
              shrink: true,
            },
            ...rest,
            sx: compactSx,
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
      sx={compactSx}
      {...rest}
    />
  );
};

export default Input;
