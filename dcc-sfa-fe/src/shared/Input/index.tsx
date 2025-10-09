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
import { IconButton, TextField, type TextFieldProps } from '@mui/material';
import React from 'react';
import type { FormikProps } from 'formik';
import { Search, Visibility, VisibilityOff } from '@mui/icons-material';

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
  const error =
    formik?.touched?.[name as string] && formik?.errors?.[name as string];

  const errorMessage = typeof error === 'string' ? error : undefined;

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
          className:
            type === 'date' || type === 'time' ? '!uppercase' : undefined,
        },
        inputLabel:
          type === 'date' || type === 'time' ? { shrink: true } : undefined,
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
      value={value || formik?.values[name as string]}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default Input;
