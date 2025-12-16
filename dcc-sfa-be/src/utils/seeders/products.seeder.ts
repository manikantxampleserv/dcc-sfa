/**
 * @fileoverview Products Seeder
 * @description Creates products for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import prisma from '../../configs/prisma.client';

interface MockProduct {
  code: string;
  name: string;
  product_type: string | null;
  vat_percentage: number | null;
  weight_in_grams: number | null;
  volume_in_liters: number | null;
  category_name: string | null;
  flavour_name: string | null;
  volume_name: string | null;
  brand_name: string | null;
  shelf_life_name: string | null;
  sub_category_name: string | null;
  target_group_name: string | null;
  web_order_group_name: string | null;
  is_active: string;
}

const mockProducts: MockProduct[] = [
  {
    code: 'FG001',
    name: 'Coke RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20400,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'COKE',
    volume_name: '350ML',
    brand_name: 'COKE',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG002',
    name: 'Fanta RGB Orange 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20600,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'FANTA ORANGE',
    volume_name: '350ML',
    brand_name: 'FANTA',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG003',
    name: 'Fanta Passion RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20600,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'FANTA PASSION',
    volume_name: '350ML',
    brand_name: 'FANTA',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG004',
    name: 'Fanta Pineapple RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20600,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'FANTA PINE APPLE',
    volume_name: '350ML',
    brand_name: 'FANTA',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG005',
    name: 'Fanta Fruit Blast RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20800,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'FANTA FRUIT BLAS',
    volume_name: '350ML',
    brand_name: 'FANTA',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG006',
    name: 'Sprite RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20400,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'SPRITE',
    volume_name: '350ML',
    brand_name: 'SPRITE',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG007',
    name: 'Stoney Tangawizi RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20600,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'STONEY TANGAWIZI',
    volume_name: '350ML',
    brand_name: 'STONEY',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG008',
    name: 'Sparletta Pinenut RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20600,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'SPARLETTA PINE A',
    volume_name: '350ML',
    brand_name: 'SPARLETTA',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG009',
    name: 'Krest Bitter Lemon RGB 300ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 19200,
    volume_in_liters: 7.2,
    category_name: 'RGB',
    flavour_name: 'BITTER LEMON',
    volume_name: '300ML',
    brand_name: 'KREST',
    shelf_life_name: '365 Days',
    sub_category_name: '300ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG010',
    name: 'Krest Club Soda RGB 300ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 18400,
    volume_in_liters: 7.2,
    category_name: 'RGB',
    flavour_name: 'CLUB SODA',
    volume_name: '300ML',
    brand_name: 'KREST',
    shelf_life_name: '365 Days',
    sub_category_name: '300ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG011',
    name: 'Krest Tonic Water RGB 300ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 16600,
    volume_in_liters: 7.2,
    category_name: 'RGB',
    flavour_name: 'TONIC WATER',
    volume_name: '300ML',
    brand_name: 'KREST',
    shelf_life_name: '365 Days',
    sub_category_name: '300ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG012',
    name: 'Krest Ginger Ale RGB 300ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 18600,
    volume_in_liters: 7.2,
    category_name: 'RGB',
    flavour_name: 'GINGER ALE',
    volume_name: '300ML',
    brand_name: 'KREST',
    shelf_life_name: '365 Days',
    sub_category_name: '300ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG013',
    name: 'Coke RGB 250ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 14200,
    volume_in_liters: 6.0,
    category_name: 'RGB',
    flavour_name: 'COKE',
    volume_name: '250ML',
    brand_name: 'COKE',
    shelf_life_name: '365 Days',
    sub_category_name: '250ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG014',
    name: 'Fanta Orange RGB 250ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 14200,
    volume_in_liters: 6.0,
    category_name: 'RGB',
    flavour_name: 'FANTA ORANGE',
    volume_name: '250ML',
    brand_name: 'FANTA',
    shelf_life_name: '365 Days',
    sub_category_name: '250ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG015',
    name: 'Coke Zero RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20200,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'COKE ZERO',
    volume_name: '350ML',
    brand_name: 'COKE',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG021',
    name: 'Novida RGB 300ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 16800,
    volume_in_liters: 7.2,
    category_name: 'RGB',
    flavour_name: 'NOVIDA',
    volume_name: '300ML',
    brand_name: 'NOVIDA',
    shelf_life_name: '365 Days',
    sub_category_name: '300ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG022',
    name: 'Fanta Passion RGB 250ml rgb',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 14200,
    volume_in_liters: 6.0,
    category_name: 'RGB',
    flavour_name: 'FANTA PASSION',
    volume_name: '250ML',
    brand_name: 'FANTA',
    shelf_life_name: '365 Days',
    sub_category_name: '250ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'FG024',
    name: 'Sparletta Red Apple RGB 350ml 1x24',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 20600,
    volume_in_liters: 8.4,
    category_name: 'RGB',
    flavour_name: 'RED APPLE',
    volume_name: '350ML',
    brand_name: 'SPARLETTA',
    shelf_life_name: '365 Days',
    sub_category_name: '350ML RGB 1x24',
    target_group_name: 'RGB',
    web_order_group_name: 'RGB',
    is_active: 'Y',
  },
  {
    code: 'KD001',
    name: 'Kilimanjaro Drinking Water 500ml',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6200,
    volume_in_liters: 6.0,
    category_name: 'KDW',
    flavour_name: 'KDW500',
    volume_name: '0.5LTR',
    brand_name: 'KILIMANJARO',
    shelf_life_name: '180 Days',
    sub_category_name: '500ML KDW 1x12',
    target_group_name: 'KDW 500ML',
    web_order_group_name: 'KDW',
    is_active: 'Y',
  },
  {
    code: 'KD003',
    name: 'Kilimanjaro Drinking Water 1500ml',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 9200,
    volume_in_liters: 9.0,
    category_name: 'KDW',
    flavour_name: 'KDW1500',
    volume_name: '1.5LTR',
    brand_name: 'KILIMANJARO',
    shelf_life_name: '180 Days',
    sub_category_name: '1500ML KDW 1X6',
    target_group_name: 'KDW 1.5L',
    web_order_group_name: 'KDW',
    is_active: 'Y',
  },
  {
    code: 'KD004',
    name: 'BULK WATER 6 Ltr',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6000,
    volume_in_liters: 6.0,
    category_name: 'KDW',
    flavour_name: 'KDW 6 Ltr',
    volume_name: '6 Ltr',
    brand_name: 'KILIMANJARO',
    shelf_life_name: '180 Days',
    sub_category_name: 'BULK WATER 6 LTR',
    target_group_name: 'BULK WATER 6 LTR',
    web_order_group_name: 'KDW',
    is_active: 'Y',
  },
  {
    code: 'KD005',
    name: 'BULK WATER 12 Ltr',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 12000,
    volume_in_liters: 12.0,
    category_name: 'KDW',
    flavour_name: 'KDW 12 Ltr',
    volume_name: '12 Ltr',
    brand_name: 'KILIMANJARO',
    shelf_life_name: '180 Days',
    sub_category_name: 'BULK WATER 12 LTR',
    target_group_name: 'BULK WATER 12 L',
    web_order_group_name: 'KDW',
    is_active: 'Y',
  },
  {
    code: 'KD006',
    name: 'BULK WATER 18.9 Ltr',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 19200,
    volume_in_liters: 18.9,
    category_name: 'KDW',
    flavour_name: 'KDW 18.9 Ltr',
    volume_name: '18.9 Ltr',
    brand_name: 'KILIMANJARO',
    shelf_life_name: '180 Days',
    sub_category_name: 'BULK WATER 18.9 LTR',
    target_group_name: 'BULK WATER 18.9L',
    web_order_group_name: 'KDW',
    is_active: 'Y',
  },
  {
    code: 'KD007',
    name: 'Kilimanjaro Drinking Water 1000ml(6 Pack)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6200,
    volume_in_liters: 6.0,
    category_name: 'KDW',
    flavour_name: 'KDW1000',
    volume_name: '1.0LTR',
    brand_name: 'KILIMANJARO',
    shelf_life_name: '180 Days',
    sub_category_name: '1000ML KDW',
    target_group_name: 'KDW 1.0L',
    web_order_group_name: 'KDW',
    is_active: 'Y',
  },
  {
    code: 'PH001',
    name: 'Coke Pet 500ML ( x12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6400,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'COKE',
    volume_name: '500ML',
    brand_name: 'COKE',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH002',
    name: 'Sprite Pet 500ML (x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6400,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'SPRITE',
    volume_name: '500ML',
    brand_name: 'SPRITE',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH003',
    name: 'Fanta Orange Pet 500ML ( x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6600,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'FANTA ORANGE',
    volume_name: '500ML',
    brand_name: 'FANTA',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH004',
    name: 'Fanta Passion Pet 500ML ( x12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6600,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'FANTA PASSION',
    volume_name: '500ML',
    brand_name: 'FANTA',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH005',
    name: 'Fanta Pineapple Pet 500ml ( x12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6600,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'FANTA PINE APPLE',
    volume_name: '500ML',
    brand_name: 'FANTA',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH006',
    name: 'Fanta Fruit Blast Pet 500ML (x12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6600,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'FANTA FRUIT BLAS',
    volume_name: '500ML',
    brand_name: 'FANTA',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH007',
    name: 'Stoney Tangawizi Pet 500 ml ( x12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6400,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'STONEY TANGAWIZI',
    volume_name: '500ML',
    brand_name: 'STONEY',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH008',
    name: 'Sparletta Pinenut Pet 500 ml ( x12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6600,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'SPARLETTA PINE A',
    volume_name: '500ML',
    brand_name: 'SPARLETTA',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PH009',
    name: 'Coke Zero 500ML ( X 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 6200,
    volume_in_liters: 6.0,
    category_name: 'PET',
    flavour_name: 'COKE ZERO',
    volume_name: '500ML',
    brand_name: 'COKE',
    shelf_life_name: '90 Days',
    sub_category_name: '500ML PET 1x12',
    target_group_name: 'PET 500ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PO008',
    name: 'Coke Pet 300ML(x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 4000,
    volume_in_liters: 3.6,
    category_name: 'PET',
    flavour_name: 'COKE',
    volume_name: '300ML',
    brand_name: 'COKE',
    shelf_life_name: '90 Days',
    sub_category_name: '300ML PET 1x12',
    target_group_name: 'PET 300ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PO009',
    name: 'Coke Zero 300ML (x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 3800,
    volume_in_liters: 3.6,
    category_name: 'PET',
    flavour_name: 'COKE ZERO',
    volume_name: '300ML',
    brand_name: 'COKE',
    shelf_life_name: '90 Days',
    sub_category_name: '300ML PET 1x12',
    target_group_name: 'PET 300ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PO010',
    name: 'Sprite Zero 300ML (x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 3800,
    volume_in_liters: 3.6,
    category_name: 'PET',
    flavour_name: 'SPRITE ZERO',
    volume_name: '300ML',
    brand_name: 'SPRITE',
    shelf_life_name: '90 Days',
    sub_category_name: '300ML PET 1x12',
    target_group_name: 'PET 300ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PO012',
    name: 'Fanta Zero 300ML (x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 3800,
    volume_in_liters: 3.6,
    category_name: 'PET',
    flavour_name: 'FANTA ZERO',
    volume_name: '300ML',
    brand_name: 'FANTA',
    shelf_life_name: '90 Days',
    sub_category_name: '300ML PET 1x12',
    target_group_name: 'PET 300ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PO013',
    name: 'Sparletta Red Apple 300ML(x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 4000,
    volume_in_liters: 3.6,
    category_name: 'PET',
    flavour_name: 'RED APPLE',
    volume_name: '300ML',
    brand_name: 'SPARLETTA',
    shelf_life_name: '90 Days',
    sub_category_name: '300ML PET 1x12',
    target_group_name: 'PET 300ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PO014',
    name: 'Novida Pineapple 300ML (x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 4000,
    volume_in_liters: 3.6,
    category_name: 'PET',
    flavour_name: 'NOVIDA',
    volume_name: '300ML',
    brand_name: 'NOVIDA',
    shelf_life_name: '90 Days',
    sub_category_name: '300ML PET 1x12',
    target_group_name: 'PET 300ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PO015',
    name: 'Sparletta Pine Apple 300ML (x 12)',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 4000,
    volume_in_liters: 3.6,
    category_name: 'PET',
    flavour_name: 'SPARLETTA PINE A',
    volume_name: '300ML',
    brand_name: 'SPARLETTA',
    shelf_life_name: '90 Days',
    sub_category_name: '300ML PET 1x12',
    target_group_name: 'PET 300ML',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PT005',
    name: 'Coke 1250 ML',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 9820,
    volume_in_liters: 7.5,
    category_name: 'PET',
    flavour_name: 'COKE',
    volume_name: '1250ML',
    brand_name: 'COKE',
    shelf_life_name: '90 Days',
    sub_category_name: '1250ML PET 1x6',
    target_group_name: 'PET 1.25L',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PT006',
    name: 'Sprite 1250 ML',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 9750,
    volume_in_liters: 7.5,
    category_name: 'PET',
    flavour_name: 'SPRITE',
    volume_name: '1250ML',
    brand_name: 'SPRITE',
    shelf_life_name: '90 Days',
    sub_category_name: '1250ML PET 1x6',
    target_group_name: 'PET 1.25L',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PT007',
    name: 'Fanta Orange 1250 ML',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 9910,
    volume_in_liters: 7.5,
    category_name: 'PET',
    flavour_name: 'FANTA ORANGE',
    volume_name: '1250ML',
    brand_name: 'FANTA',
    shelf_life_name: '90 Days',
    sub_category_name: '1250ML PET 1x6',
    target_group_name: 'PET 1.25L',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'PT008',
    name: 'Fanta Passion 1250 ML',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 9850,
    volume_in_liters: 7.5,
    category_name: 'PET',
    flavour_name: 'FANTA PASSION',
    volume_name: '1250ML',
    brand_name: 'FANTA',
    shelf_life_name: '90 Days',
    sub_category_name: '1250ML PET 1x6',
    target_group_name: 'PET 1.25L',
    web_order_group_name: 'PET',
    is_active: 'Y',
  },
  {
    code: 'RGB001',
    name: 'Returnable Glass Bottle',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 488,
    volume_in_liters: 0.0,
    category_name: 'OTHER',
    flavour_name: 'RETURNABLE',
    volume_name: null,
    brand_name: null,
    shelf_life_name: null,
    sub_category_name: 'EMPTIES',
    target_group_name: null,
    web_order_group_name: null,
    is_active: 'Y',
  },
  {
    code: 'RP001',
    name: 'Returnable Plastic crates',
    product_type: 'Commercial Product',
    vat_percentage: 0.18,
    weight_in_grams: 488,
    volume_in_liters: 0.0,
    category_name: 'OTHER',
    flavour_name: 'RETURNABLE',
    volume_name: null,
    brand_name: null,
    shelf_life_name: null,
    sub_category_name: 'CRATES',
    target_group_name: null,
    web_order_group_name: null,
    is_active: 'Y',
  },
  {
    code: 'C01',
    name: 'Chair',
    product_type: 'Deposit Product',
    vat_percentage: 0.0,
    weight_in_grams: 0,
    volume_in_liters: 0.0,
    category_name: 'OTHER',
    flavour_name: null,
    volume_name: null,
    brand_name: null,
    shelf_life_name: null,
    sub_category_name: null,
    target_group_name: null,
    web_order_group_name: null,
    is_active: 'Y',
  },
  {
    code: 'CPE0255',
    name: 'CPE0255',
    product_type: 'Deposit Product',
    vat_percentage: 0.0,
    weight_in_grams: 0,
    volume_in_liters: 0.0,
    category_name: 'OTHER',
    flavour_name: null,
    volume_name: null,
    brand_name: null,
    shelf_life_name: null,
    sub_category_name: null,
    target_group_name: null,
    web_order_group_name: null,
    is_active: 'Y',
  },
  {
    code: 'CPE0405',
    name: 'CPE0405',
    product_type: 'Deposit Product',
    vat_percentage: 0.0,
    weight_in_grams: 0,
    volume_in_liters: 0.0,
    category_name: 'OTHER',
    flavour_name: null,
    volume_name: null,
    brand_name: null,
    shelf_life_name: null,
    sub_category_name: null,
    target_group_name: null,
    web_order_group_name: null,
    is_active: 'Y',
  },
  {
    code: 'CPE0605',
    name: 'CPE0605',
    product_type: 'Deposit Product',
    vat_percentage: 0.0,
    weight_in_grams: 0,
    volume_in_liters: 0.0,
    category_name: 'OTHER',
    flavour_name: null,
    volume_name: null,
    brand_name: null,
    shelf_life_name: null,
    sub_category_name: null,
    target_group_name: null,
    web_order_group_name: null,
    is_active: 'Y',
  },
  {
    code: 'CPE1005',
    name: 'CPE1005',
    product_type: 'Deposit Product',
    vat_percentage: 0.0,
    weight_in_grams: 0,
    volume_in_liters: 0.0,
    category_name: 'OTHER',
    flavour_name: null,
    volume_name: null,
    brand_name: null,
    shelf_life_name: null,
    sub_category_name: null,
    target_group_name: null,
    web_order_group_name: null,
    is_active: 'Y',
  },
];

/**
 * Seed Products with mock data
 */
export async function seedProducts(): Promise<void> {
  try {
    const categories = await prisma.product_categories.findMany({
      select: { id: true, category_name: true },
    });

    const subCategories = await prisma.product_sub_categories.findMany({
      select: {
        id: true,
        sub_category_name: true,
        product_category_id: true,
      },
    });

    const brands = await prisma.brands.findMany({
      select: { id: true, name: true },
    });

    const units = await prisma.unit_of_measurement.findMany({
      select: { id: true, name: true },
    });

    const productTypes = await prisma.product_type.findMany({
      select: { id: true, name: true },
    });

    const targetGroups = await prisma.product_target_group.findMany({
      select: { id: true, name: true },
    });

    const webOrders = await prisma.product_web_order.findMany({
      select: { id: true, name: true },
    });

    const volumes = await prisma.product_volumes.findMany({
      select: { id: true, name: true },
    });

    const flavours = await prisma.product_flavours.findMany({
      select: { id: true, name: true },
    });

    const shelfLives = await prisma.product_shelf_life.findMany({
      select: { id: true, name: true },
    });

    const categoryMap = new Map(
      categories.map(cat => [cat.category_name, cat.id])
    );
    const subCategoryMap = new Map(
      subCategories.map(sc => [sc.sub_category_name, sc.id])
    );
    const brandMap = new Map(brands.map(b => [b.name, b.id]));
    const unitMap = new Map(units.map(u => [u.name, u.id]));
    const productTypeMap = new Map(productTypes.map(pt => [pt.name, pt.id]));
    const targetGroupMap = new Map(targetGroups.map(tg => [tg.name, tg.id]));
    const webOrderMap = new Map(webOrders.map(wo => [wo.name, wo.id]));
    const volumeMap = new Map(volumes.map(v => [v.name, v.id]));
    const flavourMap = new Map(flavours.map(f => [f.name, f.id]));
    const shelfLifeMap = new Map(shelfLives.map(sl => [sl.name, sl.id]));

    const defaultCategoryId = categoryMap.get('OTHER');
    const defaultBrandId = brandMap.get('COKE');
    const defaultUnitId = unitMap.get('Case');

    const otherCategoryId = categoryMap.get('OTHER');
    const otherSubCategories = otherCategoryId
      ? subCategories.filter(sc => sc.product_category_id === otherCategoryId)
      : [];
    const defaultSubCategoryId =
      otherSubCategories.length > 0 ? otherSubCategories[0].id : null;

    for (const product of mockProducts) {
      const existingProduct = await prisma.products.findFirst({
        where: { code: product.code },
      });

      if (existingProduct) {
        continue;
      }

      const categoryId =
        product.category_name && categoryMap.has(product.category_name)
          ? categoryMap.get(product.category_name)
          : defaultCategoryId;

      let subCategoryId: number | null = null;
      if (product.sub_category_name) {
        subCategoryId = subCategoryMap.get(product.sub_category_name) || null;
      } else if (categoryId) {
        const categorySubCategories = subCategories.filter(
          sc => sc.product_category_id === categoryId
        );
        subCategoryId =
          categorySubCategories.length > 0
            ? categorySubCategories[0].id
            : defaultSubCategoryId;
      } else {
        subCategoryId = defaultSubCategoryId;
      }

      const brandId = product.brand_name
        ? brandMap.get(product.brand_name)
        : defaultBrandId;

      if (!categoryId || !subCategoryId || !brandId || !defaultUnitId) {
        console.warn(
          `⚠️  Missing required fields for product: ${product.code} - ${product.name}`
        );
        continue;
      }

      const productTypeId = product.product_type
        ? productTypeMap.get(product.product_type)
        : null;

      const targetGroupId = product.target_group_name
        ? targetGroupMap.get(product.target_group_name)
        : null;

      const webOrderId = product.web_order_group_name
        ? webOrderMap.get(product.web_order_group_name)
        : null;

      const volumeId = product.volume_name
        ? volumeMap.get(product.volume_name)
        : null;

      const flavourId = product.flavour_name
        ? flavourMap.get(product.flavour_name)
        : null;

      const shelfLifeId = product.shelf_life_name
        ? shelfLifeMap.get(product.shelf_life_name)
        : null;

      await prisma.products.create({
        data: {
          name: product.name,
          code: product.code,
          category_id: categoryId,
          sub_category_id: subCategoryId,
          brand_id: brandId,
          unit_of_measurement: defaultUnitId,
          product_type_id: productTypeId,
          product_target_group_id: targetGroupId,
          product_web_order_id: webOrderId,
          volume_id: volumeId,
          flavour_id: flavourId,
          shelf_life_id: shelfLifeId,
          vat_percentage: product.vat_percentage,
          weight_in_grams: product.weight_in_grams,
          volume_in_liters: product.volume_in_liters,
          is_active: product.is_active,
          createdate: new Date(),
          createdby: 1,
          log_inst: 1,
        },
      });
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Clear Products data
 */
export async function clearProducts(): Promise<void> {
  try {
    const productCodes = mockProducts.map(p => p.code);

    for (const code of productCodes) {
      try {
        await prisma.products.deleteMany({
          where: { code },
        });
      } catch (error) {
        console.warn(
          `⚠️  Could not delete product with code ${code} due to foreign key constraints. It may be in use.`
        );
      }
    }
  } catch (error) {
    console.warn(
      '⚠️  Error clearing products. Some products may be in use and cannot be deleted.'
    );
    console.warn('Error:', error);
  }
}

export { mockProducts };
