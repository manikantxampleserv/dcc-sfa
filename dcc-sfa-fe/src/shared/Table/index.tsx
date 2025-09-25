import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import classNames from 'classnames';
import React, { useMemo, useState, type ReactNode } from 'react';

/**
 * Configuration for a table column
 * @template T - The type of data in the table rows
 */
export interface TableColumn<T = any> {
  id: keyof T;
  label: string;
  numeric?: boolean;
  disablePadding?: boolean;
  sortable?: boolean;
  width?: string | number;
  render?: (value: any, row: T) => ReactNode;
}

/**
 * Configuration for table actions (bulk operations)
 * @template T - The type of data in the table rows
 */
export interface TableAction<T = any> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: T[]) => void;
  show?: (selectedRows: T[]) => boolean;
  disabled?: (selectedRows: T[]) => boolean;
}

/**
 * Props for the Enhanced Table component
 * @template T - The type of data in the table rows
 */
export interface EnhancedTableProps<T = any> {
  /** Array of data to display in the table */
  data: T[];
  /** Column configuration array */
  columns: TableColumn<T>[];
  /** Optional table title */
  title?: string;
  /** Enable/disable sorting functionality */
  sortable?: boolean;
  /** Enable/disable pagination */
  pagination?: boolean;
  /** Array of bulk actions */
  actions?: TableAction<T>[];
  /** Callback when a row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Loading state */
  loading?: boolean;
  /** Message to show when no data */
  emptyMessage?: string;
  /** Function to get unique ID for each row */
  getRowId?: (row: T) => string | number;
  /** Initial column to sort by */
  initialOrderBy?: keyof T;
  /** Initial sort direction */
  initialOrder?: 'asc' | 'desc';
  /** Enable sticky header */
  stickyHeader?: boolean;
  /** Maximum height of the table container */
  maxHeight?: string | number;
  /** Total count of records (for backend pagination) */
  totalCount?: number;
  /** Current page number (controlled) */
  page?: number;
  /** Number of rows per page (controlled) */
  rowsPerPage?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
}

/** Sort order type */
type Order = 'asc' | 'desc';

/**
 * Comparator function for descending sort
 * @template T - The type of objects being compared
 * @param a - First object to compare
 * @param b - Second object to compare
 * @param orderBy - Property to compare by
 * @returns Comparison result
 */
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**
 * Get comparator function based on sort order
 * @template Key - The key type for comparison
 * @param order - Sort order ('asc' or 'desc')
 * @param orderBy - Property to sort by
 * @returns Comparator function
 */
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Props for the Enhanced Table Head component
 * @template T - The type of data in the table rows
 */
interface EnhancedTableHeadProps<T> {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: string;
  columns: TableColumn<T>[];
  sortable: boolean;
}

/**
 * Enhanced table header component with sorting functionality
 * @template T - The type of data in the table rows
 * @param props - Component props
 * @returns Table header JSX element
 */
function EnhancedTableHead<T>(props: EnhancedTableHeadProps<T>) {
  const { order, orderBy, onRequestSort, columns, sortable } = props;

  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {columns.map(column => (
          <TableCell
            key={String(column.id)}
            align={column.numeric ? 'right' : 'left'}
            padding={column.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === column.id ? order : false}
            className={classNames(
              '!border-b !border-gray-200 !bg-gray-50 !font-semibold',
              '!whitespace-nowrap !text-gray-700 !p-4 !text-sm'
            )}
            style={{ width: column.width }}
          >
            {sortable && column.sortable !== false ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : 'asc'}
                onClick={createSortHandler(column.id)}
                className={classNames(
                  'hover:!text-blue-600',
                  orderBy === column.id && '!text-blue-600'
                )}
              >
                {column.label}
                {orderBy === column.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

/**
 * Props for the Skeleton Loader component
 */
interface SkeletonLoaderProps {
  columns: TableColumn[];
  rows?: number;
}

/**
 * Skeleton loader component for table loading states
 * @param props - Component props
 * @returns Skeleton rows JSX elements
 */
function SkeletonLoader({ columns, rows = 3 }: SkeletonLoaderProps) {
  const skeletonRows = Array.from({ length: rows }, (_, index) => index);

  const getSkeletonWidth = (_column: TableColumn, index: number) => {
    const widths = ['60%', '80%', '70%', '90%', '50%', '75%'];
    return widths[index % widths.length];
  };

  const getSkeletonHeight = (column: TableColumn) => {
    if (column.id === 'name' || column.id === 'user') return 40;
    return 20;
  };

  return (
    <>
      {skeletonRows.map((_row, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {columns.map((column, colIndex) => (
            <TableCell
              key={`skeleton-${rowIndex}-${String(column.id)}`}
              align={column.numeric ? 'right' : 'left'}
              padding={column.disablePadding ? 'none' : 'normal'}
              className="!border-b !border-gray-100 !h-[53px]"
            >
              <Box className="!flex !items-center !gap-1.5">
                {(column.id === 'name' || column.id === 'user') &&
                  colIndex === 0 && (
                    <Skeleton
                      variant="circular"
                      width={32}
                      height={32}
                      className="!bg-gray-100"
                    />
                  )}
                <Box className="!flex-1">
                  <Skeleton
                    variant="text"
                    width={getSkeletonWidth(column, colIndex)}
                    height={getSkeletonHeight(column)}
                    className="!bg-gray-100 !rounded"
                  />
                  {(column.id === 'name' || column.id === 'user') && (
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={16}
                      className="!bg-gray-50 !rounded !mt-0.5"
                    />
                  )}
                </Box>
              </Box>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * Enhanced Table component with sorting, pagination, and loading states
 * Supports both client-side and server-side pagination
 * @template T - The type of data objects in the table
 * @param props - Component props
 * @returns Enhanced table JSX element
 */
export default function EnhancedTable<T extends Record<string, any>>(
  props: EnhancedTableProps<T>
) {
  const {
    data,
    columns,
    sortable = true,
    pagination = true,
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    getRowId = (row: T, index: number) => row.id || index,
    initialOrderBy,
    initialOrder = 'asc',
    stickyHeader = false,
    maxHeight,
    totalCount = 0,
    page = 0,
    rowsPerPage = 6,
    onPageChange,
  } = props;

  const [order, setOrder] = useState<Order>(initialOrder);
  const [orderBy, setOrderBy] = useState<keyof T>(
    initialOrderBy || (columns[0]?.id as keyof T)
  );

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof T
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (
    _event: React.MouseEvent<unknown>,
    row: T,
    index: number
  ) => {
    onRowClick?.(row, index);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const visibleRows = useMemo(() => {
    return sortable ? [...data].sort(getComparator(order, orderBy)) : data;
  }, [data, order, orderBy, sortable]);

  const emptyRows = 0;

  if (loading && data.length === 0) {
    return (
      <Box className="!w-full">
        <Paper className="!w-full !rounded-lg !border !border-gray-200 !shadow-sm">
          <TableContainer style={{ maxHeight }}>
            <Table
              className="!min-w-[750px]"
              size="small"
              stickyHeader={stickyHeader}
            >
              <EnhancedTableHead
                order={order}
                orderBy={String(orderBy)}
                onRequestSort={() => {}}
                columns={columns}
                sortable={sortable}
              />
              <TableBody>
                <SkeletonLoader columns={columns} rows={rowsPerPage} />
              </TableBody>
            </Table>
          </TableContainer>
          {pagination && (
            <TablePagination
              rowsPerPageOptions={[]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              className="!border-t !border-gray-200 [&_.MuiTablePagination-toolbar]:!text-gray-700 [&_.MuiTablePagination-selectIcon]:!text-gray-500"
            />
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="!w-full">
      <Paper
        elevation={0}
        className="!bg-white !shadow-sm !rounded-lg !border !border-gray-100"
      >
        <TableContainer style={{ maxHeight }}>
          <Table
            className="!min-w-[750px]"
            size="small"
            stickyHeader={stickyHeader}
          >
            <EnhancedTableHead
              order={order}
              orderBy={String(orderBy)}
              onRequestSort={handleRequestSort}
              columns={columns}
              sortable={sortable}
            />
            <TableBody>
              {loading ? (
                <SkeletonLoader columns={columns} rows={rowsPerPage} />
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    className="!py-4 !text-gray-500 !italic"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, index) => {
                  const rowId = getRowId(row, index);
                  return (
                    <TableRow
                      hover
                      onClick={event => handleClick(event, row, index)}
                      tabIndex={-1}
                      key={String(rowId)}
                      className="!whitespace-nowrap !cursor-pointer hover:!bg-gray-50"
                    >
                      {columns.map(column => (
                        <TableCell
                          key={String(column.id)}
                          align={column.numeric ? 'right' : 'left'}
                          padding={column.disablePadding ? 'none' : 'normal'}
                          className="!border-b !border-gray-100 !text-gray-700 !whitespace-nowrap !text-sm !p-4"
                        >
                          {column.render
                            ? column.render(row[column.id], row)
                            : String(row[column.id] || '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
              {!loading && emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination && (
          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            className="!border-t !border-gray-200 [&_.MuiTablePagination-toolbar]:!text-gray-700 [&_.MuiTablePagination-selectIcon]:!text-gray-500"
          />
        )}
      </Paper>
    </Box>
  );
}
