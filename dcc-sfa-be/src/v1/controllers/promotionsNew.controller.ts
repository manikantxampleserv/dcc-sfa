import { Request, Response } from 'express';
import { paginate } from '../../utils/paginate';
import prisma from '../../configs/prisma.client';
import { Prisma } from '@prisma/client';

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
