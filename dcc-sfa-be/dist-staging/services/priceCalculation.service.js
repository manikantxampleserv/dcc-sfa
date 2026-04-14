"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceCalculationService = void 0;
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
class PriceCalculationService {
    static async calculateInvoiceLineItem(params) {
        try {
            const priceListItem = await prisma_client_1.default.pricelist_items.findUnique({
                where: { id: params.pricelist_item_id },
                include: {
                    pricelist_items_products: true,
                    pricelist_item: {
                        include: {
                            pricelists_customer: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                            pricelists_route: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            pricelists_depot: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!priceListItem) {
                throw new Error('Price list item not found');
            }
            const product = priceListItem.pricelist_items_products;
            const priceList = priceListItem.pricelist_item;
            const unitPrice = Number(priceListItem.unit_price);
            const discountPercent = Number(priceListItem.discount_percent) || 0;
            const taxPercent = Number(priceListItem.tax_percent) || 0;
            const discountedPrice = unitPrice * (1 - discountPercent / 100);
            const taxAmount = discountedPrice * (taxPercent / 100);
            const finalUnitPrice = discountedPrice + taxAmount;
            const lineTotal = finalUnitPrice * params.quantity;
            return {
                pricelist_item_id: params.pricelist_item_id,
                product_id: priceListItem.product_id,
                quantity: params.quantity,
                unit_price: unitPrice,
                discount_percent: discountPercent,
                tax_percent: taxPercent,
                discounted_price: discountedPrice,
                tax_amount: taxAmount,
                final_unit_price: finalUnitPrice,
                line_total: lineTotal,
                price_list_used: {
                    id: priceList.id,
                    name: priceList.name,
                    level: this.getPriceListLevel(priceList),
                },
                product_details: {
                    id: product.id,
                    name: product.name,
                    code: product.code,
                    tracking_type: product.tracking_type,
                },
            };
        }
        catch (error) {
            throw new Error(`Price calculation failed: ${error.message}`);
        }
    }
    static async getPriceListForCustomer(customer_id, date) {
        const targetDate = date || new Date();
        let priceList = await prisma_client_1.default.pricelists.findFirst({
            where: {
                customer_id: customer_id,
                is_active: 'Y',
                valid_from: { lte: targetDate },
                valid_to: { gte: targetDate },
            },
            include: {
                pricelist_item: {
                    where: { is_active: 'Y' },
                    include: { pricelist_items_products: true },
                },
                pricelists_customer: {
                    select: { id: true, name: true, code: true },
                },
            },
            orderBy: [{ priority: 'asc' }],
        });
        let level = 'CUSTOMER';
        if (!priceList) {
            const customer = await prisma_client_1.default.customers.findUnique({
                where: { id: customer_id },
                select: { route_id: true, depot_id: true },
            });
            if (customer?.route_id) {
                const routePriceList = await prisma_client_1.default.pricelists.findFirst({
                    where: {
                        route_id: customer.route_id,
                        is_active: 'Y',
                        valid_from: { lte: targetDate },
                        valid_to: { gte: targetDate },
                    },
                    include: {
                        pricelist_item: {
                            where: { is_active: 'Y' },
                            include: { pricelist_items_products: true },
                        },
                        pricelists_route: {
                            select: { id: true, name: true },
                        },
                    },
                });
                if (routePriceList) {
                    priceList = routePriceList;
                    level = 'ROUTE';
                }
            }
        }
        if (!priceList) {
            const customer = await prisma_client_1.default.customers.findUnique({
                where: { id: customer_id },
                select: { depot_id: true },
            });
            if (customer?.depot_id) {
                const depotPriceList = await prisma_client_1.default.pricelists.findFirst({
                    where: {
                        depot_id: customer.depot_id,
                        is_active: 'Y',
                        valid_from: { lte: targetDate },
                        valid_to: { gte: targetDate },
                    },
                    include: {
                        pricelist_item: {
                            where: { is_active: 'Y' },
                            include: { pricelist_items_products: true },
                        },
                        pricelists_depot: {
                            select: { id: true, name: true },
                        },
                    },
                });
                if (depotPriceList) {
                    priceList = depotPriceList;
                    level = 'DEPOT';
                }
            }
        }
        if (!priceList) {
            const defaultPriceList = await prisma_client_1.default.pricelists.findFirst({
                where: {
                    is_default: 'Y',
                    is_active: 'Y',
                    valid_from: { lte: targetDate },
                    valid_to: { gte: targetDate },
                },
                include: {
                    pricelist_item: {
                        where: { is_active: 'Y' },
                        include: { pricelist_items_products: true },
                    },
                },
            });
            if (defaultPriceList) {
                priceList = defaultPriceList;
                level = 'DEFAULT';
            }
        }
        if (!priceList) {
            throw new Error('No valid price list found for customer');
        }
        return {
            level,
            priceList,
            reason: `${level.toLowerCase()} price list applied`,
        };
    }
    static getPriceListLevel(priceList) {
        if (priceList.customer_id)
            return 'CUSTOMER';
        if (priceList.route_id)
            return 'ROUTE';
        if (priceList.depot_id)
            return 'DEPOT';
        if (priceList.is_default === 'Y')
            return 'DEFAULT';
        return 'MANUAL';
    }
}
exports.PriceCalculationService = PriceCalculationService;
//# sourceMappingURL=priceCalculation.service.js.map