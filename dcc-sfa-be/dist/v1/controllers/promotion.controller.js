"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("../../configs/prisma.client"));
var PromotionType;
(function (PromotionType) {
    PromotionType["INSTANT_DISCOUNT"] = "INSTANT_DISCOUNT";
    PromotionType["INSTANT_FREE_PRODUCT"] = "INSTANT_FREE_PRODUCT";
    PromotionType["DEPOT_PRICE_REDUCTION"] = "DEPOT_PRICE_REDUCTION";
    PromotionType["PERIOD_ACCUMULATED"] = "PERIOD_ACCUMULATED";
})(PromotionType || (PromotionType = {}));
var Platform;
(function (Platform) {
    Platform["MOBILE"] = "MOBILE";
    Platform["B2B"] = "B2B";
    Platform["OFFICE"] = "OFFICE";
    Platform["ALL"] = "ALL";
})(Platform || (Platform = {}));
const generatePromotionCode = async (name) => {
    const prefix = name.slice(0, 3).toUpperCase();
    const lastPromotion = await prisma_client_1.default.promotions.findFirst({
        orderBy: { id: 'desc' },
        select: { code: true },
    });
    let newNumber = 1;
    if (lastPromotion && lastPromotion.code) {
        const match = lastPromotion.code.match(/(\d+)$/);
        if (match) {
            newNumber = parseInt(match[1], 10) + 1;
        }
    }
    const code = `${prefix}${newNumber.toString().padStart(4, '0')}`;
    return code;
};
const serializePromotion = (promotion) => {
    if (!promotion)
        return {};
    return {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        description: promotion.description,
        promotion_type: promotion.promotion_type,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        is_active: promotion.is_active,
        allow_overlap: promotion.allow_overlap,
        platform: promotion.platform,
        priority: promotion.priority,
        createdate: promotion.createdate,
        createdby: promotion.createdby,
        updatedate: promotion.updatedate,
        updatedby: promotion.updatedby,
        eligibility: promotion.promotion_eligibility || [],
        products: promotion.promotion_products || [],
        rewards: promotion.promotion_rewards || [],
        usage: promotion.promotion_usage || [],
    };
};
//# sourceMappingURL=promotion.controller.js.map