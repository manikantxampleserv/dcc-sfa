import {
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
} from '@mui/material';
import type { FormikProps } from 'formik';
import React from 'react';
import CustomRadio from 'shared/CustomRadio';

interface YesNoFieldProps {
  formik?: FormikProps<any>;
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const YesNoField: React.FC<YesNoFieldProps> = ({
  formik,
  name,
  label = 'Select Option',
  required = false,
  className = '',
  disabled = false,
  value,
  onChange,
}) => {
  const currentValue =
    value !== undefined ? value : formik?.values?.[name] || 'N';

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
      className={`${className}`}
      error={!!error}
      disabled={disabled}
    >
      <FormLabel
        component="legend"
        className="!text-gray-700 !text-sm !font-medium"
      >
        {label}
        {required && <span> *</span>}
      </FormLabel>
      <RadioGroup
        row
        name={name}
        value={currentValue}
        onChange={handleChange}
        className="!gap-4 pl-1"
      >
        <FormControlLabel
          value="Y"
          control={<CustomRadio />}
          label="Yes"
          disabled={disabled}
        />
        <FormControlLabel
          value="N"
          control={<CustomRadio />}
          label="No"
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

export default YesNoField;
