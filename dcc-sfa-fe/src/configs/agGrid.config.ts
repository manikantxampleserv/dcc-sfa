import {
  AllCommunityModule,
  ModuleRegistry,
  type GridOptions,
  themeQuartz,
} from 'ag-grid-community';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Custom AG Grid theme configuration
export const myTheme = themeQuartz.withParams({
  browserColorScheme: "light",
  headerFontSize: 14,
  headerHeight: 48,
  rowHeight: 52,
  fontSize: 14,
  fontFamily: "'Noto Sans', sans-serif",
  borderRadius: 8,
  spacing: 8,
  accentColor: "#3b82f6", // Primary blue color
  backgroundColor: "#ffffff",
  headerBackgroundColor: "#f8fafc",
  oddRowBackgroundColor: "#fafbfc",
});

// Legacy theme name for backward compatibility
export const AG_GRID_THEME = 'ag-theme-quartz';

// Default grid options with proper typing
export const DEFAULT_GRID_OPTIONS: GridOptions = {
  domLayout: 'normal' as const,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  suppressMenuHide: false,
  animateRows: true,
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100],
};

// Column default properties
export const DEFAULT_COL_DEF = {
  sortable: true,
  filter: true,
  resizable: true,
  flex: 1,
  minWidth: 100,
};
