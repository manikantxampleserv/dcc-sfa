import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { getTimeFilter } from '../../utils/dateFilters';
import { isAdminRole } from '../../configs/permissions.config';
import {
  getOrderedQuantities,
  calculateStockDeduction,
  getContainerGroupUsers,
  getContainerOwnerAndSelf,
  validateAndGetLocationId,
} from '../utils/inventory.utils';

function calculateUnitConversion(
  quantity: number,
  unit: string,
  conversionRate: number
): number {
  if (unit?.toUpperCase() === 'PCS') {
    return quantity / (conversionRate || 1);
  }
  return quantity;
}

interface InvoiceSerialized {
  id: number;
  invoice_number: string;
  parent_id?: number;
  customer_id: number;
  currency_id?: number;
  invoice_date: string;
  due_date?: string;
  status: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  notes?: string;
  billing_address?: string;
  is_active: string;
  invoice_method?: string;
  pricelist_id?: number;
  salesperson_id?: number;
  createdate?: string;
  createdby: number;
  updatedate?: string;
  updatedby?: number;
  log_inst?: number;
  customer?: {
    id: number;
    name: string;
    code: string;
    type: string;
  };
  salesperson?: {
    id: number;
    name: string;
    email?: string;
  };
  currency?: {
    id: number;
    name: string;
    code: string;
  };
  order?: {
    id: number;
    order_number: string;
  };
  invoice_items?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    tax_amount: number;
    notes?: string;
    uom?: string;
    conversion_factor?: number;
    base_quantity?: number;
    product?: {
      id: number;
      name: string;
      code: string;
    };
  }>;
}

const serializeInvoice = (invoice: any): InvoiceSerialized => ({
  id: invoice.id,
  invoice_number: invoice.invoice_number,
  parent_id: invoice.parent_id,
  customer_id: invoice.customer_id,
  currency_id: invoice.currency_id,
  invoice_date: invoice.invoice_date?.toISOString() || '',
  due_date: invoice.due_date?.toISOString(),
  status: invoice.status,
  payment_method: invoice.payment_method,
  subtotal: Number(invoice.subtotal),
  discount_amount: Number(invoice.discount_amount),
  tax_amount: Number(invoice.tax_amount),
  shipping_amount: Number(invoice.shipping_amount),
  total_amount: Number(invoice.total_amount),
  amount_paid: Number(invoice.amount_paid),
  balance_due: Number(invoice.balance_due),
  notes: invoice.notes,
  billing_address: invoice.billing_address,
  is_active: invoice.is_active,
  invoice_method: invoice.parent_id ? 'order' : 'direct',
  pricelist_id: invoice.pricelist_id,
  salesperson_id: invoice.salesperson_id,
  createdate: invoice.createdate?.toISOString(),
  createdby: invoice.createdby,
  updatedate: invoice.updatedate?.toISOString(),
  updatedby: invoice.updatedby,
  log_inst: invoice.log_inst,
  salesperson: invoice.invoices_salesperson
    ? {
        id: invoice.invoices_salesperson.id,
        name:
          invoice.invoices_salesperson.name ||
          invoice.invoices_salesperson.full_name ||
          '',
        email: invoice.invoices_salesperson.email || null,
      }
    : undefined,
  customer: invoice.invoices_customers
    ? {
        id: invoice.invoices_customers.id,
        name: invoice.invoices_customers.name,
        code: invoice.invoices_customers.code,
        type:
          invoice.invoices_customers.customer_type_customer?.type_name || null,
      }
    : undefined,

  currency: invoice.currencies
    ? {
        id: invoice.currencies.id,
        name: invoice.currencies.name,
        code: invoice.currencies.code,
      }
    : undefined,
  order: invoice.orders
    ? {
        id: invoice.orders.id,
        order_number: invoice.orders.order_number,
      }
    : undefined,
  invoice_items: invoice.invoice_items?.map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    discount_amount: Number(item.discount_amount),
    tax_amount: Number(item.tax_amount),
    notes: item.notes,
    uom: item.uom,
    conversion_factor: Number(item.conversion_factor) || 1,
    base_quantity: Number(item.base_quantity) || 0,
    tracking_type: item.invoice_items_products?.tracking_type || null,
    product: item.invoice_items_products
      ? {
          id: item.invoice_items_products.id,
          name: item.invoice_items_products.name,
          code: item.invoice_items_products.code,
          tracking_type: item.invoice_items_products.tracking_type || null,
        }
      : undefined,
  })),
});

export const invoicesController = {
  async createInvoice(req: Request, res: Response) {
    try {
      const data = req.body;

      if (!data.customer_id) {
        return res.status(400).json({ message: 'Customer is required' });
      }
      if (!data.invoice_date) {
        return res.status(400).json({ message: 'Invoice date is required' });
      }
      if (!data.status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      if (!data.payment_method) {
        return res.status(400).json({ message: 'Payment method is required' });
      }
      if (
        !data.invoiceItems ||
        !Array.isArray(data.invoiceItems) ||
        data.invoiceItems.length === 0
      ) {
        return res.status(400).json({
          message: 'At leat one invoice item is required to create an invoice',
        });
      }

      const invalidItems = data.invoiceItems.filter(
        (item: any) => !item.product_id || !item.quantity || item.unit_price === undefined || item.unit_price === null || item.unit_price === ''
      );

      if (invalidItems.length > 0) {
        return res.status(400).json({
          message:
            'All invoice items must have product_id, quantity, and unit_price',
        });
      }

      const invoiceNumber = data.invoice_number || `INV-${Date.now()}`;

      const invoice = await prisma.$transaction(async tx => {
        const newInvoice = await tx.invoices.create({
          data: {
            invoice_number: invoiceNumber,
            parent_id:
              data.parent_id && data.invoice_method !== 'direct'
                ? Number(data.parent_id)
                : null,
            customer_id: Number(data.customer_id),
            salesperson_id: data.salesperson_id
              ? Number(data.salesperson_id)
              : null,
            currency_id: data.currency_id ? Number(data.currency_id) : null,
            invoice_date: new Date(data.invoice_date),
            due_date: data.due_date ? new Date(data.due_date) : null,
            status: data.status,
            payment_method: data.payment_method,
            subtotal: Number(data.subtotal) || 0,
            discount_amount: Number(data.discount_amount) || 0,
            tax_amount: Number(data.tax_amount) || 0,
            shipping_amount: Number(data.shipping_amount) || 0,
            total_amount: Number(data.total_amount) || 0,
            amount_paid: Number(data.amount_paid) || 0,
            balance_due: Number(data.balance_due) || 0,
            notes: data.notes || null,
            billing_address: data.billing_address || null,
            is_active: data.is_active || 'Y',
            pricelist_id: data.pricelist_id ? Number(data.pricelist_id) : null,
            createdby: data.createdby ? Number(data.createdby) : 1,
            log_inst: data.log_inst || 1,
            createdate: new Date(),
          },
          include: {
            invoices_customers: {
              select: {
                customer_type_customer: true,
                name: true,
                code: true,
                email: true,
              },
            },
            invoices_salesperson: true,

            currencies: true,
            orders: true,
          },
        });

        if (data.invoiceItems && data.invoiceItems.length > 0) {
          const productIds = data.invoiceItems.map((item: any) =>
            Number(item.product_id)
          );
          const products = await tx.products.findMany({
            where: { id: { in: productIds } },
            include: {
              product_unit_of_measurement: true,
              product_tax_master: true,
            },
          });

          let calculatedSubtotal = 0;
          let calculatedTaxAmount = 0;
          let calculatedDiscountAmount = 0;

          const productMap = new Map(products.map(p => [p.id, p]));

          const salespersonId = Number(data.salesperson_id);
          const groupUsers = await getContainerGroupUsers(tx, salespersonId);
          const targetSalespersonIds = await getContainerOwnerAndSelf(tx, salespersonId);
          const referenceType = 'INVOICE';
          const referenceId = newInvoice.id;
          const referenceLabel = `invoice ${newInvoice.invoice_number}`;

          for (const item of data.invoiceItems) {
            const product = productMap.get(Number(item.product_id));
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unit_price);
            const discountAmount = Number(item.discount_amount) || 0;
            const itemSubtotal = quantity * unitPrice;
            const taxRate = Number(product?.product_tax_master?.tax_rate) || 0;
            const taxAmount = Number(item.tax_amount) || ((itemSubtotal - discountAmount) * taxRate) / 100;
            const totalAmount = itemSubtotal - discountAmount + taxAmount;

            calculatedSubtotal += itemSubtotal;
            calculatedDiscountAmount += discountAmount;
            calculatedTaxAmount += taxAmount;

            const {
              orderedQty,
              orderedPieces,
              conversionFactor: conversionRate,
              uom: itemUnit,
            } = getOrderedQuantities({ ...item, conversion_factor: product?.product_unit_of_measurement?.conversion_rate });

            const isUnitPcs = itemUnit === 'UNIT';
            const baseQuantity = orderedPieces;

            let trackingNotes = '';
            const trackingType = product?.tracking_type?.toUpperCase() || 'NONE';

            if (trackingType === 'BATCH') {
              const batchData = (item as any).product_batches || [];
              const batchDataParsed = Array.isArray(batchData) ? batchData : JSON.parse(batchData || '[]');
              
              trackingNotes = `Batches: ${batchDataParsed.map((b: any) => b.batch_number || b.batch_lot_id).join(', ')}`;

              if (data.invoice_method !== 'order') {
                let batchDeductions = batchDataParsed.map((b: any) => {
                  const bUomQty = parseInt(b.quantity, 10);
                  const bPieces = b.base_quantity ? parseInt(b.base_quantity, 10) : bUomQty * conversionRate;
                  return { batch_lot_id: b.batch_lot_id, pieces: bPieces, uomQty: bUomQty };
                });

                for (const batchOrder of batchDeductions) {
                  const piecesToDeduct = batchOrder.pieces;
                  const batchLot = await tx.batch_lots.findUnique({ where: { id: batchOrder.batch_lot_id } });
                  
                  if (!batchLot) continue;

                  const vanInventory = await tx.van_inventory.findFirst({
                    where: {
                      user_id: { in: groupUsers },
                      status: 'A',
                      is_active: 'Y',
                      van_inventory_items_inventory: { some: { product_id: product?.id, batch_lot_id: batchOrder.batch_lot_id } },
                    },
                    orderBy: { document_date: 'desc' },
                  });

                  const inventoryStock = await tx.inventory_stock.findFirst({
                    where: {
                      product_id: product?.id,
                      salesperson_id: { in: targetSalespersonIds },
                      batch_id: batchOrder.batch_lot_id,
                    },
                  });

                  if (inventoryStock) {
                    const stockDeduction = calculateStockDeduction(
                      inventoryStock.current_stock || 0,
                      inventoryStock.base_quantity || 0,
                      piecesToDeduct,
                      conversionRate,
                      itemUnit,
                      batchOrder.uomQty
                    );

                    let newAvailableQty: number;
                    if (isUnitPcs) {
                      const availableTotalPieces = (inventoryStock.available_stock || 0) * conversionRate + (inventoryStock.base_quantity || 0);
                      const newAvailablePieces = Math.max(0, availableTotalPieces - piecesToDeduct);
                      newAvailableQty = Math.floor(newAvailablePieces / conversionRate);
                    } else {
                      newAvailableQty = Math.max(0, (inventoryStock.available_stock || 0) - batchOrder.uomQty);
                    }

                    await tx.inventory_stock.update({
                      where: { id: inventoryStock.id },
                      data: {
                        current_stock: stockDeduction.newQuantity,
                        available_stock: newAvailableQty,
                        base_quantity: stockDeduction.newBaseQuantity,
                        updatedate: new Date(),
                        updatedby: 1,
                      },
                    });
                  }

                  const validatedFromLocationId = await validateAndGetLocationId(tx, vanInventory?.location_id);
                  await tx.stock_movements.create({
                    data: {
                      product_id: product?.id || 0,
                      batch_id: batchOrder.batch_lot_id,
                      serial_id: null,
                      movement_type: 'SALE',
                      reference_type: referenceType,
                      reference_id: referenceId,
                      from_location_id: validatedFromLocationId,
                      to_location_id: null,
                      quantity: batchOrder.uomQty,
                      movement_date: new Date(),
                      remarks: `Sold via ${referenceLabel} - Batch ${batchLot.batch_number}`,
                      is_active: 'Y',
                      createdate: new Date(),
                      createdby: salespersonId || 1,
                      log_inst: 1,
                      van_inventory_id: vanInventory?.id || null,
                    },
                  });
                }
              }
            } else if (trackingType === 'SERIAL') {
              const serialData = (item as any).product_serials || [];
              const serialDataParsed = Array.isArray(serialData) ? serialData : JSON.parse(serialData || '[]');
              const selectedSerials = serialDataParsed.filter((s: any) => s.selected !== false);
              
              trackingNotes = `Serials: ${selectedSerials.map((s: any) => s.serial_number).join(', ')}`;

              if (data.invoice_method !== 'order') {
                for (const serialInput of selectedSerials) {
                  const serial = await tx.serial_numbers.findUnique({ where: { id: serialInput.id } });
                  if (!serial) continue;
                  
                  await tx.serial_numbers.update({
                    where: { id: serial.id },
                    data: { status: 'sold', sold_date: new Date() },
                  });

                  const vanItemWithSerial = await tx.van_inventory_items.findFirst({
                    where: { product_id: product?.id, serial_id: serial.id, van_inventory_items_inventory: { user_id: { in: groupUsers }, is_active: 'Y', status: 'A' } },
                    include: { van_inventory_items_inventory: true },
                  });
                  const vanInventory = vanItemWithSerial?.van_inventory_items_inventory;

                  let inventoryStock = await tx.inventory_stock.findFirst({
                    where: { product_id: product?.id, salesperson_id: { in: targetSalespersonIds }, serial_number_id: serial.id },
                  });

                  if (!inventoryStock) {
                    inventoryStock = await tx.inventory_stock.findFirst({
                      where: { product_id: product?.id, salesperson_id: { in: targetSalespersonIds }, serial_number_id: null, batch_id: null, ...(vanInventory?.location_id && { location_id: vanInventory.location_id }) },
                    });
                  }

                  if (inventoryStock) {
                    await tx.inventory_stock.update({
                      where: { id: inventoryStock.id },
                      data: {
                        current_stock: Math.max(0, (inventoryStock.current_stock || 0) - 1),
                        available_stock: Math.max(0, (inventoryStock.available_stock || 0) - 1),
                        updatedate: new Date(),
                        updatedby: 1,
                      },
                    });
                  }

                  const validatedFromLocationId = await validateAndGetLocationId(tx, vanInventory?.location_id);
                  await tx.stock_movements.create({
                    data: {
                      product_id: product?.id || 0,
                      batch_id: null,
                      serial_id: serial.id,
                      movement_type: 'SALE',
                      reference_type: referenceType,
                      reference_id: referenceId,
                      from_location_id: validatedFromLocationId,
                      to_location_id: null,
                      quantity: 1,
                      movement_date: new Date(),
                      remarks: `Sold via ${referenceLabel} - Serial ${serial.serial_number}`,
                      is_active: 'Y',
                      createdate: new Date(),
                      createdby: salespersonId || 1,
                      log_inst: 1,
                      van_inventory_id: vanInventory?.id || null,
                    },
                  });
                }
              }
            } else {
              if (data.invoice_method !== 'order') {
                const vanInventory = await tx.van_inventory.findFirst({
                  where: { user_id: { in: groupUsers }, status: 'A', is_active: 'Y', van_inventory_items_inventory: { some: { product_id: product?.id, batch_lot_id: null, serial_id: null } } },
                  orderBy: { document_date: 'desc' },
                });

                const inventoryStock = await tx.inventory_stock.findFirst({
                  where: { product_id: product?.id, salesperson_id: { in: targetSalespersonIds }, batch_id: null, serial_number_id: null, ...(vanInventory?.location_id && { location_id: vanInventory.location_id }) },
                });

                if (inventoryStock) {
                  const stockDeduction = calculateStockDeduction(
                    inventoryStock.current_stock || 0,
                    inventoryStock.base_quantity || 0,
                    orderedPieces,
                    conversionRate,
                    itemUnit,
                    orderedQty
                  );

                  let newAvailableQty: number;
                  if (isUnitPcs) {
                    const availableTotalPieces = (inventoryStock.available_stock || 0) * conversionRate + (inventoryStock.base_quantity || 0);
                    const newAvailablePieces = Math.max(0, availableTotalPieces - orderedPieces);
                    newAvailableQty = Math.floor(newAvailablePieces / conversionRate);
                  } else {
                    newAvailableQty = Math.max(0, (inventoryStock.available_stock || 0) - orderedQty);
                  }

                  await tx.inventory_stock.update({
                    where: { id: inventoryStock.id },
                    data: {
                      current_stock: stockDeduction.newQuantity,
                      available_stock: newAvailableQty,
                      base_quantity: stockDeduction.newBaseQuantity,
                      updatedate: new Date(),
                      updatedby: 1,
                    },
                  });
                }

                const validatedFromLocationId = await validateAndGetLocationId(tx, vanInventory?.location_id);
                await tx.stock_movements.create({
                  data: {
                    product_id: product?.id || 0,
                    batch_id: null,
                    serial_id: null,
                    movement_type: 'SALE',
                    reference_type: referenceType,
                    reference_id: referenceId,
                    from_location_id: validatedFromLocationId,
                    to_location_id: null,
                    quantity: orderedQty || 0,
                    movement_date: new Date(),
                    remarks: `Sold via ${referenceLabel}`,
                    is_active: 'Y',
                    createdate: new Date(),
                    createdby: salespersonId || 1,
                    log_inst: 1,
                    van_inventory_id: vanInventory?.id || null,
                  },
                });
              }
            }

            await tx.invoice_items.create({
              data: {
                parent_id: newInvoice.id,
                product_id: Number(item.product_id),
                product_name: product?.name || '',
                uom: item.uom || product?.product_unit_of_measurement?.name || product?.product_unit_of_measurement?.symbol || 'pcs',
                unit: product?.product_unit_of_measurement?.name || product?.product_unit_of_measurement?.symbol || 'pcs',
                quantity: quantity,
                unit_price: unitPrice,
                discount_amount: discountAmount,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                conversion_factor: conversionRate,
                base_quantity: baseQuantity,
                notes: item.notes ? `${item.notes}${trackingNotes ? ` (${trackingNotes})` : ''}` : trackingNotes || null,
              },
            });
          }
          const invoiceDiscount = Number(data.discount_amount) || 0;
          const invoiceShipping = Number(data.shipping_amount) || 0;
          const finalTotalAmount =
            calculatedSubtotal -
            calculatedDiscountAmount -
            invoiceDiscount +
            calculatedTaxAmount +
            invoiceShipping;

          await tx.invoices.update({
            where: { id: newInvoice.id },
            data: {
              subtotal: calculatedSubtotal,
              tax_amount: calculatedTaxAmount,
              discount_amount: calculatedDiscountAmount + invoiceDiscount,
              total_amount: finalTotalAmount,
              balance_due:
                data.status === 'paid'
                  ? 0
                  : finalTotalAmount - Number(data.amount_paid || 0),
            },
          });
        }

        return newInvoice;
      });

      const completeInvoice = await prisma.invoices.findUnique({
        where: { id: invoice.id },
        include: {
          invoices_customers: {
            select: {
              customer_type_customer: true,
              name: true,
              code: true,
              email: true,
            },
          },
          currencies: true,
          invoices_salesperson: true,

          orders: true,
          invoice_items: {
            include: {
              invoice_items_products: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Invoice created successfully',
        data: serializeInvoice(completeInvoice),
      });
    } catch (error: any) {
      console.error('Create Invoice Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getInvoices(req: Request, res: Response) {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        customer_id,
        status,
        payment_method,
        invoice_date_from,
        invoice_date_to,
        currency_id,
        is_active = 'Y',
        time_filter,
      } = req.query;

      const page_num = parseInt(page as string, 10);
      const limit_num = parseInt(limit as string, 10);
      const searchLower = (search as string).toLowerCase();

      const timeBasedDateFilter = getTimeFilter(
        time_filter as string | undefined
      );

      const user = (req as any).user;
      let isScopeRestricted = false;
      let depotIds: number[] = [];

      if (user && !isAdminRole(user.role)) {
        isScopeRestricted = true;
        const userDepots = await prisma.user_depots.findMany({
          where: { user_id: user.id },
          select: { depot_id: true },
        });
        depotIds = userDepots
          .map((ud: any) => ud.depot_id)
          .filter((id: any) => id !== null) as number[];
      }

      const filters: any = {
        is_active: is_active as string,
        ...(search && {
          OR: [
            { invoice_number: { contains: searchLower } },
            { notes: { contains: searchLower } },
            { billing_address: { contains: searchLower } },
            { invoices_customers: { name: { contains: searchLower } } },
            { invoices_customers: { code: { contains: searchLower } } },
          ],
        }),
        ...(customer_id && { customer_id: Number(customer_id) }),
        ...(status && { status: status as string }),
        ...(payment_method && { payment_method: payment_method as string }),
        ...(currency_id && { currency_id: Number(currency_id) }),
        ...(timeBasedDateFilter
          ? { invoice_date: timeBasedDateFilter }
          : invoice_date_from || invoice_date_to
            ? {
                invoice_date: {
                  ...(invoice_date_from && {
                    gte: new Date(invoice_date_from as string),
                  }),
                  ...(invoice_date_to && {
                    lte: new Date(invoice_date_to as string),
                  }),
                },
              }
            : undefined),
      };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          filters.invoices_salesperson = {
            ...filters.invoices_salesperson,
            users_depots_users: {
              some: {
                depot_id: { in: depotIds },
              },
            },
          };
        } else {
          filters.id = -1;
        }
      }

      const totalInvoices = await prisma.invoices.count({ where: filters });
      const totalAmount = await prisma.invoices.aggregate({
        where: filters,
        _sum: { total_amount: true },
      });

      const amountPaid = await prisma.invoices.aggregate({
        where: filters,
        _sum: { amount_paid: true },
      });

      const balanceDue = await prisma.invoices.aggregate({
        where: filters,
        _sum: { balance_due: true },
      });

      const stats = {
        total_invoices: totalInvoices,
        total_amount: Number(totalAmount._sum.total_amount || 0),
        amount_paid: Number(amountPaid._sum.amount_paid || 0),
        balance_due: Number(balanceDue._sum.balance_due || 0),
      };

      const { data, pagination } = await paginate({
        model: prisma.invoices,
        filters,
        page: page_num,
        limit: limit_num,
        orderBy: { createdate: 'desc' },
        include: {
          invoices_customers: {
            select: {
              customer_type_customer: true,
              name: true,
              code: true,
              email: true,
            },
          },
          invoices_salesperson: true,

          currencies: true,
          orders: true,
          invoice_items: {
            include: {
              invoice_items_products: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: data.map((d: any) => serializeInvoice(d)),
        pagination: {
          requestDuration: Date.now(),
          timestamp: new Date().toISOString(),
          ...pagination,
        },
        stats,
      });
    } catch (error: any) {
      console.error('Get Invoices Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getInvoiceById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = (req as any).user;
      let isScopeRestricted = false;
      let depotIds: number[] = [];

      if (user && !isAdminRole(user.role)) {
        isScopeRestricted = true;
        const userDepots = await prisma.user_depots.findMany({
          where: { user_id: user.id },
          select: { depot_id: true },
        });
        depotIds = userDepots
          .map((ud: any) => ud.depot_id)
          .filter((id: any) => id !== null) as number[];
      }

      const whereClause: any = { id: Number(id) };

      if (isScopeRestricted) {
        if (depotIds.length > 0) {
          whereClause.invoices_salesperson = {
            ...whereClause.invoices_salesperson,
            users_depots_users: {
              some: {
                depot_id: { in: depotIds },
              },
            },
          };
        } else {
          whereClause.id = -1;
        }
      }

      const invoice = await prisma.invoices.findFirst({
        where: whereClause,
        include: {
          invoices_customers: {
            select: {
              customer_type_customer: true,
              name: true,
              code: true,
              email: true,
            },
          },
          currencies: true,
          orders: true,
          invoices_salesperson: true,

          invoice_items: {
            include: {
              invoice_items_products: true,
            },
          },
        },
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      res.json({
        message: 'Invoice fetched successfully',
        data: serializeInvoice(invoice),
      });
    } catch (error: any) {
      console.error('Get Invoice Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const existingInvoice = await prisma.invoices.findUnique({
        where: { id: Number(id) },
      });

      if (!existingInvoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      await prisma.$transaction(async tx => {
        await tx.invoices.update({
          where: { id: Number(id) },
          data: {
            parent_id:
              data.parent_id && data.invoice_method !== 'direct'
                ? Number(data.parent_id)
                : null,
            customer_id: data.customer_id
              ? Number(data.customer_id)
              : undefined,
            salesperson_id: data.salesperson_id
              ? Number(data.salesperson_id)
              : undefined,
            currency_id: data.currency_id
              ? Number(data.currency_id)
              : undefined,
            invoice_date: data.invoice_date
              ? new Date(data.invoice_date)
              : undefined,
            due_date: data.due_date ? new Date(data.due_date) : undefined,
            status: data.status,
            payment_method: data.payment_method,
            subtotal: data.subtotal !== undefined ? Number(data.subtotal) : 0,
            discount_amount:
              data.discount_amount !== undefined
                ? Number(data.discount_amount)
                : 0,
            tax_amount:
              data.tax_amount !== undefined ? Number(data.tax_amount) : 0,
            shipping_amount:
              data.shipping_amount !== undefined
                ? Number(data.shipping_amount)
                : 0,
            total_amount:
              data.total_amount !== undefined ? Number(data.total_amount) : 0,
            amount_paid:
              data.amount_paid !== undefined ? Number(data.amount_paid) : 0,
            balance_due:
              data.balance_due !== undefined ? Number(data.balance_due) : 0,
            notes: data.notes !== undefined ? data.notes : undefined,
            billing_address:
              data.billing_address !== undefined
                ? data.billing_address
                : undefined,
            is_active: data.is_active || 'Y',
            pricelist_id:
              data.pricelist_id !== undefined
                ? data.pricelist_id
                  ? Number(data.pricelist_id)
                  : null
                : undefined,
            updatedate: new Date(),
          },
        });

        if (data.invoiceItems && Array.isArray(data.invoiceItems)) {
          await tx.invoice_items.deleteMany({
            where: { parent_id: Number(id) },
          });

          if (data.invoiceItems.length > 0) {
            const productIds = data.invoiceItems.map((item: any) =>
              Number(item.product_id)
            );
            const products = await tx.products.findMany({
              where: { id: { in: productIds } },
              include: {
                product_unit_of_measurement: true,
                product_tax_master: true,
              },
            });

            let calculatedSubtotal = 0;
            let calculatedTaxAmount = 0;
            let calculatedDiscountAmount = 0;

            const productMap = new Map(products.map(p => [p.id, p]));

            for (const item of data.invoiceItems) {
              const product = productMap.get(Number(item.product_id));
              const quantity = Number(item.quantity);
              const unitPrice = Number(item.unit_price);
              const discountAmount = Number(item.discount_amount) || 0;
              const itemSubtotal = quantity * unitPrice;
              const taxRate =
                Number(product?.product_tax_master?.tax_rate) || 0;
              const taxAmount =
                Number(item.tax_amount) ||
                ((itemSubtotal - discountAmount) * taxRate) / 100;
              const totalAmount = itemSubtotal - discountAmount + taxAmount;
              calculatedSubtotal += itemSubtotal;
              calculatedDiscountAmount += discountAmount;
              calculatedTaxAmount += taxAmount;

              let trackingNotes = '';
              const trackingType = product?.tracking_type?.toUpperCase();

              if (trackingType === 'BATCH' && item.product_batches) {
                const batchData = Array.isArray(item.product_batches)
                  ? item.product_batches
                  : JSON.parse(item.product_batches || '[]');
                trackingNotes = `Batches: ${batchData.map((b: any) => b.batch_number || b.batch_lot_id).join(', ')}`;
              } else if (trackingType === 'SERIAL' && item.product_serials) {
                const serialData = Array.isArray(item.product_serials)
                  ? item.product_serials
                  : JSON.parse(item.product_serials || '[]');
                const selectedSerials = serialData.filter(
                  (s: any) => s.selected !== false
                );
                trackingNotes = `Serials: ${selectedSerials.map((s: any) => s.serial_number).join(', ')}`;
              }
              await tx.invoice_items.create({
                data: {
                  parent_id: Number(id),
                  product_id: Number(item.product_id),
                  product_name: product?.name || '',
                  uom:
                    item.uom ||
                    product?.product_unit_of_measurement?.name ||
                    product?.product_unit_of_measurement?.symbol ||
                    'pcs',
                  unit:
                    product?.product_unit_of_measurement?.name ||
                    product?.product_unit_of_measurement?.symbol ||
                    'pcs',
                  quantity: quantity,
                  unit_price: unitPrice,
                  discount_amount: discountAmount,
                  tax_amount: taxAmount,
                  total_amount: totalAmount,
                  conversion_factor: Number(item.conversion_factor) || 1,
                  base_quantity: Number(item.base_quantity) || 0,
                  notes: item.notes
                    ? `${item.notes}${trackingNotes ? ` (${trackingNotes})` : ''}`
                    : trackingNotes || null,
                },
              });
            }

            const invoiceDiscount = Number(data.discount_amount) || 0;
            const invoiceShipping = Number(data.shipping_amount) || 0;
            const finalTotalAmount =
              calculatedSubtotal -
              calculatedDiscountAmount -
              invoiceDiscount +
              calculatedTaxAmount +
              invoiceShipping;

            await tx.invoices.update({
              where: { id: Number(id) },
              data: {
                subtotal: calculatedSubtotal,
                tax_amount: calculatedTaxAmount,
                discount_amount: calculatedDiscountAmount + invoiceDiscount,
                total_amount: finalTotalAmount,
                balance_due:
                  data.status === 'paid'
                    ? 0
                    : finalTotalAmount - Number(data.amount_paid || 0),
              },
            });
          }
        }
      });

      const updatedInvoice = await prisma.invoices.findUnique({
        where: { id: Number(id) },
        include: {
          invoices_customers: {
            select: {
              customer_type_customer: true,
              name: true,
              code: true,
              email: true,
            },
          },
          currencies: true,
          orders: true,
          invoices_salesperson: true,

          invoice_items: {
            include: {
              invoice_items_products: true,
            },
          },
        },
      });

      res.json({
        message: 'Invoice updated successfully',
        data: serializeInvoice(updatedInvoice),
      });
    } catch (error: any) {
      console.error('Update Invoice Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existingInvoice = await prisma.invoices.findUnique({
        where: { id: Number(id) },
      });

      if (!existingInvoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      await prisma.$transaction(async tx => {
        await tx.invoice_items.deleteMany({
          where: { parent_id: Number(id) },
        });

        await tx.invoices.delete({ where: { id: Number(id) } });
      });

      res.json({ message: 'Invoice deleted successfully' });
    } catch (error: any) {
      console.error('Delete Invoice Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async createInvoicePaymentLine(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const data = req.body;

      if (!data.payment_id) {
        return res.status(400).json({ message: 'Payment ID is required' });
      }
      if (!data.amount_applied) {
        return res.status(400).json({ message: 'Amount applied is required' });
      }

      const invoice = await prisma.invoices.findUnique({
        where: { id: Number(invoiceId) },
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const payment = await prisma.payments.findUnique({
        where: { id: Number(data.payment_id) },
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      const paymentLine = await prisma.payment_lines.create({
        data: {
          parent_id: Number(data.payment_id),
          invoice_id: Number(invoiceId),
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          amount_applied: Number(data.amount_applied),
          notes: data.notes || null,
        },
        include: {
          invoices: true,
          payments: {
            include: {
              payments_customers: true,
              users_payments_collected_byTousers: true,
              currencies: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Payment line created successfully',
        data: paymentLine,
      });
    } catch (error: any) {
      console.error('Create Invoice Payment Line Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getInvoicePaymentLines(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;

      const paymentLines = await prisma.payment_lines.findMany({
        where: { invoice_id: Number(invoiceId) },
        include: {
          invoices: true,
          payments: {
            include: {
              payments_customers: true,
              users_payments_collected_byTousers: true,
              currencies: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });

      res.json({
        success: true,
        message: 'Payment lines retrieved successfully',
        data: paymentLines,
      });
    } catch (error: any) {
      console.error('Get Invoice Payment Lines Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateInvoicePaymentLine(req: Request, res: Response) {
    try {
      const { invoiceId, lineId } = req.params;
      const data = req.body;

      const existingLine = await prisma.payment_lines.findFirst({
        where: {
          id: Number(lineId),
          invoice_id: Number(invoiceId),
        },
      });

      if (!existingLine) {
        return res.status(404).json({ message: 'Payment line not found' });
      }

      const paymentLine = await prisma.payment_lines.update({
        where: { id: Number(lineId) },
        data: {
          amount_applied: data.amount_applied
            ? Number(data.amount_applied)
            : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: {
          invoices: true,
          payments: {
            include: {
              payments_customers: true,
              users_payments_collected_byTousers: true,
              currencies: true,
            },
          },
        },
      });

      res.json({
        message: 'Payment line updated successfully',
        data: paymentLine,
      });
    } catch (error: any) {
      console.error('Update Invoice Payment Line Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteInvoicePaymentLine(req: Request, res: Response) {
    try {
      const { invoiceId, lineId } = req.params;

      const existingLine = await prisma.payment_lines.findFirst({
        where: {
          id: Number(lineId),
          invoice_id: Number(invoiceId),
        },
      });

      if (!existingLine) {
        return res.status(404).json({ message: 'Payment line not found' });
      }

      await prisma.payment_lines.delete({
        where: { id: Number(lineId) },
      });

      res.json({ message: 'Payment line deleted successfully' });
    } catch (error: any) {
      console.error('Delete Invoice Payment Line Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async bulkUpdateInvoicePaymentLines(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const { paymentLines } = req.body;

      if (!Array.isArray(paymentLines)) {
        return res
          .status(400)
          .json({ message: 'Payment lines must be an array' });
      }

      const invoice = await prisma.invoices.findUnique({
        where: { id: Number(invoiceId) },
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const result = await prisma.$transaction(async tx => {
        await tx.payment_lines.deleteMany({
          where: { invoice_id: Number(invoiceId) },
        });

        const newPaymentLines = [];
        for (const line of paymentLines) {
          if (line.payment_id && line.amount_applied) {
            const paymentLine = await tx.payment_lines.create({
              data: {
                parent_id: Number(line.payment_id),
                invoice_id: Number(invoiceId),
                invoice_number: invoice.invoice_number,
                invoice_date: invoice.invoice_date,
                amount_applied: Number(line.amount_applied),
                notes: line.notes || null,
              },
            });
            newPaymentLines.push(paymentLine);
          }
        }

        return newPaymentLines;
      });

      res.json({
        message: 'Payment lines updated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Bulk Update Invoice Payment Lines Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async createInvoiceItem(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const data = req.body;

      if (!data.product_id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      if (!data.quantity) {
        return res.status(400).json({ message: 'Quantity is required' });
      }
      if (!data.unit_price) {
        return res.status(400).json({ message: 'Unit price is required' });
      }

      const invoice = await prisma.invoices.findUnique({
        where: { id: Number(invoiceId) },
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const product = await prisma.products.findUnique({
        where: { id: Number(data.product_id) },
        include: {
          product_unit_of_measurement: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const invoiceItem = await prisma.invoice_items.create({
        data: {
          parent_id: Number(invoiceId),
          product_id: Number(data.product_id),
          product_name: product.name,
          unit:
            product.product_unit_of_measurement?.name ||
            product.product_unit_of_measurement?.symbol ||
            'pcs',
          quantity: Number(data.quantity),
          unit_price: Number(data.unit_price),
          discount_amount: Number(data.discount_amount) || 0,
          tax_amount: Number(data.tax_amount) || 0,
          total_amount:
            Number(data.quantity) * Number(data.unit_price) -
            (Number(data.discount_amount) || 0) +
            (Number(data.tax_amount) || 0),
          notes: data.notes || null,
        },
        include: {
          invoice_items_products: true,
        },
      });

      res.status(201).json({
        message: 'Invoice item created successfully',
        data: invoiceItem,
      });
    } catch (error: any) {
      console.error('Create Invoice Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async getInvoiceItems(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;

      const invoiceItems = await prisma.invoice_items.findMany({
        where: { parent_id: Number(invoiceId) },
        include: {
          invoice_items_products: {
            include: {
              product_unit_of_measurement: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      res.json({
        success: true,
        message: 'Invoice items retrieved successfully',
        data: invoiceItems,
      });
    } catch (error: any) {
      console.error('Get Invoice Items Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async updateInvoiceItem(req: Request, res: Response) {
    try {
      const { invoiceId, itemId } = req.params;
      const data = req.body;

      const existingItem = await prisma.invoice_items.findFirst({
        where: {
          id: Number(itemId),
          parent_id: Number(invoiceId),
        },
      });

      if (!existingItem) {
        return res.status(404).json({ message: 'Invoice item not found' });
      }

      const invoiceItem = await prisma.invoice_items.update({
        where: { id: Number(itemId) },
        data: {
          quantity: data.quantity ? Number(data.quantity) : undefined,
          unit_price: data.unit_price ? Number(data.unit_price) : undefined,
          discount_amount:
            data.discount_amount !== undefined
              ? Number(data.discount_amount)
              : undefined,
          tax_amount:
            data.tax_amount !== undefined ? Number(data.tax_amount) : undefined,
          total_amount:
            data.quantity && data.unit_price
              ? Number(data.quantity) * Number(data.unit_price) -
                (Number(data.discount_amount) || 0) +
                (Number(data.tax_amount) || 0)
              : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: {
          invoice_items_products: true,
        },
      });

      res.json({
        message: 'Invoice item updated successfully',
        data: invoiceItem,
      });
    } catch (error: any) {
      console.error('Update Invoice Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async deleteInvoiceItem(req: Request, res: Response) {
    try {
      const { invoiceId, itemId } = req.params;

      const existingItem = await prisma.invoice_items.findFirst({
        where: {
          id: Number(itemId),
          parent_id: Number(invoiceId),
        },
      });

      if (!existingItem) {
        return res.status(404).json({ message: 'Invoice item not found' });
      }

      await prisma.invoice_items.delete({
        where: { id: Number(itemId) },
      });

      res.json({ message: 'Invoice item deleted successfully' });
    } catch (error: any) {
      console.error('Delete Invoice Item Error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async bulkUpdateInvoiceItems(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const { invoiceItems } = req.body;

      if (!Array.isArray(invoiceItems)) {
        return res
          .status(400)
          .json({ message: 'Invoice items must be an array' });
      }

      const invoice = await prisma.invoices.findUnique({
        where: { id: Number(invoiceId) },
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const result = await prisma.$transaction(async tx => {
        await tx.invoice_items.deleteMany({
          where: { parent_id: Number(invoiceId) },
        });

        const newInvoiceItems = [];
        for (const item of invoiceItems) {
          if (item.product_id && item.quantity && item.unit_price) {
            const product = await tx.products.findUnique({
              where: { id: Number(item.product_id) },
              include: {
                product_unit_of_measurement: true,
              },
            });

            if (product) {
              const invoiceItem = await tx.invoice_items.create({
                data: {
                  parent_id: Number(invoiceId),
                  product_id: Number(item.product_id),
                  product_name: product.name,
                  unit:
                    product.product_unit_of_measurement?.name ||
                    product.product_unit_of_measurement?.symbol ||
                    'pcs',
                  quantity: Number(item.quantity),
                  unit_price: Number(item.unit_price),
                  discount_amount: Number(item.discount_amount) || 0,
                  tax_amount: Number(item.tax_amount) || 0,
                  total_amount:
                    Number(item.quantity) * Number(item.unit_price) -
                    (Number(item.discount_amount) || 0) +
                    (Number(item.tax_amount) || 0),
                  notes: item.notes || null,
                },
              });
              newInvoiceItems.push(invoiceItem);
            }
          }
        }

        return newInvoiceItems;
      });

      res.json({
        message: 'Invoice items updated successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Bulk Update Invoice Items Error:', error);
      res.status(500).json({ message: error.message });
    }
  },
};
