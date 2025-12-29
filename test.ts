async getSalespersonInventory(req: Request, res: Response) {
  try {
    const { salesperson_id } = req.params;
    const { 
      page, 
      limit, 
      search, 
      product_id, 
      tracking_type,
      include_empty = 'false',
      include_expired_batches = 'false',
      batch_status, // 'all', 'expiring', 'expired', 'active'
      serial_status, // 'in_van', 'sold', 'available', etc.
    } = req.query;

    if (!salesperson_id) {
      return res.status(400).json({
        success: false,
        message: 'Salesperson ID is required',
      });
    }

    const salespersonIdNum = parseInt(salesperson_id as string, 10);

    // ============================================
    // STEP 1: Verify salesperson exists
    // ============================================
    const salesperson = await prisma.users.findUnique({
      where: { id: salespersonIdNum },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        user_type: true,
      },
    });

    if (!salesperson) {
      return res.status(404).json({
        success: false,
        message: 'Salesperson not found',
      });
    }
    const vanInventories = await prisma.van_inventory.findMany({
      where: {
        user_id: salespersonIdNum,
        is_active: 'Y',
        status: 'A',
      },
      include: {
        vehicle: {
          select: {
            id: true,
            vehicle_number: true,
            type: true,
            model: true,
            license_plate: true,
          },
        },
        van_inventory_depot: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
        van_inventory_items_inventory: {
          include: {
            van_inventory_items_products: {
              include: {
                product_unit_of_measurement: true,
                product_categories: {
                  select: {
                    id: true,
                    category_name: true,
                  },
                },
                product_sub_categories: {
                  select: {
                    id: true,
                    sub_category_name: true,
                  },
                },
                product_brands: {
                  select: {
                    id: true,
                    brand_name: true,
                  },
                },
                product_product_batches: {
                  where: { is_active: 'Y' },
                  include: {
                    batch_lot_product_batches: true,
                  },
                },
                serial_numbers_products: {
                  where: {
                    is_active: 'Y',
                    status: serial_status ? (serial_status as string) : 'in_van',
                  },
                  select: {
                    id: true,
                    serial_number: true,
                    status: true,
                    warranty_expiry: true,
                    batch_id: true,
                    customer_id: true,
                    sold_date: true,
                    location_id: true,
                    createdate: true,
                    serial_numbers_customers: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        phone_number: true,
                      },
                    },
                    serial_numbers_batch_lots: {
                      select: {
                        id: true,
                        batch_number: true,
                        lot_number: true,
                        expiry_date: true,
                      },
                    },
                  },
                },
              },
            },
            van_inventory_items_batch_lot: true,
          },
        },
      },
      orderBy: { document_date: 'desc' },
    });

    if (vanInventories.length === 0) {
      return res.json({
        success: true,
        message: 'No inventory found for this salesperson',
        data: {
          salesperson,
          van_inventories: [],
          inventory_summary: {
            total_van_inventories: 0,
            total_unique_products: 0,
            total_items_count: 0,
            total_quantity: 0,
            total_value: 0,
            total_batches: 0,
            total_serials: 0,
            tracking_type_breakdown: {
              batch: 0,
              serial: 0,
              none: 0,
            },
            batch_status_breakdown: {
              active: 0,
              expiring_soon: 0,
              expired: 0,
            },
            serial_status_breakdown: {},
          },
          products: [],
          batches_summary: [],
          serials_summary: [],
        },
      });
    }

    // ============================================
    // STEP 3: Aggregate inventory data
    // ============================================
    const productInventoryMap = new Map<number, {
      product_id: number;
      product_name: string;
      product_code: string;
      tracking_type: string;
      unit: string;
      category: any;
      sub_category: any;
      brand: any;
      base_price: number | null;
      total_quantity: number;
      total_value: number;
      van_inventory_count: number;
      van_inventory_ids: number[];
      batches: any[];
      serials: any[];
      items: any[];
    }>();

    const allBatches: any[] = [];
    const allSerials: any[] = [];
    const batchStatusCount = { active: 0, expiring_soon: 0, expired: 0 };
    const serialStatusCount: any = {};
    const trackingTypeCount = { batch: 0, serial: 0, none: 0 };

    for (const vanInventory of vanInventories) {
      for (const item of vanInventory.van_inventory_items_inventory) {
        const product = item.van_inventory_items_products;
        if (!product) continue;

        const productId = item.product_id;
        
        // Apply search filter
        if (search) {
          const searchLower = (search as string).toLowerCase();
          const matchesSearch = 
            product.name?.toLowerCase().includes(searchLower) ||
            product.code?.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower);
          if (!matchesSearch) continue;
        }

        // Apply product_id filter
        if (product_id && productId !== parseInt(product_id as string, 10)) {
          continue;
        }

        // Apply tracking_type filter
        if (tracking_type && product.tracking_type !== tracking_type) {
          continue;
        }

        // Initialize or update product entry
        if (!productInventoryMap.has(productId)) {
          const pTrackingType = product.tracking_type || 'none';
          trackingTypeCount[pTrackingType as keyof typeof trackingTypeCount]++;

          productInventoryMap.set(productId, {
            product_id: productId,
            product_name: product.name || item.product_name || '',
            product_code: product.code || '',
            tracking_type: pTrackingType,
            unit: item.unit || product.product_unit_of_measurement?.name || 'pcs',
            category: product.product_categories || null,
            sub_category: product.product_sub_categories || null,
            brand: product.product_brands || null,
            base_price: product.base_price ? Number(product.base_price) : null,
            total_quantity: 0,
            total_value: 0,
            van_inventory_count: 0,
            van_inventory_ids: [],
            batches: [],
            serials: [],
            items: [],
          });
        }

        const productEntry = productInventoryMap.get(productId)!;
        
        productEntry.total_quantity += item.quantity || 0;
        productEntry.total_value += Number(item.total_amount) || 0;
        
        if (!productEntry.van_inventory_ids.includes(vanInventory.id)) {
          productEntry.van_inventory_ids.push(vanInventory.id);
          productEntry.van_inventory_count++;
        }

        // Add item details
        productEntry.items.push({
          van_inventory_id: vanInventory.id,
          van_inventory_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price ? Number(item.unit_price) : null,
          discount_amount: item.discount_amount ? Number(item.discount_amount) : null,
          tax_amount: item.tax_amount ? Number(item.tax_amount) : null,
          total_amount: item.total_amount ? Number(item.total_amount) : null,
          batch_lot_id: item.batch_lot_id,
          document_date: vanInventory.document_date,
          loading_type: vanInventory.loading_type,
          vehicle: vanInventory.vehicle,
          notes: item.notes,
        });

        // ============================================
        // PROCESS BATCH INFORMATION
        // ============================================
        if (item.batch_lot_id && item.van_inventory_items_batch_lot) {
          const batchLot = item.van_inventory_items_batch_lot;
          const isExpired = new Date(batchLot.expiry_date) <= new Date();
          const daysUntilExpiry = Math.floor(
            (new Date(batchLot.expiry_date).getTime() - Date.now()) / 
            (1000 * 60 * 60 * 24)
          );
          const isExpiringSoon = !isExpired && daysUntilExpiry <= 30;

          // Filter by batch_status
          if (batch_status) {
            if (batch_status === 'active' && (isExpired || isExpiringSoon)) continue;
            if (batch_status === 'expiring' && !isExpiringSoon) continue;
            if (batch_status === 'expired' && !isExpired) continue;
          }

          // Filter expired batches
          if (include_expired_batches !== 'true' && isExpired) continue;

          // Update batch status count
          if (isExpired) {
            batchStatusCount.expired++;
          } else if (isExpiringSoon) {
            batchStatusCount.expiring_soon++;
          } else {
            batchStatusCount.active++;
          }
          
          const existingBatch = productEntry.batches.find(
            b => b.batch_lot_id === item.batch_lot_id
          );

          if (!existingBatch) {
            const batchData = {
              batch_lot_id: batchLot.id,
              batch_number: batchLot.batch_number,
              lot_number: batchLot.lot_number,
              manufacturing_date: batchLot.manufacturing_date,
              expiry_date: batchLot.expiry_date,
              supplier_name: batchLot.supplier_name,
              purchase_price: batchLot.purchase_price ? Number(batchLot.purchase_price) : null,
              quality_grade: batchLot.quality_grade,
              storage_location: batchLot.storage_location,
              quantity_in_van: item.quantity || 0,
              total_quantity: batchLot.quantity,
              remaining_quantity: batchLot.remaining_quantity,
              is_expired: isExpired,
              is_expiring_soon: isExpiringSoon,
              days_until_expiry: daysUntilExpiry,
              status: isExpired ? 'expired' : isExpiringSoon ? 'expiring_soon' : 'active',
              product_id: productId,
              product_name: product.name,
              product_code: product.code,
              van_inventory_ids: [vanInventory.id],
            };
            
            productEntry.batches.push(batchData);
            allBatches.push(batchData);
          } else {
            existingBatch.quantity_in_van += item.quantity || 0;
            if (!existingBatch.van_inventory_ids.includes(vanInventory.id)) {
              existingBatch.van_inventory_ids.push(vanInventory.id);
            }
          }
        }

        // ============================================
        // PROCESS SERIAL NUMBERS
        // ============================================
        if (product.serial_numbers_products && product.serial_numbers_products.length > 0) {
          for (const serial of product.serial_numbers_products) {
            // Update serial status count
            serialStatusCount[serial.status] = (serialStatusCount[serial.status] || 0) + 1;

            const warrantyExpired = serial.warranty_expiry && 
              new Date(serial.warranty_expiry) <= new Date();

            const serialData = {
              serial_id: serial.id,
              serial_number: serial.serial_number,
              status: serial.status,
              warranty_expiry: serial.warranty_expiry,
              warranty_expired: warrantyExpired,
              warranty_days_remaining: serial.warranty_expiry ? Math.floor(
                (new Date(serial.warranty_expiry).getTime() - Date.now()) / 
                (1000 * 60 * 60 * 24)
              ) : null,
              batch_id: serial.batch_id,
              batch: serial.serial_numbers_batch_lots || null,
              customer_id: serial.customer_id,
              customer: serial.serial_numbers_customers || null,
              sold_date: serial.sold_date,
              location_id: serial.location_id,
              created_date: serial.createdate,
              product_id: productId,
              product_name: product.name,
              product_code: product.code,
            };
            
            const existsInProduct = productEntry.serials.find(
              s => s.serial_id === serial.id
            );
            
            if (!existsInProduct) {
              productEntry.serials.push(serialData);
              allSerials.push(serialData);
            }
          }
        }
      }
    }

    // ============================================
    // STEP 4: Convert to array and apply filters
    // ============================================
    let productsArray = Array.from(productInventoryMap.values());

    // Filter out empty products if needed
    if (include_empty !== 'true') {
      productsArray = productsArray.filter(p => p.total_quantity > 0);
    }

    // Sort products by total quantity (descending)
    productsArray.sort((a, b) => b.total_quantity - a.total_quantity);

    // ============================================
    // STEP 5: Create batch summary grouped by status
    // ============================================
    const batchesByStatus = {
      active: allBatches.filter(b => b.status === 'active'),
      expiring_soon: allBatches.filter(b => b.status === 'expiring_soon'),
      expired: allBatches.filter(b => b.status === 'expired'),
    };

    // Sort batches by expiry date
    const sortedBatches = [...allBatches].sort((a, b) => 
      a.days_until_expiry - b.days_until_expiry
    );

    // ============================================
    // STEP 6: Create serial summary grouped by status
    // ============================================
    const serialsByStatus: any = {};
    for (const status in serialStatusCount) {
      serialsByStatus[status] = allSerials.filter(s => s.status === status);
    }

    // ============================================
    // STEP 7: Calculate comprehensive summary
    // ============================================
    const summary = {
      salesperson_info: {
        id: salesperson.id,
        name: salesperson.name,
        email: salesperson.email,
        phone_number: salesperson.phone_number,
        user_type: salesperson.user_type,
      },
      overview: {
        total_van_inventories: vanInventories.length,
        total_unique_products: productsArray.length,
        total_items_count: productsArray.reduce((sum, p) => sum + p.items.length, 0),
        total_quantity: productsArray.reduce((sum, p) => sum + p.total_quantity, 0),
        total_value: productsArray.reduce((sum, p) => sum + p.total_value, 0),
        total_batches: allBatches.length,
        total_serials: allSerials.length,
      },
      tracking_type_breakdown: trackingTypeCount,
      batch_status_breakdown: {
        active: batchStatusCount.active,
        expiring_soon: batchStatusCount.expiring_soon,
        expired: batchStatusCount.expired,
        total: batchStatusCount.active + batchStatusCount.expiring_soon + batchStatusCount.expired,
      },
      serial_status_breakdown: serialStatusCount,
      top_products_by_quantity: productsArray.slice(0, 10).map(p => ({
        product_id: p.product_id,
        product_name: p.product_name,
        product_code: p.product_code,
        quantity: p.total_quantity,
        value: p.total_value,
      })),
      top_products_by_value: [...productsArray]
        .sort((a, b) => b.total_value - a.total_value)
        .slice(0, 10)
        .map(p => ({
          product_id: p.product_id,
          product_name: p.product_name,
          product_code: p.product_code,
          quantity: p.total_quantity,
          value: p.total_value,
        })),
    };

    // ============================================
    // STEP 8: Apply pagination to products
    // ============================================
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = productsArray.slice(startIndex, startIndex + limitNum);

    const pagination = {
      current_page: pageNum,
      per_page: limitNum,
      total_pages: Math.ceil(productsArray.length / limitNum),
      total_count: productsArray.length,
      has_next: pageNum < Math.ceil(productsArray.length / limitNum),
      has_prev: pageNum > 1,
    };

    // ============================================
    // STEP 9: Format van inventories for response
    // ============================================
    const formattedVanInventories = vanInventories.map(vi => ({
      id: vi.id,
      status: vi.status,
      loading_type: vi.loading_type,
      document_date: vi.document_date,
      last_updated: vi.last_updated,
      vehicle: vi.vehicle,
      depot: vi.van_inventory_depot,
      location_type: vi.location_type,
      items_count: vi.van_inventory_items_inventory.length,
      total_quantity: vi.van_inventory_items_inventory.reduce(
        (sum, item) => sum + (item.quantity || 0), 0
      ),
      total_value: vi.van_inventory_items_inventory.reduce(
        (sum, item) => sum + Number(item.total_amount || 0), 0
      ),
      createdate: vi.createdate,
    }));

    // ============================================
    // STEP 10: Return comprehensive response
    // ============================================
    res.json({
      success: true,
      message: 'Salesperson inventory retrieved successfully',
      data: {
        salesperson: {
          id: salesperson.id,
          name: salesperson.name,
          email: salesperson.email,
          phone_number: salesperson.phone_number,
          user_type: salesperson.user_type,
        },
        
        // Van inventories overview
        van_inventories: formattedVanInventories,
        
        // Summary statistics
        inventory_summary: summary,
        
        // Products with details (paginated)
        products: paginatedProducts.map(p => ({
          product_id: p.product_id,
          product_name: p.product_name,
          product_code: p.product_code,
          tracking_type: p.tracking_type,
          unit: p.unit,
          category: p.category,
          sub_category: p.sub_category,
          brand: p.brand,
          base_price: p.base_price,
          total_quantity: p.total_quantity,
          total_value: p.total_value,
          van_inventory_count: p.van_inventory_count,
          batches_count: p.batches.length,
          serials_count: p.serials.length,
          items_count: p.items.length,
          
          // Batch details for this product
          batches: p.batches.sort((a, b) => a.days_until_expiry - b.days_until_expiry),
          
          // Serial details for this product
          serials: p.serials,
          
          // Van inventory items for this product
          van_inventory_items: p.items,
        })),
        
        // All batches summary (grouped by status)
        batches_summary: {
          total: allBatches.length,
          by_status: {
            active: {
              count: batchesByStatus.active.length,
              batches: batchesByStatus.active.slice(0, 20), // Top 20
            },
            expiring_soon: {
              count: batchesByStatus.expiring_soon.length,
              batches: batchesByStatus.expiring_soon,
            },
            expired: {
              count: batchesByStatus.expired.length,
              batches: batchesByStatus.expired,
            },
          },
          all_batches_sorted_by_expiry: sortedBatches,
        },
        
        // All serials summary (grouped by status)
        serials_summary: {
          total: allSerials.length,
          by_status: Object.keys(serialsByStatus).map(status => ({
            status,
            count: serialsByStatus[status].length,
            serials: serialsByStatus[status],
          })),
          all_serials: allSerials,
        },
      },
      pagination,
    });
  } catch (error: any) {
    console.error('Get Salesperson Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve salesperson inventory',
      error: error.message,
    });
  }
},