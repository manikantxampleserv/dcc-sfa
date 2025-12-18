# Product-Batch Many-to-Many Relationship Migration

## Overview

Migrated the product-batch relationship from one-to-one to many-to-many using a junction table. This allows products to be associated with multiple batch lots.

## Database Schema Changes

### 1. Created Junction Table: `product_batches`

```sql
CREATE TABLE product_batches (
  id           INT PRIMARY KEY IDENTITY(1,1),
  product_id   INT NOT NULL,
  batch_lot_id INT NOT NULL,
  quantity     INT DEFAULT 0,
  is_active    CHAR(1) DEFAULT 'Y',
  createdate   DATETIME DEFAULT GETDATE(),
  createdby    INT NOT NULL,
  updatedate   DATETIME,
  updatedby    INT,
  log_inst     INT,
  CONSTRAINT FK_product_batches_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT FK_product_batches_batch_lot FOREIGN KEY (batch_lot_id) REFERENCES batch_lots(id) ON DELETE CASCADE,
  CONSTRAINT UQ_product_batch UNIQUE (product_id, batch_lot_id)
);

CREATE INDEX IX_product_batches_product_id ON product_batches(product_id);
CREATE INDEX IX_product_batches_batch_lot_id ON product_batches(batch_lot_id);
```

### 2. Updated `batch_lots` Table

- **Removed**: `product_id` column (was nullable INT)
- **Added**: Relation to `product_batches` junction table

### 3. Updated `products` Table

- **Removed**: Direct `batch_lots_product` relation
- **Added**: `product_batches` relation through junction table

## Backend Changes

### 1. Prisma Schema (`prisma/schema.prisma`)

```prisma
model batch_lots {
  // Removed: product_id field
  product_batches      product_batches[]  // New relation
  serial_numbers       serial_numbers[]
  stock_movements      stock_movements[]
  stock_transfer_lines stock_transfer_lines[]
}

model products {
  // Removed: batch_lots_product relation
  product_batches      product_batches[]  // New relation
  // ... other relations
}

model product_batches {
  id           Int        @id @default(autoincrement())
  product_id   Int
  batch_lot_id Int
  quantity     Int        @default(0)
  is_active    String     @default("Y") @db.Char(1)
  createdate   DateTime?  @default(now()) @db.DateTime
  createdby    Int
  updatedate   DateTime?  @db.DateTime
  updatedby    Int?
  log_inst     Int?
  product      products   @relation(fields: [product_id], references: [id], onDelete: Cascade)
  batch_lot    batch_lots @relation(fields: [batch_lot_id], references: [id], onDelete: Cascade)

  @@unique([product_id, batch_lot_id])
  @@index([product_id])
  @@index([batch_lot_id])
}
```

### 2. Product Controller (`src/v1/controllers/products.controller.ts`)

**Updated Serialization:**

```typescript
batch_lots: normalizeToArray(product.product_batches).map((pb: any) => ({
  id: pb.batch_lot?.id,
  batch_number: pb.batch_lot?.batch_number,
  lot_number: pb.batch_lot?.lot_number,
  quantity: pb.quantity,
  expiry_date: pb.batch_lot?.expiry_date,
  quality_grade: pb.batch_lot?.quality_grade,
}));
```

**Updated Includes:**

```typescript
include: {
  product_batches: {
    include: {
      batch_lot: true,
    },
  },
  // ... other includes
}
```

### 3. Batch Lots Controller (`src/v1/controllers/batchLots.controller.ts`)

**Updated Delete Validation:**

```typescript
const existingBatch = await prisma.batch_lots.findUnique({
  where: { id: Number(id) },
  include: {
    product_batches: true, // Changed from batch_lots_products
    serial_numbers: true,
    stock_movements: true,
  },
});

if (existingBatch.product_batches.length > 0) {
  return res.status(400).json({
    message: `Cannot delete batch lot. ${existingBatch.product_batches.length} product(s) are associated.`,
  });
}
```

## Frontend Changes Required

### 1. ManageProducts Form

**Change from single select to multi-select:**

```tsx
// OLD: Single batch selection
<Select name="batch_lots_id" label="Batch Lot" formik={formik}>
  {batchLots.map(batchLot => (
    <MenuItem key={batchLot.id} value={batchLot.id}>
      {batchLot.batch_number}
    </MenuItem>
  ))}
</Select>;

// NEW: Multiple batch selection with quantities
import { Autocomplete, Chip, TextField } from '@mui/material';

<Autocomplete
  multiple
  options={batchLots}
  getOptionLabel={option =>
    `${option.batch_number} - Qty: ${option.remaining_quantity}`
  }
  value={formik.values.batch_lots || []}
  onChange={(_, newValue) => {
    formik.setFieldValue('batch_lots', newValue);
  }}
  renderInput={params => (
    <TextField
      {...params}
      label="Batch Lots"
      error={formik.touched.batch_lots && Boolean(formik.errors.batch_lots)}
      helperText={formik.touched.batch_lots && formik.errors.batch_lots}
    />
  )}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        label={`${option.batch_number} (${option.lot_number || 'N/A'})`}
        {...getTagProps({ index })}
      />
    ))
  }
/>;
```

### 2. Form Initial Values

```tsx
// OLD
batch_lots_id: selectedProduct?.batch_lots_id || '';

// NEW
batch_lots: selectedProduct?.batch_lots || [];
```

### 3. Form Submission

```tsx
// OLD
batch_lots_id: values.batch_lots_id ? Number(values.batch_lots_id) : undefined;

// NEW
batch_lots: values.batch_lots?.map(batch => ({
  batch_lot_id: batch.id,
  quantity: batch.quantity || 0,
}));
```

### 4. ProductDetail Page

Update to display multiple batches in a table or list format:

```tsx
<Box className="!mt-4">
  <Typography variant="h6">Associated Batch Lots</Typography>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Batch Number</TableCell>
        <TableCell>Lot Number</TableCell>
        <TableCell>Quantity</TableCell>
        <TableCell>Expiry Date</TableCell>
        <TableCell>Quality Grade</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {product.batch_lots?.map(batch => (
        <TableRow key={batch.id}>
          <TableCell>{batch.batch_number}</TableCell>
          <TableCell>{batch.lot_number || 'N/A'}</TableCell>
          <TableCell>{batch.quantity}</TableCell>
          <TableCell>{formatDate(batch.expiry_date)}</TableCell>
          <TableCell>
            <Chip label={`Grade ${batch.quality_grade}`} size="small" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Box>
```

## Migration Steps

### 1. Database Migration

```bash
# Run in backend directory
cd dcc-sfa-be

# Generate Prisma client with new schema
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_product_batches_junction_table

# Or for production
npx prisma migrate deploy
```

### 2. Data Migration Script (if needed)

If you have existing data with `product_id` in `batch_lots`:

```sql
-- Migrate existing data to junction table
INSERT INTO product_batches (product_id, batch_lot_id, quantity, is_active, createdate, createdby, log_inst)
SELECT
  product_id,
  id as batch_lot_id,
  quantity,
  is_active,
  createdate,
  createdby,
  log_inst
FROM batch_lots
WHERE product_id IS NOT NULL;

-- Remove product_id column from batch_lots
ALTER TABLE batch_lots DROP COLUMN product_id;
```

### 3. Backend Testing

```bash
# Test product creation with multiple batches
POST /api/products
{
  "name": "Test Product",
  "batch_lots": [
    { "batch_lot_id": 1, "quantity": 100 },
    { "batch_lot_id": 2, "quantity": 50 }
  ]
}

# Test product retrieval
GET /api/products/:id
# Should return product with batch_lots array

# Test batch lot deletion
DELETE /api/batch-lots/:id
# Should check product_batches relation
```

### 4. Frontend Updates

```bash
cd dcc-sfa-fe

# Update TypeScript interfaces
# Update form components
# Update detail pages
# Test CRUD operations
```

## Benefits

1. **Flexibility**: Products can now have multiple batch lots
2. **Quantity Tracking**: Track quantity per batch-product association
3. **Better Inventory**: More accurate inventory management
4. **Scalability**: Easier to add batch-specific features
5. **Data Integrity**: Proper many-to-many relationship with cascade deletes

## Breaking Changes

⚠️ **API Response Structure Changed:**

- `batch_lots_id` field removed from products
- `batch_lots` is now an array instead of single object
- Each batch lot includes `quantity` from junction table

⚠️ **Frontend Forms Need Updates:**

- Replace single select with multi-select
- Update validation schemas
- Update form submission logic

## Rollback Plan

If needed, you can rollback by:

1. Restore old Prisma schema
2. Run: `npx prisma migrate dev --name revert_product_batches`
3. Revert controller changes
4. Revert frontend changes

## Testing Checklist

- [ ] Create product with multiple batches
- [ ] Update product batches
- [ ] Remove batch from product
- [ ] Delete product (cascades to product_batches)
- [ ] Delete batch lot (checks product_batches)
- [ ] View product detail with multiple batches
- [ ] Import products with batch data
- [ ] Export products with batch data
- [ ] API response includes all batch details
- [ ] Frontend displays multiple batches correctly
