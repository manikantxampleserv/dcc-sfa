import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { Prisma } from '@prisma/client';
import { channel } from 'diagnostics_channel';

interface PromotionCreateInput {
  name: string;
  code?: string;
  description?: string;
  start_date: string;
  end_date: string;
  platforms?: string[];
  quantity_type?: string;
  product_conditions?: Array<{
    product_id?: number;
    category_id?: number;
    product_group?: string;
    min_quantity?: number;
    min_value?: number;
    quantity_type?: string;
  }>;
  location_areas?: number[];
  routes?: number[];
  zones?: number[];
  customer_exclusions?: number[];
  outlet1_groups?: number[];
  customer_types?: number[];
  customer_channels?: number[];
  salespersons?: number[];
  levels?: Array<{
    level_number?: number;
    threshold_value?: number;
    discount_type?: string;
    discount_value?: number;
    benefits?: Array<{
      benefit_type?: string;
      product_id?: number;
      benefit_value?: number;
      condition_type?: string;
      gift_limit?: number;
    }>;
  }>;
}
interface PromotionUpdateInput {
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  is_active?: string;
  platforms?: string[];
  quantity_type?: string;
  product_conditions?: Array<{
    product_id?: number;
    category_id?: number;
    product_group?: string;
    min_quantity?: number;
    min_value?: number;
    quantity_type?: string;
  }>;
  location_areas?: number[];
  routes?: number[];
  zones?: number[];
  customer_exclusions?: number[];
  outlet1_groups?: number[];
  customer_types?: number[];
  customer_channels?: number[];
  salespersons?: number[];
  levels?: Array<{
    level_number?: number;
    threshold_value?: number;
    discount_type?: string;
    discount_value?: number;
    benefits?: Array<{
      benefit_type?: string;
      product_id?: number;
      benefit_value?: number;
      condition_type?: string;
      gift_limit?: number;
    }>;
  }>;
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
    zones: promo.promotion_zones_promotions,
    customer_categories: promo.promotion_customer_category_promotions,
    customer_types: promo.promotion_customer_types_promotions,
    customer_channels: promo.promotion_customer_channel_promotions,
    customer_exclusions: promo.promotion_customer_exclusion_promotions,
    conditions: promo.promotion_condition_promotions,
    levels: promo.promotion_level_promotions,
    tracking: promo.promotion_tracking_promotions,
  };
};

export const promotionsNewController = {
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
          type: 'GENERAL',
          start_date: startDate,
          end_date: endDate,
          description: input.description || null,
          is_active: 'Y',
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

      const productConditions = input.product_conditions || [];
      if (productConditions.length > 0) {
        const firstProduct = await prisma.products.findFirst({
          select: { id: true },
        });
        const firstCategory = await prisma.product_categories.findFirst({
          select: { id: true },
        });

        const defaultProductId = firstProduct?.id || 1;
        const defaultCategoryId = firstCategory?.id || 1;

        for (const conditionInput of productConditions) {
          const condition = await prisma.promotion_condition.create({
            data: {
              parent_id: promotionId,
              condition_type: (
                conditionInput.quantity_type ||
                input.quantity_type ||
                'QUANTITY'
              ).toUpperCase(),
              applies_to_type: conditionInput.product_group
                ? 'PRODUCTGROUP'
                : conditionInput.category_id
                  ? 'CATEGORY'
                  : 'SINGLEPRODUCT',
              min_value: new Prisma.Decimal(
                conditionInput.min_value || conditionInput.min_quantity || 0
              ),
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
              product_id:
                conditionInput.product_id ||
                (conditionInput.product_group
                  ? defaultProductId
                  : defaultProductId),
              category_id:
                conditionInput.category_id ||
                (conditionInput.product_group
                  ? defaultCategoryId
                  : defaultCategoryId),
              product_group: conditionInput.product_group || null,
              condition_quantity: new Prisma.Decimal(
                conditionInput.min_quantity || conditionInput.min_value || 0
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
              level_number: levelInput.level_number || 1,
              threshold_value: new Prisma.Decimal(
                levelInput.threshold_value || 0
              ),
              discount_type: levelInput.discount_type || 'PERCENTAGE',
              discount_value: new Prisma.Decimal(
                levelInput.discount_value || 0
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
                  benefit_type: benefitInput.benefit_type || 'FREE_PRODUCT',
                  product_id: benefitInput.product_id || null,
                  benefit_value: new Prisma.Decimal(
                    benefitInput.benefit_value || 0
                  ),
                  condition_type: benefitInput.condition_type || null,
                  gift_limit: benefitInput.gift_limit || 0,
                  is_active: 'Y',
                },
              });
            }
          }
        }
      }

      const locationAreas = input.location_areas || [];
      if (locationAreas.length > 0) {
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

      const routes = input.routes || [];
      if (routes.length > 0) {
        for (const routeId of routes) {
          await prisma.promotion_routes.create({
            data: {
              parent_id: promotionId,
              route_id: routeId,
              is_active: 'Y',
            },
          });
        }
      }

      const customerExclusions = input.customer_exclusions || [];
      if (customerExclusions.length > 0) {
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

      const outlet1Groups = input.outlet1_groups || [];
      if (outlet1Groups.length > 0) {
        for (const categoryId of outlet1Groups) {
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
      }

      const customerTypes = input.customer_types || [];
      if (customerTypes.length > 0) {
        for (const customerTypeId of customerTypes) {
          await prisma.promotion_customer_types.create({
            data: {
              parent_id: promotionId,
              customer_type_id: customerTypeId,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }
      }

      const customerChannels = input.customer_channels || [];
      if (customerChannels.length > 0) {
        for (const customerChannelId of customerChannels) {
          await prisma.promotion_customer_channel.create({
            data: {
              parent_id: promotionId,
              customer_channel_id: customerChannelId,
              is_active: 'Y',
              createdby: req.user?.id || 1,
              createdate: new Date(),
              log_inst: 1,
            },
          });
        }
      }

      const salespersons = input.salespersons || [];
      if (salespersons.length > 0) {
        for (const salespersonId of salespersons) {
          await prisma.promotion_salesperson.create({
            data: {
              parent_id: promotionId,
              salesperson_id: salespersonId,
              is_active: 'Y',
            },
          });
        }
      }

      const zones = input.zones || [];
      if (zones.length > 0) {
        for (const zoneId of zones) {
          await prisma.promotion_zones.create({
            data: {
              parent_id: promotionId,
              zone_id: zoneId,
              is_active: 'Y',
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
          promotion_zones_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_zones_zones: true },
          },
          promotion_customer_category_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_categorys: true },
          },
          promotion_customer_types_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_types_customer: true },
          },
          promotion_customer_channel_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_channel_customer: true },
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
          promotion_zones_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_zones_zones: {
                select: { id: true, name: true, code: true },
              },
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
          promotion_customer_types_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_customer_types_customer: {
                select: { id: true, type_name: true, type_code: true },
              },
            },
          },
          promotion_customer_channel_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_customer_channel_customer: {
                select: { id: true, channel_name: true, channel_code: true },
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
          promotion_zones_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_zones_zones: true },
          },
          promotion_customer_category_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_categorys: true },
          },
          promotion_customer_types_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_types_customer: true },
          },
          promotion_customer_channel_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_channel_customer: true },
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
                include: {
                  promotion_benefit_products: true,
                },
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
      const input: PromotionUpdateInput = req.body;

      const existing = await prisma.promotions.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      const updateData: any = {
        updatedate: new Date(),
        updatedby: req.user?.id || 1,
      };

      if (input.name) updateData.name = input.name;
      if (input.start_date) updateData.start_date = new Date(input.start_date);
      if (input.end_date) updateData.end_date = new Date(input.end_date);
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.is_active) updateData.is_active = input.is_active;

      const promotion = await prisma.promotions.update({
        where: { id: Number(id) },
        data: updateData,
      });

      if (input.platforms && Array.isArray(input.platforms)) {
        await prisma.promotion_channel.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        for (const platform of input.platforms) {
          await prisma.promotion_channel.create({
            data: {
              parent_id: Number(id),
              channel_type: platform,
              is_active: 'Y',
            },
          });
        }
      }

      const locationAreas = input.location_areas;
      if (locationAreas !== undefined) {
        await prisma.promotion_depot.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        if (Array.isArray(locationAreas) && locationAreas.length > 0) {
          for (const depotId of locationAreas) {
            await prisma.promotion_depot.create({
              data: {
                parent_id: Number(id),
                depot_id: depotId,
                is_active: 'Y',
              },
            });
          }
        }
      }

      const routes = input.routes;
      if (routes !== undefined) {
        await prisma.promotion_routes.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        if (Array.isArray(routes) && routes.length > 0) {
          for (const routeId of routes) {
            await prisma.promotion_routes.create({
              data: {
                parent_id: Number(id),
                route_id: routeId,
                is_active: 'Y',
              },
            });
          }
        }
      }

      const zones = input.zones;
      if (zones !== undefined) {
        await prisma.promotion_zones.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        if (Array.isArray(zones) && zones.length > 0) {
          for (const zoneId of zones) {
            await prisma.promotion_zones.create({
              data: {
                parent_id: Number(id),
                zone_id: zoneId,
                is_active: 'Y',
              },
            });
          }
        }
      }

      const customerExclusions = input.customer_exclusions;
      if (customerExclusions !== undefined) {
        await prisma.promotion_customer_exclusion.deleteMany({
          where: { parent_id: Number(id) },
        });
        if (
          Array.isArray(customerExclusions) &&
          customerExclusions.length > 0
        ) {
          for (const customerId of customerExclusions) {
            await prisma.promotion_customer_exclusion.create({
              data: {
                parent_id: Number(id),
                customer_id: customerId,
                is_excluded: 'Y',
              },
            });
          }
        }
      }

      const outlet1Groups = input.outlet1_groups;
      if (outlet1Groups !== undefined) {
        await prisma.promotion_customer_category.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        if (Array.isArray(outlet1Groups) && outlet1Groups.length > 0) {
          for (const categoryId of outlet1Groups) {
            await prisma.promotion_customer_category.create({
              data: {
                parent_id: Number(id),
                customer_category_id: categoryId,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      const customerTypes = input.customer_types;
      if (customerTypes !== undefined) {
        await prisma.promotion_customer_types.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        if (Array.isArray(customerTypes) && customerTypes.length > 0) {
          for (const customerTypeId of customerTypes) {
            await prisma.promotion_customer_types.create({
              data: {
                parent_id: Number(id),
                customer_type_id: customerTypeId,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      const customerChannels = input.customer_channels;
      if (customerChannels !== undefined) {
        await prisma.promotion_customer_channel.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        if (Array.isArray(customerChannels) && customerChannels.length > 0) {
          for (const customerChannelId of customerChannels) {
            await prisma.promotion_customer_channel.create({
              data: {
                parent_id: Number(id),
                customer_channel_id: customerChannelId,
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      const salespersons = input.salespersons;
      if (salespersons !== undefined) {
        await prisma.promotion_salesperson.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });
        if (Array.isArray(salespersons) && salespersons.length > 0) {
          for (const salespersonId of salespersons) {
            await prisma.promotion_salesperson.create({
              data: {
                parent_id: Number(id),
                salesperson_id: salespersonId,
                is_active: 'Y',
              },
            });
          }
        }
      }

      const productConditions = input.product_conditions;
      if (productConditions !== undefined) {
        await prisma.promotion_condition.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });

        if (Array.isArray(productConditions) && productConditions.length > 0) {
          const firstProduct = await prisma.products.findFirst({
            select: { id: true },
          });
          const firstCategory = await prisma.product_categories.findFirst({
            select: { id: true },
          });

          const defaultProductId = firstProduct?.id || 1;
          const defaultCategoryId = firstCategory?.id || 1;

          const startDate = input.start_date
            ? new Date(input.start_date)
            : existing.start_date;
          const endDate = input.end_date
            ? new Date(input.end_date)
            : existing.end_date;

          for (const conditionInput of productConditions) {
            const condition = await prisma.promotion_condition.create({
              data: {
                parent_id: Number(id),
                condition_type: (
                  conditionInput.quantity_type ||
                  input.quantity_type ||
                  'QUANTITY'
                ).toUpperCase(),
                applies_to_type: conditionInput.product_group
                  ? 'PRODUCTGROUP'
                  : conditionInput.category_id
                    ? 'CATEGORY'
                    : 'SINGLEPRODUCT',
                min_value: new Prisma.Decimal(
                  conditionInput.min_value || conditionInput.min_quantity || 0
                ),
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
                product_id:
                  conditionInput.product_id ||
                  (conditionInput.product_group
                    ? defaultProductId
                    : defaultProductId),
                category_id:
                  conditionInput.category_id ||
                  (conditionInput.product_group
                    ? defaultCategoryId
                    : defaultCategoryId),
                product_group: conditionInput.product_group || null,
                condition_quantity: new Prisma.Decimal(
                  conditionInput.min_quantity || conditionInput.min_value || 0
                ),
                is_active: 'Y',
                createdby: req.user?.id || 1,
                createdate: new Date(),
                log_inst: 1,
              },
            });
          }
        }
      }

      const levels = input.levels;
      if (levels !== undefined) {
        await prisma.promotion_level.updateMany({
          where: { parent_id: Number(id) },
          data: { is_active: 'N' },
        });

        if (Array.isArray(levels) && levels.length > 0) {
          for (const levelInput of levels) {
            const level = await prisma.promotion_level.create({
              data: {
                parent_id: Number(id),
                level_number: levelInput.level_number || 1,
                threshold_value: new Prisma.Decimal(
                  levelInput.threshold_value || 0
                ),
                discount_type: levelInput.discount_type || 'PERCENTAGE',
                discount_value: new Prisma.Decimal(
                  levelInput.discount_value || 0
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
                    benefit_type: benefitInput.benefit_type || 'FREE_PRODUCT',
                    product_id: benefitInput.product_id || null,
                    benefit_value: new Prisma.Decimal(
                      benefitInput.benefit_value || 0
                    ),
                    condition_type: benefitInput.condition_type || null,
                    gift_limit: benefitInput.gift_limit || 0,
                    is_active: 'Y',
                  },
                });
              }
            }
          }
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
          promotion_zones_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_zones_zones: true },
          },
          promotion_customer_category_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_categorys: true },
          },
          promotion_customer_types_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_types_customer: true },
          },
          promotion_customer_channel_promotions: {
            where: { is_active: 'Y' },
            include: { promotion_customer_channel_customer: true },
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
            orderBy: { action_date: 'desc' },
            take: 100,
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

  async getPromotionsWithVisitsAndOutlets(req: any, res: Response) {
    try {
      const { salesperson_id } = req.query;

      if (!salesperson_id) {
        return res.status(400).json({
          success: false,
          message: 'salesperson_id is required',
        });
      }

      const salespersonIdNum = parseInt(salesperson_id as string, 10);

      // Get current date (start and end of day)
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch promotions for the salesperson
      const promotions = await prisma.promotions.findMany({
        where: {
          is_active: 'Y',
          promotion_salesperson_promotions: {
            some: {
              salesperson_id: salespersonIdNum,
              is_active: 'Y',
            },
          },
        },
        include: {
          promotion_channel_promotions: { where: { is_active: 'Y' } },
          promotion_depot_promotions: {
            where: { is_active: 'Y' },
            include: {
              depots: { select: { id: true, name: true, code: true } },
            },
          },
          promotion_condition_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_products: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_productId: {
                    select: { id: true, name: true, code: true },
                  },
                  promotion_condition_categories: {
                    select: { id: true, category_name: true },
                  },
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
                  promotion_benefit_products: {
                    select: { id: true, name: true, code: true },
                  },
                },
              },
            },
            orderBy: { level_number: 'asc' },
          },
        },
      });

      // Fetch visits for the current date for this salesperson
      const visits = await prisma.visits.findMany({
        where: {
          sales_person_id: salespersonIdNum,
          visit_date: {
            gte: currentDate,
            lte: endOfDay,
          },
          is_active: 'Y',
        },
        include: {
          visit_customers: {
            select: {
              id: true,
              name: true,
              code: true,
              short_name: true,
              contact_person: true,
              phone_number: true,
              email: true,
              address: true,
              city: true,
              state: true,
              latitude: true,
              longitude: true,
              customer_type_id: true,
              customer_channel_id: true,
              customer_category_id: true,
              route_id: true,
              zones_id: true,
            },
          },
          visit_routes: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          visit_zones: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          visit_date: 'asc',
        },
      });

      // Structure the response
      const response = {
        salesperson_id: salespersonIdNum,
        date: currentDate.toISOString().split('T')[0],
        promotions: promotions.map(promo => serializePromotion(promo)),
        visits: visits.map(visit => ({
          id: visit.id,
          visit_date: visit.visit_date,
          visit_time: visit.visit_time,
          purpose: visit.purpose,
          status: visit.status,
          start_time: visit.start_time,
          end_time: visit.end_time,
          duration: visit.duration,
          check_in_time: visit.check_in_time,
          check_out_time: visit.check_out_time,
          start_latitude: visit.start_latitude,
          start_longitude: visit.start_longitude,
          end_latitude: visit.end_latitude,
          end_longitude: visit.end_longitude,
          visit_notes: visit.visit_notes,
          customer_feedback: visit.customer_feedback,
          outlet: visit.visit_customers,
          route: visit.visit_routes,
          zone: visit.visit_zones,
        })),
        summary: {
          total_promotions: promotions.length,
          total_visits: visits.length,
          total_outlets: visits.length,
        },
      };

      res.json({
        success: true,
        message: 'Promotions with visits and outlets retrieved successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('Get Promotions with Visits and Outlets Error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // async getActivePromotionsWithDetails(req: any, res: Response) {
  //   try {
  //     const {
  //       page,
  //       limit,
  //       search,
  //       platform,
  //       depot_id,
  //       salesperson_id,
  //       route_id,
  //       zone_id,
  //       customer_type_id,
  //       customer_channel_id,
  //       customer_category_id,
  //     } = req.query;

  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 10;
  //     const searchLower = search ? (search as string).toLowerCase().trim() : '';

  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  //     const endOfToday = new Date(today);
  //     endOfToday.setHours(23, 59, 59, 999);

  //     const filters: any = {
  //       is_active: 'Y',
  //       start_date: { lte: endOfToday },
  //       end_date: { gte: today },
  //     };

  //     if (searchLower) {
  //       filters.OR = [
  //         { name: { contains: searchLower } },
  //         { code: { contains: searchLower } },
  //         { description: { contains: searchLower } },
  //       ];
  //     }

  //     if (platform) {
  //       filters.promotion_channel_promotions = {
  //         some: {
  //           channel_type: platform,
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (depot_id) {
  //       filters.promotion_depot_promotions = {
  //         some: {
  //           depot_id: parseInt(depot_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (salesperson_id) {
  //       filters.promotion_salesperson_promotions = {
  //         some: {
  //           salesperson_id: parseInt(salesperson_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (route_id) {
  //       filters.promotion_routes_promotions = {
  //         some: {
  //           route_id: parseInt(route_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (zone_id) {
  //       filters.promotion_zones_promotions = {
  //         some: {
  //           zone_id: parseInt(zone_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (customer_type_id) {
  //       filters.promotion_customer_types_promotions = {
  //         some: {
  //           customer_type_id: parseInt(customer_type_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (customer_channel_id) {
  //       filters.promotion_customer_channel_promotions = {
  //         some: {
  //           customer_channel_id: parseInt(customer_channel_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (customer_category_id) {
  //       filters.promotion_customer_category_promotions = {
  //         some: {
  //           customer_category_id: parseInt(customer_category_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     const { data, pagination } = await paginate({
  //       model: prisma.promotions,
  //       filters,
  //       page: pageNum,
  //       limit: limitNum,
  //       orderBy: { start_date: 'desc' },
  //       include: {
  //         promotion_routes_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { route_id: true },
  //         },
  //         promotion_zones_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { zone_id: true },
  //         },
  //         promotion_customer_types_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { customer_type_id: true },
  //         },
  //         promotion_customer_channel_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { customer_channel_id: true },
  //         },
  //         promotion_customer_category_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { customer_category_id: true },
  //         },
  //         promotion_customer_exclusion_promotions: {
  //           select: { customer_id: true },
  //         },
  //         promotion_condition_promotions: {
  //           where: { is_active: 'Y' },
  //           include: {
  //             promotion_condition_products: {
  //               where: { is_active: 'Y' },
  //               include: {
  //                 promotion_condition_productId: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                     description: true,
  //                     base_price: true,
  //                     category_id: true,
  //                     sub_category_id: true,
  //                     brand_id: true,
  //                     unit_of_measurement: true,
  //                     tax_rate: true,
  //                     vat_percentage: true,
  //                     weight_in_grams: true,
  //                     volume_in_liters: true,
  //                     tracking_type: true,
  //                   },
  //                 },
  //                 promotion_condition_categories: {
  //                   select: {
  //                     id: true,
  //                     category_name: true,
  //                   },
  //                 },
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
  //                 promotion_benefit_products: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                     description: true,
  //                     base_price: true,
  //                     category_id: true,
  //                     sub_category_id: true,
  //                     brand_id: true,
  //                     unit_of_measurement: true,
  //                     tax_rate: true,
  //                     vat_percentage: true,
  //                     weight_in_grams: true,
  //                     volume_in_liters: true,
  //                     tracking_type: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           orderBy: { level_number: 'asc' },
  //         },
  //       },
  //     });

  //     const promotionsWithDetails = await Promise.all(
  //       data.map(async (promo: any) => {
  //         const outletFilters: any = {
  //           is_active: 'Y',
  //         };

  //         const routeIds = promo.promotion_routes_promotions?.map(
  //           (r: any) => r.route_id
  //         );
  //         if (routeIds && routeIds.length > 0) {
  //           outletFilters.route_id = { in: routeIds };
  //         }

  //         const zoneIds = promo.promotion_zones_promotions?.map(
  //           (z: any) => z.zone_id
  //         );
  //         if (zoneIds && zoneIds.length > 0) {
  //           outletFilters.zones_id = { in: zoneIds };
  //         }

  //         const customerTypeIds =
  //           promo.promotion_customer_types_promotions?.map(
  //             (ct: any) => ct.customer_type_id
  //           );
  //         if (customerTypeIds && customerTypeIds.length > 0) {
  //           outletFilters.customer_type_id = { in: customerTypeIds };
  //         }

  //         const customerChannelIds =
  //           promo.promotion_customer_channel_promotions?.map(
  //             (cc: any) => cc.customer_channel_id
  //           );
  //         if (customerChannelIds && customerChannelIds.length > 0) {
  //           outletFilters.customer_channel_id = { in: customerChannelIds };
  //         }

  //         const customerCategoryIds =
  //           promo.promotion_customer_category_promotions?.map(
  //             (cat: any) => cat.customer_category_id
  //           );
  //         if (customerCategoryIds && customerCategoryIds.length > 0) {
  //           outletFilters.customer_category_id = { in: customerCategoryIds };
  //         }

  //         const excludedCustomerIds =
  //           promo.promotion_customer_exclusion_promotions?.map(
  //             (exc: any) => exc.customer_id
  //           );
  //         if (excludedCustomerIds && excludedCustomerIds.length > 0) {
  //           outletFilters.id = { notIn: excludedCustomerIds };
  //         }

  //         const suitableOutlets = await prisma.customers.findMany({
  //           where: outletFilters,
  //           select: {
  //             id: true,
  //             name: true,
  //             code: true,
  //           },
  //           take: 1000,
  //         });

  //         const productConditions = promo.promotion_condition_promotions?.map(
  //           (condition: any) => ({
  //             id: condition.id,
  //             condition_type: condition.condition_type,
  //             applies_to_type: condition.applies_to_type,
  //             min_value: condition.min_value,
  //             max_value: condition.max_value,
  //             effective_start_date: condition.effective_start_date,
  //             effective_end_date: condition.effective_end_date,
  //             status: condition.status,
  //             products: condition.promotion_condition_products?.map(
  //               (cp: any) => ({
  //                 id: cp.id,
  //                 product_id: cp.product_id,
  //                 category_id: cp.category_id,
  //                 product_group: cp.product_group,
  //                 condition_quantity: cp.condition_quantity,
  //                 product_details: cp.promotion_condition_productId,
  //                 category_details: cp.promotion_condition_categories,
  //               })
  //             ),
  //           })
  //         );

  //         const gifts = promo.promotion_level_promotions?.flatMap(
  //           (level: any) =>
  //             level.promotion_benefit_level?.map((benefit: any) => ({
  //               id: benefit.id,
  //               level_number: level.level_number,
  //               level_threshold: level.threshold_value,
  //               discount_type: level.discount_type,
  //               discount_value: level.discount_value,
  //               benefit_type: benefit.benefit_type,
  //               product_id: benefit.product_id,
  //               benefit_value: benefit.benefit_value,
  //               condition_type: benefit.condition_type,
  //               gift_limit: benefit.gift_limit,
  //               product_details: benefit.promotion_benefit_products,
  //             })) || []
  //         );

  //         return {
  //           id: promo.id,
  //           name: promo.name,
  //           code: promo.code,
  //           type: promo.type,
  //           start_date: promo.start_date,
  //           end_date: promo.end_date,
  //           description: promo.description,
  //           is_active: promo.is_active,
  //           createdate: promo.createdate,
  //           createdby: promo.createdby,
  //           updatedate: promo.updatedate,
  //           updatedby: promo.updatedby,
  //           product_conditions: productConditions || [],
  //           gifts: gifts || [],
  //           suitable_outlets: suitableOutlets || [],
  //           suitable_outlets_count: suitableOutlets?.length || 0,
  //         };
  //       })
  //     );

  //     const totalActivePromotions = await prisma.promotions.count({
  //       where: filters,
  //     });

  //     res.json({
  //       success: true,
  //       message: 'Active promotions with details retrieved successfully',
  //       data: promotionsWithDetails,
  //       pagination,
  //       summary: {
  //         total_active_promotions: totalActivePromotions,
  //         current_date: today.toISOString().split('T')[0],
  //         filtered_count: promotionsWithDetails.length,
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error('Get Active Promotions With Details Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // },

  // II
  // async getActivePromotionsWithDetails(req: any, res: Response) {
  //   try {
  //     const {
  //       page,
  //       limit,
  //       search,
  //       platform,
  //       depot_id,
  //       salesperson_id,
  //       route_id,
  //       zone_id,
  //       customer_type_id,
  //       customer_channel_id,
  //       customer_category_id,
  //     } = req.query;

  //     const pageNum = parseInt(page as string, 10) || 1;
  //     const limitNum = parseInt(limit as string, 10) || 10;
  //     const searchLower = search ? (search as string).toLowerCase().trim() : '';

  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  //     const endOfToday = new Date(today);
  //     endOfToday.setHours(23, 59, 59, 999);

  //     const filters: any = {
  //       is_active: 'Y',
  //       start_date: { lte: endOfToday },
  //       end_date: { gte: today },
  //     };

  //     if (searchLower) {
  //       filters.OR = [
  //         { name: { contains: searchLower } },
  //         { code: { contains: searchLower } },
  //         { description: { contains: searchLower } },
  //       ];
  //     }

  //     if (platform) {
  //       filters.promotion_channel_promotions = {
  //         some: {
  //           channel_type: platform,
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (depot_id) {
  //       filters.promotion_depot_promotions = {
  //         some: {
  //           depot_id: parseInt(depot_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (salesperson_id) {
  //       filters.promotion_salesperson_promotions = {
  //         some: {
  //           salesperson_id: parseInt(salesperson_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (route_id) {
  //       filters.promotion_routes_promotions = {
  //         some: {
  //           route_id: parseInt(route_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (zone_id) {
  //       filters.promotion_zones_promotions = {
  //         some: {
  //           zone_id: parseInt(zone_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (customer_type_id) {
  //       filters.promotion_customer_types_promotions = {
  //         some: {
  //           customer_type_id: parseInt(customer_type_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (customer_channel_id) {
  //       filters.promotion_customer_channel_promotions = {
  //         some: {
  //           customer_channel_id: parseInt(customer_channel_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     if (customer_category_id) {
  //       filters.promotion_customer_category_promotions = {
  //         some: {
  //           customer_category_id: parseInt(customer_category_id as string, 10),
  //           is_active: 'Y',
  //         },
  //       };
  //     }

  //     let todaysOutletIds: number[] = [];
  //     let outletSource: string = 'none';

  //     if (salesperson_id) {
  //       const salespersonIdNum = parseInt(salesperson_id as string, 10);

  //       const todaysVisits = await prisma.visits.findMany({
  //         where: {
  //           sales_person_id: salespersonIdNum,
  //           visit_date: {
  //             gte: today,
  //             lte: endOfToday,
  //           },
  //           is_active: 'Y',
  //         },
  //         select: {
  //           customer_id: true,
  //         },
  //       });

  //       if (todaysVisits.length > 0) {
  //         todaysOutletIds = todaysVisits.map(v => v.customer_id);
  //         outletSource = 'visits';
  //       } else {
  //         const salespersonRoutes = await prisma.routes.findMany({
  //           where: {
  //             salesperson_id: salespersonIdNum,
  //             is_active: 'Y',
  //           },
  //           select: {
  //             id: true,
  //           },
  //         });

  //         const routeIds = salespersonRoutes.map(r => r.id);

  //         if (routeIds.length > 0) {
  //           const routeCustomers = await prisma.customers.findMany({
  //             where: {
  //               route_id: { in: routeIds },
  //               is_active: 'Y',
  //             },
  //             select: {
  //               id: true,
  //             },
  //           });

  //           todaysOutletIds = routeCustomers.map(c => c.id);
  //           outletSource = 'salesperson_routes';
  //         }
  //       }
  //     }

  //     const { data, pagination } = await paginate({
  //       model: prisma.promotions,
  //       filters,
  //       page: pageNum,
  //       limit: limitNum,
  //       orderBy: { start_date: 'desc' },
  //       include: {
  //         promotion_routes_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { route_id: true },
  //         },
  //         promotion_zones_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { zone_id: true },
  //         },
  //         promotion_customer_types_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { customer_type_id: true },
  //         },
  //         promotion_customer_channel_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { customer_channel_id: true },
  //         },
  //         promotion_customer_category_promotions: {
  //           where: { is_active: 'Y' },
  //           select: { customer_category_id: true },
  //         },
  //         promotion_customer_exclusion_promotions: {
  //           select: { customer_id: true },
  //         },
  //         promotion_condition_promotions: {
  //           where: { is_active: 'Y' },
  //           include: {
  //             promotion_condition_products: {
  //               where: { is_active: 'Y' },
  //               include: {
  //                 promotion_condition_productId: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                     description: true,
  //                     base_price: true,
  //                     category_id: true,
  //                     sub_category_id: true,
  //                     brand_id: true,
  //                     unit_of_measurement: true,
  //                     tax_rate: true,
  //                     vat_percentage: true,
  //                     weight_in_grams: true,
  //                     volume_in_liters: true,
  //                     tracking_type: true,
  //                   },
  //                 },
  //                 promotion_condition_categories: {
  //                   select: {
  //                     id: true,
  //                     category_name: true,
  //                   },
  //                 },
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
  //                 promotion_benefit_products: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                     code: true,
  //                     description: true,
  //                     base_price: true,
  //                     category_id: true,
  //                     sub_category_id: true,
  //                     brand_id: true,
  //                     unit_of_measurement: true,
  //                     tax_rate: true,
  //                     vat_percentage: true,
  //                     weight_in_grams: true,
  //                     volume_in_liters: true,
  //                     tracking_type: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           orderBy: { level_number: 'asc' },
  //         },
  //       },
  //     });

  //     const promotionsWithDetails = await Promise.all(
  //       data.map(async (promo: any) => {
  //         const outletFilters: any = {
  //           is_active: 'Y',
  //         };

  //         if (salesperson_id && todaysOutletIds.length > 0) {
  //           outletFilters.id = { in: todaysOutletIds };
  //         } else if (salesperson_id && todaysOutletIds.length === 0) {
  //           return {
  //             id: promo.id,
  //             name: promo.name,
  //             code: promo.code,
  //             type: promo.type,
  //             start_date: promo.start_date,
  //             end_date: promo.end_date,
  //             description: promo.description,
  //             is_active: promo.is_active,
  //             createdate: promo.createdate,
  //             createdby: promo.createdby,
  //             updatedate: promo.updatedate,
  //             updatedby: promo.updatedby,
  //             product_conditions: [],
  //             gifts: [],
  //             suitable_outlets: [],
  //             suitable_outlets_count: 0,
  //             outlet_source: outletSource,
  //             message: 'No visits or routes assigned for this salesperson',
  //           };
  //         }

  //         const routeIds = promo.promotion_routes_promotions?.map(
  //           (r: any) => r.route_id
  //         );
  //         if (routeIds && routeIds.length > 0) {
  //           outletFilters.route_id = { in: routeIds };
  //         }

  //         const zoneIds = promo.promotion_zones_promotions?.map(
  //           (z: any) => z.zone_id
  //         );
  //         if (zoneIds && zoneIds.length > 0) {
  //           outletFilters.zones_id = { in: zoneIds };
  //         }

  //         const customerTypeIds =
  //           promo.promotion_customer_types_promotions?.map(
  //             (ct: any) => ct.customer_type_id
  //           );
  //         if (customerTypeIds && customerTypeIds.length > 0) {
  //           outletFilters.customer_type_id = { in: customerTypeIds };
  //         }

  //         const customerChannelIds =
  //           promo.promotion_customer_channel_promotions?.map(
  //             (cc: any) => cc.customer_channel_id
  //           );
  //         if (customerChannelIds && customerChannelIds.length > 0) {
  //           outletFilters.customer_channel_id = { in: customerChannelIds };
  //         }

  //         const customerCategoryIds =
  //           promo.promotion_customer_category_promotions?.map(
  //             (cat: any) => cat.customer_category_id
  //           );
  //         if (customerCategoryIds && customerCategoryIds.length > 0) {
  //           outletFilters.customer_category_id = { in: customerCategoryIds };
  //         }

  //         const excludedCustomerIds =
  //           promo.promotion_customer_exclusion_promotions?.map(
  //             (exc: any) => exc.customer_id
  //           );
  //         if (excludedCustomerIds && excludedCustomerIds.length > 0) {
  //           outletFilters.id = outletFilters.id
  //             ? {
  //                 in: todaysOutletIds.filter(
  //                   id => !excludedCustomerIds.includes(id)
  //                 ),
  //               }
  //             : { notIn: excludedCustomerIds };
  //         }

  //         const suitableOutlets = await prisma.customers.findMany({
  //           where: outletFilters,
  //           select: {
  //             id: true,
  //           },
  //           take: 1000,
  //         });

  //         const outletIdsFormatted = suitableOutlets.map(
  //           outlet => `id:${outlet.id}`
  //         );

  //         const productConditions = promo.promotion_condition_promotions?.map(
  //           (condition: any) => ({
  //             id: condition.id,
  //             condition_type: condition.condition_type,
  //             applies_to_type: condition.applies_to_type,
  //             min_value: condition.min_value,
  //             max_value: condition.max_value,
  //             effective_start_date: condition.effective_start_date,
  //             effective_end_date: condition.effective_end_date,
  //             status: condition.status,
  //             products: condition.promotion_condition_products?.map(
  //               (cp: any) => ({
  //                 id: cp.id,
  //                 product_id: cp.product_id,
  //                 category_id: cp.category_id,
  //                 product_group: cp.product_group,
  //                 condition_quantity: cp.condition_quantity,
  //                 product_details: cp.promotion_condition_productId,
  //                 category_details: cp.promotion_condition_categories,
  //               })
  //             ),
  //           })
  //         );

  //         const gifts = promo.promotion_level_promotions?.flatMap(
  //           (level: any) =>
  //             level.promotion_benefit_level?.map((benefit: any) => ({
  //               id: benefit.id,
  //               level_number: level.level_number,
  //               level_threshold: level.threshold_value,
  //               discount_type: level.discount_type,
  //               discount_value: level.discount_value,
  //               benefit_type: benefit.benefit_type,
  //               product_id: benefit.product_id,
  //               benefit_value: benefit.benefit_value,
  //               condition_type: benefit.condition_type,
  //               gift_limit: benefit.gift_limit,
  //               product_details: benefit.promotion_benefit_products,
  //             })) || []
  //         );

  //         return {
  //           id: promo.id,
  //           name: promo.name,
  //           code: promo.code,
  //           type: promo.type,
  //           start_date: promo.start_date,
  //           end_date: promo.end_date,
  //           description: promo.description,
  //           is_active: promo.is_active,
  //           createdate: promo.createdate,
  //           createdby: promo.createdby,
  //           updatedate: promo.updatedate,
  //           updatedby: promo.updatedby,
  //           product_conditions: productConditions || [],
  //           gifts: gifts || [],
  //           suitable_outlets: outletIdsFormatted,
  //           suitable_outlets_count: outletIdsFormatted.length,
  //           outlet_source: salesperson_id ? outletSource : null,
  //         };
  //       })
  //     );

  //     const totalActivePromotions = await prisma.promotions.count({
  //       where: filters,
  //     });

  //     res.json({
  //       success: true,
  //       message: 'Active promotions with details retrieved successfully',
  //       data: promotionsWithDetails,
  //       pagination,
  //       summary: {
  //         total_active_promotions: totalActivePromotions,
  //         current_date: today.toISOString().split('T')[0],
  //         filtered_count: promotionsWithDetails.length,
  //         salesperson_filter_applied: !!salesperson_id,
  //         todays_total_outlets: salesperson_id ? todaysOutletIds.length : null,
  //         outlet_source: salesperson_id ? outletSource : null,
  //       },
  //     });
  //   } catch (error: any) {
  //     console.error('Get Active Promotions With Details Error:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // },

  async getActivePromotionsWithDetails(req: any, res: Response) {
    try {
      const {
        page,
        limit,
        search,
        platform,
        depot_id,
        salesperson_id,
        route_id,
        zone_id,
        customer_type_id,
        customer_channel_id,
        customer_category_id,
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const searchLower = search ? (search as string).toLowerCase().trim() : '';

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      let salespersonOutletIds: number[] = [];
      let outletSource: string = 'none';

      if (salesperson_id) {
        const salespersonIdNum = parseInt(salesperson_id as string, 10);

        const todaysVisits = await prisma.visits.findMany({
          where: {
            sales_person_id: salespersonIdNum,
            visit_date: {
              gte: today,
              lte: endOfToday,
            },
            is_active: 'Y',
          },
          select: {
            customer_id: true,
          },
        });

        if (todaysVisits.length > 0) {
          salespersonOutletIds = [
            ...new Set(todaysVisits.map(v => v.customer_id)),
          ];
          outletSource = 'visits';
        } else {
          const salespersonRoutes = await prisma.routes.findMany({
            where: {
              salesperson_id: salespersonIdNum,
              is_active: 'Y',
            },
            select: {
              id: true,
            },
          });

          const routeIds = salespersonRoutes.map(r => r.id);

          if (routeIds.length > 0) {
            const routeCustomers = await prisma.customers.findMany({
              where: {
                route_id: { in: routeIds },
                is_active: 'Y',
              },
              select: {
                id: true,
              },
            });

            salespersonOutletIds = routeCustomers.map(c => c.id);
            outletSource = 'salesperson_routes';
          }
        }

        if (salespersonOutletIds.length === 0) {
          return res.json({
            success: true,
            message: 'No outlets assigned to this salesperson for today',
            data: [],
            pagination: {
              current_page: pageNum,
              per_page: limitNum,
              total_pages: 0,
              total_count: 0,
            },
            summary: {
              total_active_promotions: 0,
              current_date: today.toISOString().split('T')[0],
              salesperson_filter_applied: true,
              salesperson_outlets_count: 0,
              outlet_source: outletSource,
            },
          });
        }
      }

      const filters: any = {
        is_active: 'Y',
        start_date: { lte: endOfToday },
        end_date: { gte: today },
      };

      if (searchLower) {
        filters.OR = [
          { name: { contains: searchLower } },
          { code: { contains: searchLower } },
          { description: { contains: searchLower } },
        ];
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

      if (route_id) {
        filters.promotion_routes_promotions = {
          some: {
            route_id: parseInt(route_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      if (zone_id) {
        filters.promotion_zones_promotions = {
          some: {
            zone_id: parseInt(zone_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      if (customer_type_id) {
        filters.promotion_customer_types_promotions = {
          some: {
            customer_type_id: parseInt(customer_type_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      if (customer_channel_id) {
        filters.promotion_customer_channel_promotions = {
          some: {
            customer_channel_id: parseInt(customer_channel_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      if (customer_category_id) {
        filters.promotion_customer_category_promotions = {
          some: {
            customer_category_id: parseInt(customer_category_id as string, 10),
            is_active: 'Y',
          },
        };
      }

      const allPromotions = await prisma.promotions.findMany({
        where: filters,
        include: {
          promotion_routes_promotions: {
            where: { is_active: 'Y' },
            select: { route_id: true },
          },
          promotion_zones_promotions: {
            where: { is_active: 'Y' },
            select: { zone_id: true },
          },
          promotion_customer_types_promotions: {
            where: { is_active: 'Y' },
            select: { customer_type_id: true },
          },
          promotion_customer_channel_promotions: {
            where: { is_active: 'Y' },
            select: { customer_channel_id: true },
          },
          promotion_customer_category_promotions: {
            where: { is_active: 'Y' },
            select: { customer_category_id: true },
          },
          promotion_customer_exclusion_promotions: {
            select: { customer_id: true },
          },
          promotion_condition_promotions: {
            where: { is_active: 'Y' },
            include: {
              promotion_condition_products: {
                where: { is_active: 'Y' },
                include: {
                  promotion_condition_productId: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      description: true,
                      base_price: true,
                      category_id: true,
                      sub_category_id: true,
                      brand_id: true,
                      unit_of_measurement: true,
                      tax_rate: true,
                      vat_percentage: true,
                      weight_in_grams: true,
                      volume_in_liters: true,
                      tracking_type: true,
                    },
                  },
                  promotion_condition_categories: {
                    select: {
                      id: true,
                      category_name: true,
                    },
                  },
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
                  promotion_benefit_products: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      description: true,
                      base_price: true,
                      category_id: true,
                      sub_category_id: true,
                      brand_id: true,
                      unit_of_measurement: true,
                      tax_rate: true,
                      vat_percentage: true,
                      weight_in_grams: true,
                      volume_in_liters: true,
                      tracking_type: true,
                    },
                  },
                },
              },
            },
            orderBy: { level_number: 'asc' },
          },
        },
        orderBy: { start_date: 'desc' },
      });

      const promotionsWithMatchingOutlets = await Promise.all(
        allPromotions.map(async (promo: any) => {
          const outletFilters: any = {
            is_active: 'Y',
          };

          if (salesperson_id && salespersonOutletIds.length > 0) {
            outletFilters.id = { in: salespersonOutletIds };
          }

          const routeIds = promo.promotion_routes_promotions?.map(
            (r: any) => r.route_id
          );
          if (routeIds && routeIds.length > 0) {
            outletFilters.route_id = { in: routeIds };
          }

          const zoneIds = promo.promotion_zones_promotions?.map(
            (z: any) => z.zone_id
          );
          if (zoneIds && zoneIds.length > 0) {
            outletFilters.zones_id = { in: zoneIds };
          }

          const customerTypeIds =
            promo.promotion_customer_types_promotions?.map(
              (ct: any) => ct.customer_type_id
            );
          if (customerTypeIds && customerTypeIds.length > 0) {
            outletFilters.customer_type_id = { in: customerTypeIds };
          }

          const customerChannelIds =
            promo.promotion_customer_channel_promotions?.map(
              (cc: any) => cc.customer_channel_id
            );
          if (customerChannelIds && customerChannelIds.length > 0) {
            outletFilters.customer_channel_id = { in: customerChannelIds };
          }

          // Apply promotion's customer category targeting
          const customerCategoryIds =
            promo.promotion_customer_category_promotions?.map(
              (cat: any) => cat.customer_category_id
            );
          if (customerCategoryIds && customerCategoryIds.length > 0) {
            outletFilters.customer_category_id = { in: customerCategoryIds };
          }

          const excludedCustomerIds =
            promo.promotion_customer_exclusion_promotions?.map(
              (exc: any) => exc.customer_id
            );

          if (excludedCustomerIds && excludedCustomerIds.length > 0) {
            if (outletFilters.id?.in) {
              outletFilters.id.in = outletFilters.id.in.filter(
                (id: number) => !excludedCustomerIds.includes(id)
              );
            } else {
              outletFilters.NOT = { id: { in: excludedCustomerIds } };
            }
          }

          const matchingOutlets = await prisma.customers.findMany({
            where: outletFilters,
            select: {
              id: true,
              name: true,
              code: true,
            },
          });

          return {
            promo,
            matchingOutlets,
            matchingOutletIds: matchingOutlets.map(o => o.id),
          };
        })
      );

      let filteredPromotions = promotionsWithMatchingOutlets;

      if (salesperson_id) {
        filteredPromotions = promotionsWithMatchingOutlets.filter(
          item => item.matchingOutletIds.length > 0
        );
      }

      const totalCount = filteredPromotions.length;
      const totalPages = Math.ceil(totalCount / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedPromotions = filteredPromotions.slice(
        startIndex,
        startIndex + limitNum
      );

      const promotionsWithDetails = paginatedPromotions.map(item => {
        const promo = item.promo;

        const productConditions = promo.promotion_condition_promotions?.map(
          (condition: any) => ({
            id: condition.id,
            condition_type: condition.condition_type,
            applies_to_type: condition.applies_to_type,
            min_value: condition.min_value,
            max_value: condition.max_value,
            effective_start_date: condition.effective_start_date,
            effective_end_date: condition.effective_end_date,
            status: condition.status,
            products: condition.promotion_condition_products?.map(
              (cp: any) => ({
                id: cp.id,
                product_id: cp.product_id,
                category_id: cp.category_id,
                product_group: cp.product_group,
                condition_quantity: cp.condition_quantity,
                product_details: cp.promotion_condition_productId,
                category_details: cp.promotion_condition_categories,
              })
            ),
          })
        );

        const gifts = promo.promotion_level_promotions?.flatMap(
          (level: any) =>
            level.promotion_benefit_level?.map((benefit: any) => ({
              id: benefit.id,
              level_number: level.level_number,
              level_threshold: level.threshold_value,
              discount_type: level.discount_type,
              discount_value: level.discount_value,
              benefit_type: benefit.benefit_type,
              product_id: benefit.product_id,
              benefit_value: benefit.benefit_value,
              condition_type: benefit.condition_type,
              gift_limit: benefit.gift_limit,
              product_details: benefit.promotion_benefit_products,
            })) || []
        );

        const matchingOutletsFormatted = item.matchingOutlets.map(outlet => ({
          id: outlet.id,
          name: outlet.name,
          code: outlet.code,
        }));

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
          product_conditions: productConditions || [],
          gifts: gifts || [],
          matching_outlets: matchingOutletsFormatted,
          matching_outlets_count: item.matchingOutletIds.length,
          outlet_source: salesperson_id ? outletSource : null,
        };
      });

      res.json({
        success: true,
        message: 'Active promotions with details retrieved successfully',
        data: promotionsWithDetails,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total_pages: totalPages,
          total_count: totalCount,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1,
        },
        summary: {
          total_active_promotions_in_system: allPromotions.length,
          promotions_matching_salesperson_outlets: filteredPromotions.length,
          current_date: today.toISOString().split('T')[0],
          salesperson_filter_applied: !!salesperson_id,
          salesperson_total_outlets: salesperson_id
            ? salespersonOutletIds.length
            : null,
          salesperson_outlet_ids: salesperson_id ? salespersonOutletIds : null,
          outlet_source: salesperson_id ? outletSource : null,
        },
      });
    } catch (error: any) {
      console.error('Get Active Promotions With Details Error:', error);
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
};
