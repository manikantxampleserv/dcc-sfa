# Sidebar vs Permissions Mapping Analysis

## Current Sidebar Structure (Extracted from sidebar/index.ts)

### 1. Dashboards
- `executive-dashboard` → Executive Dashboard

### 2. Masters

#### Organization Setup
- `user-master` → User Master
- `role-permission` → Role & Permission Setup
- `zones` → Zones
- `depots` → Depots
- `currency` → Currency

#### Operations & Logistics
- `vehicle-master` → Vehicle Master
- `asset-types` → Asset Types
- `asset-master` → Asset Master
- `route-types` → Route Types
- `routes` → Routes

#### Outlet Management
- `outlet-groups` → Outlet Groups
- `outlet-master` → Outlet Master
- `outlet-type` → Outlet Type
- `outlet-channel` → Outlet Channel
- `outlet-category` → Outlet Category

#### Product & Pricing Setup
- `brands` → Brands
- `product-categories` → Categories
- `product-sub-categories` → Sub Categories
- `unit-of-measurement` → Unit of Measurement
- `product-flavours` → Flavours
- `product-volumes` → Volumes
- `product-shelf-life` → Shelf Life
- `product-types` → Product Types
- `product-target-groups` → Product Target Groups
- `product-web-orders` → Web Orders
- `product-catalog` → Product Catalog
- `batch-lots` → Batch & Lot Management
- `tax-master` → Tax Master

#### Sales Planning & Targets
- `sales-target-groups` → Sales Target Groups
- `sales-targets` → Sales Targets
- `kpi-targets` → KPI Targets
- `sales-bonus-rules` → Sales Bonus Rules

#### Feedback & Engagement
- `survey-templates` → Survey Templates
- `customer-complaints` → Customer Complaints
- `promotions` → Promotions

### 3. Transactions

#### Sales Operations
- `order-entry` → Order Entry
- `invoice-management` → Invoice Management
- `inventory-items` → Inventory Items
- `payment-collection` → Payment Collection

#### Asset & Cooler Management
- `asset-movement` → Asset Movement
- `asset-maintenance` → Asset Maintenance
- `cooler-types` → Cooler Types
- `cooler-sub-types` → Cooler Sub Types
- `cooler-installations` → Cooler Installations
- `cooler-inspections` → Cooler Inspections

#### Van & Stock Operations
- `van-stock` → Van Stock Load/Unload
- `stock-movements` → Stock Movements

#### Field Visit & Market Activities
- `visit-logging` → Visit Logging
- `competitor-activity` → Competitor Activity

### 4. Tracking
- `rep-location` → Rep Location Tracking
- `route-effectiveness` → Route Effectiveness

### 5. Reports
- `orders-invoices-returns` → Orders, Invoices, Returns
- `sales-vs-target` → Sales vs Target
- `asset-movement-status` → Asset Movement/Status
- `visit-frequency` → Visit Frequency/Completion
- `promo-effectiveness` → Promo Effectiveness
- `region-territory` → Region/Territory Sales
- `rep-productivity` → Rep Productivity
- `competitor-analysis` → Competitor Analysis
- `outstanding-collection` → Outstanding & Collection
- `attendance-history` → Attendance History
- `activity-logs` → Audit Logs
- `survey-responses` → Survey Responses

### 6. Workflows
- `approval-setup` → Approval Setup
- `approval-requests` → Approval Requests
- `route-exceptions` → Route Exceptions
- `alerts-reminders` → Alerts & Reminders

### 7. Settings
- `profile` → My Profile
- `login-history` → Login History
- `api-tokens` → API Tokens
- `system-settings` → System Settings

## Current Permissions Seeder Modules

From permissions.seeder.ts, the current MODULE_MAPPING includes:

```typescript
const MODULE_MAPPING: Record<string, string> = {
  'dashboard': 'Dashboard',
  'company': 'Company Master',
  'user': 'User Management',
  'role': 'Role & Permission',
  'depot': 'Depot',
  "zone": 'Zone',
  'currency': 'Currency',
  'route': 'Route',
  'route-type': 'Route Type',
  'outlet': 'Outlet Master',
  'outlet-group': 'Outlet Group',
  'asset-type': 'Asset Type',
  'asset-master': 'Asset Master',
  'warehouse': 'Warehouse',
  'vehicle': 'Vehicle',
  'brand': 'Brand',
  'product-category': 'Product Category',
  'product-sub-category': 'Product Sub Category',
  'unit-of-measurement': 'Unit Of Measurement',
  'product': 'Product',
  'pricelist': 'Price List',
  'sales-target-group': 'Sales Target Group',
  'sales-target': 'Sales Target',
  'sales-bonus-rule': 'Sales Bonus Rule',
  'kpi-target': 'KPI Target',
  'survey': 'Survey',
  'promotions': 'Promotions',
  'order': 'Order',
  'delivery': 'Delivery Schedule',
  'return': 'Return Request',
  'payment': 'Payment',
  'invoice': 'Invoice',
  'credit-note': 'Credit Note',
  'visit': 'Visit',
  'asset-movement': 'Asset Movement',
  'maintenance': 'Asset Maintenance',
  'installation': 'Cooler Installation',
  'inspection': 'Cooler Inspection',
  'van-stock': 'Van Inventory',
  'stock-movement': 'Stock Movement',
  'stock-transfer': 'Stock Transfer Request',
  'batch-lots': 'Batch & Lot Management',
  'inventory-management': 'Inventory Management',
  'competitor': 'Competitor Activity',
  'customer-complaint': 'Customer Complaint',
  'customer-category': 'Customer Category',
  'customer-type': 'Customer Type',
  'customer-channel': 'Customer Channel',
  'product-flavour': 'Product Flavour',
  'product-volume': 'Product Volume',
  'product-shelf-life': 'Product Shelf Life',
  'product-type': 'Product Type',
  'product-target-group': 'Product Target Group',
  'product-web-order': 'Product Web Order',
  'cooler-type': 'Cooler Type',
  'cooler-sub-type': 'Cooler Sub Type',
  'location': 'GPS Tracking',
  'route-effectiveness': 'Route Effectiveness',
  'erp-sync': 'ERP Sync',
  'report': 'Report',
  'approval': 'Approval Workflow',
  'exception': 'Exception',
  'alert': 'Alert',
  'profile': 'Profile',
  'login-history': 'Login History',
  'token': 'Token',
  'setting': 'Setting',
};
```

## Identified Issues and Mismatches

### 1. Missing Permissions (in sidebar but not in seeder)
- `executive-dashboard` (specific dashboard type)
- `vehicle-master` (exists as `vehicle` but should match sidebar)
- `asset-types` (exists as `asset-type` but should match sidebar)
- `asset-master` (exists as `asset-master` ✓)
- `route-types` (exists as `route-type` but should match sidebar)
- `outlet-type` (missing)
- `outlet-channel` (exists as `customer-channel` but should match sidebar)
- `outlet-category` (exists as `customer-category` but should match sidebar)
- `brands` (exists as `brand` but should match sidebar)
- `product-categories` (exists as `product-category` but should match sidebar)
- `product-sub-categories` (exists as `product-sub-category` but should match sidebar)
- `product-flavours` (exists as `product-flavour` but should match sidebar)
- `product-volumes` (exists as `product-volume` but should match sidebar)
- `product-shelf-life` (exists as `product-shelf-life` but should match sidebar)
- `product-types` (exists as `product-type` but should match sidebar)
- `product-target-groups` (exists as `product-target-group` but should match sidebar)
- `product-web-orders` (exists as `product-web-order` but should match sidebar)
- `product-catalog` (exists as `product` but should match sidebar)
- `batch-lots` (exists as `batch-lots` ✓)
- `tax-master` (missing)
- `sales-target-groups` (exists as `sales-target-group` but should match sidebar)
- `sales-targets` (exists as `sales-target` but should match sidebar)
- `kpi-targets` (exists as `kpi-target` but should match sidebar)
- `sales-bonus-rules` (exists as `sales-bonus-rule` but should match sidebar)
- `survey-templates` (exists as `survey` but should match sidebar)
- `customer-complaints` (exists as `customer-complaint` but should match sidebar)
- `promotions` (exists as `promotions` ✓)
- `order-entry` (exists as `order` but should match sidebar)
- `invoice-management` (exists as `invoice` but should match sidebar)
- `inventory-items` (exists as `inventory-management` but should match sidebar)
- `payment-collection` (exists as `payment` but should match sidebar)
- `cooler-types` (exists as `cooler-type` but should match sidebar)
- `cooler-sub-types` (exists as `cooler-sub-type` but should match sidebar)
- `cooler-installations` (exists as `installation` but should match sidebar)
- `cooler-inspections` (exists as `inspection` but should match sidebar)
- `van-stock` (exists as `van-stock` but should match sidebar)
- `stock-movements` (exists as `stock-movement` but should match sidebar)
- `visit-logging` (exists as `visit` but should match sidebar)
- `competitor-activity` (exists as `competitor` but should match sidebar)
- `rep-location` (exists as `location` but should match sidebar)
- `rep-productivity` (missing)
- `outstanding-collection` (missing)
- `attendance-history` (missing)
- `activity-logs` (missing)
- `survey-responses` (missing)
- `approval-setup` (exists as `approval` but should match sidebar)
- `approval-requests` (missing)
- `route-exceptions` (exists as `exception` but should match sidebar)
- `alerts-reminders` (exists as `alert` but should match sidebar)
- `api-tokens` (exists as `token` but should match sidebar)
- `system-settings` (exists as `setting` but should match sidebar)

### 2. Deprecated Permissions (in seeder but not in sidebar)
- `company` (Company Master - commented out in sidebar)
- `warehouse` (Warehouse Master - commented out in sidebar)
- `pricelist` (Pricelists - commented out in sidebar)
- `delivery` (Delivery Schedule - commented out in sidebar)
- `return` (Return Request - commented out in sidebar)
- `credit-note` (Credit Notes - commented out in sidebar)
- `stock-transfer` (Stock Transfer Request - commented out in sidebar)
- `customer-type` (not in sidebar)
- `erp-sync` (not in sidebar)

### 3. Naming Convention Issues
- Sidebar uses kebab-case for IDs (e.g., `user-master`, `asset-types`)
- Seeder uses snake_case/kebab-case mix (e.g., `user`, `asset-type`)
- Need to standardize to match sidebar IDs exactly

## Required Actions

1. **Update MODULE_MAPPING** to use exact sidebar IDs
2. **Add missing permissions** for new sidebar items
3. **Remove deprecated permissions** for commented-out sidebar items
4. **Standardize naming convention** to match sidebar structure
5. **Update permission names** to reflect the new module keys
