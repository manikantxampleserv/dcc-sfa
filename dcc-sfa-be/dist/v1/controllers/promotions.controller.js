"use strict";
// import { Request, Response } from 'express';
// import { paginate } from '../../utils/paginate';
// import prisma from '../../configs/prisma.client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionsController = void 0;
const paginate_1 = require("../../utils/paginate");
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
const client_1 = require("@prisma/client");
const generatePromotionCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastPromo = await prisma_client_1.default.promotions.findFirst({
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
const serializePromotion = (promo) => {
    if (!promo)
        return null;
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
exports.promotionsController = {
    async createPromotion(req, res) {
        try {
            const input = req.body;
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
            const promotion = await prisma_client_1.default.promotions.create({
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
                    await prisma_client_1.default.promotion_channel.create({
                        data: {
                            parent_id: promotionId,
                            channel_type: platform,
                            is_active: 'Y',
                        },
                    });
                }
            }
            const productConditions = input.product_conditions || input.productconditions;
            if (productConditions && Array.isArray(productConditions)) {
                for (const conditionInput of productConditions) {
                    const condition = await prisma_client_1.default.promotion_condition.create({
                        data: {
                            parent_id: promotionId,
                            condition_type: input.quantity_type || 'QUANTITY',
                            applies_to_type: conditionInput.product_group
                                ? 'PRODUCTGROUP'
                                : conditionInput.category_id
                                    ? 'CATEGORY'
                                    : 'SINGLEPRODUCT',
                            min_value: new client_1.Prisma.Decimal(conditionInput.min_value || 0),
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
                    await prisma_client_1.default.promotion_condition_products.create({
                        data: {
                            condition_id: condition.id,
                            product_id: conditionInput.product_id,
                            category_id: conditionInput.category_id,
                            product_group: conditionInput.product_group || null,
                            condition_quantity: new client_1.Prisma.Decimal(conditionInput.min_quantity || 0),
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
                    const level = await prisma_client_1.default.promotion_level.create({
                        data: {
                            parent_id: promotionId,
                            level_number: levelInput.level_number ?? levelInput.levelnumber ?? 1,
                            threshold_value: new client_1.Prisma.Decimal(levelInput.threshold_value ?? levelInput.thresholdvalue ?? 0),
                            discount_type: levelInput.discount_type ||
                                levelInput.discounttype ||
                                'PERCENTAGE',
                            discount_value: new client_1.Prisma.Decimal(levelInput.discount_value ?? levelInput.discountvalue ?? 0),
                            is_active: 'Y',
                            createdby: req.user?.id || 1,
                            createdate: new Date(),
                            log_inst: 1,
                        },
                    });
                    if (levelInput.benefits && Array.isArray(levelInput.benefits)) {
                        for (const benefitInput of levelInput.benefits) {
                            await prisma_client_1.default.promotion_benefit.create({
                                data: {
                                    level_id: level.id,
                                    benefit_type: benefitInput.benefit_type ||
                                        benefitInput.benefittype ||
                                        'FREE_PRODUCT',
                                    product_id: benefitInput.product_id || null,
                                    benefit_value: new client_1.Prisma.Decimal(benefitInput.benefit_value ?? benefitInput.benefitvalue ?? 0),
                                    condition_type: benefitInput.condition_type ||
                                        benefitInput.conditiontype ||
                                        null,
                                    gift_limit: benefitInput.gift_limit ?? benefitInput.giftlimit ?? 0,
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
                    await prisma_client_1.default.promotion_depot.create({
                        data: {
                            parent_id: promotionId,
                            depot_id: depotId,
                            is_active: 'Y',
                        },
                    });
                }
            }
            const distributorDistributors = input.distributor_distributors || input.distributordistributors;
            if (distributorDistributors && Array.isArray(distributorDistributors)) {
                for (const salespersonId of distributorDistributors) {
                    await prisma_client_1.default.promotion_salesperson.create({
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
                    await prisma_client_1.default.promotion_routes.create({
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
                await prisma_client_1.default.promotion_customer_category.create({
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
            const customerExclusions = input.customer_exclusions || input.customerexclusions;
            if (customerExclusions && Array.isArray(customerExclusions)) {
                for (const customerId of customerExclusions) {
                    await prisma_client_1.default.promotion_customer_exclusion.create({
                        data: {
                            parent_id: promotionId,
                            customer_id: customerId,
                            is_excluded: 'Y',
                        },
                    });
                }
            }
            await prisma_client_1.default.promotion_tracking.create({
                data: {
                    parent_id: promotionId,
                    action_type: 'CREATED',
                    action_date: new Date(),
                    user_id: req.user?.id || 1,
                    comments: `Promotion created: ${input.name}`,
                    is_active: 'Y',
                },
            });
            const completePromotion = await prisma_client_1.default.promotions.findUnique({
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
        }
        catch (error) {
            console.error('Create Promotion Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getAllPromotions(req, res) {
        try {
            const { page, limit, search, is_active, platform, depot_id, salesperson_id, route_id, start_date, end_date, activeonly, } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const searchLower = search ? search.toLowerCase().trim() : '';
            const filters = {};
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
                filters.start_date = { gte: new Date(start_date) };
            }
            if (end_date) {
                filters.end_date = { lte: new Date(end_date) };
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
                        depot_id: parseInt(depot_id, 10),
                        is_active: 'Y',
                    },
                };
            }
            if (salesperson_id) {
                filters.promotion_salesperson_promotions = {
                    some: {
                        salesperson_id: parseInt(salesperson_id, 10),
                        is_active: 'Y',
                    },
                };
            }
            if (route_id) {
                filters.promotion_routes_promotions = {
                    some: {
                        route_id: parseInt(route_id, 10),
                        is_active: 'Y',
                    },
                };
            }
            const { data, pagination } = await (0, paginate_1.paginate)({
                model: prisma_client_1.default.promotions,
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
            const totalPromotions = await prisma_client_1.default.promotions.count();
            const activePromotions = await prisma_client_1.default.promotions.count({
                where: {
                    is_active: 'Y',
                    start_date: { lte: new Date() },
                    end_date: { gte: new Date() },
                },
            });
            res.json({
                success: true,
                message: 'Promotions retrieved successfully',
                data: data.map((p) => serializePromotion(p)),
                pagination,
                stats: {
                    total: totalPromotions,
                    active: activePromotions,
                    inactive: totalPromotions - activePromotions,
                },
            });
        }
        catch (error) {
            console.error('Get All Promotions Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getPromotionById(req, res) {
        try {
            const { id } = req.params;
            const promotion = await prisma_client_1.default.promotions.findUnique({
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
        }
        catch (error) {
            console.error('Get Promotion By ID Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async updatePromotion(req, res) {
        try {
            const { id } = req.params;
            const { name, start_date, end_date, description, is_active, platforms, locationareas, distributordistributors, sellerdata, outlet1groups, outlet2groups, } = req.body;
            const existing = await prisma_client_1.default.promotions.findUnique({
                where: { id: Number(id) },
            });
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Promotion not found',
                });
            }
            const promotion = await prisma_client_1.default.promotions.update({
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
                await prisma_client_1.default.promotion_channel.updateMany({
                    where: { parent_id: Number(id) },
                    data: { is_active: 'N' },
                });
                for (const platform of platforms) {
                    await prisma_client_1.default.promotion_channel.create({
                        data: {
                            parent_id: Number(id),
                            channel_type: platform,
                            is_active: 'Y',
                        },
                    });
                }
            }
            if (locationareas && Array.isArray(locationareas)) {
                await prisma_client_1.default.promotion_depot.updateMany({
                    where: { parent_id: Number(id) },
                    data: { is_active: 'N' },
                });
                for (const depotId of locationareas) {
                    await prisma_client_1.default.promotion_depot.create({
                        data: {
                            parent_id: Number(id),
                            depot_id: depotId,
                            is_active: 'Y',
                        },
                    });
                }
            }
            await prisma_client_1.default.promotion_tracking.create({
                data: {
                    parent_id: Number(id),
                    action_type: 'UPDATED',
                    action_date: new Date(),
                    user_id: req.user?.id || 1,
                    comments: `Promotion updated: ${promotion.name}`,
                    is_active: 'Y',
                },
            });
            const updatedPromotion = await prisma_client_1.default.promotions.findUnique({
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
        }
        catch (error) {
            console.error('Update Promotion Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async deletePromotion(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_client_1.default.promotions.findUnique({
                where: { id: Number(id) },
            });
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Promotion not found',
                });
            }
            await prisma_client_1.default.promotions.delete({
                where: { id: Number(id) },
            });
            res.json({
                success: true,
                message: 'Promotion deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete Promotion Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async assignChannels(req, res) {
        try {
            const { id } = req.params;
            const { channels } = req.body;
            if (!Array.isArray(channels)) {
                return res.status(400).json({
                    success: false,
                    message: 'channels must be an array',
                });
            }
            await prisma_client_1.default.promotion_channel.updateMany({
                where: { parent_id: Number(id) },
                data: { is_active: 'N' },
            });
            const created = await Promise.all(channels.map((channel) => prisma_client_1.default.promotion_channel.create({
                data: {
                    parent_id: Number(id),
                    channel_type: channel,
                    is_active: 'Y',
                },
            })));
            res.json({
                success: true,
                message: 'Channels assigned successfully',
                data: created,
            });
        }
        catch (error) {
            console.error('Assign Channels Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async assignDepots(req, res) {
        try {
            const { id } = req.params;
            const { depot_ids } = req.body;
            if (!Array.isArray(depot_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'depot_ids must be an array',
                });
            }
            await prisma_client_1.default.promotion_depot.updateMany({
                where: { parent_id: Number(id) },
                data: { is_active: 'N' },
            });
            const created = await Promise.all(depot_ids.map((depot_id) => prisma_client_1.default.promotion_depot.create({
                data: {
                    parent_id: Number(id),
                    depot_id,
                    is_active: 'Y',
                },
            })));
            res.json({
                success: true,
                message: 'Depots assigned successfully',
                data: created,
            });
        }
        catch (error) {
            console.error('Assign Depots Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async assignSalespersons(req, res) {
        try {
            const { id } = req.params;
            const { salesperson_ids } = req.body;
            if (!Array.isArray(salesperson_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'Salesperson Ids must be an array',
                });
            }
            await prisma_client_1.default.promotion_salesperson.updateMany({
                where: { parent_id: Number(id) },
                data: { is_active: 'N' },
            });
            const created = await Promise.all(salesperson_ids.map((salesperson_id) => prisma_client_1.default.promotion_salesperson.create({
                data: {
                    parent_id: Number(id),
                    salesperson_id,
                    is_active: 'Y',
                },
            })));
            res.json({
                success: true,
                message: 'Salespersons assigned successfully',
                data: created,
            });
        }
        catch (error) {
            console.error('Assign Salespersons Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async assignRoutes(req, res) {
        try {
            const { id } = req.params;
            const { route_ids } = req.body;
            if (!Array.isArray(route_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'route_ids must be an array',
                });
            }
            await prisma_client_1.default.promotion_routes.updateMany({
                where: { parent_id: Number(id) },
                data: { is_active: 'N' },
            });
            const created = await Promise.all(route_ids.map((route_id) => prisma_client_1.default.promotion_routes.create({
                data: {
                    parent_id: Number(id),
                    route_id,
                    is_active: 'Y',
                },
            })));
            res.json({
                success: true,
                message: 'Routes assigned successfully',
                data: created,
            });
        }
        catch (error) {
            console.error('Assign Routes Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async assignCustomerCategories(req, res) {
        try {
            const { id } = req.params;
            const { customer_category_ids } = req.body;
            if (!Array.isArray(customer_category_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'Customer category ID must be an array',
                });
            }
            await prisma_client_1.default.promotion_customer_category.updateMany({
                where: { parent_id: Number(id) },
                data: { is_active: 'N' },
            });
            const created = await Promise.all(customer_category_ids.map((customer_category_id) => prisma_client_1.default.promotion_customer_category.create({
                data: {
                    parent_id: Number(id),
                    customer_category_id,
                    is_active: 'Y',
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                    log_inst: 1,
                },
            })));
            res.json({
                success: true,
                message: 'Customer categories assigned successfully',
                data: created,
            });
        }
        catch (error) {
            console.error('Assign Customer Categories Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async assignCustomerExclusions(req, res) {
        try {
            const { id } = req.params;
            const { customer_ids } = req.body;
            if (!Array.isArray(customer_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'customer_ids must be an array',
                });
            }
            await prisma_client_1.default.promotion_customer_exclusion.deleteMany({
                where: { parent_id: Number(id) },
            });
            const created = await Promise.all(customer_ids.map((customer_id) => prisma_client_1.default.promotion_customer_exclusion.create({
                data: {
                    parent_id: Number(id),
                    customer_id,
                    is_excluded: 'Y',
                },
            })));
            res.json({
                success: true,
                message: 'Customer exclusions assigned successfully',
                data: created,
            });
        }
        catch (error) {
            console.error('Assign Customer Exclusions Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async createCondition(req, res) {
        try {
            const { id } = req.params;
            const { condition_type, applies_to_type, min_value, max_value, effective_start_date, effective_end_date, } = req.body;
            if (!condition_type || !applies_to_type || min_value === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'condition_type, applies_to_type, and min_value are required',
                });
            }
            const condition = await prisma_client_1.default.promotion_condition.create({
                data: {
                    parent_id: Number(id),
                    condition_type,
                    applies_to_type,
                    min_value: new client_1.Prisma.Decimal(min_value),
                    max_value: max_value ? new client_1.Prisma.Decimal(max_value) : null,
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
        }
        catch (error) {
            console.error('Create Condition Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updateCondition(req, res) {
        try {
            const { id, conditionId } = req.params;
            const data = req.body;
            const condition = await prisma_client_1.default.promotion_condition.update({
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
        }
        catch (error) {
            console.error('Update Condition Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async deleteCondition(req, res) {
        try {
            const { conditionId } = req.params;
            await prisma_client_1.default.promotion_condition.update({
                where: { id: Number(conditionId) },
                data: { is_active: 'N' },
            });
            res.json({
                success: true,
                message: 'Condition deleted successfully',
            });
        }
        catch (error) {
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
    async assignConditionProducts(req, res) {
        try {
            const { conditionId } = req.params;
            const { products } = req.body;
            if (!Array.isArray(products)) {
                return res.status(400).json({
                    success: false,
                    message: 'products must be an array',
                });
            }
            await prisma_client_1.default.promotion_condition_products.updateMany({
                where: { condition_id: Number(conditionId) },
                data: { is_active: 'N' },
            });
            const validProducts = products.filter((p) => p.product_id || p.category_id || p.product_group);
            if (validProducts.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one of product_id, category_id, or product_group must be provided',
                });
            }
            const firstProduct = await prisma_client_1.default.products.findFirst({
                select: { id: true },
            });
            const firstCategory = await prisma_client_1.default.product_categories.findFirst({
                select: { id: true },
            });
            const defaultProductId = firstProduct?.id || 1;
            const defaultCategoryId = firstCategory?.id || 1;
            const created = await Promise.all(validProducts.map((p) => prisma_client_1.default.promotion_condition_products.create({
                data: {
                    condition_id: Number(conditionId),
                    product_id: p.product_id || defaultProductId,
                    category_id: p.category_id || defaultCategoryId,
                    product_group: p.product_group || null,
                    condition_quantity: new client_1.Prisma.Decimal(p.condition_quantity || 0),
                    is_active: 'Y',
                    createdby: req.user?.id || 1,
                    createdate: new Date(),
                    log_inst: 1,
                },
            })));
            res.json({
                success: true,
                message: 'Condition products assigned successfully',
                data: created,
            });
        }
        catch (error) {
            console.error('Assign Condition Products Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async createLevel(req, res) {
        try {
            const { id } = req.params;
            const { level_number, threshold_value, discount_type, discount_value } = req.body;
            if (level_number === undefined ||
                threshold_value === undefined ||
                discount_value === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'level_number, threshold_value, and discount_value are required',
                });
            }
            const level = await prisma_client_1.default.promotion_level.create({
                data: {
                    parent_id: Number(id),
                    level_number,
                    threshold_value: new client_1.Prisma.Decimal(threshold_value),
                    discount_type: discount_type || 'PERCENTAGE',
                    discount_value: new client_1.Prisma.Decimal(discount_value),
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
        }
        catch (error) {
            console.error('Create Level Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updateLevel(req, res) {
        try {
            const { levelId } = req.params;
            const data = req.body;
            const level = await prisma_client_1.default.promotion_level.update({
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
        }
        catch (error) {
            console.error('Update Level Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async deleteLevel(req, res) {
        try {
            const { levelId } = req.params;
            await prisma_client_1.default.promotion_level.update({
                where: { id: Number(levelId) },
                data: { is_active: 'N' },
            });
            res.json({
                success: true,
                message: 'Level deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete Level Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async createBenefit(req, res) {
        try {
            const { levelId } = req.params;
            const { benefit_type, product_id, benefit_value, condition_type, gift_limit, } = req.body;
            if (!benefit_type || benefit_value === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Benefit type and benefit value are required',
                });
            }
            const benefit = await prisma_client_1.default.promotion_benefit.create({
                data: {
                    level_id: Number(levelId),
                    benefit_type,
                    product_id: product_id || null,
                    benefit_value: new client_1.Prisma.Decimal(benefit_value),
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
        }
        catch (error) {
            console.error('Create Benefit Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updateBenefit(req, res) {
        try {
            const { benifitId } = req.params;
            const data = req.body;
            const benefit = await prisma_client_1.default.promotion_benefit.update({
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
        }
        catch (error) {
            console.error('Update Benefit Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async deleteBenefit(req, res) {
        try {
            const { benefitId } = req.params;
            await prisma_client_1.default.promotion_benefit.update({
                where: { id: Number(benefitId) },
                data: { is_active: 'N' },
            });
            res.json({
                success: true,
                message: 'Benefit deleted successfully',
            });
        }
        catch (error) {
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
    async calculateEligiblePromotions(req, res) {
        try {
            const { customer_id, order_lines, depot_id, salesman_id, route_id, order_date, platform, } = req.body;
            if (!customer_id || !order_lines || !Array.isArray(order_lines)) {
                return res.status(400).json({
                    success: false,
                    message: 'customer_id and order_lines are required',
                });
            }
            const checkDate = order_date ? new Date(order_date) : new Date();
            const customer = await prisma_client_1.default.customers.findUnique({
                where: { id: customer_id },
                select: { type: true },
            });
            let promotionsQuery = {
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
            const promotions = await prisma_client_1.default.promotions.findMany({
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
            const eligiblePromotions = [];
            for (const promo of promotions) {
                const isExcluded = promo.promotion_customer_exclusion_promotions.find((exc) => exc.customer_id === customer_id && exc.is_excluded === 'Y');
                if (isExcluded)
                    continue;
                let isEligible = false;
                if (promo.promotion_depot_promotions.length === 0 &&
                    promo.promotion_salesperson_promotions.length === 0 &&
                    promo.promotion_routes_promotions.length === 0 &&
                    promo.promotion_customer_category_promotions.length === 0) {
                    isEligible = true;
                }
                else {
                    if (depot_id && promo.promotion_depot_promotions.length > 0) {
                        const depotMatch = promo.promotion_depot_promotions.find((d) => d.depot_id === depot_id);
                        if (depotMatch)
                            isEligible = true;
                    }
                    if (salesman_id &&
                        promo.promotion_salesperson_promotions.length > 0) {
                        const salesmanMatch = promo.promotion_salesperson_promotions.find((s) => s.salesperson_id === salesman_id);
                        if (salesmanMatch)
                            isEligible = true;
                    }
                    if (route_id && promo.promotion_routes_promotions.length > 0) {
                        const routeMatch = promo.promotion_routes_promotions.find((r) => r.route_id === route_id);
                        if (routeMatch)
                            isEligible = true;
                    }
                    if (customer?.type &&
                        promo.promotion_customer_category_promotions.length > 0) {
                        for (const cat of promo.promotion_customer_category_promotions) {
                            const category = await prisma_client_1.default.customer_category.findUnique({
                                where: { id: cat.customer_category_id },
                            });
                            if (category && category.category_code === customer.type) {
                                isEligible = true;
                                break;
                            }
                        }
                    }
                }
                if (!isEligible)
                    continue;
                for (const condition of promo.promotion_condition_promotions) {
                    let totalQty = new client_1.Prisma.Decimal(0);
                    let totalValue = new client_1.Prisma.Decimal(0);
                    for (const line of order_lines) {
                        const productMatch = condition.promotion_condition_products.find((cp) => cp.product_id === line.product_id ||
                            cp.category_id === line.category_id ||
                            cp.product_group === line.product_group);
                        if (productMatch) {
                            const lineQty = new client_1.Prisma.Decimal(line.quantity || 0);
                            const linePrice = new client_1.Prisma.Decimal(line.unit_price || 0);
                            const lineValue = lineQty.mul(linePrice);
                            totalQty = totalQty.add(lineQty);
                            totalValue = totalValue.add(lineValue);
                        }
                    }
                    const minValue = new client_1.Prisma.Decimal(condition.min_value || 0);
                    const conditionMet = totalValue.gte(minValue);
                    if (!conditionMet)
                        continue;
                    const applicableLevel = promo.promotion_level_promotions.find((lvl) => new client_1.Prisma.Decimal(lvl.threshold_value).lte(totalValue));
                    if (!applicableLevel)
                        continue;
                    let discountAmount = new client_1.Prisma.Decimal(0);
                    const freeProducts = [];
                    if (applicableLevel.discount_type === 'PERCENTAGE') {
                        const discountPercent = new client_1.Prisma.Decimal(applicableLevel.discount_value || 0);
                        discountAmount = totalValue.mul(discountPercent).div(100);
                    }
                    else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
                        discountAmount = new client_1.Prisma.Decimal(applicableLevel.discount_value || 0);
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
                    total_discount: eligiblePromotions.reduce((sum, p) => sum + p.discount_amount, 0),
                },
            });
        }
        catch (error) {
            console.error('Calculate Promotions Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async applyPromotion(req, res) {
        try {
            const { promotion_id, order_id, customer_id, discount_amount, free_products, } = req.body;
            if (!promotion_id || !customer_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Promotion Id and customer ID are required',
                });
            }
            await prisma_client_1.default.promotion_tracking.create({
                data: {
                    parent_id: promotion_id,
                    action_type: 'APPLIED',
                    action_date: new Date(),
                    user_id: req.user?.id || 1,
                    comments: `Applied to order ${order_id} for customer ${customer_id}. Discount: ${discount_amount}. Free Products: ${JSON.stringify(free_products)}`,
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
        }
        catch (error) {
            console.error('Apply Promotion Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async settlePeriodPromotion(req, res) {
        try {
            const { id } = req.params;
            const { period_start, period_end, customer_ids } = req.body;
            if (!period_start || !period_end || !Array.isArray(customer_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'period_start, period_end, and customer_ids are required',
                });
            }
            const promotion = await prisma_client_1.default.promotions.findUnique({
                where: { id: Number(id) },
            });
            if (!promotion) {
                return res.status(404).json({
                    success: false,
                    message: 'Promotion not found',
                });
            }
            const settlementResults = [];
            for (const customerId of customer_ids) {
                await prisma_client_1.default.promotion_tracking.create({
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
        }
        catch (error) {
            console.error('Settle Period Promotion Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async activatePromotion(req, res) {
        try {
            const { id } = req.params;
            const promotion = await prisma_client_1.default.promotions.update({
                where: { id: Number(id) },
                data: {
                    is_active: 'Y',
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                },
            });
            await prisma_client_1.default.promotion_tracking.create({
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
        }
        catch (error) {
            console.error('Activate Promotion Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async deactivatePromotion(req, res) {
        try {
            const { id } = req.params;
            const promotion = await prisma_client_1.default.promotions.update({
                where: { id: Number(id) },
                data: {
                    is_active: 'N',
                    updatedate: new Date(),
                    updatedby: req.user?.id || 1,
                },
            });
            await prisma_client_1.default.promotion_tracking.create({
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
        }
        catch (error) {
            console.error('Deactivate Promotion Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async bulkActivatePromotions(req, res) {
        try {
            const { promotion_ids } = req.body;
            if (!Array.isArray(promotion_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'Promotion Id must be an array',
                });
            }
            const result = await prisma_client_1.default.promotions.updateMany({
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
        }
        catch (error) {
            console.error('Bulk Activate Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async bulkDeactivatePromotions(req, res) {
        try {
            const { promotion_ids } = req.body;
            if (!Array.isArray(promotion_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'Promotion Ids must be an array',
                });
            }
            const result = await prisma_client_1.default.promotions.updateMany({
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
        }
        catch (error) {
            console.error('Bulk Deactivate Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async bulkDeletePromotions(req, res) {
        try {
            const { promotion_ids } = req.body;
            if (!Array.isArray(promotion_ids)) {
                return res.status(400).json({
                    success: false,
                    message: 'Promotion Ids must be an array',
                });
            }
            const result = await prisma_client_1.default.promotions.deleteMany({
                where: { id: { in: promotion_ids } },
            });
            res.json({
                success: true,
                message: `${result.count} promotions deleted successfully`,
                data: { count: result.count },
            });
        }
        catch (error) {
            console.error('Bulk Delete Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getActivePromotionsReport(req, res) {
        try {
            const { platform, depot_id, start_date, end_date } = req.query;
            const now = new Date();
            const filters = {
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
                        depot_id: parseInt(depot_id, 10),
                        is_active: 'Y',
                    },
                };
            }
            const activePromotions = await prisma_client_1.default.promotions.findMany({
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
                                    ? new Date(start_date)
                                    : new Date(now.getFullYear(), now.getMonth(), 1),
                                lte: end_date ? new Date(end_date) : now,
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
                    total_applications: report.reduce((sum, p) => sum + p.applications_count, 0),
                },
            });
        }
        catch (error) {
            console.error('Active Promotions Report Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getPromotionTrackingReport(req, res) {
        try {
            const { promotion_id, action_type, start_date, end_date } = req.query;
            const filters = {};
            if (promotion_id)
                filters.parent_id = Number(promotion_id);
            if (action_type)
                filters.action_type = action_type;
            if (start_date || end_date) {
                filters.action_date = {};
                if (start_date)
                    filters.action_date.gte = new Date(start_date);
                if (end_date)
                    filters.action_date.lte = new Date(end_date);
            }
            const tracking = await prisma_client_1.default.promotion_tracking.findMany({
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
        }
        catch (error) {
            console.error('Promotion Tracking Report Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getPromotionUsageReport(req, res) {
        try {
            const { id } = req.params;
            const { start_date, end_date } = req.query;
            const filters = {
                parent_id: Number(id),
                action_type: 'APPLIED',
            };
            if (start_date || end_date) {
                filters.action_date = {};
                if (start_date)
                    filters.action_date.gte = new Date(start_date);
                if (end_date)
                    filters.action_date.lte = new Date(end_date);
            }
            const usage = await prisma_client_1.default.promotion_tracking.findMany({
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
        }
        catch (error) {
            console.error('Promotion Usage Report Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getCustomerQualifiedReport(req, res) {
        try {
            const { promotion_id, start_date, end_date } = req.query;
            if (!promotion_id) {
                return res.status(400).json({
                    success: false,
                    message: 'promotion_id is required',
                });
            }
            const filters = {
                parent_id: Number(promotion_id),
                action_type: 'APPLIED',
            };
            if (start_date || end_date) {
                filters.action_date = {};
                if (start_date)
                    filters.action_date.gte = new Date(start_date);
                if (end_date)
                    filters.action_date.lte = new Date(end_date);
            }
            const tracking = await prisma_client_1.default.promotion_tracking.findMany({
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
        }
        catch (error) {
            console.error('Customer Qualified Report Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getPromotionPerformanceReport(req, res) {
        try {
            const { start_date, end_date } = req.query;
            const dateFilters = {};
            if (start_date || end_date) {
                dateFilters.action_date = {};
                if (start_date)
                    dateFilters.action_date.gte = new Date(start_date);
                if (end_date)
                    dateFilters.action_date.lte = new Date(end_date);
            }
            const promotions = await prisma_client_1.default.promotions.findMany({
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
                    total_applications: performance.reduce((sum, p) => sum + p.total_applications, 0),
                },
            });
        }
        catch (error) {
            console.error('Promotion Performance Report Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async createDepotPriceOverride(req, res) {
        try {
            const { depot_id, product_id, override_price, start_date, end_date, products, } = req.body;
            const userId = req.user?.id || 1;
            if (product_id && !products) {
                const product = await prisma_client_1.default.products.findUnique({
                    where: { id: product_id },
                    select: { base_price: true },
                });
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Product not found',
                    });
                }
                const discountAmount = new client_1.Prisma.Decimal(product.base_price || 0).minus(new client_1.Prisma.Decimal(override_price));
                const priceOverride = await prisma_client_1.default.depot_price_overrides.create({
                    data: {
                        depot_id,
                        product_id,
                        original_price: product.base_price || 0,
                        override_price: new client_1.Prisma.Decimal(override_price),
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
                const overrides = await Promise.all(products.map(async (p) => {
                    const product = await prisma_client_1.default.products.findUnique({
                        where: { id: p.product_id },
                        select: { base_price: true },
                    });
                    const discountAmount = new client_1.Prisma.Decimal(product?.base_price || 0).minus(new client_1.Prisma.Decimal(p.override_price));
                    return prisma_client_1.default.depot_price_overrides.create({
                        data: {
                            depot_id: p.depot_id || depot_id,
                            product_id: p.product_id,
                            original_price: product?.base_price || 0,
                            override_price: new client_1.Prisma.Decimal(p.override_price),
                            discount_amount: discountAmount,
                            start_date: new Date(start_date),
                            end_date: new Date(end_date),
                            is_active: 'Y',
                            created_by: userId,
                        },
                    });
                }));
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
        }
        catch (error) {
            console.error('Create Depot Price Override Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getDepotPriceOverrides(req, res) {
        try {
            const { depot_id, product_id, active_only } = req.query;
            const filters = {};
            if (depot_id) {
                filters.depot_id = parseInt(depot_id, 10);
            }
            if (product_id) {
                filters.product_id = parseInt(product_id, 10);
            }
            if (active_only === 'true') {
                const now = new Date();
                filters.is_active = 'Y';
                filters.start_date = { lte: now };
                filters.end_date = { gte: now };
            }
            const overrides = await prisma_client_1.default.depot_price_overrides.findMany({
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
        }
        catch (error) {
            console.error('Get Depot Price Overrides Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    async getProductPrice(req, res) {
        try {
            const { product_id, depot_id } = req.query;
            if (!product_id) {
                return res.status(400).json({
                    success: false,
                    message: 'product_id is required',
                });
            }
            const product = await prisma_client_1.default.products.findUnique({
                where: { id: parseInt(product_id, 10) },
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
                override = await prisma_client_1.default.depot_price_overrides.findFirst({
                    where: {
                        product_id: parseInt(product_id, 10),
                        depot_id: parseInt(depot_id, 10),
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
        }
        catch (error) {
            console.error('Get Product Price Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
};
//# sourceMappingURL=promotions.controller.js.map