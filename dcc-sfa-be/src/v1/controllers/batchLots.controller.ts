import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

interface ProductInput {
  product_id: number;
  quantity: number;
}
// interface BatchLotInput {
//   batch_number: string;
//   lot_number?: string;
//   manufacturing_date: string | Date;
//   expiry_date: string | Date;
//   quantity: number;
//   remaining_quantity?: number;
//   supplier_name?: string;
//   purchase_price?: number;
//   quality_grade?: string;
//   storage_location?: string;
//   is_active?: string;
//   products?: Array<{
//     product_id: number;
//     quantity: number;
//   }>;
// }

interface BatchLotInput {
  batch_number: string;
  lot_number?: string;
  manufacturing_date: string | Date;
  expiry_date: string | Date;
  quantity: number;
  remaining_quantity?: number;
  supplier_name?: string;
  purchase_price?: number;
  quality_grade?: string;
  storage_location?: string;
  is_active?: string;
  products?: ProductInput[];
}
interface BatchLotSerialized {
  id: number;
  batch_number: string;
  lot_number?: string | null;
  manufacturing_date: Date;
  expiry_date: Date;
  quantity: number;
  remaining_quantity: number;
  supplier_name?: string | null;
  purchase_price?: number | null;
  quality_grade?: string | null;
  storage_location?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  log_inst?: number | null;
  products?: Array<{
    id: number;
    name: string;
    code: string;
    base_price?: number;
  }>;
  serial_numbers?: Array<{
    id: number;
    serial_number: string;
    status?: string;
    customer_id?: number | null;
    sold_date?: Date | null;
  }>;
  stock_movements?: Array<{
    id: number;
    movement_type: string;
    quantity: number;
    movement_date: Date;
  }>;
}

// const serializeBatchLot = (batch: any): BatchLotSerialized => ({
//   id: batch.id,
//   batch_number: batch.batch_number,
//   lot_number: batch.lot_number,
//   manufacturing_date: batch.manufacturing_date,
//   expiry_date: batch.expiry_date,
//   quantity: batch.quantity,
//   remaining_quantity: batch.remaining_quantity,
//   supplier_name: batch.supplier_name,
//   purchase_price: batch.purchase_price ? Number(batch.purchase_price) : null,
//   quality_grade: batch.quality_grade,
//   storage_location: batch.storage_location,
//   is_active: batch.is_active,
//   createdate: batch.createdate,
//   createdby: batch.createdby,
//   updatedate: batch.updatedate,
//   updatedby: batch.updatedby,
//   log_inst: batch.log_inst,
//   // products: batch.batch_lots_products
//   //   ? batch.batch_lots_products.map((product: any) => ({
//   //       id: product.id,
//   //       name: product.name,
//   //       code: product.code,
//   //       base_price: product.base_price ? Number(product.base_price) : null,
//   //     }))
//   //   : [],

//   products: batch.batch_lot_product_batches
//     ? batch.batch_lot_product_batches.map((pb: any) => ({
//         id: pb.product_product_batches?.id,
//         name: pb.product_product_batches?.name,
//         code: pb.product_product_batches?.code,
//         base_price: pb.product_product_batches?.base_price
//           ? Number(pb.product_product_batches.base_price)
//           : null,
//         quantity: pb.quantity,
//       }))
//     : [],
//   serial_numbers: batch.serial_numbers
//     ? batch.serial_numbers.map((serial: any) => ({
//         id: serial.id,
//         serial_number: serial.serial_number,
//         status: serial.status,
//         customer_id: serial.customer_id,
//         sold_date: serial.sold_date,
//       }))
//     : [],
//   stock_movements: batch.stock_movements
//     ? batch.stock_movements.map((movement: any) => ({
//         id: movement.id,
//         movement_type: movement.movement_type,
//         quantity: movement.quantity,
//         movement_date: movement.movement_date,
//       }))
//     : [],
// });

const serializeBatchLot = (batch: any): BatchLotSerialized => ({
  id: batch.id,
  batch_number: batch.batch_number,
  lot_number: batch.lot_number,
  manufacturing_date: batch.manufacturing_date,
  expiry_date: batch.expiry_date,
  quantity: batch.quantity,
  remaining_quantity: batch.remaining_quantity,
  supplier_name: batch.supplier_name,
  purchase_price: batch.purchase_price ? Number(batch.purchase_price) : null,
  quality_grade: batch.quality_grade,
  storage_location: batch.storage_location,
  is_active: batch.is_active,
  createdate: batch.createdate,
  createdby: batch.createdby,
  updatedate: batch.updatedate,
  updatedby: batch.updatedby,
  log_inst: batch.log_inst,

  products: batch.batch_lot_product_batches
    ? batch.batch_lot_product_batches.map((pb: any) => ({
        id: pb.product_product_batches?.id,
        name: pb.product_product_batches?.name,
        code: pb.product_product_batches?.code,
        base_price: pb.product_product_batches?.base_price
          ? Number(pb.product_product_batches.base_price)
          : null,
        quantity: pb.quantity,
      }))
    : [],
  serial_numbers: batch.serial_numbers
    ? batch.serial_numbers.map((serial: any) => ({
        id: serial.id,
        serial_number: serial.serial_number,
        status: serial.status,
        customer_id: serial.customer_id,
        sold_date: serial.sold_date,
      }))
    : [],
  stock_movements: batch.stock_movements
    ? batch.stock_movements.map((movement: any) => ({
        id: movement.id,
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        movement_date: movement.movement_date,
      }))
    : [],
});

const batchLotInclude = {
  batch_lot_product_batches: {
    include: {
      product_product_batches: {
        select: {
          id: true,
          name: true,
          code: true,
          base_price: true,
        },
      },
    },
  },

  serial_numbers: {
    select: {
      id: true,
      serial_number: true,
      status: true,
      customer_id: true,
      sold_date: true,
    },
  },
  stock_movements: {
    select: {
      id: true,
      movement_type: true,
      quantity: true,
      movement_date: true,
    },
    orderBy: {
      movement_date: 'desc' as const,
    },
    take: 10,
  },
};
export const batchLotsController = {
  async createMultipleBatchLotsForProduct(req: Request, res: Response) {
    try {
      const { product_id, batch_lots } = req.body;
      const userId = req.user?.id || 1;

      if (!product_id) {
        return res.status(400).json({
          message: 'product_id is required',
        });
      }

      if (
        !batch_lots ||
        !Array.isArray(batch_lots) ||
        batch_lots.length === 0
      ) {
        return res.status(400).json({
          message: 'batch_lots array is required and must not be empty',
        });
      }

      const product = await prisma.products.findUnique({
        where: { id: product_id },
        select: { id: true, name: true, code: true },
      });

      if (!product) {
        return res.status(404).json({
          message: `Product with ID ${product_id} not found`,
        });
      }

      const batchNumbers = batch_lots.map((b: any) => b.batch_number);
      const uniqueBatchNumbers = new Set(batchNumbers);
      if (uniqueBatchNumbers.size !== batchNumbers.length) {
        return res.status(400).json({
          message: 'Duplicate batch numbers found in the request',
        });
      }

      const existingBatches = await prisma.batch_lots.findMany({
        where: {
          batch_number: { in: batchNumbers },
        },
        select: { batch_number: true },
      });

      if (existingBatches.length > 0) {
        return res.status(400).json({
          message: `Batch numbers already exist: ${existingBatches.map(b => b.batch_number).join(', ')}`,
        });
      }

      const createdBatchLotIds: number[] = [];
      const batchLotDataMap: Map<string, any> = new Map();

      for (const batchData of batch_lots) {
        const newBatchLot = await prisma.batch_lots.create({
          data: {
            batch_number: batchData.batch_number,
            lot_number: batchData.lot_number || null,
            manufacturing_date: new Date(batchData.manufacturing_date),
            expiry_date: new Date(batchData.expiry_date),
            quantity: batchData.quantity,
            remaining_quantity:
              batchData.remaining_quantity || batchData.quantity,
            supplier_name: batchData.supplier_name || null,
            purchase_price: batchData.purchase_price || null,
            quality_grade: batchData.quality_grade || 'A',
            storage_location: batchData.storage_location || null,
            is_active: batchData.is_active || 'Y',
            createdate: new Date(),
            createdby: userId,
            log_inst: 1,
          },
        });

        createdBatchLotIds.push(newBatchLot.id);
        batchLotDataMap.set(batchData.batch_number, {
          batchLotId: newBatchLot.id,
          quantity: batchData.quantity,
        });
      }

      const productBatchesData = createdBatchLotIds.map(
        (batchLotId, index) => ({
          product_id: product_id,
          batch_lot_id: batchLotId,
          quantity: batch_lots[index].quantity,
          is_active: 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        })
      );

      await prisma.product_batches.createMany({
        data: productBatchesData,
      });

      const createdBatchLots = await prisma.batch_lots.findMany({
        where: {
          id: { in: createdBatchLotIds },
        },
        include: {
          batch_lot_product_batches: {
            include: {
              product_product_batches: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  base_price: true,
                },
              },
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      });

      return res.status(201).json({
        message: `${createdBatchLots.length} batch lot(s) created successfully for product "${product.name}"`,
        product: {
          id: product.id,
          name: product.name,
          code: product.code,
        },
        data: createdBatchLots.map(serializeBatchLot),
      });
    } catch (error: any) {
      console.error('Create Multiple Batch Lots For Product Error:', error);
      return res.status(500).json({
        message: error.message || 'Failed to create batch lots',
      });
    }
  },

  // async createBatchLot(req: Request, res: Response) {
  //   try {
  //     const data = req.body;
  //     const userId = req.user?.id || 1;

  //     const existingBatch = await prisma.batch_lots.findFirst({
  //       where: {
  //         batch_number: data.batch_number,
  //       },
  //     });

  //     if (existingBatch) {
  //       return res.status(400).json({
  //         message: 'Batch number already exists',
  //       });
  //     }

  //     const batchLot = await prisma.batch_lots.create({
  //       data: {
  //         batch_number: data.batch_number,
  //         lot_number: data.lot_number,
  //         manufacturing_date: new Date(data.manufacturing_date),
  //         expiry_date: new Date(data.expiry_date),
  //         quantity: data.quantity,
  //         remaining_quantity: data.remaining_quantity || data.quantity,
  //         supplier_name: data.supplier_name,
  //         purchase_price: data.purchase_price,
  //         quality_grade: data.quality_grade || 'A',
  //         storage_location: data.storage_location,
  //         is_active: data.is_active || 'Y',
  //         createdate: new Date(),
  //         createdby: userId,
  //         log_inst: 1,
  //       },
  //       include: {
  //         batch_lot_product_batches: true,
  //       },
  //     });

  //     return res.status(201).json({
  //       message: 'Batch lot created successfully',
  //       data: serializeBatchLot(batchLot),
  //     });
  //   } catch (error: any) {
  //     console.error('Create Batch Lot Error:', error);
  //     return res.status(500).json({
  //       message: error.message || 'Failed to create batch lot',
  //     });
  //   }
  // },

  //II
  // async createBatchLot(req: Request, res: Response) {
  //   try {
  //     const data: BatchLotInput = req.body;
  //     const userId = req.user?.id || 1;

  //     const existingBatch = await prisma.batch_lots.findFirst({
  //       where: {
  //         batch_number: data.batch_number,
  //       },
  //     });

  //     if (existingBatch) {
  //       return res.status(400).json({
  //         message: 'Batch number already exists',
  //       });
  //     }

  //     if (data.products && data.products.length > 0) {
  //       const productIds = data.products.map(p => p.product_id);
  //       const existingProducts = await prisma.products.findMany({
  //         where: {
  //           id: { in: productIds },
  //         },
  //         select: { id: true },
  //       });

  //       const existingProductIds = existingProducts.map(p => p.id);
  //       const missingProducts = productIds.filter(
  //         id => !existingProductIds.includes(id)
  //       );

  //       if (missingProducts.length > 0) {
  //         return res.status(400).json({
  //           message: `Products with IDs ${missingProducts.join(', ')} not found`,
  //         });
  //       }
  //     }

  //     const batchLot = await prisma.$transaction(async tx => {
  //       const newBatchLot = await tx.batch_lots.create({
  //         data: {
  //           batch_number: data.batch_number,
  //           lot_number: data.lot_number,
  //           manufacturing_date: new Date(data.manufacturing_date),
  //           expiry_date: new Date(data.expiry_date),
  //           quantity: data.quantity,
  //           remaining_quantity: data.remaining_quantity || data.quantity,
  //           supplier_name: data.supplier_name,
  //           purchase_price: data.purchase_price,
  //           quality_grade: data.quality_grade || 'A',
  //           storage_location: data.storage_location,
  //           is_active: data.is_active || 'Y',
  //           createdate: new Date(),
  //           createdby: userId,
  //           log_inst: 1,
  //         },
  //       });

  //       if (data.products && data.products.length > 0) {
  //         await tx.product_batches.createMany({
  //           data: data.products.map(product => ({
  //             product_id: product.product_id,
  //             batch_lot_id: newBatchLot.id,
  //             quantity: product.quantity,
  //             is_active: 'Y',
  //             createdate: new Date(),
  //             createdby: userId,
  //             log_inst: 1,
  //           })),
  //         });
  //       }

  //       return tx.batch_lots.findUnique({
  //         where: { id: newBatchLot.id },
  //         include: {
  //           batch_lot_product_batches: {
  //             include: {
  //               product_product_batches: {
  //                 select: {
  //                   id: true,
  //                   name: true,
  //                   code: true,
  //                   base_price: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });
  //     });

  //     return res.status(201).json({
  //       message: 'Batch lot created successfully',
  //       data: serializeBatchLot(batchLot),
  //     });
  //   } catch (error: any) {
  //     console.error('Create Batch Lot Error:', error);
  //     return res.status(500).json({
  //       message: error.message || 'Failed to create batch lot',
  //     });
  //   }
  // },

  async createBatchLot(req: Request, res: Response) {
    try {
      const data: BatchLotInput = req.body;
      const userId = req.user?.id || 1;
      const products: ProductInput[] = data.products || [];

      const existingBatch = await prisma.batch_lots.findFirst({
        where: { batch_number: data.batch_number },
      });

      if (existingBatch) {
        return res.status(400).json({
          message: 'Batch number already exists',
        });
      }

      if (products.length > 0) {
        const productIds = products.map(p => p.product_id);

        const uniqueProductIds = new Set(productIds);
        if (uniqueProductIds.size !== productIds.length) {
          return res.status(400).json({
            message: 'Duplicate product_id found in the request',
          });
        }

        const existingProducts = await prisma.products.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        });

        const existingProductIds = existingProducts.map(p => p.id);
        const missingProducts = productIds.filter(
          id => !existingProductIds.includes(id)
        );

        if (missingProducts.length > 0) {
          return res.status(400).json({
            message: `Products with IDs ${missingProducts.join(', ')} not found`,
          });
        }
      }

      const newBatchLot = await prisma.batch_lots.create({
        data: {
          batch_number: data.batch_number,
          lot_number: data.lot_number || null,
          manufacturing_date: new Date(data.manufacturing_date),
          expiry_date: new Date(data.expiry_date),
          quantity: data.quantity,
          remaining_quantity: data.remaining_quantity || data.quantity,
          supplier_name: data.supplier_name || null,
          purchase_price: data.purchase_price || null,
          quality_grade: data.quality_grade || 'A',
          storage_location: data.storage_location || null,
          is_active: data.is_active || 'Y',
          createdate: new Date(),
          createdby: userId,
          log_inst: 1,
        },
      });

      if (products.length > 0) {
        for (const product of products) {
          await prisma.product_batches.create({
            data: {
              product_id: product.product_id,
              batch_lot_id: newBatchLot.id,
              quantity: product.quantity,
              is_active: 'Y',
              createdate: new Date(),
              createdby: userId,
              log_inst: 1,
            },
          });
        }
      }

      const completeBatchLot = await prisma.batch_lots.findUnique({
        where: { id: newBatchLot.id },
        include: batchLotInclude,
      });

      return res.status(201).json({
        message: 'Batch lot created successfully',
        data: serializeBatchLot(completeBatchLot),
      });
    } catch (error: any) {
      console.error('Create Batch Lot Error:', error);
      return res.status(500).json({
        message: error.message || 'Failed to create batch lot',
      });
    }
  },

  // async getAllBatchLots(req: Request, res: Response) {
  //   try {
  //     const { search, status, expiring_soon, expired, quality_grade } =
  //       req.query;
  //     const page = Number(req.query.page) || 1;
  //     const limit = Number(req.query.limit) || 10;

  //     const where: any = {};

  //     if (search) {
  //       where.OR = [
  //         { batch_number: { contains: String(search) } },
  //         { lot_number: { contains: String(search) } },
  //         { supplier_name: { contains: String(search) } },
  //       ];
  //     }

  //     if (status === 'active') {
  //       where.is_active = 'Y';
  //     } else if (status === 'inactive') {
  //       where.is_active = 'N';
  //     }

  //     if (quality_grade) {
  //       where.quality_grade = String(quality_grade);
  //     }

  //     if (expiring_soon === 'true') {
  //       const thirtyDaysFromNow = new Date();
  //       thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  //       where.expiry_date = {
  //         gte: new Date(),
  //         lte: thirtyDaysFromNow,
  //       };
  //     }

  //     if (expired === 'true') {
  //       where.expiry_date = {
  //         lt: new Date(),
  //       };
  //     }

  //     const skip = (page - 1) * limit;

  //     const [batchLots, totalCount] = await Promise.all([
  //       prisma.batch_lots.findMany({
  //         where,
  //         include: {
  //           batch_lot_product_batches: true,
  //           serial_numbers: {
  //             select: {
  //               id: true,
  //               serial_number: true,
  //               status: true,
  //             },
  //           },
  //         },
  //         orderBy: { expiry_date: 'asc' },
  //         skip,
  //         take: limit,
  //       }),
  //       prisma.batch_lots.count({ where }),
  //     ]);

  //     const [totalBatchLots, activeBatchLots] = await Promise.all([
  //       prisma.batch_lots.count(),
  //       prisma.batch_lots.count({ where: { is_active: 'Y' } }),
  //     ]);

  //     const thirtyDaysFromNow = new Date();
  //     thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  //     const expiringBatchLots = await prisma.batch_lots.count({
  //       where: {
  //         expiry_date: {
  //           gte: new Date(),
  //           lte: thirtyDaysFromNow,
  //         },
  //         is_active: 'Y',
  //       },
  //     });

  //     const expiredBatchLots = await prisma.batch_lots.count({
  //       where: {
  //         expiry_date: {
  //           lt: new Date(),
  //         },
  //       },
  //     });

  //     return res.status(200).json({
  //       message: 'Batch lots retrieved successfully',
  //       data: batchLots.map(serializeBatchLot),
  //       meta: {
  //         current_page: page,
  //         per_page: limit,
  //         total_count: totalCount,
  //         total_pages: Math.ceil(totalCount / limit),
  //       },
  //       stats: {
  //         total_batch_lots: totalBatchLots,
  //         active_batch_lots: activeBatchLots,
  //         expiring_batch_lots: expiringBatchLots,
  //         expired_batch_lots: expiredBatchLots,
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error('Get All Batch Lots Error:', error);
  //     return res.status(500).json({
  //       message: error.message || 'Failed to retrieve batch lots',
  //     });
  //   }
  // },

  async getAllBatchLots(req: Request, res: Response) {
    try {
      const { search, status, expiring_soon, expired, quality_grade } =
        req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const where: any = {};

      if (search) {
        where.OR = [
          { batch_number: { contains: String(search) } },
          { lot_number: { contains: String(search) } },
          { supplier_name: { contains: String(search) } },
        ];
      }

      if (status === 'active') {
        where.is_active = 'Y';
      } else if (status === 'inactive') {
        where.is_active = 'N';
      }

      if (quality_grade) {
        where.quality_grade = String(quality_grade);
      }

      if (expiring_soon === 'true') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        where.expiry_date = {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        };
      }

      if (expired === 'true') {
        where.expiry_date = {
          lt: new Date(),
        };
      }

      const skip = (page - 1) * limit;

      const [batchLots, totalCount] = await Promise.all([
        prisma.batch_lots.findMany({
          where,
          include: {
            batch_lot_product_batches: {
              include: {
                product_product_batches: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    base_price: true,
                  },
                },
              },
            },
            serial_numbers: {
              select: {
                id: true,
                serial_number: true,
                status: true,
                customer_id: true,
                sold_date: true,
              },
            },
            stock_movements: {
              select: {
                id: true,
                movement_type: true,
                quantity: true,
                movement_date: true,
              },
              orderBy: {
                movement_date: 'desc',
              },
              take: 10,
            },
          },
          orderBy: { createdate: 'desc' }, // Changed from expiry_date: 'asc'
          skip,
          take: limit,
        }),
        prisma.batch_lots.count({ where }),
      ]);

      const [totalBatchLots, activeBatchLots] = await Promise.all([
        prisma.batch_lots.count(),
        prisma.batch_lots.count({ where: { is_active: 'Y' } }),
      ]);

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const [expiringBatchLots, expiredBatchLots] = await Promise.all([
        prisma.batch_lots.count({
          where: {
            expiry_date: { gte: new Date(), lte: thirtyDaysFromNow },
            is_active: 'Y',
          },
        }),
        prisma.batch_lots.count({
          where: { expiry_date: { lt: new Date() } },
        }),
      ]);

      return res.status(200).json({
        message: 'Batch lots retrieved successfully',
        data: batchLots.map(serializeBatchLot),
        meta: {
          current_page: page,
          per_page: limit,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limit),
        },
        stats: {
          total_batch_lots: totalBatchLots,
          active_batch_lots: activeBatchLots,
          expiring_batch_lots: expiringBatchLots,
          expired_batch_lots: expiredBatchLots,
        },
      });
    } catch (error: any) {
      console.error('Get All Batch Lots Error:', error);
      return res.status(500).json({
        message: error.message || 'Failed to retrieve batch lots',
      });
    }
  },

  // async getBatchLotById(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;

  //     const batchLot = await prisma.batch_lots.findUnique({
  //       where: { id: Number(id) },
  //       include: {
  //         batch_lot_product_batches: true,
  //         serial_numbers: {
  //           select: {
  //             id: true,
  //             serial_number: true,
  //             status: true,
  //             customer_id: true,
  //             sold_date: true,
  //           },
  //         },
  //         stock_movements: {
  //           select: {
  //             id: true,
  //             movement_type: true,
  //             quantity: true,
  //             movement_date: true,
  //           },
  //           orderBy: {
  //             movement_date: 'desc',
  //           },
  //           take: 10,
  //         },
  //       },
  //     });

  //     if (!batchLot) {
  //       return res.status(404).json({ message: 'Batch lot not found' });
  //     }

  //     return res.status(200).json({
  //       message: 'Batch lot retrieved successfully',
  //       data: serializeBatchLot(batchLot),
  //     });
  //   } catch (error: any) {
  //     console.error('Get Batch Lot By ID Error:', error);
  //     return res.status(500).json({
  //       message: error.message || 'Failed to retrieve batch lot',
  //     });
  //   }
  // },

  async getBatchLotById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const batchLot = await prisma.batch_lots.findUnique({
        where: { id: Number(id) },
        include: batchLotInclude,
      });

      if (!batchLot) {
        return res.status(404).json({ message: 'Batch lot not found' });
      }

      return res.status(200).json({
        message: 'Batch lot retrieved successfully',
        data: serializeBatchLot(batchLot),
      });
    } catch (error: any) {
      console.error('Get Batch Lot By ID Error:', error);
      return res.status(500).json({
        message: error.message || 'Failed to retrieve batch lot',
      });
    }
  },
  // async updateBatchLot(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const data = req.body;
  //     const userId = req.user?.id || 1;

  //     const existingBatch = await prisma.batch_lots.findUnique({
  //       where: { id: Number(id) },
  //     });

  //     if (!existingBatch) {
  //       return res.status(404).json({ message: 'Batch lot not found' });
  //     }

  //     if (
  //       data.batch_number &&
  //       data.batch_number !== existingBatch.batch_number
  //     ) {
  //       const duplicateBatch = await prisma.batch_lots.findFirst({
  //         where: {
  //           batch_number: data.batch_number,
  //           id: { not: Number(id) },
  //         },
  //       });

  //       if (duplicateBatch) {
  //         return res.status(400).json({
  //           message: 'Batch number already exists',
  //         });
  //       }
  //     }

  //     const updateData: any = {
  //       updatedate: new Date(),
  //       updatedby: userId,
  //     };

  //     if (data.batch_number !== undefined)
  //       updateData.batch_number = data.batch_number;
  //     if (data.lot_number !== undefined)
  //       updateData.lot_number = data.lot_number;
  //     if (data.manufacturing_date !== undefined)
  //       updateData.manufacturing_date = new Date(data.manufacturing_date);
  //     if (data.expiry_date !== undefined)
  //       updateData.expiry_date = new Date(data.expiry_date);
  //     if (data.quantity !== undefined) updateData.quantity = data.quantity;
  //     if (data.remaining_quantity !== undefined)
  //       updateData.remaining_quantity = data.remaining_quantity;
  //     if (data.supplier_name !== undefined)
  //       updateData.supplier_name = data.supplier_name;
  //     if (data.purchase_price !== undefined)
  //       updateData.purchase_price = data.purchase_price;
  //     if (data.quality_grade !== undefined)
  //       updateData.quality_grade = data.quality_grade;
  //     if (data.storage_location !== undefined)
  //       updateData.storage_location = data.storage_location;
  //     if (data.is_active !== undefined) updateData.is_active = data.is_active;

  //     const updatedBatchLot = await prisma.batch_lots.update({
  //       where: { id: Number(id) },
  //       data: updateData,
  //       include: {
  //         batch_lot_product_batches: true,
  //       },
  //     });

  //     return res.status(200).json({
  //       message: 'Batch lot updated successfully',
  //       data: serializeBatchLot(updatedBatchLot),
  //     });
  //   } catch (error: any) {
  //     console.error('Update Batch Lot Error:', error);
  //     return res.status(500).json({
  //       message: error.message || 'Failed to update batch lot',
  //     });
  //   }
  // },

  async updateBatchLot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: BatchLotInput = req.body;
      const userId = req.user?.id || 1;
      const products:
        | Array<{ product_id: number; quantity: number }>
        | undefined = data.products;

      const existingBatch = await prisma.batch_lots.findUnique({
        where: { id: Number(id) },
      });

      if (!existingBatch) {
        return res.status(404).json({ message: 'Batch lot not found' });
      }

      if (
        data.batch_number &&
        data.batch_number !== existingBatch.batch_number
      ) {
        const duplicateBatch = await prisma.batch_lots.findFirst({
          where: {
            batch_number: data.batch_number,
            id: { not: Number(id) },
          },
        });

        if (duplicateBatch) {
          return res.status(400).json({
            message: 'Batch number already exists',
          });
        }
      }

      if (products !== undefined && products.length > 0) {
        const productIds = products.map(p => p.product_id);

        const uniqueProductIds = new Set(productIds);
        if (uniqueProductIds.size !== productIds.length) {
          return res.status(400).json({
            message: 'Duplicate product_id found in the request',
          });
        }

        const existingProducts = await prisma.products.findMany({
          where: { id: { in: productIds } },
          select: { id: true },
        });

        const existingProductIds = existingProducts.map(p => p.id);
        const missingProducts = productIds.filter(
          pid => !existingProductIds.includes(pid)
        );

        if (missingProducts.length > 0) {
          return res.status(400).json({
            message: `Products with IDs ${missingProducts.join(', ')} not found`,
          });
        }
      }

      const updateData: any = {
        updatedate: new Date(),
        updatedby: userId,
      };

      if (data.batch_number !== undefined)
        updateData.batch_number = data.batch_number;
      if (data.lot_number !== undefined)
        updateData.lot_number = data.lot_number;
      if (data.manufacturing_date !== undefined)
        updateData.manufacturing_date = new Date(data.manufacturing_date);
      if (data.expiry_date !== undefined)
        updateData.expiry_date = new Date(data.expiry_date);
      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.remaining_quantity !== undefined)
        updateData.remaining_quantity = data.remaining_quantity;
      if (data.supplier_name !== undefined)
        updateData.supplier_name = data.supplier_name;
      if (data.purchase_price !== undefined)
        updateData.purchase_price = data.purchase_price;
      if (data.quality_grade !== undefined)
        updateData.quality_grade = data.quality_grade;
      if (data.storage_location !== undefined)
        updateData.storage_location = data.storage_location;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      await prisma.batch_lots.update({
        where: { id: Number(id) },
        data: updateData,
      });

      if (products !== undefined) {
        await prisma.product_batches.deleteMany({
          where: { batch_lot_id: Number(id) },
        });

        if (products.length > 0) {
          for (const product of products) {
            await prisma.product_batches.create({
              data: {
                product_id: product.product_id,
                batch_lot_id: Number(id),
                quantity: product.quantity,
                is_active: 'Y',
                createdate: new Date(),
                createdby: userId,
                log_inst: 1,
              },
            });
          }
        }
      }

      const updatedBatchLot = await prisma.batch_lots.findUnique({
        where: { id: Number(id) },
        include: {
          batch_lot_product_batches: {
            include: {
              product_product_batches: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  base_price: true,
                },
              },
            },
          },
          serial_numbers: {
            select: {
              id: true,
              serial_number: true,
              status: true,
              customer_id: true,
              sold_date: true,
            },
          },
          stock_movements: {
            select: {
              id: true,
              movement_type: true,
              quantity: true,
              movement_date: true,
            },
            orderBy: {
              movement_date: 'desc',
            },
            take: 10,
          },
        },
      });

      return res.status(200).json({
        message: 'Batch lot updated successfully',
        data: serializeBatchLot(updatedBatchLot),
      });
    } catch (error: any) {
      console.error('Update Batch Lot Error:', error);
      return res.status(500).json({
        message: error.message || 'Failed to update batch lot',
      });
    }
  },
  async deleteBatchLot(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingBatch = await prisma.batch_lots.findUnique({
        where: { id: Number(id) },
        include: {
          batch_lot_product_batches: true,
          serial_numbers: true,
          stock_movements: true,
        },
      });

      if (!existingBatch) {
        return res.status(404).json({ message: 'Batch lot not found' });
      }

      if (existingBatch.batch_lot_product_batches.length > 0) {
        return res.status(400).json({
          message: `Cannot delete batch lot. ${existingBatch.batch_lot_product_batches.length} product(s) are associated with this batch.`,
        });
      }

      if (existingBatch.serial_numbers.length > 0) {
        return res.status(400).json({
          message: `Cannot delete batch lot. ${existingBatch.serial_numbers.length} serial number(s) are associated with this batch.`,
        });
      }

      if (existingBatch.stock_movements.length > 0) {
        return res.status(400).json({
          message: `Cannot delete batch lot. ${existingBatch.stock_movements.length} stock movement(s) are associated with this batch.`,
        });
      }

      await prisma.batch_lots.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({
        message: 'Batch lot deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Batch Lot Error:', error);
      return res.status(500).json({
        message: error.message || 'Failed to delete batch lot',
      });
    }
  },

  async getBatchLotsDropdown(req: any, res: any): Promise<void> {
    try {
      const { search = '', batch_lot_id } = req.query;
      const searchLower = search.toLowerCase().trim();
      const batchLotId = batch_lot_id ? Number(batch_lot_id) : null;

      const where: any = {
        is_active: 'Y',
      };

      if (batchLotId) {
        where.id = batchLotId;
      } else if (searchLower) {
        where.OR = [
          {
            batch_number: {
              contains: searchLower,
            },
          },
          {
            lot_number: {
              contains: searchLower,
            },
          },
          {
            supplier_name: {
              contains: searchLower,
            },
          },
        ];
      }

      const batchLots = await prisma.batch_lots.findMany({
        where,
        select: {
          id: true,
          batch_number: true,
          lot_number: true,
          remaining_quantity: true,
          expiry_date: true,
        },
        orderBy: {
          batch_number: 'asc',
        },
        take: 50,
      });

      res.success('Batch lots dropdown fetched successfully', batchLots, 200);
    } catch (error: any) {
      console.error('Error fetching batch lots dropdown:', error);
      res.error(error.message);
    }
  },
};
