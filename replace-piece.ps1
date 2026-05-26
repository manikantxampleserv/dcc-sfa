$base = 'C:\Users\lenovo\Desktop\Projects\DCC-SFA'

$files = @(
  'dcc-sfa-fe\src\schemas\order.schema.ts',
  'dcc-sfa-fe\src\pages\transactions\Orders\ManageOrder\index.tsx',
  'dcc-sfa-fe\src\pages\transactions\Orders\ManageOrder\ManageOrderBatch.tsx',
  'dcc-sfa-fe\src\pages\transactions\Orders\OrderDetail\index.tsx',
  'dcc-sfa-fe\src\pages\transactions\Invoices\ManageInvoice\index.tsx',
  'dcc-sfa-fe\src\pages\transactions\Invoices\ManageInvoice\ManageInvoiceBatch.tsx',
  'dcc-sfa-fe\src\pages\transactions\CreditNotes\ManageCreditNote\index.tsx',
  'dcc-sfa-be\src\v1\controllers\orders.controller.ts',
  'dcc-sfa-be\src\v1\controllers\invoices.controller.ts'
)

foreach ($f in $files) {
  $path = Join-Path $base $f
  if (Test-Path $path) {
    $content = Get-Content $path -Raw
    $new = $content -replace "'PIECE'", "'PCS'" -replace '"PIECE"', '"PCS"'
    Set-Content $path $new -NoNewline
    Write-Host "Updated: $f"
  } else {
    Write-Host "NOT FOUND: $f"
  }
}

Write-Host "Done!"
