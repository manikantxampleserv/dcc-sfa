/**
 * @fileoverview Auto-Generated Menu Permissions Hook
 * @description Generated automatically from menu items and backend modules
 * @generated-at 2026-04-01T12:26:16.708Z
 */

import { useCallback, useMemo } from 'react';
import type { MenuItem } from '../mock/sidebar';
import { AUTO_PERMISSION_MAPPINGS } from '../utils/permission-auto-generator';
import { usePermission } from './usePermission';

export const useMenuPermissions = () => {
  const executiveDashboardPerms = usePermission('executive-dashboard');
  const gradingDashboardPerms = usePermission('grading-dashboard');
  const reconciliationPerms = usePermission('reconciliation');
  const userPerms = usePermission('user');
  const rolePerms = usePermission('role');
  const depotPerms = usePermission('depot');
  const zonePerms = usePermission('zone');
  const regionPerms = usePermission('region');
  const districtPerms = usePermission('district');
  const cityPerms = usePermission('city');
  const currencyPerms = usePermission('currency');
  const routePerms = usePermission('route');
  const routeTypePerms = usePermission('route-type');
  const outletPerms = usePermission('outlet');
  const outletGroupPerms = usePermission('outlet-group');
  const assetTypePerms = usePermission('asset-type');
  const assetBrandPerms = usePermission('asset-brand');
  const assetSubTypesPerms = usePermission('asset-sub-types');
  const assetMasterPerms = usePermission('asset-master');
  const vehiclePerms = usePermission('vehicle');
  const brandPerms = usePermission('brand');
  const productCategoryPerms = usePermission('product-category');
  const productSubCategoryPerms = usePermission('product-sub-category');
  const unitOfMeasurementPerms = usePermission('unit-of-measurement');
  const productPerms = usePermission('product');
  const pricelistPerms = usePermission('pricelist');
  const salesTargetGroupPerms = usePermission('sales-target-group');
  const salesTargetPerms = usePermission('sales-target');
  const salesBonusRulePerms = usePermission('sales-bonus-rule');
  const kpiTargetPerms = usePermission('kpi-target');
  const surveyPerms = usePermission('survey');
  const promotionsPerms = usePermission('promotions');
  const orderPerms = usePermission('order');
  const deliveryPerms = usePermission('delivery');
  const returnPerms = usePermission('return');
  const paymentPerms = usePermission('payment');
  const invoicePerms = usePermission('invoice');
  const visitPerms = usePermission('visit');
  const assetMovementPerms = usePermission('asset-movement');
  const maintenancePerms = usePermission('maintenance');
  const installationPerms = usePermission('installation');
  const inspectionPerms = usePermission('inspection');
  const vanStockPerms = usePermission('van-stock');
  const stockMovementPerms = usePermission('stock-movement');
  const inventoryItemsPerms = usePermission('inventory-items');
  const competitorPerms = usePermission('competitor');
  const customerComplaintPerms = usePermission('customer-complaint');
  const outletCategoryPerms = usePermission('outlet-category');
  const outletTypePerms = usePermission('outlet-type');
  const outletChannelPerms = usePermission('outlet-channel');
  const productFlavourPerms = usePermission('product-flavour');
  const productVolumePerms = usePermission('product-volume');
  const productShelfLifePerms = usePermission('product-shelf-life');
  const productTypePerms = usePermission('product-type');
  const productTargetGroupPerms = usePermission('product-target-group');
  const productWebOrderPerms = usePermission('product-web-order');
  const taxMasterPerms = usePermission('tax-master');
  const locationPerms = usePermission('location');
  const routeEffectivenessPerms = usePermission('route-effectiveness');
  const reportPerms = usePermission('report');
  const approvalPerms = usePermission('approval');
  const exceptionPerms = usePermission('exception');
  const loginHistoryPerms = usePermission('login-history');
  const tokenPerms = usePermission('token');
  const settingPerms = usePermission('setting');
  const templatesPerms = usePermission('templates');

  const permissions = useMemo(
    () => ({
      'executive-dashboard': executiveDashboardPerms,
      'grading-dashboard': gradingDashboardPerms,
      reconciliation: reconciliationPerms,
      user: userPerms,
      role: rolePerms,
      depot: depotPerms,
      zone: zonePerms,
      region: regionPerms,
      district: districtPerms,
      city: cityPerms,
      currency: currencyPerms,
      route: routePerms,
      'route-type': routeTypePerms,
      outlet: outletPerms,
      'outlet-group': outletGroupPerms,
      'asset-type': assetTypePerms,
      'asset-brand': assetBrandPerms,
      'asset-sub-types': assetSubTypesPerms,
      'asset-master': assetMasterPerms,
      vehicle: vehiclePerms,
      brand: brandPerms,
      'product-category': productCategoryPerms,
      'product-sub-category': productSubCategoryPerms,
      'unit-of-measurement': unitOfMeasurementPerms,
      product: productPerms,
      pricelist: pricelistPerms,
      'sales-target-group': salesTargetGroupPerms,
      'sales-target': salesTargetPerms,
      'sales-bonus-rule': salesBonusRulePerms,
      'kpi-target': kpiTargetPerms,
      survey: surveyPerms,
      promotions: promotionsPerms,
      order: orderPerms,
      delivery: deliveryPerms,
      return: returnPerms,
      payment: paymentPerms,
      invoice: invoicePerms,
      visit: visitPerms,
      'asset-movement': assetMovementPerms,
      maintenance: maintenancePerms,
      installation: installationPerms,
      inspection: inspectionPerms,
      'van-stock': vanStockPerms,
      'stock-movement': stockMovementPerms,
      'inventory-items': inventoryItemsPerms,
      competitor: competitorPerms,
      'customer-complaint': customerComplaintPerms,
      'outlet-category': outletCategoryPerms,
      'outlet-type': outletTypePerms,
      'outlet-channel': outletChannelPerms,
      'product-flavour': productFlavourPerms,
      'product-volume': productVolumePerms,
      'product-shelf-life': productShelfLifePerms,
      'product-type': productTypePerms,
      'product-target-group': productTargetGroupPerms,
      'product-web-order': productWebOrderPerms,
      'tax-master': taxMasterPerms,
      location: locationPerms,
      'route-effectiveness': routeEffectivenessPerms,
      report: reportPerms,
      approval: approvalPerms,
      exception: exceptionPerms,
      'login-history': loginHistoryPerms,
      token: tokenPerms,
      setting: settingPerms,
      templates: templatesPerms,
    }),
    [
      executiveDashboardPerms,
      gradingDashboardPerms,
      reconciliationPerms,
      userPerms,
      rolePerms,
      depotPerms,
      zonePerms,
      regionPerms,
      districtPerms,
      cityPerms,
      currencyPerms,
      routePerms,
      routeTypePerms,
      outletPerms,
      outletGroupPerms,
      assetTypePerms,
      assetBrandPerms,
      assetSubTypesPerms,
      assetMasterPerms,
      vehiclePerms,
      brandPerms,
      productCategoryPerms,
      productSubCategoryPerms,
      unitOfMeasurementPerms,
      productPerms,
      pricelistPerms,
      salesTargetGroupPerms,
      salesTargetPerms,
      salesBonusRulePerms,
      kpiTargetPerms,
      surveyPerms,
      promotionsPerms,
      orderPerms,
      deliveryPerms,
      returnPerms,
      paymentPerms,
      invoicePerms,
      visitPerms,
      assetMovementPerms,
      maintenancePerms,
      installationPerms,
      inspectionPerms,
      vanStockPerms,
      stockMovementPerms,
      inventoryItemsPerms,
      competitorPerms,
      customerComplaintPerms,
      outletCategoryPerms,
      outletTypePerms,
      outletChannelPerms,
      productFlavourPerms,
      productVolumePerms,
      productShelfLifePerms,
      productTypePerms,
      productTargetGroupPerms,
      productWebOrderPerms,
      taxMasterPerms,
      locationPerms,
      routeEffectivenessPerms,
      reportPerms,
      approvalPerms,
      exceptionPerms,
      loginHistoryPerms,
      tokenPerms,
      settingPerms,
      templatesPerms,
    ]
  );

  const hasPermission = useCallback(
    (menuId: string): boolean => {
      const requiredModule = AUTO_PERMISSION_MAPPINGS[menuId];

      if (!requiredModule) {
        return true;
      }

      const modulePermission =
        permissions[requiredModule as keyof typeof permissions];
      return modulePermission?.isRead || modulePermission?.isCreate || false;
    },
    [permissions]
  );

  const filterMenuItems = useCallback(
    (items: MenuItem[]): MenuItem[] => {
      return items
        .map(item => {
          if (item.children && item.children.length > 0) {
            const filteredChildren = filterMenuItems(item.children);

            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
            return null;
          }

          return hasPermission(item.id) ? item : null;
        })
        .filter((item): item is MenuItem => item !== null);
    },
    [hasPermission]
  );

  const isLoading = useMemo(() => {
    return Object.values(permissions).some(p => p?.isLoading);
  }, [permissions]);

  return {
    hasPermission,
    filterMenuItems,
    isLoading,
  };
};
