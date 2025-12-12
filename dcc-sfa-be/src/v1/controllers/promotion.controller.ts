import prisma from '../../configs/prisma.client';

enum PromotionType {
  INSTANT_DISCOUNT = 'INSTANT_DISCOUNT',
  INSTANT_FREE_PRODUCT = 'INSTANT_FREE_PRODUCT',
  DEPOT_PRICE_REDUCTION = 'DEPOT_PRICE_REDUCTION',
  PERIOD_ACCUMULATED = 'PERIOD_ACCUMULATED',
}

enum Platform {
  MOBILE = 'MOBILE',
  B2B = 'B2B',
  OFFICE = 'OFFICE',
  ALL = 'ALL',
}

interface PromotionCreateInput {
  name: string;
  code?: string;
  description?: string;
  promotion_type: PromotionType;
  start_date: Date;
  end_date: Date;
  is_active?: string;
  allow_overlap?: string;
  platform?: Platform;
  priority?: number;
}

const generatePromotionCode = async (name: string): Promise<string> => {
  const prefix = name.slice(0, 3).toUpperCase();
  const lastPromotion = await prisma.promotions.findFirst({
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

const serializePromotion = (promotion: any) => {
  if (!promotion) return {};

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
