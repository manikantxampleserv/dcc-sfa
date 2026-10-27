/**
 * ## CustomerSelectCell
 *
 * Compact customer autocomplete select component tailored for table rows.
 * Supports server-side search across all customers, initial dropdown list,
 * and clean clearing without re-filling "None".
 *
 * @param {CustomerSelectCellProps} props - Props for CustomerSelectCell component.
 */

import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useCustomersDropdown } from 'hooks/useCustomers';
import React, { useEffect, useMemo, useState } from 'react';
import type { CustomerDropdown } from 'services/masters/Customers';

export interface CustomerOption {
  id: number;
  name: string;
  code?: string;
}

interface CustomerSelectCellProps {
  value?: number | string | null;
  selectedCustomer?: CustomerOption | null;
  onChange: (customer: CustomerOption | null) => void;
  depotId?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Extract a clean avatar initial ignoring special characters
 * Accepts the first alphanumeric character (letter or number), skipping special characters
 * @param name - Customer name
 * @returns Single uppercase letter or digit
 */
const getAvatarInitial = (name?: string): string => {
  if (!name) return 'C';
  const match = name.match(/[a-zA-Z0-9]/);
  return match ? match[0].toUpperCase() : 'C';
};

const CustomerSelectCell: React.FC<CustomerSelectCellProps> = ({
  value,
  selectedCustomer,
  onChange,
  depotId,
  disabled = false,
  placeholder = 'Select customer',
  className = '!min-w-44',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolvedCustomer, setResolvedCustomer] =
    useState<CustomerOption | null>(selectedCustomer || null);

  useEffect(() => {
    if (selectedCustomer) {
      setResolvedCustomer(selectedCustomer);
    } else if (!value) {
      setResolvedCustomer(null);
    }
  }, [selectedCustomer, value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue]);

  const customerIdToFetch =
    value &&
    (!resolvedCustomer || String(resolvedCustomer.id) !== String(value))
      ? Number(value)
      : undefined;

  const { data: singleCustomerResponse } = useCustomersDropdown(
    { customer_id: customerIdToFetch },
    { enabled: Boolean(customerIdToFetch) }
  );

  useEffect(() => {
    if (
      singleCustomerResponse?.data &&
      singleCustomerResponse.data.length > 0
    ) {
      const fetched = singleCustomerResponse.data[0];
      setResolvedCustomer({
        id: fetched.id,
        name: fetched.name,
        code: fetched.code,
      });
    }
  }, [singleCustomerResponse]);

  const { data: dropdownResponse, isFetching } = useCustomersDropdown({
    search: searchTerm.trim() ? searchTerm.trim() : undefined,
    depot_id: depotId,
    limit: 50,
  });

  const searchResults: CustomerOption[] = useMemo(() => {
    return (dropdownResponse?.data || []).map((c: CustomerDropdown) => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }));
  }, [dropdownResponse]);

  const options = useMemo(() => {
    const list = [...searchResults];
    if (resolvedCustomer && !list.some(c => c.id === resolvedCustomer.id)) {
      list.unshift(resolvedCustomer);
    }
    return list;
  }, [searchResults, resolvedCustomer]);

  const currentValue = useMemo(() => {
    if (!value) return null;
    return (
      options.find(c => String(c.id) === String(value)) ||
      resolvedCustomer ||
      null
    );
  }, [value, options, resolvedCustomer]);

  return (
    <Autocomplete
      options={options}
      value={currentValue}
      loading={isFetching}
      disabled={disabled}
      size="small"
      clearOnBlur={false}
      filterOptions={x => x}
      getOptionLabel={option => option?.name || ''}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      onChange={(_event, newValue) => {
        setResolvedCustomer(newValue);
        if (!newValue) {
          setInputValue('');
          setSearchTerm('');
        }
        onChange(newValue);
      }}
      onInputChange={(_event, newInputValue, reason) => {
        if (reason === 'input') {
          setInputValue(newInputValue);
        } else if (reason === 'clear') {
          setInputValue('');
          setSearchTerm('');
        } else if (reason === 'reset') {
          setInputValue(newInputValue);
        }
      }}
      sx={{
        '& .MuiAutocomplete-endAdornment': {
          right: '2px !important',
          top: '50% !important',
          transform: 'translateY(-50%) !important',
          display: 'flex !important',
          alignItems: 'center !important',
          gap: '0px !important',
          '& .MuiIconButton-root': {
            padding: '1px !important',
            margin: '0px !important',
            width: '18px !important',
            height: '18px !important',
            minWidth: '18px !important',
            '& .MuiSvgIcon-root': {
              fontSize: '0.875rem !important',
            },
          },
        },
        '& .MuiAutocomplete-clearIndicator': {
          marginRight: '-1px !important',
          padding: '1px !important',
        },
        '& .MuiAutocomplete-popupIndicator': {
          marginRight: '0px !important',
          padding: '1px !important',
        },
        '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiOutlinedInput-root, &.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiAutocomplete-inputRoot':
          {
            paddingRight: '38px !important',
          },
        '&.MuiAutocomplete-hasPopupIcon:not(.MuiAutocomplete-hasClearIcon) .MuiOutlinedInput-root, &.MuiAutocomplete-hasPopupIcon:not(.MuiAutocomplete-hasClearIcon) .MuiAutocomplete-inputRoot':
          {
            paddingRight: '22px !important',
          },
        '&.MuiAutocomplete-hasClearIcon:not(.MuiAutocomplete-hasPopupIcon) .MuiOutlinedInput-root, &.MuiAutocomplete-hasClearIcon:not(.MuiAutocomplete-hasPopupIcon) .MuiAutocomplete-inputRoot':
          {
            paddingRight: '22px !important',
          },
        '&:not(.MuiAutocomplete-hasPopupIcon):not(.MuiAutocomplete-hasClearIcon) .MuiOutlinedInput-root, &:not(.MuiAutocomplete-hasPopupIcon):not(.MuiAutocomplete-hasClearIcon) .MuiAutocomplete-inputRoot':
          {
            paddingRight: '8px !important',
          },
        '& .MuiOutlinedInput-root, & .MuiAutocomplete-inputRoot, & .MuiInputBase-root':
          {
            height: '28px !important',
            minHeight: '28px !important',
            paddingTop: '0px !important',
            paddingBottom: '0px !important',
            fontSize: '0.75rem',
          },
        '& .MuiAutocomplete-input, & .MuiInputBase-input, & .MuiOutlinedInput-input':
          {
            padding: '0px 2px 0px 8px !important',
            height: '28px !important',
            lineHeight: '28px !important',
            fontSize: '0.75rem !important',
            boxSizing: 'border-box !important',
          },
      }}
      slotProps={{
        popper: {
          style: { zIndex: 10000 },
          placement: 'bottom-start',
        },
        listbox: {
          style: { maxHeight: '250px' },
          sx: {
            padding: '4px !important',
            '& .MuiAutocomplete-option': {
              minHeight: '26px !important',
              padding: '2px 6px !important',
            },
          },
        },
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            component="li"
            key={key}
            {...optionProps}
            className="!flex !items-center !gap-1.5 !py-1 !px-1.5 hover:!bg-gray-50 cursor-pointer"
          >
            <Avatar
              alt={option.name}
              className="!w-6 !h-6 !text-[10px] !rounded !bg-primary-100 !text-primary-600"
            >
              {getAvatarInitial(option.name)}
            </Avatar>
            <Box className="!flex !flex-col !min-w-0">
              <span className="text-xs font-medium text-gray-800 truncate">
                {option.name}
              </span>
              {option.code && (
                <span className="text-[8px] text-gray-400">{option.code}</span>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={currentValue ? '' : placeholder}
          size="small"
          className={className}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? (
                  <CircularProgress
                    color="inherit"
                    size={14}
                    className="!mr-1"
                  />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              height: '28px !important',
              minHeight: '28px !important',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
            },
            '& .MuiOutlinedInput-root': {
              height: '28px !important',
              minHeight: '28px !important',
            },
            '& .MuiInputBase-input, & .MuiOutlinedInput-input, & .MuiAutocomplete-input':
              {
                padding: '0px 2px 0px 8px !important',
                height: '28px !important',
                lineHeight: '28px !important',
                fontSize: '0.75rem',
                boxSizing: 'border-box',
              },
          }}
        />
      )}
      noOptionsText={
        searchTerm.trim() && !isFetching
          ? 'No customers found'
          : 'No customers available'
      }
    />
  );
};

export default CustomerSelectCell;
