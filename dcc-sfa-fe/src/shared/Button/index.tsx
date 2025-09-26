import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import type {
  ButtonProps as MuiButtonProps,
  SxProps,
  Theme,
} from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  children: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  sx?: SxProps<Theme>;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  loadingText,
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  sx,
  className,
  ...rest
}) => {
  return (
    <MuiButton
      disableElevation
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : startIcon
      }
      endIcon={!loading ? endIcon : undefined}
      onClick={onClick}
      type={type}
      sx={sx}
      className={className}
      {...rest}
    >
      {loading && loadingText ? loadingText : children}
    </MuiButton>
  );
};

export const PrimaryButton: React.FC<
  Omit<ButtonProps, 'color' | 'variant'>
> = props => <Button color="primary" variant="contained" {...props} />;

export const SecondaryButton: React.FC<
  Omit<ButtonProps, 'color' | 'variant'>
> = props => <Button color="secondary" variant="outlined" {...props} />;

export const ErrorButton: React.FC<
  Omit<ButtonProps, 'color' | 'variant'>
> = props => <Button color="error" variant="contained" {...props} />;

export const SuccessButton: React.FC<
  Omit<ButtonProps, 'color' | 'variant'>
> = props => <Button color="success" variant="contained" {...props} />;

export const TextButton: React.FC<Omit<ButtonProps, 'variant'>> = props => (
  <Button variant="text" {...props} />
);

export const OutlinedButton: React.FC<Omit<ButtonProps, 'variant'>> = props => (
  <Button variant="outlined" {...props} />
);

export default Button;
