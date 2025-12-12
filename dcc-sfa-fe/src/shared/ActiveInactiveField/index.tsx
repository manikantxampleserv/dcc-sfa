import {
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
} from '@mui/material';
import type { FormikProps } from 'formik';
import React from 'react';
import CustomRadio from 'shared/CustomRadio';

interface ActiveInactiveFieldProps {
  formik?: FormikProps<any>;
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * ## ActiveInactiveField
 *
 * Custom form field component for selecting Active/Inactive status using radio buttons.
 * Integrates with Formik for form management and validation, or can be used standalone.
 * Uses CustomRadio component for consistent styling with project theme.
 *
 * @param {ActiveInactiveFieldProps} props - Props for the ActiveInactiveField component.
 *
 * #### Example with Formik
 *
 * ```tsx
 * import React from "react";
 * import { useFormik } from "formik";
 * import ActiveInactiveField from "shared/ActiveInactiveField";
 *
 * const MyComponent = () => {
 *   const formik = useFormik({
 *     initialValues: {
 *       is_active: "Y",
 *     },
 *     onSubmit: (values) => {
 *       console.log(values);
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={formik.handleSubmit}>
 *       <ActiveInactiveField
 *         name="is_active"
 *         label="Status"
 *         formik={formik}
 *         required
 *       />
 *     </form>
 *   );
 * };
 * ```
 *
 * #### Example without Formik
 *
 * ```tsx
 * import React, { useState } from "react";
 * import ActiveInactiveField from "shared/ActiveInactiveField";
 *
 * const MyComponent = () => {
 *   const [status, setStatus] = useState("Y");
 *
 *   return (
 *     <ActiveInactiveField
 *       name="is_active"
 *       label="Status"
 *       value={status}
 *       onChange={setStatus}
 *       required
 *     />
 *   );
 * };
 * ```
 */

const ActiveInactiveField: React.FC<ActiveInactiveFieldProps> = ({
  formik,
  name,
  label = 'Status',
  required = false,
  className = '',
  disabled = false,
  value,
  onChange,
}) => {
  const currentValue =
    value !== undefined ? value : formik?.values?.[name] || 'Y';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (formik) {
      formik.setFieldValue(name, newValue);
    } else if (onChange) {
      onChange(newValue);
    }
  };

  const error = formik?.touched?.[name] && formik?.errors?.[name];

  const errorMessage = typeof error === 'string' ? error : undefined;

  return (
    <FormControl
      component="fieldset"
      className={`!mt-2 ${className}`}
      error={!!error}
      disabled={disabled}
    >
      <FormLabel
        component="legend"
        className="!text-gray-700 !mb-2 !text-sm !font-medium"
      >
        {label}
        {required && <span className="!text-red-500"> *</span>}
      </FormLabel>
      <RadioGroup
        row
        name={name}
        value={currentValue}
        onChange={handleChange}
        className="!gap-4"
      >
        <FormControlLabel
          value="Y"
          control={<CustomRadio />}
          label="Active"
          disabled={disabled}
        />
        <FormControlLabel
          value="N"
          control={<CustomRadio />}
          label="Inactive"
          disabled={disabled}
        />
      </RadioGroup>
      {errorMessage && (
        <span className="!text-red-500 !text-xs !mt-1 !ml-2">
          {errorMessage}
        </span>
      )}
    </FormControl>
  );
};

export default ActiveInactiveField;
