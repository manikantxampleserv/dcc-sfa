import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridOptions } from 'ag-grid-community';
import {
  myTheme,
  AG_GRID_THEME,
  DEFAULT_GRID_OPTIONS,
  DEFAULT_COL_DEF,
} from 'configs/agGrid.config';
import { Box } from '@mui/material';

interface DataGridProps {
  rowData: any[];
  columnDefs: ColDef[];
  height?: number | string;
  gridOptions?: GridOptions;
  onSelectionChanged?: (event: any) => void;
  onRowClicked?: (event: any) => void;
  onRowDoubleClicked?: (event: any) => void;
  loading?: boolean;
  className?: string;
}

const DataGrid: React.FC<DataGridProps> = ({
  rowData,
  columnDefs,
  height = 500,
  gridOptions = {},
  onSelectionChanged,
  onRowClicked,
  onRowDoubleClicked,
  loading = false,
  className = '',
}) => {
  const mergedGridOptions: GridOptions = {
    ...DEFAULT_GRID_OPTIONS,
    ...gridOptions,
    onSelectionChanged,
    onRowClicked,
    onRowDoubleClicked,
  };

  return (
    <Box
      className={`${AG_GRID_THEME} ${className || ''}`}
      sx={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',
        '& .ag-header': {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: 500,
          fontSize: '13px',
          color: '#6b7280',
        },
        '& .ag-header-cell': {
          borderRight: '1px solid #f3f4f6',
          padding: '8px 12px',
          height: '40px',
        },
        '& .ag-header-cell-label': {
          justifyContent: 'flex-start',
        },
        '& .ag-row': {
          borderBottom: '1px solid #f9fafb',
          fontSize: '13px',
          backgroundColor: '#ffffff',
        },
        '& .ag-row:hover': {
          backgroundColor: '#f9fafb',
        },
        '& .ag-row-selected': {
          backgroundColor: '#dbeafe !important',
        },
        '& .ag-cell': {
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          borderRight: '1px solid #f9fafb',
        },
        '& .ag-checkbox-input-wrapper': {
          fontSize: '14px',
        },
      }}
    >
      <AgGridReact
        theme={myTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={DEFAULT_COL_DEF}
        gridOptions={mergedGridOptions}
        loading={loading}
        loadingOverlayComponent={() => (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        noRowsOverlayComponent={() => (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        )}
      />
    </Box>
  );
};

export default DataGrid;
