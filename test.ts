// // import { Router } from 'express';
// // import { promotionController } from '../controllers/promotion.controller';
// // import {
// //   authenticateToken,
// //   requirePermission,
// // } from '../../middlewares/auth.middleware';
// // import {
// //   auditCreate,
// //   auditUpdate,
// //   auditDelete,
// // } from '../../middlewares/audit.middleware';

// // const router = Router();

// // // ============================================
// // // PROMOTION CRUD
// // // ============================================

// // router.post(
// //   '/promotions',
// //   authenticateToken,
// //   auditCreate('promotion'),
// //   requirePermission([{ module: 'promotion', action: 'create' }]),
// //   promotionController.createPromotion
// // );

// // router.get(
// //   '/promotions',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'read' }]),
// //   promotionController.getAllPromotions
// // );

// // router.get(
// //   '/promotions/:id',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'read' }]),
// //   promotionController.getPromotionById
// // );

// // router.put(
// //   '/promotions/:id',
// //   authenticateToken,
// //   auditUpdate('promotion'),
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.updatePromotion
// // );

// // router.delete(
// //   '/promotions/:id',
// //   authenticateToken,
// //   auditDelete('promotion'),
// //   requirePermission([{ module: 'promotion', action: 'delete' }]),
// //   promotionController.deletePromotion
// // );

// // // ============================================
// // // ELIGIBILITY MANAGEMENT
// // // ============================================

// // router.post(
// //   '/promotions/:id/channels',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.assignChannels
// // );

// // router.post(
// //   '/promotions/:id/depots',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.assignDepots
// // );

// // router.post(
// //   '/promotions/:id/salespersons',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.assignSalespersons
// // );

// // router.post(
// //   '/promotions/:id/routes',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.assignRoutes
// // );

// // router.post(
// //   '/promotions/:id/customer-categories',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.assignCustomerCategories
// // );

// // router.post(
// //   '/promotions/:id/customer-exclusions',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.assignCustomerExclusions
// // );

// // // ============================================
// // // CONDITION MANAGEMENT
// // // ============================================

// // router.post(
// //   '/promotions/:id/conditions',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.createCondition
// // );

// // router.put(
// //   '/promotions/:id/conditions/:conditionId',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.updateCondition
// // );

// // router.delete(
// //   '/promotions/:id/conditions/:conditionId',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'delete' }]),
// //   promotionController.deleteCondition
// // );

// // router.post(
// //   '/promotions/:id/conditions/:conditionId/products',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.assignConditionProducts
// // );

// // // ============================================
// // // LEVEL & BENEFIT MANAGEMENT
// // // ============================================

// // router.post(
// //   '/promotions/:id/levels',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.createLevel
// // );

// // router.put(
// //   '/promotions/:id/levels/:levelId',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.updateLevel
// // );

// // router.delete(
// //   '/promotions/:id/levels/:levelId',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'delete' }]),
// //   promotionController.deleteLevel
// // );

// // router.post(
// //   '/promotions/:id/levels/:levelId/benefits',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.createBenefit
// // );

// // router.put(
// //   '/promotions/:id/levels/:levelId/benefits/:benefitId',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.updateBenefit
// // );

// // router.delete(
// //   '/promotions/:id/levels/:levelId/benefits/:benefitId',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'delete' }]),
// //   promotionController.deleteBenefit
// // );

// // // ============================================
// // // PROMOTION CALCULATION & APPLICATION
// // // ============================================

// // router.post(
// //   '/promotions/calculate',
// //   authenticateToken,
// //   promotionController.calculateEligiblePromotions
// // );

// // router.post(
// //   '/promotions/apply',
// //   authenticateToken,
// //   promotionController.applyPromotion
// // );

// // router.post(
// //   '/promotions/:id/settle-period',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.settlePeriodPromotion
// // );

// // // ============================================
// // // ACTIVATION & STATUS
// // // ============================================

// // router.patch(
// //   '/promotions/:id/activate',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.activatePromotion
// // );

// // router.patch(
// //   '/promotions/:id/deactivate',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.deactivatePromotion
// // );

// // // ============================================
// // // REPORTS & ANALYTICS
// // // ============================================

// // router.get(
// //   '/promotions/reports/active',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'read' }]),
// //   promotionController.getActivePromotionsReport
// // );

// // router.get(
// //   '/promotions/reports/tracking',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'read' }]),
// //   promotionController.getPromotionTrackingReport
// // );

// // router.get(
// //   '/promotions/reports/usage/:id',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'read' }]),
// //   promotionController.getPromotionUsageReport
// // );

// // router.get(
// //   '/promotions/reports/customer-qualified',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'read' }]),
// //   promotionController.getCustomerQualifiedReport
// // );

// // router.get(
// //   '/promotions/reports/performance',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'read' }]),
// //   promotionController.getPromotionPerformanceReport
// // );

// // // ============================================
// // // BULK OPERATIONS
// // // ============================================

// // router.post(
// //   '/promotions/bulk-activate',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.bulkActivatePromotions
// // );

// // router.post(
// //   '/promotions/bulk-deactivate',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'update' }]),
// //   promotionController.bulkDeactivatePromotions
// // );

// // router.delete(
// //   '/promotions/bulk-delete',
// //   authenticateToken,
// //   requirePermission([{ module: 'promotion', action: 'delete' }]),
// //   promotionController.bulkDeletePromotions
// // );

// // export default router;

// import { Request, Response } from 'express';
// import { paginate } from '../../utils/paginate';
// import prisma from '../../configs/prisma.client';
// import { Decimal } from '@prisma/client/runtime/library';

// // ============================================
// // INTERFACES
// // ============================================

// interface PromotionCreateInput {
//   // Header Information
//   promotion_name: string;
//   promotion_code?: string;
//   short_name?: string;
//   pay_type?: string;
//   slip_type?: string;
//   prom_conflict?: string;
//   nr?: number;
//   mandatory?: boolean;
//   degree?: number;
//   reg_disc_conf?: string;
//   start_date: string;
//   finish_date: string;
//   conflict_with_constant_disc?: boolean;
//   disabled?: boolean;
//   scope?: string;
//   description?: string;

//   // Platform
//   platforms?: string[];

//   // Group
//   group_type?: string;
//   dist_comp_participation_from?: number;
//   dist_comp_participation_to?: number;

//   // Level Type
//   level_type?: string;

//   // Promotion Product Condition
//   quantity_type?: string;
//   product_conditions?: Array<{
//     product_code?: string;
//     category_code?: string;
//     product_group?: string;
//     min_quantity?: number;
//     min_value?: number;
//   }>;

//   // Suitable Outlets
//   outlet_date_from?: string;
//   outlet_date_to?: string;
//   document_types?: string[];

//   // Location Tab
//   location_areas?: number[];
//   location_distributors?: number[];

//   // Distributor Tab
//   distributor_distributors?: number[];
//   distributor_roles?: number[];

//   // Seller Tab
//   seller_data?: number[];

//   // Outlet 1 & 2
//   outlet1_groups?: number[];
//   outlet1_roles?: number[];
//   outlet2_groups?: number[];
//   outlet2_roles?: number[];

//   // Levels
//   levels?: Array<{
//     level_number: number;
//     threshold_value: number;
//     discount_type?: string;
//     discount_value?: number;
//     unit?: string;
//     step?: boolean;
//     benefits?: Array<{
//       benefit_type: string;
//       product_code?: string;
//       benefit_value: number;
//       gift_limit?: number;
//       condition_type?: string;
//     }>;
//   }>;

//   // Customer Exclusions
//   customer_exclusions?: number[];
// }

// // ============================================
// // HELPER FUNCTIONS
// // ============================================

// const generatePromotionCode = async (name: string): Promise<string> => {
//   const prefix = name.slice(0, 3).toUpperCase();
//   const lastPromo = await prisma.promotion.findFirst({
//     orderBy: { id: 'desc' },
//     select: { promotion_code: true },
//   });

//   let newNumber = 1;
//   if (lastPromo?.promotion_code) {
//     const match = lastPromo.promotion_code.match(/(\d+)$/);
//     if (match) {
//       newNumber = parseInt(match[1], 10) + 1;
//     }
//   }

//   return `${prefix}${newNumber.toString().padStart(4, '0')}`;
// };

// const serializePromotion = (promo: any) => {
//   if (!promo) return null;

//   return {
//     id: promo.id,
//     promotion_name: promo.promotion_name,
//     promotion_code: promo.promotion_code,
//     start_date: promo.start_date,
//     end_date: promo.end_date,
//     description: promo.description,
//     is_active: promo.is_active,
//     createdate: promo.createdate,
//     createdby: promo.createdby,
//     updatedate: promo.updatedate,
//     updatedby: promo.updatedby,

//     channels: promo.promotion_channel_promotions || [],
//     depots: promo.promotion_depot_promotions || [],
//     salespersons: promo.promotion_salesperson_promotions || [],
//     routes: promo.promotion_routes_promotions || [],
//     customer_categories: promo.promotion_customer_category_promotions || [],
//     customer_exclusions: promo.promotion_customer_exclusion_promotions || [],
//     conditions: promo.promotion_condition_promotions || [],
//     levels: promo.promotion_level_promotions || [],
//     tracking: promo.promotion_tracking_promotions || [],
//   };
// };

// // ============================================
// // MAIN CONTROLLER
// // ============================================

// export const promotionController = {
//   // ============================================
//   // CREATE PROMOTION
//   // ============================================
//   async createPromotion(req: any, res: Response) {
//     try {
//       const input: PromotionCreateInput = req.body;

//       // Validate required fields
//       if (!input.promotion_name || !input.start_date || !input.finish_date) {
//         return res.status(400).json({
//           success: false,
//           message: 'promotion_name, start_date, and finish_date are required',
//         });
//       }

//       // Generate code if not provided
//       const code =
//         input.promotion_code || (await generatePromotionCode(input.promotion_name));

//       // 1. CREATE MAIN PROMOTION
//       const promotion = await prisma.promotion.create({
//         data: {
//           promotion_name: input.promotion_name,
//           promotion_code: code,
//           start_date: new Date(input.start_date),
//           end_date: new Date(input.finish_date),
//           description: input.description || null,
//           is_active: input.disabled ? 'N' : 'Y',
//           createdby: req.user?.id || 1,
//           createdate: new Date(),
//           log_inst: 1,
//         },
//       });

//       const promotionId = promotion.id;

//       // 2. CREATE CHANNELS (Platform)
//       if (input.platforms && Array.isArray(input.platforms)) {
//         for (const platform of input.platforms) {
//           await prisma.promotion_channel.create({
//             data: {
//               parent_id: promotionId,
//               channel_type: platform,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // 3. CREATE CONDITIONS
//       if (input.product_conditions && Array.isArray(input.product_conditions)) {
//         for (const conditionInput of input.product_conditions) {
//           const condition = await prisma.promotion_condition.create({
//             data: {
//               parent_id: promotionId,
//               condition_type: input.quantity_type || 'QUANTITY',
//               applies_to_type: conditionInput.product_group
//                 ? 'PRODUCT_GROUP'
//                 : conditionInput.category_code
//                 ? 'CATEGORY'
//                 : 'SINGLE_PRODUCT',
//               min_value: new Decimal(conditionInput.min_value || 0),
//               max_value: null,
//               effective_start_date: new Date(input.start_date),
//               effective_end_date: new Date(input.finish_date),
//               status: 'active',
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });

//           await prisma.promotion_condition_products.create({
//             data: {
//               condition_id: condition.id,
//               product_code: conditionInput.product_code || null,
//               category_code: conditionInput.category_code || null,
//               product_group: conditionInput.product_group || null,
//               condition_quantity: new Decimal(conditionInput.min_quantity || 0),
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });
//         }
//       }

//       // 4. CREATE LEVELS
//       if (input.levels && Array.isArray(input.levels)) {
//         for (const levelInput of input.levels) {
//           const level = await prisma.promotion_level.create({
//             data: {
//               parent_id: promotionId,
//               level_number: levelInput.level_number || 1,
//               threshold_value: new Decimal(levelInput.threshold_value || 0),
//               discount_type: levelInput.discount_type || 'PERCENTAGE',
//               discount_value: new Decimal(levelInput.discount_value || 0),
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });

//           // Add benefits
//           if (levelInput.benefits && Array.isArray(levelInput.benefits)) {
//             for (const benefitInput of levelInput.benefits) {
//               await prisma.promotion_benefit.create({
//                 data: {
//                   level_id: level.id,
//                   benefit_type: benefitInput.benefit_type || 'FREE_PRODUCT',
//                   product_code: benefitInput.product_code || null,
//                   benefit_value: new Decimal(benefitInput.benefit_value || 0),
//                   condition_type: benefitInput.condition_type || null,
//                   gift_limit: benefitInput.gift_limit || 0,
//                   is_active: 'Y',
//                 },
//               });
//             }
//           }
//         }
//       }

//       // 5. ASSIGN DEPOTS
//       if (input.location_areas && Array.isArray(input.location_areas)) {
//         for (const depotId of input.location_areas) {
//           await prisma.promotion_depot.create({
//             data: {
//               parent_id: promotionId,
//               depot_id: depotId,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // 6. ASSIGN SALESPERSONS
//       if (
//         input.distributor_distributors &&
//         Array.isArray(input.distributor_distributors)
//       ) {
//         for (const salespersonId of input.distributor_distributors) {
//           await prisma.promotion_salesperson.create({
//             data: {
//               parent_id: promotionId,
//               salesperson_id: salespersonId,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // 7. ASSIGN ROUTES
//       if (input.seller_data && Array.isArray(input.seller_data)) {
//         for (const routeId of input.seller_data) {
//           await prisma.promotion_routes.create({
//             data: {
//               parent_id: promotionId,
//               route_id: routeId,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // 8. ASSIGN CUSTOMER CATEGORIES
//       const allOutletGroups = [
//         ...(input.outlet1_groups || []),
//         ...(input.outlet2_groups || []),
//       ];

//       for (const categoryId of allOutletGroups) {
//         await prisma.promotion_customer_category.create({
//           data: {
//             parent_id: promotionId,
//             customer_category_id: categoryId,
//             is_active: 'Y',
//             createdby: req.user?.id || 1,
//             createdate: new Date(),
//             log_inst: 1,
//           },
//         });
//       }

//       // 9. ASSIGN CUSTOMER EXCLUSIONS
//       if (input.customer_exclusions && Array.isArray(input.customer_exclusions)) {
//         for (const customerId of input.customer_exclusions) {
//           await prisma.promotion_customer_exclusion.create({
//             data: {
//               parent_id: promotionId,
//               customer_id: customerId,
//               is_excluded: 'Y',
//             },
//           });
//         }
//       }

//       // 10. LOG TRACKING
//       await prisma.promotion_tracking.create({
//         data: {
//           parent_id: promotionId,
//           action_type: 'CREATED',
//           action_date: new Date(),
//           user_id: req.user?.id || 1,
//           comments: `Promotion created: ${input.promotion_name}`,
//           is_active: 'Y',
//         },
//       });

//       // 11. FETCH COMPLETE PROMOTION
//       const completePromotion = await prisma.promotion.findUnique({
//         where: { id: promotionId },
//         include: {
//           promotion_channel_promotions: { where: { is_active: 'Y' } },
//           promotion_depot_promotions: {
//             where: { is_active: 'Y' },
//             include: { depots: true },
//           },
//           promotion_salesperson_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_salesperson_users: true },
//           },
//           promotion_routes_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_route: true },
//           },
//           promotion_customer_category_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_customer_categorys: true },
//           },
//           promotion_customer_exclusion_promotions: true,
//           promotion_condition_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_condition_product: { where: { is_active: 'Y' } },
//             },
//           },
//           promotion_level_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_benefit_level: { where: { is_active: 'Y' } },
//             },
//             orderBy: { level_number: 'asc' },
//           },
//         },
//       });

//       res.status(201).json({
//         success: true,
//         message: 'Promotion created successfully',
//         data: serializePromotion(completePromotion),
//       });
//     } catch (error: any) {
//       console.error('Create Promotion Error:', error);
//       res.status(500).json({
//         success: false,
//         message: error.message,
//         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
//       });
//     }
//   },

//   // ============================================
//   // GET ALL PROMOTIONS
//   // ============================================
//   async getAllPromotions(req: any, res: Response) {
//     try {
//       const {
//         page,
//         limit,
//         search,
//         is_active,
//         platform,
//         depot_id,
//         salesperson_id,
//         route_id,
//         start_date,
//         end_date,
//         active_only,
//       } = req.query;

//       const pageNum = parseInt(page as string, 10) || 1;
//       const limitNum = parseInt(limit as string, 10) || 10;

//       const filters: any = {};

//       if (search) {
//         filters.OR = [
//           { promotion_name: { contains: search as string, mode: 'insensitive' } },
//           { promotion_code: { contains: search as string, mode: 'insensitive' } },
//           { description: { contains: search as string, mode: 'insensitive' } },
//         ];
//       }

//       if (is_active) {
//         filters.is_active = is_active;
//       }

//       if (active_only === 'true') {
//         const now = new Date();
//         filters.is_active = 'Y';
//         filters.start_date = { lte: now };
//         filters.end_date = { gte: now };
//       }

//       if (start_date) {
//         filters.start_date = { gte: new Date(start_date as string) };
//       }

//       if (end_date) {
//         filters.end_date = { lte: new Date(end_date as string) };
//       }

//       if (platform) {
//         filters.promotion_channel_promotions = {
//           some: {
//             channel_type: platform,
//             is_active: 'Y',
//           },
//         };
//       }

//       if (depot_id) {
//         filters.promotion_depot_promotions = {
//           some: {
//             depot_id: parseInt(depot_id as string, 10),
//             is_active: 'Y',
//           },
//         };
//       }

//       if (salesperson_id) {
//         filters.promotion_salesperson_promotions = {
//           some: {
//             salesperson_id: parseInt(salesperson_id as string, 10),
//             is_active: 'Y',
//           },
//         };
//       }

//       if (route_id) {
//         filters.promotion_routes_promotions = {
//           some: {
//             route_id: parseInt(route_id as string, 10),
//             is_active: 'Y',
//           },
//         };
//       }

//       const { data, pagination } = await paginate({
//         model: prisma.promotion,
//         filters,
//         page: pageNum,
//         limit: limitNum,
//         orderBy: { createdate: 'desc' },
//         include: {
//           promotion_channel_promotions: { where: { is_active: 'Y' } },
//           promotion_depot_promotions: {
//             where: { is_active: 'Y' },
//             include: { depots: { select: { id: true, name: true, code: true } } },
//           },
//           promotion_salesperson_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_salesperson_users: {
//                 select: { id: true, name: true, email: true },
//               },
//             },
//           },
//           promotion_routes_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_route: {
//                 select: { id: true, route_name: true, route_code: true },
//               },
//             },
//           },
//           promotion_customer_category_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_customer_categorys: {
//                 select: { id: true, category_name: true, category_code: true },
//               },
//             },
//           },
//           promotion_condition_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_condition_product: { where: { is_active: 'Y' } },
//             },
//           },
//           promotion_level_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_benefit_level: { where: { is_active: 'Y' } },
//             },
//             orderBy: { level_number: 'asc' },
//           },
//         },
//       });

//       const totalPromotions = await prisma.promotion.count();
//       const activePromotions = await prisma.promotion.count({
//         where: {
//           is_active: 'Y',
//           start_date: { lte: new Date() },
//           end_date: { gte: new Date() },
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Promotions retrieved successfully',
//         data: data.map((p: any) => serializePromotion(p)),
//         pagination,
//         stats: {
//           total: totalPromotions,
//           active: activePromotions,
//           inactive: totalPromotions - activePromotions,
//         },
//       });
//     } catch (error: any) {
//       console.error('Get All Promotions Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // GET PROMOTION BY ID
//   // ============================================
//   async getPromotionById(req: Request, res: Response) {
//     try {
//       const { id } = req.params;

//       const promotion = await prisma.promotion.findUnique({
//         where: { id: Number(id) },
//         include: {
//           promotion_channel_promotions: { where: { is_active: 'Y' } },
//           promotion_depot_promotions: {
//             where: { is_active: 'Y' },
//             include: { depots: true },
//           },
//           promotion_salesperson_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_salesperson_users: true },
//           },
//           promotion_routes_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_route: true },
//           },
//           promotion_customer_category_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_customer_categorys: true },
//           },
//           promotion_customer_exclusion_promotions: true,
//           promotion_condition_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_condition_product: { where: { is_active: 'Y' } },
//             },
//           },
//           promotion_level_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_benefit_level: { where: { is_active: 'Y' } },
//             },
//             orderBy: { level_number: 'asc' },
//           },
//           promotion_tracking_promotions: {
//             where: { is_active: 'Y' },
//             orderBy: { action_date: 'desc' },
//             take: 100,
//           },
//         },
//       });

//       if (!promotion) {
//         return res.status(404).json({
//           success: false,
//           message: 'Promotion not found',
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Promotion retrieved successfully',
//         data: serializePromotion(promotion),
//       });
//     } catch (error: any) {
//       console.error('Get Promotion By ID Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // UPDATE PROMOTION
//   // ============================================
//   async updatePromotion(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const {
//         promotion_name,
//         start_date,
//         end_date,
//         description,
//         is_active,
//         platforms,
//         location_areas,
//         distributor_distributors,
//         seller_data,
//         outlet1_groups,
//         outlet2_groups,
//         product_conditions,
//         levels,
//         customer_exclusions,
//       } = req.body;

//       const existing = await prisma.promotion.findUnique({
//         where: { id: Number(id) },
//       });

//       if (!existing) {
//         return res.status(404).json({
//           success: false,
//           message: 'Promotion not found',
//         });
//       }

//       // Update main promotion
//       const promotion = await prisma.promotion.update({
//         where: { id: Number(id) },
//         data: {
//           ...(promotion_name && { promotion_name }),
//           ...(start_date && { start_date: new Date(start_date) }),
//           ...(end_date && { end_date: new Date(end_date) }),
//           ...(description !== undefined && { description }),
//           ...(is_active && { is_active }),
//           updatedate: new Date(),
//           updatedby: req.user?.id || 1,
//         },
//       });

//       // Update channels
//       if (platforms && Array.isArray(platforms)) {
//         await prisma.promotion_channel.updateMany({
//           where: { parent_id: Number(id) },
//           data: { is_active: 'N' },
//         });

//         for (const platform of platforms) {
//           await prisma.promotion_channel.create({
//             data: {
//               parent_id: Number(id),
//               channel_type: platform,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // Update depots
//       if (location_areas && Array.isArray(location_areas)) {
//         await prisma.promotion_depot.updateMany({
//           where: { parent_id: Number(id) },
//           data: { is_active: 'N' },
//         });

//         for (const depotId of location_areas) {
//           await prisma.promotion_depot.create({
//             data: {
//               parent_id: Number(id),
//               depot_id: depotId,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // Update salespersons
//       if (distributor_distributors && Array.isArray(distributor_distributors)) {
//         await prisma.promotion_salesperson.updateMany({
//           where: { parent_id: Number(id) },
//           data: { is_active: 'N' },
//         });

//         for (const salespersonId of distributor_distributors) {
//           await prisma.promotion_salesperson.create({
//             data: {
//               parent_id: Number(id),
//               salesperson_id: salespersonId,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // Update routes
//       if (seller_data && Array.isArray(seller_data)) {
//         await prisma.promotion_routes.updateMany({
//           where: { parent_id: Number(id) },
//           data: { is_active: 'N' },
//         });

//         for (const routeId of seller_data) {
//           await prisma.promotion_routes.create({
//             data: {
//               parent_id: Number(id),
//               route_id: routeId,
//               is_active: 'Y',
//             },
//           });
//         }
//       }

//       // Update customer categories
//       if (outlet1_groups || outlet2_groups) {
//         await prisma.promotion_customer_category.updateMany({
//           where: { parent_id: Number(id) },
//           data: { is_active: 'N' },
//         });

//         const allGroups = [...(outlet1_groups || []), ...(outlet2_groups || [])];
//         for (const categoryId of allGroups) {
//           await prisma.promotion_customer_category.create({
//             data: {
//               parent_id: Number(id),
//               customer_category_id: categoryId,
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           });
//         }
//       }

//       // Log tracking
//       await prisma.promotion_tracking.create({
//         data: {
//           parent_id: Number(id),
//           action_type: 'UPDATED',
//           action_date: new Date(),
//           user_id: req.user?.id || 1,
//           comments: `Promotion updated: ${promotion.promotion_name}`,
//           is_active: 'Y',
//         },
//       });

//       // Fetch updated promotion
//       const updatedPromotion = await prisma.promotion.findUnique({
//         where: { id: Number(id) },
//         include: {
//           promotion_channel_promotions: { where: { is_active: 'Y' } },
//           promotion_depot_promotions: { where: { is_active: 'Y' } },
//           promotion_salesperson_promotions: { where: { is_active: 'Y' } },
//           promotion_routes_promotions: { where: { is_active: 'Y' } },
//           promotion_customer_category_promotions: { where: { is_active: 'Y' } },
//           promotion_condition_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_condition_product: { where: { is_active: 'Y' } } },
//           },
//           promotion_level_promotions: {
//             where: { is_active: 'Y' },
//             include: { promotion_benefit_level: { where: { is_active: 'Y' } } },
//           },
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Promotion updated successfully',
//         data: serializePromotion(updatedPromotion),
//       });
//     } catch (error: any) {
//       console.error('Update Promotion Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // DELETE PROMOTION
//   // ============================================
//   async deletePromotion(req: Request, res: Response) {
//     try {
//       const { id } = req.params;

//       const existing = await prisma.promotion.findUnique({
//         where: { id: Number(id) },
//       });

//       if (!existing) {
//         return res.status(404).json({
//           success: false,
//           message: 'Promotion not found',
//         });
//       }

//       await prisma.promotion.delete({
//         where: { id: Number(id) },
//       });

//       res.json({
//         success: true,
//         message: 'Promotion deleted successfully',
//       });
//     } catch (error: any) {
//       console.error('Delete Promotion Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ASSIGN CHANNELS
//   // ============================================
//   async assignChannels(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { channels } = req.body;

//       if (!Array.isArray(channels)) {
//         return res.status(400).json({
//           success: false,
//           message: 'channels must be an array',
//         });
//       }

//       await prisma.promotion_channel.updateMany({
//         where: { parent_id: Number(id) },
//         data: { is_active: 'N' },
//       });

//       const created = await Promise.all(
//         channels.map((channel: string) =>
//           prisma.promotion_channel.create({
//             data: {
//               parent_id: Number(id),
//               channel_type: channel,
//               is_active: 'Y',
//             },
//           })
//         )
//       );

//       res.json({
//         success: true,
//         message: 'Channels assigned successfully',
//         data: created,
//       });
//     } catch (error: any) {
//       console.error('Assign Channels Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ASSIGN DEPOTS
//   // ============================================
//   async assignDepots(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { depot_ids } = req.body;

//       if (!Array.isArray(depot_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'depot_ids must be an array',
//         });
//       }

//       await prisma.promotion_depot.updateMany({
//         where: { parent_id: Number(id) },
//         data: { is_active: 'N' },
//       });

//       const created = await Promise.all(
//         depot_ids.map((depot_id: number) =>
//           prisma.promotion_depot.create({
//             data: {
//               parent_id: Number(id),
//               depot_id,
//               is_active: 'Y',
//             },
//           })
//         )
//       );

//       res.json({
//         success: true,
//         message: 'Depots assigned successfully',
//         data: created,
//       });
//     } catch (error: any) {
//       console.error('Assign Depots Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ASSIGN SALESPERSONS
//   // ============================================
//   async assignSalespersons(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { salesperson_ids } = req.body;

//       if (!Array.isArray(salesperson_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'salesperson_ids must be an array',
//         });
//       }

//       await prisma.promotion_salesperson.updateMany({
//         where: { parent_id: Number(id) },
//         data: { is_active: 'N' },
//       });

//       const created = await Promise.all(
//         salesperson_ids.map((salesperson_id: number) =>
//           prisma.promotion_salesperson.create({
//             data: {
//               parent_id: Number(id),
//               salesperson_id,
//               is_active: 'Y',
//             },
//           })
//         )
//       );

//       res.json({
//         success: true,
//         message: 'Salespersons assigned successfully',
//         data: created,
//       });
//     } catch (error: any) {
//       console.error('Assign Salespersons Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ASSIGN ROUTES
//   // ============================================
//   async assignRoutes(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { route_ids } = req.body;

//       if (!Array.isArray(route_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'route_ids must be an array',
//         });
//       }

//       await prisma.promotion_routes.updateMany({
//         where: { parent_id: Number(id) },
//         data: { is_active: 'N' },
//       });

//       const created = await Promise.all(
//         route_ids.map((route_id: number) =>
//           prisma.promotion_routes.create({
//             data: {
//               parent_id: Number(id),
//               route_id,
//               is_active: 'Y',
//             },
//           })
//         )
//       );

//       res.json({
//         success: true,
//         message: 'Routes assigned successfully',
//         data: created,
//       });
//     } catch (error: any) {
//       console.error('Assign Routes Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ASSIGN CUSTOMER CATEGORIES
//   // ============================================
//   async assignCustomerCategories(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { customer_category_ids } = req.body;

//       if (!Array.isArray(customer_category_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'customer_category_ids must be an array',
//         });
//       }

//       await prisma.promotion_customer_category.updateMany({
//         where: { parent_id: Number(id) },
//         data: { is_active: 'N' },
//       });

//       const created = await Promise.all(
//         customer_category_ids.map((customer_category_id: number) =>
//           prisma.promotion_customer_category.create({
//             data: {
//               parent_id: Number(id),
//               customer_category_id,
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           })
//         )
//       );

//       res.json({
//         success: true,
//         message: 'Customer categories assigned successfully',
//         data: created,
//       });
//     } catch (error: any) {
//       console.error('Assign Customer Categories Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ASSIGN CUSTOMER EXCLUSIONS
//   // ============================================
//   async assignCustomerExclusions(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { customer_ids } = req.body;

//       if (!Array.isArray(customer_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'customer_ids must be an array',
//         });
//       }

//       await prisma.promotion_customer_exclusion.deleteMany({
//         where: { parent_id: Number(id) },
//       });

//       const created = await Promise.all(
//         customer_ids.map((customer_id: number) =>
//           prisma.promotion_customer_exclusion.create({
//             data: {
//               parent_id: Number(id),
//               customer_id,
//               is_excluded: 'Y',
//             },
//           })
//         )
//       );

//       res.json({
//         success: true,
//         message: 'Customer exclusions assigned successfully',
//         data: created,
//       });
//     } catch (error: any) {
//       console.error('Assign Customer Exclusions Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // CREATE CONDITION
//   // ============================================
//   async createCondition(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const {
//         condition_type,
//         applies_to_type,
//         min_value,
//         max_value,
//         effective_start_date,
//         effective_end_date,
//       } = req.body;

//       if (!condition_type || !applies_to_type || min_value === undefined) {
//         return res.status(400).json({
//           success: false,
//           message: 'condition_type, applies_to_type, and min_value are required',
//         });
//       }

//       const condition = await prisma.promotion_condition.create({
//         data: {
//           parent_id: Number(id),
//           condition_type,
//           applies_to_type,
//           min_value: new Decimal(min_value),
//           max_value: max_value ? new Decimal(max_value) : null,
//           effective_start_date: new Date(effective_start_date || new Date()),
//           effective_end_date: effective_end_date
//             ? new Date(effective_end_date)
//             : null,
//           status: 'active',
//           is_active: 'Y',
//           createdby: req.user?.id || 1,
//           createdate: new Date(),
//           log_inst: 1,
//         },
//       });

//       res.status(201).json({
//         success: true,
//         message: 'Condition created successfully',
//         data: condition,
//       });
//     } catch (error: any) {
//       console.error('Create Condition Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // UPDATE CONDITION
//   // ============================================
//   async updateCondition(req: any, res: Response) {
//     try {
//       const { id, conditionId } = req.params;
//       const data = req.body;

//       const condition = await prisma.promotion_condition.update({
//         where: { id: Number(conditionId) },
//         data: {
//           ...data,
//           updatedate: new Date(),
//           updatedby: req.user?.id || 1,
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Condition updated successfully',
//         data: condition,
//       });
//     } catch (error: any) {
//       console.error('Update Condition Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // DELETE CONDITION
//   // ============================================
//   async deleteCondition(req: Request, res: Response) {
//     try {
//       const { conditionId } = req.params;

//       await prisma.promotion_condition.update({
//         where: { id: Number(conditionId) },
//         data: { is_active: 'N' },
//       });

//       res.json({
//         success: true,
//         message: 'Condition deleted successfully',
//       });
//     } catch (error: any) {
//       console.error('Delete Condition Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ASSIGN CONDITION PRODUCTS
//   // ============================================
//   async assignConditionProducts(req: any, res: Response) {
//     try {
//       const { conditionId } = req.params;
//       const { products } = req.body;

//       if (!Array.isArray(products)) {
//         return res.status(400).json({
//           success: false,
//           message: 'products must be an array',
//         });
//       }

//       await prisma.promotion_condition_products.updateMany({
//         where: { condition_id: Number(conditionId) },
//         data: { is_active: 'N' },
//       });

//       const created = await Promise.all(
//         products.map((p: any) =>
//           prisma.promotion_condition_products.create({
//             data: {
//               condition_id: Number(conditionId),
//               product_code: p.product_code || null,
//               category_code: p.category_code || null,
//               product_group: p.product_group || null,
//               condition_quantity: new Decimal(p.condition_quantity || 0),
//               is_active: 'Y',
//               createdby: req.user?.id || 1,
//               createdate: new Date(),
//               log_inst: 1,
//             },
//           })
//         )
//       );

//       res.json({
//         success: true,
//         message: 'Condition products assigned successfully',
//         data: created,
//       });
//     } catch (error: any) {
//       console.error('Assign Condition Products Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // CREATE LEVEL
//   // ============================================
//   async createLevel(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { level_number, threshold_value, discount_type, discount_value } =
//         req.body;

//       if (
//         level_number === undefined ||
//         threshold_value === undefined ||
//         discount_value === undefined
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             'level_number, threshold_value, and discount_value are required',
//         });
//       }

//       const level = await prisma.promotion_level.create({
//         data: {
//           parent_id: Number(id),
//           level_number,
//           threshold_value: new Decimal(threshold_value),
//           discount_type: discount_type || 'PERCENTAGE',
//           discount_value: new Decimal(discount_value),
//           is_active: 'Y',
//           createdby: req.user?.id || 1,
//           createdate: new Date(),
//           log_inst: 1,
//         },
//       });

//       res.status(201).json({
//         success: true,
//         message: 'Level created successfully',
//         data: level,
//       });
//     } catch (error: any) {
//       console.error('Create Level Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // UPDATE LEVEL
//   // ============================================
//   async updateLevel(req: any, res: Response) {
//     try {
//       const { levelId } = req.params;
//       const data = req.body;

//       const level = await prisma.promotion_level.update({
//         where: { id: Number(levelId) },
//         data: {
//           ...data,
//           updatedate: new Date(),
//           updatedby: req.user?.id || 1,
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Level updated successfully',
//         data: level,
//       });
//     } catch (error: any) {
//       console.error('Update Level Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // DELETE LEVEL
//   // ============================================
//   async deleteLevel(req: Request, res: Response) {
//     try {
//       const { levelId } = req.params;

//       await prisma.promotion_level.update({
//         where: { id: Number(levelId) },
//         data: { is_active: 'N' },
//       });

//       res.json({
//         success: true,
//         message: 'Level deleted successfully',
//       });
//     } catch (error: any) {
//       console.error('Delete Level Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // CREATE BENEFIT
//   // ============================================
//   async createBenefit(req: any, res: Response) {
//     try {
//       const { levelId } = req.params;
//       const {
//         benefit_type,
//         product_code,
//         benefit_value,
//         condition_type,
//         gift_limit,
//       } = req.body;

//       if (!benefit_type || benefit_value === undefined) {
//         return res.status(400).json({
//           success: false,
//           message: 'benefit_type and benefit_value are required',
//         });
//       }

//       const benefit = await prisma.promotion_benefit.create({
//         data: {
//           level_id: Number(levelId),
//           benefit_type,
//           product_code: product_code || null,
//           benefit_value: new Decimal(benefit_value),
//           condition_type: condition_type || null,
//           gift_limit: gift_limit || 0,
//           is_active: 'Y',
//         },
//       });

//       res.status(201).json({
//         success: true,
//         message: 'Benefit created successfully',
//         data: benefit,
//       });
//     } catch (error: any) {
//       console.error('Create Benefit Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // UPDATE BENEFIT
//   // ============================================
//   async updateBenefit(req: any, res: Response) {
//     try {
//       const { benefitId } = req.params;
//       const data = req.body;

//       const benefit = await prisma.promotion_benefit.update({
//         where: { id: Number(benefitId) },
//         data: {
//           ...data,
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Benefit updated successfully',
//         data: benefit,
//       });
//     } catch (error: any) {
//       console.error('Update Benefit Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // DELETE BENEFIT
//   // ============================================
//   async deleteBenefit(req: Request, res: Response) {
//     try {
//       const { benefitId } = req.params;

//       await prisma.promotion_benefit.update({
//         where: { id: Number(benefitId) },
//         data: { is_active: 'N' },
//       });

//       res.json({
//         success: true,
//         message: 'Benefit deleted successfully',
//       });
//     } catch (error: any) {
//       console.error('Delete Benefit Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // CALCULATE ELIGIBLE PROMOTIONS
//   // ============================================
//   async calculateEligiblePromotions(req: any, res: Response) {
//     try {
//       const {
//         customer_id,
//         order_lines,
//         depot_id,
//         salesman_id,
//         route_id,
//         order_date,
//         platform,
//       } = req.body;

//       if (!customer_id || !order_lines || !Array.isArray(order_lines)) {
//         return res.status(400).json({
//           success: false,
//           message: 'customer_id and order_lines are required',
//         });
//       }

//       const checkDate = order_date ? new Date(order_date) : new Date();

//       // Get customer details
//       const customer = await prisma.customers.findUnique({
//         where: { id: customer_id },
//         select: { type: true },
//       });

//       // Get active promotions
//       let promotionsQuery: any = {
//         is_active: 'Y',
//         start_date: { lte: checkDate },
//         end_date: { gte: checkDate },
//       };

//       if (platform) {
//         promotionsQuery.promotion_channel_promotions = {
//           some: {
//             channel_type: platform,
//             is_active: 'Y',
//           },
//         };
//       }

//       const promotions = await prisma.promotion.findMany({
//         where: promotionsQuery,
//         include: {
//           promotion_depot_promotions: { where: { is_active: 'Y' } },
//           promotion_salesperson_promotions: { where: { is_active: 'Y' } },
//           promotion_routes_promotions: { where: { is_active: 'Y' } },
//           promotion_customer_category_promotions: { where: { is_active: 'Y' } },
//           promotion_customer_exclusion_promotions: true,
//           promotion_condition_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_condition_product: { where: { is_active: 'Y' } },
//             },
//           },
//           promotion_level_promotions: {
//             where: { is_active: 'Y' },
//             include: {
//               promotion_benefit_level: { where: { is_active: 'Y' } },
//             },
//             orderBy: { threshold_value: 'desc' },
//           },
//         },
//       });

//       const eligiblePromotions: any[] = [];

//       for (const promo of promotions) {
//         // Check exclusion
//         const isExcluded = promo.promotion_customer_exclusion_promotions.find(
//           (exc) => exc.customer_id === customer_id && exc.is_excluded === 'Y'
//         );

//         if (isExcluded) continue;

//         // Check eligibility
//         let isEligible = false;

//         if (
//           promo.promotion_depot_promotions.length === 0 &&
//           promo.promotion_salesperson_promotions.length === 0 &&
//           promo.promotion_routes_promotions.length === 0 &&
//           promo.promotion_customer_category_promotions.length === 0
//         ) {
//           isEligible = true;
//         } else {
//           if (depot_id && promo.promotion_depot_promotions.length > 0) {
//             const depotMatch = promo.promotion_depot_promotions.find(
//               (d) => d.depot_id === depot_id
//             );
//             if (depotMatch) isEligible = true;
//           }

//           if (salesman_id && promo.promotion_salesperson_promotions.length > 0) {
//             const salesmanMatch = promo.promotion_salesperson_promotions.find(
//               (s) => s.salesperson_id === salesman_id
//             );
//             if (salesmanMatch) isEligible = true;
//           }

//           if (route_id && promo.promotion_routes_promotions.length > 0) {
//             const routeMatch = promo.promotion_routes_promotions.find(
//               (r) => r.route_id === route_id
//             );
//             if (routeMatch) isEligible = true;
//           }

//           if (
//             customer?.type &&
//             promo.promotion_customer_category_promotions.length > 0
//           ) {
//             for (const cat of promo.promotion_customer_category_promotions) {
//               const category = await prisma.customer_category.findUnique({
//                 where: { id: cat.customer_category_id },
//               });

//               if (category && category.category_code === customer.type) {
//                 isEligible = true;
//                 break;
//               }
//             }
//           }
//         }

//         if (!isEligible) continue;

//         // Calculate qualification
//         for (const condition of promo.promotion_condition_promotions) {
//           let totalQty = new Decimal(0);
//           let totalValue = new Decimal(0);

//           for (const line of order_lines) {
//             const productMatch = condition.promotion_condition_product.find(
//               (cp) =>
//                 cp.product_code === line.product_code ||
//                 cp.category_code === line.category_code ||
//                 cp.product_group === line.product_group
//             );

//             if (productMatch) {
//               const lineQty = new Decimal(line.quantity || 0);
//               const linePrice = new Decimal(line.unit_price || 0);
//               const lineValue = lineQty.mul(linePrice);

//               totalQty = totalQty.add(lineQty);
//               totalValue = totalValue.add(lineValue);
//             }
//           }

//           const minValue = new Decimal(condition.min_value || 0);
//           const conditionMet = totalValue.gte(minValue);

//           if (!conditionMet) continue;

//           const applicableLevel = promo.promotion_level_promotions.find((lvl) =>
//             new Decimal(lvl.threshold_value).lte(totalValue)
//           );

//           if (!applicableLevel) continue;

//           let discountAmount = new Decimal(0);
//           const freeProducts: any[] = [];

//           if (applicableLevel.discount_type === 'PERCENTAGE') {
//             const discountPercent = new Decimal(
//               applicableLevel.discount_value || 0
//             );
//             discountAmount = totalValue.mul(discountPercent).div(100);
//           } else if (applicableLevel.discount_type === 'FIXED_AMOUNT') {
//             discountAmount = new Decimal(applicableLevel.discount_value || 0);
//           }

//           for (const benefit of applicableLevel.promotion_benefit_level) {
//             if (benefit.benefit_type === 'FREE_PRODUCT') {
//               freeProducts.push({
//                 product_code: benefit.product_code,
//                 quantity: benefit.benefit_value.toNumber(),
//                 gift_limit: benefit.gift_limit || 0,
//               });
//             }
//           }

//           eligiblePromotions.push({
//             promotion_id: promo.id,
//             promotion_name: promo.promotion_name,
//             promotion_code: promo.promotion_code,
//             level_number: applicableLevel.level_number,
//             discount_type: applicableLevel.discount_type,
//             discount_amount: discountAmount.toNumber(),
//             free_products: freeProducts,
//             qualified_quantity: totalQty.toNumber(),
//             qualified_value: totalValue.toNumber(),
//             threshold_met: totalValue.toNumber(),
//           });

//           break;
//         }
//       }

//       res.json({
//         success: true,
//         message: 'Eligible promotions calculated',
//         data: eligiblePromotions,
//         summary: {
//           total_eligible: eligiblePromotions.length,
//           total_discount: eligiblePromotions.reduce(
//             (sum, p) => sum + p.discount_amount,
//             0
//           ),
//         },
//       });
//     } catch (error: any) {
//       console.error('Calculate Promotions Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // APPLY PROMOTION
//   // ============================================
//   async applyPromotion(req: any, res: Response) {
//     try {
//       const { promotion_id, order_id, customer_id, discount_amount, free_products } =
//         req.body;

//       if (!promotion_id || !customer_id) {
//         return res.status(400).json({
//           success: false,
//           message: 'promotion_id and customer_id are required',
//         });
//       }

//       await prisma.promotion_tracking.create({
//         data: {
//           parent_id: promotion_id,
//           action_type: 'APPLIED',
//           action_date: new Date(),
//           user_id: req.user?.id || 1,
//           comments: `Applied to order ${order_id} for customer ${customer_id}. Discount: ${discount_amount}. Free Products: ${JSON.stringify(
//             free_products
//           )}`,
//           is_active: 'Y',
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Promotion applied successfully',
//         data: {
//           promotion_id,
//           order_id,
//           customer_id,
//           discount_amount,
//           free_products,
//           applied_at: new Date(),
//         },
//       });
//     } catch (error: any) {
//       console.error('Apply Promotion Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // SETTLE PERIOD PROMOTION
//   // ============================================
//   async settlePeriodPromotion(req: any, res: Response) {
//     try {
//       const { id } = req.params;
//       const { period_start, period_end, customer_ids } = req.body;

//       if (!period_start || !period_end || !Array.isArray(customer_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'period_start, period_end, and customer_ids are required',
//         });
//       }

//       const promotion = await prisma.promotion.findUnique({
//         where: { id: Number(id) },
//       });

//       if (!promotion) {
//         return res.status(404).json({
//           success: false,
//           message: 'Promotion not found',
//         });
//       }

//       const settlementResults: any[] = [];

//       for (const customerId of customer_ids) {
//         // Calculate accumulated sales for period
//         // (Implementation depends on your order structure)

//         await prisma.promotion_tracking.create({
//           data: {
//             parent_id: Number(id),
//             action_type: 'PERIOD_SETTLEMENT',
//             action_date: new Date(),
//             user_id: req.user?.id || 1,
//             comments: `Period settlement for customer ${customerId}. Period: ${period_start} to ${period_end}`,
//             is_active: 'Y',
//           },
//         });

//         settlementResults.push({
//           customer_id: customerId,
//           settled: true,
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Period promotion settled successfully',
//         data: settlementResults,
//       });
//     } catch (error: any) {
//       console.error('Settle Period Promotion Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ACTIVATE PROMOTION
//   // ============================================
//   async activatePromotion(req: any, res: Response) {
//     try {
//       const { id } = req.params;

//       const promotion = await prisma.promotion.update({
//         where: { id: Number(id) },
//         data: {
//           is_active: 'Y',
//           updatedate: new Date(),
//           updatedby: req.user?.id || 1,
//         },
//       });

//       await prisma.promotion_tracking.create({
//         data: {
//           parent_id: Number(id),
//           action_type: 'ACTIVATED',
//           action_date: new Date(),
//           user_id: req.user?.id || 1,
//           comments: `Promotion activated`,
//           is_active: 'Y',
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Promotion activated successfully',
//         data: promotion,
//       });
//     } catch (error: any) {
//       console.error('Activate Promotion Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // DEACTIVATE PROMOTION
//   // ============================================
//   async deactivatePromotion(req: any, res: Response) {
//     try {
//       const { id } = req.params;

//       const promotion = await prisma.promotion.update({
//         where: { id: Number(id) },
//         data: {
//           is_active: 'N',
//           updatedate: new Date(),
//           updatedby: req.user?.id || 1,
//         },
//       });

//       await prisma.promotion_tracking.create({
//         data: {
//           parent_id: Number(id),
//           action_type: 'DEACTIVATED',
//           action_date: new Date(),
//           user_id: req.user?.id || 1,
//           comments: `Promotion deactivated`,
//           is_active: 'Y',
//         },
//       });

//       res.json({
//         success: true,
//         message: 'Promotion deactivated successfully',
//         data: promotion,
//       });
//     } catch (error: any) {
//       console.error('Deactivate Promotion Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // BULK ACTIVATE
//   // ============================================
//   async bulkActivatePromotions(req: any, res: Response) {
//     try {
//       const { promotion_ids } = req.body;

//       if (!Array.isArray(promotion_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'promotion_ids must be an array',
//         });
//       }

//       const result = await prisma.promotion.updateMany({
//         where: { id: { in: promotion_ids } },
//         data: {
//           is_active: 'Y',
//           updatedate: new Date(),
//           updatedby: req.user?.id || 1,
//         },
//       });

//       res.json({
//         success: true,
//         message: `${result.count} promotions activated successfully`,
//         data: { count: result.count },
//       });
//     } catch (error: any) {
//       console.error('Bulk Activate Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // BULK DEACTIVATE
//   // ============================================
//   async bulkDeactivatePromotions(req: any, res: Response) {
//     try {
//       const { promotion_ids } = req.body;

//       if (!Array.isArray(promotion_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'promotion_ids must be an array',
//         });
//       }

//       const result = await prisma.promotion.updateMany({
//         where: { id: { in: promotion_ids } },
//         data: {
//           is_active: 'N',
//           updatedate: new Date(),
//           updatedby: req.user?.id || 1,
//         },
//       });

//       res.json({
//         success: true,
//         message: `${result.count} promotions deactivated successfully`,
//         data: { count: result.count },
//       });
//     } catch (error: any) {
//       console.error('Bulk Deactivate Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // BULK DELETE
//   // ============================================
//   async bulkDeletePromotions(req: any, res: Response) {
//     try {
//       const { promotion_ids } = req.body;

//       if (!Array.isArray(promotion_ids)) {
//         return res.status(400).json({
//           success: false,
//           message: 'promotion_ids must be an array',
//         });
//       }

//       const result = await prisma.promotion.deleteMany({
//         where: { id: { in: promotion_ids } },
//       });

//       res.json({
//         success: true,
//         message: `${result.count} promotions deleted successfully`,
//         data: { count: result.count },
//       });
//     } catch (error: any) {
//       console.error('Bulk Delete Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // ACTIVE PROMOTIONS REPORT
//   // ============================================
//   async getActivePromotionsReport(req: Request, res: Response) {
//     try {
//       const { platform, depot_id, start_date, end_date } = req.query;

//       const now = new Date();
//       const filters: any = {
//         is_active: 'Y',
//         start_date: { lte: now },
//         end_date: { gte: now },
//       };

//       if (platform) {
//         filters.promotion_channel_promotions = {
//           some: {
//             channel_type: platform,
//             is_active: 'Y',
//           },
//         };
//       }

//       if (depot_id) {
//         filters.promotion_depot_promotions = {
//           some: {
//             depot_id: parseInt(depot_id as string, 10),
//             is_active: 'Y',
//           },
//         };
//       }

//       const activePromotions = await prisma.promotion.findMany({
//         where: filters,
//         include: {
//           promotion_channel_promotions: { where: { is_active: 'Y' } },
//           promotion_depot_promotions: {
//             where: { is_active: 'Y' },
//             include: { depots: true },
//           },
//           promotion_level_promotions: { where: { is_active: 'Y' } },
//           promotion_tracking_promotions: {
//             where: {
//               action_type: 'APPLIED',
//               action_date: {
//                 gte: start_date
//                   ? new Date(start_date as string)
//                   : new Date(now.getFullYear(), now.getMonth(), 1),
//                 lte: end_date ? new Date(end_date as string) : now,
//               },
//             },
//           },
//         },
//         orderBy: { start_date: 'desc' },
//       });

//       const report = activePromotions.map((promo) => ({
//         ...serializePromotion(promo),
//         applications_count: promo.promotion_tracking_promotions.length,
//         platforms: promo.promotion_channel_promotions.map((c) => c.channel_type),
//         depots: promo.promotion_depot_promotions.map((d) => d.depots?.name),
//       }));

//       res.json({
//         success: true,
//         message: 'Active promotions report generated',
//         data: report,
//         summary: {
//           total_active: report.length,
//           total_applications: report.reduce(
//             (sum, p) => sum + p.applications_count,
//             0
//           ),
//         },
//       });
//     } catch (error: any) {
//       console.error('Active Promotions Report Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // PROMOTION TRACKING REPORT
//   // ============================================
//   async getPromotionTrackingReport(req: Request, res: Response) {
//     try {
//       const { promotion_id, action_type, start_date, end_date } = req.query;

//       const filters: any = {};

//       if (promotion_id) filters.parent_id = Number(promotion_id);
//       if (action_type) filters.action_type = action_type;
//       if (start_date || end_date) {
//         filters.action_date = {};
//         if (start_date) filters.action_date.gte = new Date(start_date as string);
//         if (end_date) filters.action_date.lte = new Date(end_date as string);
//       }

//       const tracking = await prisma.promotion_tracking.findMany({
//         where: filters,
//         include: {
//           promotion_tracking_promotions: {
//             select: { id: true, promotion_name: true, promotion_code: true },
//           },
//         },
//         orderBy: { action_date: 'desc' },
//         take: 1000,
//       });

//       res.json({
//         success: true,
//         message: 'Promotion tracking report generated',
//         data: tracking,
//         summary: {
//           total_records: tracking.length,
//           action_types: [...new Set(tracking.map((t) => t.action_type))],
//         },
//       });
//     } catch (error: any) {
//       console.error('Promotion Tracking Report Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // PROMOTION USAGE REPORT
//   // ============================================
//   async getPromotionUsageReport(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const { start_date, end_date } = req.query;

//       const filters: any = {
//         parent_id: Number(id),
//         action_type: 'APPLIED',
//       };

//       if (start_date || end_date) {
//         filters.action_date = {};
//         if (start_date) filters.action_date.gte = new Date(start_date as string);
//         if (end_date) filters.action_date.lte = new Date(end_date as string);
//       }

//       const usage = await prisma.promotion_tracking.findMany({
//         where: filters,
//         orderBy: { action_date: 'desc' },
//       });

//       res.json({
//         success: true,
//         message: 'Promotion usage report generated',
//         data: usage,
//         summary: {
//           total_usage: usage.length,
//         },
//       });
//     } catch (error: any) {
//       console.error('Promotion Usage Report Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // CUSTOMER QUALIFIED REPORT
//   // ============================================
//   async getCustomerQualifiedReport(req: Request, res: Response) {
//     try {
//       const { promotion_id, start_date, end_date } = req.query;

//       if (!promotion_id) {
//         return res.status(400).json({
//           success: false,
//           message: 'promotion_id is required',
//         });
//       }

//       const filters: any = {
//         parent_id: Number(promotion_id),
//         action_type: 'APPLIED',
//       };

//       if (start_date || end_date) {
//         filters.action_date = {};
//         if (start_date) filters.action_date.gte = new Date(start_date as string);
//         if (end_date) filters.action_date.lte = new Date(end_date as string);
//       }

//       const tracking = await prisma.promotion_tracking.findMany({
//         where: filters,
//         orderBy: { action_date: 'desc' },
//       });

//       res.json({
//         success: true,
//         message: 'Customer qualified report generated',
//         data: {
//           total_applications: tracking.length,
//           applications: tracking,
//         },
//       });
//     } catch (error: any) {
//       console.error('Customer Qualified Report Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },

//   // ============================================
//   // PROMOTION PERFORMANCE REPORT
//   // ============================================
//   async getPromotionPerformanceReport(req: Request, res: Response) {
//     try {
//       const { start_date, end_date } = req.query;

//       const dateFilters: any = {};
//       if (start_date || end_date) {
//         dateFilters.action_date = {};
//         if (start_date) dateFilters.action_date.gte = new Date(start_date as string);
//         if (end_date) dateFilters.action_date.lte = new Date(end_date as string);
//       }

//       const promotions = await prisma.promotion.findMany({
//         where: { is_active: 'Y' },
//         include: {
//           promotion_tracking_promotions: {
//             where: {
//               action_type: 'APPLIED',
//               ...dateFilters,
//             },
//           },
//         },
//       });

//       const performance = promotions.map((promo) => ({
//         promotion_id: promo.id,
//         promotion_name: promo.promotion_name,
//         promotion_code: promo.promotion_code,
//         total_applications: promo.promotion_tracking_promotions.length,
//         start_date: promo.start_date,
//         end_date: promo.end_date,
//       }));

//       res.json({
//         success: true,
//         message: 'Promotion performance report generated',
//         data: performance,
//         summary: {
//           total_promotions: performance.length,
//           total_applications: performance.reduce(
//             (sum, p) => sum + p.total_applications,
//             0
//           ),
//         },
//       });
//     } catch (error: any) {
//       console.error('Promotion Performance Report Error:', error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   },
// };
