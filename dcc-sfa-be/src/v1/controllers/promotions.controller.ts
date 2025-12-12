// import { Request, Response } from 'express';
// import { paginate } from '../../utils/paginate';
// import prisma from '../../configs/prisma.client';

// interface PromotionSerialized {
//   id: number;
//   name: string;
//   code: string;
//   type: string;
//   description?: string | null;
//   start_date: Date;
//   end_date: Date;
//   depot_id?: number | null;
//   zone_id?: number | null;
//   is_active: string;
//   createdate?: Date | null;
//   createdby: number;
//   updatedate?: Date | null;
//   updatedby?: number | null;
//   log_inst?: number | null;
//   promotion_depots?: { id: number; name: string; code: string } | null;
//   promotion_zones?: { id: number; name: string } | null;
// }
// const generatePromotionCode = async (name: string) => {
//   const prefix = name.slice(0, 3).toUpperCase();

//   const lastZone = await prisma.zones.findFirst({
//     orderBy: { id: 'desc' },
//     select: { code: true },
//   });

//   let newNumber = 1;
//   if (lastZone && lastZone.code) {
//     const match = lastZone.code.match(/(\d+)$/);
//     if (match) {
//       newNumber = parseInt(match[1], 10) + 1;
//     }
//   }

//   const code = `${prefix}${newNumber.toString().padStart(3, '0')}`;
//   return code;
// };

// const serializePromotion = (p: any): PromotionSerialized => ({
//   id: p.id,
//   name: p.name,
//   code: p.code,
//   type: p.type,
//   description: p.description,
//   start_date: p.start_date,
//   end_date: p.end_date,
//   depot_id: p.depot_id,
//   zone_id: p.zone_id,
//   is_active: p.is_active,
//   createdate: p.createdate,
//   createdby: p.createdby,
//   updatedate: p.updatedate,
//   updatedby: p.updatedby,
//   log_inst: p.log_inst,
//   promotion_depots: p.promotion_depots
//     ? {
//         id: p.promotion_depots.id,
//         name: p.promotion_depots.name,
//         code: p.promotion_depots.code,
//       }
//     : null,
//   promotion_zones: p.promotion_zones
//     ? { id: p.promotion_zones.id, name: p.promotion_zones.name }
//     : null,
// });

// export const promotionsController = {
//   async createPromotions(req: Request, res: Response) {
//     try {
//       const data = req.body;
//       const code = await generatePromotionCode(data.name);

//       const promotion = await prisma.promotions.create({
//         data: {
//           ...data,
//           code,
//           start_date: new Date(data.start_date),
//           end_date: new Date(data.end_date),
//           createdate: new Date(),
//           createdby: req.user?.id || 1,
//           log_inst: data.log_inst || 1,
//         },
//         include: {
//           promotion_depots: true,
//           promotion_zones: true,
//         },
//       });

//       res.status(201).json({
//         message: 'Promotion created successfully',
//         data: serializePromotion(promotion),
//       });
//     } catch (error: any) {
//       console.error('Create Promotion Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async getAllPromotions(req: any, res: any) {
//     try {
//       const { page, limit, search, status } = req.query;
//       const pageNum = parseInt(page as string, 10) || 1;
//       const limitNum = parseInt(limit as string, 10) || 10;
//       const searchLower = search ? (search as string).toLowerCase() : '';
//       const statusLower = status ? (status as string).toLowerCase() : '';

//       const filters: any = {
//         ...(search && {
//           OR: [
//             { name: { contains: searchLower } },
//             { code: { contains: searchLower } },
//             { type: { contains: searchLower } },
//           ],
//         }),
//         ...(statusLower === 'active' && { is_active: 'Y' }),
//         ...(statusLower === 'inactive' && { is_active: 'N' }),
//       };

//       const { data, pagination } = await paginate({
//         model: prisma.promotions,
//         filters,
//         page: pageNum,
//         limit: limitNum,
//         orderBy: { createdate: 'desc' },
//         include: { promotion_depots: true, promotion_zones: true },
//       });

//       const totatalPromotions = await prisma.promotions.count();
//       const activePromotions = await prisma.promotions.count({
//         where: { is_active: 'Y' },
//       });
//       const inactivePromotions = await prisma.promotions.count({
//         where: { is_active: 'N' },
//       });
//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//       const newPromotionsThisMonth = await prisma.promotions.count({
//         where: {
//           createdate: {
//             gte: startOfMonth,
//             lt: endOfMonth,
//           },
//         },
//       });

//       res.success(
//         'Promotions retrieved successfully',
//         data.map((p: any) => serializePromotion(p)),
//         200,
//         pagination,
//         {
//           totatalPromotions,
//           activePromotions,
//           inactivePromotions,
//           newPromotionsThisMonth,
//         }
//       );
//     } catch (error: any) {
//       console.error('Get Promotions Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async getPromotionsById(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const promotion = await prisma.promotions.findUnique({
//         where: { id: Number(id) },
//         include: { promotion_depots: true, promotion_zones: true },
//       });

//       if (!promotion)
//         return res.status(404).json({ message: 'Promotion not found' });

//       res.status(200).json({
//         message: 'Promotion fetched successfully',
//         data: serializePromotion(promotion),
//       });
//     } catch (error: any) {
//       console.error('Get Promotion Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async updatePromotions(req: any, res: any) {
//     try {
//       const { id } = req.params;
//       const existingPromotion = await prisma.promotions.findUnique({
//         where: { id: Number(id) },
//       });
//       if (!existingPromotion)
//         return res.status(404).json({ message: 'Promotion not found' });

//       const data = {
//         ...req.body,
//         start_date: req.body.start_date
//           ? new Date(req.body.start_date)
//           : undefined,
//         end_date: req.body.end_date ? new Date(req.body.end_date) : undefined,
//         updatedate: new Date(),
//         updatedby: req.user?.id || 1,
//       };

//       const promotion = await prisma.promotions.update({
//         where: { id: Number(id) },
//         data,
//         include: { promotion_depots: true, promotion_zones: true },
//       });

//       res.json({
//         message: 'Promotion updated successfully',
//         data: serializePromotion(promotion),
//       });
//     } catch (error: any) {
//       console.error('Update Promotion Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },

//   async deletePromotions(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const existingPromotion = await prisma.promotions.findUnique({
//         where: { id: Number(id) },
//       });
//       if (!existingPromotion)
//         return res.status(404).json({ message: 'Promotion not found' });

//       await prisma.promotions.delete({ where: { id: Number(id) } });

//       res.json({ message: 'Promotion deleted successfully' });
//     } catch (error: any) {
//       console.error('Delete Promotion Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   },
// };

/// II
import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { Prisma } from '@prisma/client';

interface PromotionCreateInput {
  name: string;
  code?: string;
  type?: string;
  description?: string;
  start_date: string;
  end_date: string;
  disabled?: boolean;
  platforms?: string[];

  // Product conditions - support both naming conventions
  productconditions?: Array<{
    product_id: number;
    category_id: number;
    productgroup?: string;
    product_group?: string;
    minquantity?: number;
    min_quantity?: number;
    minvalue?: number;
    min_value?: number;
  }>;
  product_conditions?: Array<{
    product_id: number;
    category_id: number;
    productgroup?: string;
    product_group?: string;
    minquantity?: number;
    min_quantity?: number;
    minvalue?: number;
    min_value?: number;
  }>;

  // Quantity type for conditions
  quantity_type?: string;

  // Location areas - support both naming conventions
  locationareas?: number[];
  location_areas?: number[];

  // Distributor distributors - support both naming conventions
  distributordistributors?: number[];
  distributor_distributors?: number[];

  // Seller data - support both naming conventions
  sellerdata?: number[];
  seller_data?: number[];

  // Outlet groups - support both naming conventions
  outlet1groups?: number[];
  outlet1_groups?: number[];
  outlet2groups?: number[];
  outlet2_groups?: number[];

  // Levels
  levels?: Array<{
    level_number?: number;
    levelnumber?: number;
    threshold_value?: number;
    thresholdvalue?: number;
    discount_type?: string;
    discounttype?: string;
    discount_value?: number;
    discountvalue?: number;
    benefits?: Array<{
      benefit_type?: string;
      benefittype?: string;
      product_id?: number;
      benefit_value?: number;
      benefitvalue?: number;
      gift_limit?: number;
      giftlimit?: number;
      condition_type?: string;
      conditiontype?: string;
    }>;
  }>;

  customerexclusions?: number[];
  customer_exclusions?: number[];
}

const generatePromotionCode = async (name: string): Promise<string> => {
  const prefix = name.slice(0, 3).toUpperCase();

  const lastPromo = await prisma.promotions.findFirst({
    orderBy: { id: 'desc' },
    select: { code: true },
  });

  let newNumber = 1;
  if (lastPromo?.code) {
    const match = lastPromo.code.match(/\d+/);
    if (match) {
      newNumber = parseInt(match[0], 10) + 1;
    }
  }

  return `${prefix}${newNumber.toString().padStart(4, '0')}`;
};

const serializePromotion = (promo: any) => {
  if (!promo) return null;

  return {
    id: promo.id,
    name: promo.name,
    code: promo.code,
    type: promo.type,
    start_date: promo.start_date,
    end_date: promo.end_date,
    description: promo.description,
    is_active: promo.is_active,
    createdate: promo.createdate,
    createdby: promo.createdby,
    updatedate: promo.updatedate,
    updatedby: promo.updatedby,
    channels: promo.promotion_channel_promotions,
    depots: promo.promotion_depot_promotions,
    salespersons: promo.promotion_salesperson_promotions,
    routes: promo.promotion_routes_promotions,
    customer_categories: promo.promotion_customer_category_promotions,
    customer_exclusions: promo.promotion_customer_exclusion_promotions,
    conditions: promo.promotion_condition_promotions,
    levels: promo.promotion_level_promotions,
    tracking: promo.promotion_tracking_promotions,
  };
};

export const promotionsController = {
  async createPromotion(req: any, res: Response) {
    try {
      const input: PromotionCreateInput = req.body;

      const startDateInput = input.start_date;
      const endDateInput = input.end_date;

      if (!input.name || !startDateInput || !endDateInput) {
        return res.status(400).json({
          success: false,
          message: 'name, start_date, and end_date are required',
        });
      }

      const startDate = new Date(startDateInput);
      const endDate = new Date(endDateInput);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD or ISO 8601 format',
        });
      }

      const code = input.code || (await generatePromotionCode(input.name));

      const promotion = await prisma.promotions.create({
        data: {
          name: input.name,
          code: code,
          type: input.type || 'GENERAL',
          start_date: startDate,
          end_date: endDate,
          description: input.description || null,
          is_active: input.disabled ? 'N' : 'Y',
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: 1,
        },
      });

      const promotionId = promotion.id;

      if (input.platforms && Array.isArray(input.platforms)) {
        for (const platform of input.platforms) {
          await prisma.promotion_channel.create({
            data: {
              parent_id: promotionId,
              channel_type: platform,
              is_active: 'Y',
            },
          });
        }
      }

      const productConditions =
        input.product_conditions || input.productconditions;
      if (productConditions && Array.isArray(productConditions)) {
        for (const conditionInput of productConditions) {
          const condition = await prisma.promotion_condition.create({
            data: {
              parent_id: promotionId,
              condition_type: input.quantity_type || 'QUANTITY',
              applies_to_type: conditionInput.product_group
                ? 'PRODUCTGROUP'
                : conditionInput.category_id
                  ? 'CATEGORY'
                  : 'SINGLEPRODUCT',
              min_value: new Prisma.Decimal(conditionInput.min_value || 0),
              max_value: null,
              effective_start_date: startDate,
              effective_end_date: endDate,
              status: 'active',
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });

          await prisma.promotion_condition_products.create({
            data: {
              condition_id: condition.id,
              product_id: conditionInput.product_id,
              category_id: conditionInput.category_id,
              product_group: conditionInput.product_group || null,
              condition_quantity: new Prisma.Decimal(
                conditionInput.min_quantity || 0
              ),
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }
      }

      if (input.levels && Array.isArray(input.levels)) {
        for (const levelInput of input.levels) {
          const level = await prisma.promotion_level.create({
            data: {
              parent_id: promotionId,
              level_number:
                levelInput.level_number ?? levelInput.levelnumber ?? 1,
              threshold_value: new Prisma.Decimal(
                levelInput.threshold_value ?? levelInput.thresholdvalue ?? 0
              ),
              discount_type:
                levelInput.discount_type ||
                levelInput.discounttype ||
                'PERCENTAGE',
              discount_value: new Prisma.Decimal(
                levelInput.discount_value ?? levelInput.discountvalue ?? 0
              ),
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });

          if (levelInput.benefits && Array.isArray(levelInput.benefits)) {
            for (const benefitInput of levelInput.benefits) {
              await prisma.promotion_benefit.create({
                data: {
                  level_id: level.id,
                  benefit_type:
                    benefitInput.benefit_type ||
                    benefitInput.benefittype ||
                    'FREE_PRODUCT',
                  product_id: benefitInput.product_id || null,
                  benefit_value: new Prisma.Decimal(
                    benefitInput.benefit_value ?? benefitInput.benefitvalue ?? 0
                  ),
                  condition_type:
                    benefitInput.condition_type ||
                    benefitInput.conditiontype ||
                    null,
                  gift_limit:
                    benefitInput.gift_limit ?? benefitInput.giftlimit ?? 0,
                  is_active: 'Y',
                },
              });
            }
          }
        }
      }

      const locationAreas = input.location_areas || input.locationareas;
      if (locationAreas && Array.isArray(locationAreas)) {
        for (const depotId of locationAreas) {
          await prisma.promotion_depot.create({
            data: {
              parent_id: promotionId,
              depot_id: depotId,
              is_active: 'Y',
            },
          });
        }
      }

      const distributorDistributors =
        input.distributor_distributors || input.distributordistributors;
      if (distributorDistributors && Array.isArray(distributorDistributors)) {
        for (const salespersonId of distributorDistributors) {
          await prisma.promotion_salesperson.create({
            data: {
              parent_id: promotionId,
              salesperson_id: salespersonId,
              is_active: 'Y',
            },
          });
        }
      }

      const sellerData = input.seller_data || input.sellerdata;
      if (sellerData && Array.isArray(sellerData)) {
        for (const routeId of sellerData) {
          await prisma.promotion_routes.create({
            data: {
              parent_id: promotionId,
              route_id: routeId,
              is_active: 'Y',
            },
          });
        }
      }

      const outlet1Groups = input.outlet1_groups || input.outlet1groups || [];
      const outlet2Groups = input.outlet2_groups || input.outlet2groups || [];
      const allOutletGroups = [...outlet1Groups, ...outlet2Groups];

      for (const categoryId of allOutletGroups) {
        await prisma.promotion_customer_category.create({
          data: {
            parent_id: promotionId,
            customer_category_id: categoryId,
            is_active: 'Y',
            createdby: req.user?.id || 1,
            createdate: new Date(),
            log_inst: 1,
          },
        });
      }

      const customerExclusions =
        input.customer_exclusions || input.customerexclusions;
      if (customerExclusions && Array.isArray(customerExclusions)) {
        for (const customerId of customerExclusions) {
          await prisma.promotion_customer_exclusion.create({
            data: {
              parent_id: promotionId,
              customer_id: customerId,
              is_excluded: 'Y',
            },
          });
        }
      }

      await prisma.promotion_tracking.create({
        data: {
          parent_id: promotionId,
          action_type: 'CREATED',
          action_date: new Date(),
          user_id: req.user?.id || 1,
          comments: `Promotion created: ${input.name}`,
          is_active: 'Y',
        },
      });

      const completePromotion = await prisma.promotions.findUnique({
        where: { id: promotionId },
        include: {
          promotion_channel_promotions: { where: { is_active: 'Y' } },
          promotion_depot_promotions: {
            where: { is_active: 'Y' },
            include: { depots: true },
          },
          promotion_salesperson_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_salesperson_users: true },
          },
          promotion_routes_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_route: true },
          },
          promotion_customer_category_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_categorys: true },
          },
          promotion_customer_exclusion_promotions: {
            include: { promotion_customer_exclusion_customers: true },
          },
          promotion_condition_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_products: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_productId: true,
                  promotion_condition_categories: true,
                },
              },
            },
          },
          promotion_level_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_benefit_level: {
                where: { is_active: 'Y' },
                include: {
                  promotion_benefit_products: true,
                },
              },
            },
            orderBy: { level_number: 'asc' },
          },
          promotion_tracking_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_tracking_users: true },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Promotion created successfully',
        data: serializePromotion(completePromotion),
      });
    } catch (error: any) {
      console.error('Create Promotion Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAllPromotions(req: any, res: Response) {
    try {
      const {
        page,
        limit,
        search,
        is_active,
        platform,
        depot_id,
        salesperson_id,
        route_id,
        start_date,
        end_date,
        activeonly,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase().trim() : '';

      const filters: any = {};

      if (searchLower) {
        filters.OR = [
          { name: { contains: searchLower } },
          { code: { contains: searchLower } },
          { description: { contains: searchLower } },
        ];
      }

      if (is_active) {
        filters.is_active = is_active;
      }

      if (activeonly === 'true') {
        const now = new Date();
        filters.is_active = 'Y';
        filters.start_date = { lte: now };
        filters.end_date = { gte: now };
      }

      if (start_date) {
        filters.start_date = { gte: new Date(start_date as string) };
      }

      if (end_date) {
        filters.end_date = { lte: new Date(end_date as string) };
      }

      if (platform) {
        filters.promotion_channel_promotions = {
          some: {
            channel_type: platform,
            is_active: 'Y',
          },
        };
      }

      if (depot_id) {
        filters.promotion_depot_promotions = {
          some: {
            depot_id: parseInt(depot_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      if (salesperson_id) {
        filters.promotion_salesperson_promotions = {
          some: {
            salesperson_id: parseInt(salesperson_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      if (route_id) {
        filters.promotion_routes_promotions = {
          some: {
            route_id: parseInt(route_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      const { data, pagination } = await paginate({
        model: prisma.promotions,
        filters,
        page: pageNum,
        limit: limitNum,
        orderBy: { createdate: 'desc' },
        include: {
          promotion_channel_promotions: { where: { is_active: 'Y' } },
          promotion_depot_promotions: {
            where: { is_active: 'Y' },
            include: {
              depots: { select: { id: true, name: true, code: true } },
            },
          },
          promotion_salesperson_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_salesperson_users: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          promotion_routes_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_route: { select: { id: true, name: true, code: true } },
            },
          },
          promotion_customer_category_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_customer_categorys: {
                select: { id: true, category_name: true, category_code: true },
              },
            },
          },
          promotion_condition_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_products: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_productId: true,
                  promotion_condition_categories: true,
                },
              },
            },
          },
          promotion_level_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_benefit_level: {
                where: { is_active: 'Y' },
                include: {
                  promotion_benefit_products: true,
                },
              },
            },
            orderBy: { level_number: 'asc' },
          },
        },
      });

      const totalPromotions = await prisma.promotions.count();
      const activePromotions = await prisma.promotions.count({
        where: {
          is_active: 'Y',
          start_date: { lte: new Date() },
          end_date: { gte: new Date() },
        },
      });

      res.json({
        success: true,
        message: 'Promotions retrieved successfully',
        data: data.map((p: any) => serializePromotion(p)),
        pagination,
        stats: {
          total: totalPromotions,
          active: activePromotions,
          inactive: totalPromotions - activePromotions,
        },
      });
    } catch (error: any) {
      console.error('Get All Promotions Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getPromotionById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const promotion = await prisma.promotions.findUnique({
        where: { id: Number(id) },
        include: {
          promotion_channel_promotions: { where: { is_active: 'Y' } },
          promotion_depot_promotions: {
            where: { is_active: 'Y' },
            include: { depots: true },
          },
          promotion_salesperson_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_salesperson_users: true },
          },
          promotion_routes_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_route: true },
          },
          promotion_customer_category_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_categorys: true },
          },
          promotion_customer_exclusion_promotions: true,
          promotion_condition_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_products: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_productId: true,
                  promotion_condition_categories: true,
                },
              },
            },
          },
          promotion_level_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_benefit_level: {
                where: { is_active: 'Y' },
              },
            },
            orderBy: { level_number: 'asc' },
          },
          promotion_tracking_promotions: {
            where: { is_active: 'Y' },
            orderBy: { action_date: 'desc' },
            take: 100,
          },
        },
      });

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      res.json({
        success: true,
        message: 'Promotion retrieved successfully',
        data: serializePromotion(promotion),
      });
    } catch (error: any) {
      console.error('Get Promotion By ID Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async updatePromotion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        start_date,
        end_date,
        description,
        is_active,
        platforms,
        locationareas,
        distributordistributors,
        sellerdata,
        outlet1groups,
        outlet2groups,
      } = req.body;

      const existing = await prisma.promotions.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      const promotion = await prisma.promotions.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(start_date && { start_date: new Date(start_date) }),
          ...(end_date && { end_date: new Date(end_date) }),
          ...(description !== undefined && { description }),
          ...(is_active && { is_active }),
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      if (platforms && Array.isArray(platforms)) {
        await prisma.promotion_channel.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        for (const platform of platforms) {
          await prisma.promotion_channel.create({
            data: {
              parent_id: Number(id),
              channel_type: platform,
              is_active: 'Y',
            },
          });
        }
      }

      if (locationareas && Array.isArray(locationareas)) {
        await prisma.promotion_depot.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        for (const depotId of locationareas) {
          await prisma.promotion_depot.create({
            data: {
              parent_id: Number(id),
              depot_id: depotId,
              is_active: 'Y',
            },
          });
        }
      }

      await prisma.promotion_tracking.create({
        data: {
          parent_id: Number(id),
          action_type: 'UPDATED',
          action_date: new Date(),
          user_id: req.user?.id || 1,
          comments: `Promotion updated: ${promotion.name}`,
          is_active: 'Y',
        },
      });

      const updatedPromotion = await prisma.promotions.findUnique({
        where: { id: Number(id) },
        include: {
          promotion_channel_promotions: { where: { is_active: 'Y' } },
          promotion_depot_promotions: { where: { is_active: 'Y' } },
          promotion_salesperson_promotions: { where: { is_active: 'Y' } },
          promotion_routes_promotions: { where: { is_active: 'Y' } },
          promotion_customer_category_promotions: { where: { is_active: 'Y' } },
          promotion_condition_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_products: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_productId: true,
                  promotion_condition_categories: true,
                },
              },
            },
          },
          promotion_level_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_benefit_level: { where: { is_active: 'Y' } },
            },
          },
        },
      });

      return res.json({
        success: true,
        message: 'Promotion updated successfully',
        data: serializePromotion(updatedPromotion),
      });
    } catch (error: any) {
      console.error('Update Promotion Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async deletePromotion(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.promotions.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      await prisma.promotions.delete({
        where: { id: Number(id) },
      });

      res.json({
        success: true,
        message: 'Promotion deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Promotion Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async assignChannels(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { channels } = req.body;

      if (!Array.isArray(channels)) {
        return res.status(400).json({
          success: false,
          message: 'channels must be an array',
        });
      }

      await prisma.promotion_channel.updateMany({
        where: { parent_id: Number(id) },
        data: { is_active: 'N' },
      });

      const created = await Promise.all(
        channels.map((channel: string) =>
          prisma.promotion_channel.create({
            data: {
              parent_id: Number(id),
              channel_type: channel,
              is_active: 'Y',
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Channels assigned successfully',
        data: created,
      });
    } catch (error: any) {
      console.error('Assign Channels Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async assignDepots(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { depot_ids } = req.body;

      if (!Array.isArray(depot_ids)) {
        return res.status(400).json({
          success: false,
          message: 'depot_ids must be an array',
        });
      }

      await prisma.promotion_depot.updateMany({
        where: { parent_id: Number(id) },
        data: { is_active: 'N' },
      });

      const created = await Promise.all(
        depot_ids.map((depot_id: number) =>
          prisma.promotion_depot.create({
            data: {
              parent_id: Number(id),
              depot_id,
              is_active: 'Y',
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Depots assigned successfully',
        data: created,
      });
    } catch (error: any) {
      console.error('Assign Depots Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async assignSalespersons(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { salesperson_ids } = req.body;

      if (!Array.isArray(salesperson_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Salesperson Ids must be an array',
        });
      }

      await prisma.promotion_salesperson.updateMany({
        where: { parent_id: Number(id) },
        data: { is_active: 'N' },
      });

      const created = await Promise.all(
        salesperson_ids.map((salesperson_id: number) =>
          prisma.promotion_salesperson.create({
            data: {
              parent_id: Number(id),
              salesperson_id,
              is_active: 'Y',
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Salespersons assigned successfully',
        data: created,
      });
    } catch (error: any) {
      console.error('Assign Salespersons Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async assignRoutes(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { route_ids } = req.body;

      if (!Array.isArray(route_ids)) {
        return res.status(400).json({
          success: false,
          message: 'route_ids must be an array',
        });
      }

      await prisma.promotion_routes.updateMany({
        where: { parent_id: Number(id) },
        data: { is_active: 'N' },
      });

      const created = await Promise.all(
        route_ids.map((route_id: number) =>
          prisma.promotion_routes.create({
            data: {
              parent_id: Number(id),
              route_id,
              is_active: 'Y',
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Routes assigned successfully',
        data: created,
      });
    } catch (error: any) {
      console.error('Assign Routes Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async assignCustomerCategories(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { customer_category_ids } = req.body;

      if (!Array.isArray(customer_category_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Customer category ID must be an array',
        });
      }

      await prisma.promotion_customer_category.updateMany({
        where: { parent_id: Number(id) },
        data: { is_active: 'N' },
      });

      const created = await Promise.all(
        customer_category_ids.map((customer_category_id: number) =>
          prisma.promotion_customer_category.create({
            data: {
              parent_id: Number(id),
              customer_category_id,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Customer categories assigned successfully',
        data: created,
      });
    } catch (error: any) {
      console.error('Assign Customer Categories Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async assignCustomerExclusions(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { customer_ids } = req.body;

      if (!Array.isArray(customer_ids)) {
        return res.status(400).json({
          success: false,
          message: 'customer_ids must be an array',
        });
      }

      await prisma.promotion_customer_exclusion.deleteMany({
        where: { parent_id: Number(id) },
      });

      const created = await Promise.all(
        customer_ids.map((customer_id: number) =>
          prisma.promotion_customer_exclusion.create({
            data: {
              parent_id: Number(id),
              customer_id,
              is_excluded: 'Y',
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Customer exclusions assigned successfully',
        data: created,
      });
    } catch (error: any) {
      console.error('Assign Customer Exclusions Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createCondition(req: any, res: Response) {
    try {
      const { id } = req.params;
      const {
        condition_type,
        applies_to_type,
        min_value,
        max_value,
        effective_start_date,
        effective_end_date,
      } = req.body;

      if (!condition_type || !applies_to_type || min_value === undefined) {
        return res.status(400).json({
          success: false,
          message:
            'condition_type, applies_to_type, and min_value are required',
        });
      }

      const condition = await prisma.promotion_condition.create({
        data: {
          parent_id: Number(id),
          condition_type,
          applies_to_type,
          min_value: new Prisma.Decimal(min_value),
          max_value: max_value ? new Prisma.Decimal(max_value) : null,
          effective_start_date: new Date(effective_start_date || new Date()),
          effective_end_date: effective_end_date
            ? new Date(effective_end_date)
            : null,
          status: 'active',
          is_active: 'Y',
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: 1,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Condition created successfully',
        data: condition,
      });
    } catch (error: any) {
      console.error('Create Condition Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateCondition(req: any, res: Response) {
    try {
      const { id, conditionId } = req.params;
      const data = req.body;

      const condition = await prisma.promotion_condition.update({
        where: { id: Number(conditionId) },
        data: {
          ...data,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      res.json({
        success: true,
        message: 'Condition updated successfully',
        data: condition,
      });
    } catch (error: any) {
      console.error('Update Condition Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteCondition(req: Request, res: Response) {
    try {
      const { conditionId } = req.params;

      await prisma.promotion_condition.update({
        where: { id: Number(conditionId) },
        data: { is_active: 'N' },
      });

      res.json({
        success: true,
        message: 'Condition deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Condition Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // async assignConditionProducts(req: any, res: Response) {
  //   try {
  //     const { conditionId } = req.params;
  //     const { products } = req.body;

  //     if (!Array.isArray(products)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'products must be an array',
  //       });
  //     }

  //     await prisma.promotion_condition_products.updateMany({
  //       where: { condition_id: Number(conditionId) },
  //       data: { is_active: 'N' },
  //     });

  //     const created = await Promise.all(
  //       products.map((p: any) =>
  //         prisma.promotion_condition_products.create({
  //           data: {
  //             condition_id: Number(conditionId),
  //             product_id: p.product_id || null,
  //             category_id: p.category_id || null,
  //             product_group: p.product_group || null,
  //             condition_quantity: new Prisma.Decimal(p.condition_quantity || 0),
  //             is_active: 'Y',
  //             createdby: req.user?.id || 1,
  //             createdate: new Date(),
  //             log_inst: 1,
  //           },
  //         })
  //       )
  //     );

  //     res.json({
  //       success: true,
  //       message: 'Condition products assigned successfully',
  //       data: created,
  //     });
  //   } catch (error: any) {
  //     console.error('Assign Condition Products Error:', error);
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // },

  async assignConditionProducts(req: any, res: Response) {
    try {
      const { conditionId } = req.params;
      const { products } = req.body;

      if (!Array.isArray(products)) {
        return res.status(400).json({
          success: false,
          message: 'products must be an array',
        });
      }

      await prisma.promotion_condition_products.updateMany({
        where: { condition_id: Number(conditionId) },
        data: { is_active: 'N' },
      });

      const validProducts = products.filter(
        (p: any) => p.product_id || p.category_id || p.product_group
      );

      if (validProducts.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            'At least one of product_id, category_id, or product_group must be provided',
        });
      }

      const firstProduct = await prisma.products.findFirst({
        select: { id: true },
      });
      const firstCategory = await prisma.product_categories.findFirst({
        select: { id: true },
      });

      const defaultProductId = firstProduct?.id || 1;
      const defaultCategoryId = firstCategory?.id || 1;

      const created = await Promise.all(
        validProducts.map((p: any) =>
          prisma.promotion_condition_products.create({
            data: {
              condition_id: Number(conditionId),
              product_id: p.product_id || defaultProductId,
              category_id: p.category_id || defaultCategoryId,
              product_group: p.product_group || null,
              condition_quantity: new Prisma.Decimal(p.condition_quantity || 0),
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          })
        )
      );

      res.json({
        success: true,
        message: 'Condition products assigned successfully',
        data: created,
      });
    } catch (error: any) {
      console.error('Assign Condition Products Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createLevel(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { level_number, threshold_value, discount_type, discount_value } =
        req.body;

      if (
        level_number === undefined ||
        threshold_value === undefined ||
        discount_value === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            'level_number, threshold_value, and discount_value are required',
        });
      }

      const level = await prisma.promotion_level.create({
        data: {
          parent_id: Number(id),
          level_number,
          threshold_value: new Prisma.Decimal(threshold_value),
          discount_type: discount_type || 'PERCENTAGE',
          discount_value: new Prisma.Decimal(discount_value),
          is_active: 'Y',
          createdby: req.user?.id || 1,
          createdate: new Date(),
          log_inst: 1,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Level created successfully',
        data: level,
      });
    } catch (error: any) {
      console.error('Create Level Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateLevel(req: any, res: Response) {
    try {
      const { levelId } = req.params;
      const data = req.body;

      const level = await prisma.promotion_level.update({
        where: { id: Number(levelId) },
        data: {
          ...data,
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      res.json({
        success: true,
        message: 'Level updated successfully',
        data: level,
      });
    } catch (error: any) {
      console.error('Update Level Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteLevel(req: Request, res: Response) {
    try {
      const { levelId } = req.params;

      await prisma.promotion_level.update({
        where: { id: Number(levelId) },
        data: { is_active: 'N' },
      });

      res.json({
        success: true,
        message: 'Level deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Level Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createBenefit(req: any, res: Response) {
    try {
      const { levelId } = req.params;
      const {
        benefit_type,
        product_id,
        benefit_value,
        condition_type,
        gift_limit,
      } = req.body;

      if (!benefit_type || benefit_value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Benefit type and benefit value are required',
        });
      }

      const benefit = await prisma.promotion_benefit.create({
        data: {
          level_id: Number(levelId),
          benefit_type,
          product_id: product_id || null,
          benefit_value: new Prisma.Decimal(benefit_value),
          condition_type: condition_type || null,
          gift_limit: gift_limit || 0,
          is_active: 'Y',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Benefit created successfully',
        data: benefit,
      });
    } catch (error: any) {
      console.error('Create Benefit Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateBenefit(req: any, res: Response) {
    try {
      const { benifitId } = req.params;
      const data = req.body;

      const benefit = await prisma.promotion_benefit.update({
        where: { id: Number(benifitId) },
        data: {
          ...data,
        },
      });

      res.json({
        success: true,
        message: 'Benefit updated successfully',
        data: benefit,
      });
    } catch (error: any) {
      console.error('Update Benefit Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteBenefit(req: Request, res: Response) {
    try {
      const { benefitId } = req.params;

      await prisma.promotion_benefit.update({
        where: { id: Number(benefitId) },
        data: { is_active: 'N' },
      });

      res.json({
        success: true,
        message: 'Benefit deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete Benefit Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  // async calculateEligiblePromotions(req: any, res: Response) {
  //   try {
  //     const {
  //       customer_id,
  //       order_lines,
  //       depot_id,
  //       salesman_id,
  //       route_id,
  //       order_date,
  //       platform,
  //     } = req.body;

  //     if (!customer_id || !order_lines || !Array.isArray(order_lines)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'customer_id and order_lines are required',
  //       });
  //     }

  //     const checkDate = order_date ? new Date(order_date) : new Date();

  //     // Get customer details
  //     const customer = await prisma.customers.findUnique({
  //       where: { id: customer_id },
  //       select: { type: true },
  //     });

  //     // Get active promotions
  //     let promotionsQuery: any = {
  //       is_active: 'Y',
  //       start_date: { lte: checkDate },
  //       end_date: { gte: checkDate },
  //     };

  //     if (platform) {
  //       promotionsQuery.promotion_channel_promotions = {
  //         some: {
  //           channel_type: platform,
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     const promotions = await prisma.promotion.findMany({
  //       where: promotionsQuery,
  //       include: {
  //         promotion_depot_promotions: { where: { is_active: 'Y' } },
  //         promotion_salesperson_promotions: { where: { is_active: 'Y' } },
  //         promotion_routes_promotions: { where: { is_active: 'Y' } },
  //         promotion_customer_category_promotions: { where: { is_active: 'Y' } },
  //         promotion_customer_exclusion_promotions: true,
  //         promotion_condition_promotions: {
  //           where: { is_active: 'Y' },
  //           include: {
  //             promotion_condition_product: {
  //               where: { is_active: 'Y' },
  //               include: {
  //                 promotion_condition_productId: true,
  //                 promotion_condition_categories: true,
  //               },
  //             },
  //           },
  //         },
  //         promotion_level_promotions: {
  //           where: { is_active: 'Y' },
  //           include: {
  //             promotion_benefit_level: {
  //               where: { is_active: 'Y' },
  //               include: {
  //                 promotion_benefit_products: true,
  //               },
  //             },
  //           },
  //           orderBy: { threshold_value: 'desc' },
  //         },
  //       },
  //     });

  //     const eligiblePromotions: any[] = [];

  //     for (const promo of promotions) {
  //       // Check exclusion
  //       const isExcluded = promo.promotion_customer_exclusion_promotions.find(
  //         exc => exc.customer_id === customer_id && exc.is_excluded === 'Y'
  //       );

  //       if (isExcluded) continue;

  //       // Check eligibility
  //       let isEligible = false;

  //       if (
  //         promo.promotion_depot_promotions.length === 0 &&
  //         promo.promotion_salesperson_promotions.length === 0 &&
  //         promo.promotion_routes_promotions.length === 0 &&
  //         promo.promotion_customer_category_promotions.length === 0
  //       ) {
  //         isEligible = true;
  //       } else {
  //         if (depot_id && promo.promotion_depot_promotions.length > 0) {
  //           const depotMatch = promo.promotion_depot_promotions.find(
  //             d => d.depot_id === depot_id
  //           );
  //           if (depotMatch) isEligible = true;
  //         }

  //         if (
  //           salesman_id &&
  //           promo.promotion_salesperson_promotions.length > 0
  //         ) {
  //           const salesmanMatch = promo.promotion_salesperson_promotions.find(
  //             s => s.salesperson_id === salesman_id
  //           );
  //           if (salesmanMatch) isEligible = true;
  //         }

  //         if (route_id && promo.promotion_routes_promotions.length > 0) {
  //           const routeMatch = promo.promotion_routes_promotions.find(
  //             r => r.route_id === route_id
  //           );
  //           if (routeMatch) isEligible = true;
  //         }

  //         if (
  //           customer?.type &&
  //           promo.promotion_customer_category_promotions.length > 0
  //         ) {
  //           for (const cat of promo.promotion_customer_category_promotions) {
  //             const category = await prisma.customer_category.findUnique({
  //               where: { id: cat.customer_category_id },
  //             });

  //             if (category && category.category_code === customer.type) {
  //               isEligible = true;
  //               break;
  //             }
  //           }
  //         }
  //       }

  //       if (!isEligible) continue;

  //       for (const condition of promo.promotion_condition_promotions) {
  //         let totalQty = new Prisma.Decimal(0);
  //         let totalValue = new Prisma.Decimal(0);

  //         for (const line of order_lines) {
  //           const productMatch = condition.promotion_condition_product.find(
  //             cp =>
  //               cp.product_id === line.product_id ||
  //               cp.category_id === line.category_id ||
  //               cp.product_group === line.product_group
  //           );

  //           if (productMatch) {
  //             const lineQty = new Prisma.Decimal(line.quantity || 0);
  //             const linePrice = new Prisma.Decimal(line.unit_price || 0);
  //             const lineValue = lineQty.mul(linePrice);

  //             totalQty = totalQty.add(lineQty);
  //             totalValue = totalValue.add(lineValue);
  //           }
  //         }

  //         const minValue = new Prisma.Decimal(condition.min_value || 0);
  //         const conditionMet = totalValue.gte(minValue);

  //         if (!conditionMet) continue;

  //         const applicableLevel = promo.promotion_level_promotions.find(lvl =>
  //           new Prisma.Decimal(lvl.threshold_value).lte(totalValue)
  //         );

  //         if (!applicableLevel) continue;

  //         let discountAmount = new Prisma.Decimal(0);
  //         const freeProducts: any[] = [];

  //         if (applicableLevel.discount_type === 'PERCENTAGE') {
  //           const discountPercent = new Prisma.Decimal(
  //             applicableLevel.discount_value || 0
  //           );
  //           discountAmount = totalValue.mul(discountPercent).div(100);
  //         } else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
  //           discountAmount = new Prisma.Decimal(applicableLevel.discount_value || 0);
  //         }

  //         //  UPDATED: Get product details from relation
  //         for (const benefit of applicableLevel.promotion_benefit_level) {
  //           if (benefit.benefit_type === 'FREE_PRODUCT') {
  //             freeProducts.push({
  //               product_id: benefit.product_id,
  //               product_name: benefit.promotion_benefit_products?.name || null,
  //               product_code: benefit.promotion_benefit_products?.code || null,
  //               quantity: benefit.benefit_value.toNumber(),
  //               gift_limit: benefit.gift_limit || 0,
  //             });
  //           }
  //         }

  //         eligiblePromotions.push({
  //           promotion_id: promo.id,
  //           promotion_name: promo.promotion_name,
  //           promotion_code: promo.promotion_code,
  //           level_number: applicableLevel.level_number,
  //           discount_type: applicableLevel.discount_type,
  //           discount_amount: discountAmount.toNumber(),
  //           free_products: freeProducts,
  //           qualified_quantity: totalQty.toNumber(),
  //           qualified_value: totalValue.toNumber(),
  //           threshold_met: totalValue.toNumber(),
  //         });

  //         break;
  //       }
  //     }

  //     res.json({
  //       success: true,
  //       message: 'Eligible promotions calculated',
  //       data: eligiblePromotions,
  //       summary: {
  //         total_eligible: eligiblePromotions.length,
  //         total_discount: eligiblePromotions.reduce(
  //           (sum, p) => sum + p.discount_amount,
  //           0
  //         ),
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error('Calculate Promotions Error:', error);
  //     res.status(500).json({ success: false, message: error.message });
  //   }
  // },

  async calculateEligiblePromotions(req: any, res: Response) {
    try {
      const {
        customer_id,
        order_lines,
        depot_id,
        salesman_id,
        route_id,
        order_date,
        platform,
      } = req.body;

      if (!customer_id || !order_lines || !Array.isArray(order_lines)) {
        return res.status(400).json({
          success: false,
          message: 'customer_id and order_lines are required',
        });
      }

      const checkDate = order_date ? new Date(order_date) : new Date();

      const customer = await prisma.customers.findUnique({
        where: { id: customer_id },
        select: { type: true },
      });

      let promotionsQuery: any = {
        is_active: 'Y',
        start_date: { lte: checkDate },
        end_date: { gte: checkDate },
      };

      if (platform) {
        promotionsQuery.promotion_channel_promotions = {
          some: {
            channel_type: platform,
            is_active: 'Y',
          },
        };
      }

      const promotions = await prisma.promotions.findMany({
        where: promotionsQuery,
        include: {
          promotion_depot_promotions: { where: { is_active: 'Y' } },
          promotion_salesperson_promotions: { where: { is_active: 'Y' } },
          promotion_routes_promotions: { where: { is_active: 'Y' } },
          promotion_customer_category_promotions: { where: { is_active: 'Y' } },
          promotion_customer_exclusion_promotions: true,
          promotion_condition_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_products: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_productId: true,
                  promotion_condition_categories: true,
                },
              },
            },
          },
          promotion_level_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_benefit_level: {
                where: { is_active: 'Y' },
                include: {
                  promotion_benefit_products: true,
                },
              },
            },
            orderBy: { threshold_value: 'desc' },
          },
        },
      });

      const eligiblePromotions: any[] = [];

      for (const promo of promotions) {
        const isExcluded = promo.promotion_customer_exclusion_promotions.find(
          (exc: { customer_id: number; is_excluded: string }) =>
            exc.customer_id === customer_id && exc.is_excluded === 'Y'
        );

        if (isExcluded) continue;

        let isEligible = false;

        if (
          promo.promotion_depot_promotions.length === 0 &&
          promo.promotion_salesperson_promotions.length === 0 &&
          promo.promotion_routes_promotions.length === 0 &&
          promo.promotion_customer_category_promotions.length === 0
        ) {
          isEligible = true;
        } else {
          if (depot_id && promo.promotion_depot_promotions.length > 0) {
            const depotMatch = promo.promotion_depot_promotions.find(
              (d: { depot_id: number }) => d.depot_id === depot_id
            );
            if (depotMatch) isEligible = true;
          }

          if (
            salesman_id &&
            promo.promotion_salesperson_promotions.length > 0
          ) {
            const salesmanMatch = promo.promotion_salesperson_promotions.find(
              (s: { salesperson_id: number }) =>
                s.salesperson_id === salesman_id
            );
            if (salesmanMatch) isEligible = true;
          }

          if (route_id && promo.promotion_routes_promotions.length > 0) {
            const routeMatch = promo.promotion_routes_promotions.find(
              (r: { route_id: number }) => r.route_id === route_id
            );
            if (routeMatch) isEligible = true;
          }

          if (
            customer?.type &&
            promo.promotion_customer_category_promotions.length > 0
          ) {
            for (const cat of promo.promotion_customer_category_promotions) {
              const category = await prisma.customer_category.findUnique({
                where: { id: cat.customer_category_id },
              });

              if (category && category.category_code === customer.type) {
                isEligible = true;
                break;
              }
            }
          }
        }

        if (!isEligible) continue;

        for (const condition of promo.promotion_condition_promotions) {
          let totalQty = new Prisma.Decimal(0);
          let totalValue = new Prisma.Decimal(0);

          for (const line of order_lines) {
            const productMatch = condition.promotion_condition_products.find(
              (cp: {
                product_id: number | null;
                category_id: number | null;
                product_group: string | null;
              }) =>
                cp.product_id === line.product_id ||
                cp.category_id === line.category_id ||
                cp.product_group === line.product_group
            );

            if (productMatch) {
              const lineQty = new Prisma.Decimal(line.quantity || 0);
              const linePrice = new Prisma.Decimal(line.unit_price || 0);
              const lineValue = lineQty.mul(linePrice);

              totalQty = totalQty.add(lineQty);
              totalValue = totalValue.add(lineValue);
            }
          }

          const minValue = new Prisma.Decimal(condition.min_value || 0);
          const conditionMet = totalValue.gte(minValue);

          if (!conditionMet) continue;

          const applicableLevel = promo.promotion_level_promotions.find(
            (lvl: { threshold_value: Prisma.Decimal | number }) =>
              new Prisma.Decimal(lvl.threshold_value).lte(totalValue)
          );

          if (!applicableLevel) continue;

          let discountAmount = new Prisma.Decimal(0);
          const freeProducts: any[] = [];

          if (applicableLevel.discount_type === 'PERCENTAGE') {
            const discountPercent = new Prisma.Decimal(
              applicableLevel.discount_value || 0
            );
            discountAmount = totalValue.mul(discountPercent).div(100);
          } else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
            discountAmount = new Prisma.Decimal(
              applicableLevel.discount_value || 0
            );
          }

          for (const benefit of applicableLevel.promotion_benefit_level) {
            if (benefit.benefit_type === 'FREE_PRODUCT') {
              freeProducts.push({
                product_id: benefit.product_id,
                product_name: benefit.promotion_benefit_products?.name || null,
                product_code: benefit.promotion_benefit_products?.code || null,
                quantity: benefit.benefit_value.toNumber(),
                gift_limit: benefit.gift_limit || 0,
              });
            }
          }

          eligiblePromotions.push({
            promotion_id: promo.id,
            promotion_name: promo.name,
            promotion_code: promo.code,
            level_number: applicableLevel.level_number,
            discount_type: applicableLevel.discount_type,
            discount_amount: discountAmount.toNumber(),
            free_products: freeProducts,
            qualified_quantity: totalQty.toNumber(),
            qualified_value: totalValue.toNumber(),
            threshold_met: totalValue.toNumber(),
          });

          break;
        }
      }

      res.json({
        success: true,
        message: 'Eligible promotions calculated',
        data: eligiblePromotions,
        summary: {
          total_eligible: eligiblePromotions.length,
          total_discount: eligiblePromotions.reduce(
            (sum, p) => sum + p.discount_amount,
            0
          ),
        },
      });
    } catch (error: any) {
      console.error('Calculate Promotions Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  async applyPromotion(req: any, res: Response) {
    try {
      const {
        promotion_id,
        order_id,
        customer_id,
        discount_amount,
        free_products,
      } = req.body;

      if (!promotion_id || !customer_id) {
        return res.status(400).json({
          success: false,
          message: 'Promotion Id and customer ID are required',
        });
      }

      await prisma.promotion_tracking.create({
        data: {
          parent_id: promotion_id,
          action_type: 'APPLIED',
          action_date: new Date(),
          user_id: req.user?.id || 1,
          comments: `Applied to order ${order_id} for customer ${customer_id}. Discount: ${discount_amount}. Free Products: ${JSON.stringify(
            free_products
          )}`,
          is_active: 'Y',
        },
      });

      res.json({
        success: true,
        message: 'Promotion applied successfully',
        data: {
          promotion_id,
          order_id,
          customer_id,
          discount_amount,
          free_products,
          applied_at: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Apply Promotion Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async settlePeriodPromotion(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { period_start, period_end, customer_ids } = req.body;

      if (!period_start || !period_end || !Array.isArray(customer_ids)) {
        return res.status(400).json({
          success: false,
          message: 'period_start, period_end, and customer_ids are required',
        });
      }

      const promotion = await prisma.promotions.findUnique({
        where: { id: Number(id) },
      });

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      const settlementResults: any[] = [];

      for (const customerId of customer_ids) {
        await prisma.promotion_tracking.create({
          data: {
            parent_id: Number(id),
            action_type: 'PERIOD_SETTLEMENT',
            action_date: new Date(),
            user_id: req.user?.id || 1,
            comments: `Period settlement for customer ${customerId}. Period: ${period_start} to ${period_end}`,
            is_active: 'Y',
          },
        });

        settlementResults.push({
          customer_id: customerId,
          settled: true,
        });
      }

      res.json({
        success: true,
        message: 'Period promotion settled successfully',
        data: settlementResults,
      });
    } catch (error: any) {
      console.error('Settle Period Promotion Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async activatePromotion(req: any, res: Response) {
    try {
      const { id } = req.params;

      const promotion = await prisma.promotions.update({
        where: { id: Number(id) },
        data: {
          is_active: 'Y',
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      await prisma.promotion_tracking.create({
        data: {
          parent_id: Number(id),
          action_type: 'ACTIVATED',
          action_date: new Date(),
          user_id: req.user?.id || 1,
          comments: `Promotion activated`,
          is_active: 'Y',
        },
      });

      res.json({
        success: true,
        message: 'Promotion activated successfully',
        data: promotion,
      });
    } catch (error: any) {
      console.error('Activate Promotion Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async deactivatePromotion(req: any, res: Response) {
    try {
      const { id } = req.params;

      const promotion = await prisma.promotions.update({
        where: { id: Number(id) },
        data: {
          is_active: 'N',
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      await prisma.promotion_tracking.create({
        data: {
          parent_id: Number(id),
          action_type: 'DEACTIVATED',
          action_date: new Date(),
          user_id: req.user?.id || 1,
          comments: `Promotion deactivated`,
          is_active: 'Y',
        },
      });

      res.json({
        success: true,
        message: 'Promotion deactivated successfully',
        data: promotion,
      });
    } catch (error: any) {
      console.error('Deactivate Promotion Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async bulkActivatePromotions(req: any, res: Response) {
    try {
      const { promotion_ids } = req.body;

      if (!Array.isArray(promotion_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Promotion Id must be an array',
        });
      }

      const result = await prisma.promotions.updateMany({
        where: { id: { in: promotion_ids } },
        data: {
          is_active: 'Y',
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      res.json({
        success: true,
        message: `${result.count} promotions activated successfully`,
        data: { count: result.count },
      });
    } catch (error: any) {
      console.error('Bulk Activate Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async bulkDeactivatePromotions(req: any, res: Response) {
    try {
      const { promotion_ids } = req.body;

      if (!Array.isArray(promotion_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Promotion Ids must be an array',
        });
      }

      const result = await prisma.promotions.updateMany({
        where: { id: { in: promotion_ids } },
        data: {
          is_active: 'N',
          updatedate: new Date(),
          updatedby: req.user?.id || 1,
        },
      });

      res.json({
        success: true,
        message: `${result.count} promotions deactivated successfully`,
        data: { count: result.count },
      });
    } catch (error: any) {
      console.error('Bulk Deactivate Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async bulkDeletePromotions(req: any, res: Response) {
    try {
      const { promotion_ids } = req.body;

      if (!Array.isArray(promotion_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Promotion Ids must be an array',
        });
      }

      const result = await prisma.promotions.deleteMany({
        where: { id: { in: promotion_ids } },
      });

      res.json({
        success: true,
        message: `${result.count} promotions deleted successfully`,
        data: { count: result.count },
      });
    } catch (error: any) {
      console.error('Bulk Delete Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getActivePromotionsReport(req: Request, res: Response) {
    try {
      const { platform, depot_id, start_date, end_date } = req.query;

      const now = new Date();
      const filters: any = {
        is_active: 'Y',
        start_date: { lte: now },
        end_date: { gte: now },
      };

      if (platform) {
        filters.promotion_channel_promotions = {
          some: {
            channel_type: platform,
            is_active: 'Y',
          },
        };
      }

      if (depot_id) {
        filters.promotion_depot_promotions = {
          some: {
            depot_id: parseInt(depot_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      const activePromotions = await prisma.promotions.findMany({
        where: filters,
        include: {
          promotion_channel_promotions: { where: { is_active: 'Y' } },
          promotion_depot_promotions: {
            where: { is_active: 'Y' },
            include: { depots: true },
          },
          promotion_level_promotions: { where: { is_active: 'Y' } },
          promotion_tracking_promotions: {
            where: {
              action_type: 'APPLIED',
              action_date: {
                gte: start_date
                  ? new Date(start_date as string)
                  : new Date(now.getFullYear(), now.getMonth(), 1),
                lte: end_date ? new Date(end_date as string) : now,
              },
            },
          },
        },
        orderBy: { start_date: 'desc' },
      });

      const report = activePromotions.map(promo => ({
        ...serializePromotion(promo),
        applications_count: promo.promotion_tracking_promotions.length,
        platforms: promo.promotion_channel_promotions.map(c => c.channel_type),
        depots: promo.promotion_depot_promotions.map(d => d.depots?.name),
      }));

      res.json({
        success: true,
        message: 'Active promotions report generated',
        data: report,
        summary: {
          total_active: report.length,
          total_applications: report.reduce(
            (sum, p) => sum + p.applications_count,
            0
          ),
        },
      });
    } catch (error: any) {
      console.error('Active Promotions Report Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getPromotionTrackingReport(req: Request, res: Response) {
    try {
      const { promotion_id, action_type, start_date, end_date } = req.query;

      const filters: any = {};

      if (promotion_id) filters.parent_id = Number(promotion_id);
      if (action_type) filters.action_type = action_type;
      if (start_date || end_date) {
        filters.action_date = {};
        if (start_date)
          filters.action_date.gte = new Date(start_date as string);
        if (end_date) filters.action_date.lte = new Date(end_date as string);
      }
      const tracking = await prisma.promotion_tracking.findMany({
        where: filters,
        include: {
          promotion_tracking_promotions: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { action_date: 'desc' },
        take: 1000,
      });

      res.json({
        success: true,
        message: 'Promotion tracking report generated',
        data: tracking,
        summary: {
          total_records: tracking.length,
          action_types: [...new Set(tracking.map(t => t.action_type))],
        },
      });
    } catch (error: any) {
      console.error('Promotion Tracking Report Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getPromotionUsageReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      const filters: any = {
        parent_id: Number(id),
        action_type: 'APPLIED',
      };

      if (start_date || end_date) {
        filters.action_date = {};
        if (start_date)
          filters.action_date.gte = new Date(start_date as string);
        if (end_date) filters.action_date.lte = new Date(end_date as string);
      }

      const usage = await prisma.promotion_tracking.findMany({
        where: filters,
        orderBy: { action_date: 'desc' },
      });

      res.json({
        success: true,
        message: 'Promotion usage report generated',
        data: usage,
        summary: {
          total_usage: usage.length,
        },
      });
    } catch (error: any) {
      console.error('Promotion Usage Report Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getCustomerQualifiedReport(req: Request, res: Response) {
    try {
      const { promotion_id, start_date, end_date } = req.query;

      if (!promotion_id) {
        return res.status(400).json({
          success: false,
          message: 'promotion_id is required',
        });
      }

      const filters: any = {
        parent_id: Number(promotion_id),
        action_type: 'APPLIED',
      };

      if (start_date || end_date) {
        filters.action_date = {};
        if (start_date)
          filters.action_date.gte = new Date(start_date as string);
        if (end_date) filters.action_date.lte = new Date(end_date as string);
      }

      const tracking = await prisma.promotion_tracking.findMany({
        where: filters,
        orderBy: { action_date: 'desc' },
      });

      res.json({
        success: true,
        message: 'Customer qualified report generated',
        data: {
          total_applications: tracking.length,
          applications: tracking,
        },
      });
    } catch (error: any) {
      console.error('Customer Qualified Report Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getPromotionPerformanceReport(req: Request, res: Response) {
    try {
      const { start_date, end_date } = req.query;

      const dateFilters: any = {};
      if (start_date || end_date) {
        dateFilters.action_date = {};
        if (start_date)
          dateFilters.action_date.gte = new Date(start_date as string);
        if (end_date)
          dateFilters.action_date.lte = new Date(end_date as string);
      }

      const promotions = await prisma.promotions.findMany({
        where: { is_active: 'Y' },
        include: {
          promotion_tracking_promotions: {
            where: {
              action_type: 'APPLIED',
              ...dateFilters,
            },
          },
        },
      });

      const performance = promotions.map(promo => ({
        promotion_id: promo.id,
        promotion_name: promo.name,
        promotion_code: promo.code,
        total_applications: promo.promotion_tracking_promotions.length,
        start_date: promo.start_date,
        end_date: promo.end_date,
      }));

      res.json({
        success: true,
        message: 'Promotion performance report generated',
        data: performance,
        summary: {
          total_promotions: performance.length,
          total_applications: performance.reduce(
            (sum, p) => sum + p.total_applications,
            0
          ),
        },
      });
    } catch (error: any) {
      console.error('Promotion Performance Report Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async createDepotPriceOverride(req: Request, res: Response) {
    try {
      const {
        depot_id,
        product_id,
        override_price,
        start_date,
        end_date,
        products,
      } = req.body;

      const userId = req.user?.id || 1;

      if (product_id && !products) {
        const product = await prisma.products.findUnique({
          where: { id: product_id },
          select: { base_price: true },
        });

        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found',
          });
        }

        const discountAmount = new Prisma.Decimal(
          product.base_price || 0
        ).minus(new Prisma.Decimal(override_price));

        const priceOverride = await prisma.depot_price_overrides.create({
          data: {
            depot_id,
            product_id,
            original_price: product.base_price || 0,
            override_price: new Prisma.Decimal(override_price),
            discount_amount: discountAmount,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            is_active: 'Y',
            created_by: userId,
          },
        });

        return res.status(201).json({
          success: true,
          message: 'Depot price override created successfully',
          data: priceOverride,
        });
      }

      if (Array.isArray(products)) {
        const overrides = await Promise.all(
          products.map(async (p: any) => {
            const product = await prisma.products.findUnique({
              where: { id: p.product_id },
              select: { base_price: true },
            });

            const discountAmount = new Prisma.Decimal(
              product?.base_price || 0
            ).minus(new Prisma.Decimal(p.override_price));

            return prisma.depot_price_overrides.create({
              data: {
                depot_id: p.depot_id || depot_id,
                product_id: p.product_id,
                original_price: product?.base_price || 0,
                override_price: new Prisma.Decimal(p.override_price),
                discount_amount: discountAmount,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                is_active: 'Y',
                created_by: userId,
              },
            });
          })
        );

        return res.status(201).json({
          success: true,
          message: `${overrides.length} depot price overrides created successfully`,
          data: overrides,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Either product_id or products array is required',
      });
    } catch (error: any) {
      console.error('Create Depot Price Override Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getDepotPriceOverrides(req: Request, res: Response) {
    try {
      const { depot_id, product_id, active_only } = req.query;

      const filters: any = {};

      if (depot_id) {
        filters.depot_id = parseInt(depot_id as string, 10);
      }

      if (product_id) {
        filters.product_id = parseInt(product_id as string, 10);
      }

      if (active_only === 'true') {
        const now = new Date();
        filters.is_active = 'Y';
        filters.start_date = { lte: now };
        filters.end_date = { gte: now };
      }

      const overrides = await prisma.depot_price_overrides.findMany({
        where: filters,
        include: {
          depot_price_overrides_depots: {
            select: { id: true, name: true, code: true },
          },
          depot_price_overrides_products: {
            select: { id: true, name: true, code: true, base_price: true },
          },
        },
        orderBy: { start_date: 'desc' },
      });

      res.json({
        success: true,
        message: 'Depot price overrides retrieved successfully',
        data: overrides,
      });
    } catch (error: any) {
      console.error('Get Depot Price Overrides Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getProductPrice(req: Request, res: Response) {
    try {
      const { product_id, depot_id } = req.query;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'product_id is required',
        });
      }

      const product = await prisma.products.findUnique({
        where: { id: parseInt(product_id as string, 10) },
        select: {
          id: true,
          name: true,
          code: true,
          base_price: true,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      let finalPrice = product.base_price;
      let priceType = 'base';
      let override = null;

      if (depot_id) {
        const now = new Date();
        override = await prisma.depot_price_overrides.findFirst({
          where: {
            product_id: parseInt(product_id as string, 10),
            depot_id: parseInt(depot_id as string, 10),
            is_active: 'Y',
            start_date: { lte: now },
            end_date: { gte: now },
          },
          include: {
            depot_price_overrides_depots: {
              select: { name: true, code: true },
            },
          },
        });

        if (override) {
          finalPrice = override.override_price;
          priceType = 'depot_override';
        }
      }

      res.json({
        success: true,
        data: {
          product_id: product.id,
          product_name: product.name,
          product_code: product.code,
          base_price: product.base_price,
          final_price: finalPrice,
          price_type: priceType,
          override: override
            ? {
                depot_id: override.depot_id,
                depot_name: override.depot_price_overrides_depots.name,
                override_price: override.override_price,
                discount_amount: override.discount_amount,
                valid_from: override.start_date,
                valid_to: override.end_date,
              }
            : null,
        },
      });
    } catch (error: any) {
      console.error('Get Product Price Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
