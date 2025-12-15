/**
 * @fileoverview Auto-Generated Menu Permissions Hook
 * @description Generated automatically from menu items and backend modules
 * @generated-at 2025-12-15T11:00:16.536Z
 */

import { useCallback, useMemo } from 'react';
import { usePermission } from './usePermission';
import {
  AUTO_PERMISSION_MAPPINGS,
  type BackendModule,
} from '../utils/permission-auto-generator';
import type { MenuItem } from '../mock/sidebar';

export const useMenuPermissions = () => {
  const dashboardPerms = usePermission('dashboard' as BackendModule);
  const companyPerms = usePermission('company' as BackendModule);
  const userPerms = usePermission('user' as BackendModule);
  const rolePerms = usePermission('role' as BackendModule);
  const depotPerms = usePermission('depot' as BackendModule);
  const zonePerms = usePermission('zone' as BackendModule);
  const currencyPerms = usePermission('currency' as BackendModule);
  const routePerms = usePermission('route' as BackendModule);
  const routeTypePerms = usePermission('route-type' as BackendModule);
  const outletPerms = usePermission('outlet' as BackendModule);
  const outletGroupPerms = usePermission('outlet-group' as BackendModule);
  const assetTypePerms = usePermission('asset-type' as BackendModule);
  const assetMasterPerms = usePermission('asset-master' as BackendModule);
  const warehousePerms = usePermission('warehouse' as BackendModule);
  const vehiclePerms = usePermission('vehicle' as BackendModule);
  const brandPerms = usePermission('brand' as BackendModule);
  const productCategoryPerms = usePermission('product-category' as BackendModule);
  const productSubCategoryPerms = usePermission('product-sub-category' as BackendModule);
  const unitOfMeasurementPerms = usePermission('unit-of-measurement' as BackendModule);
  const productPerms = usePermission('product' as BackendModule);
  const pricelistPerms = usePermission('pricelist' as BackendModule);
  const salesTargetGroupPerms = usePermission('sales-target-group' as BackendModule);
  const salesTargetPerms = usePermission('sales-target' as BackendModule);
  const salesBonusRulePerms = usePermission('sales-bonus-rule' as BackendModule);
  const kpiTargetPerms = usePermission('kpi-target' as BackendModule);
  const surveyPerms = usePermission('survey' as BackendModule);
  const promotionsPerms = usePermission('promotions' as BackendModule);
  const orderPerms = usePermission('order' as BackendModule);
  const deliveryPerms = usePermission('delivery' as BackendModule);
  const returnPerms = usePermission('return' as BackendModule);
  const paymentPerms = usePermission('payment' as BackendModule);
  const invoicePerms = usePermission('invoice' as BackendModule);
  const creditNotePerms = usePermission('credit-note' as BackendModule);
  const visitPerms = usePermission('visit' as BackendModule);
  const assetMovementPerms = usePermission('asset-movement' as BackendModule);
  const maintenancePerms = usePermission('maintenance' as BackendModule);
  const installationPerms = usePermission('installation' as BackendModule);
  const inspectionPerms = usePermission('inspection' as BackendModule);
  const vanStockPerms = usePermission('van-stock' as BackendModule);
  const stockMovementPerms = usePermission('stock-movement' as BackendModule);
  const stockTransferPerms = usePermission('stock-transfer' as BackendModule);
  const competitorPerms = usePermission('competitor' as BackendModule);
  const customerComplaintPerms = usePermission('customer-complaint' as BackendModule);
  const customerCategoryPerms = usePermission('customer-category' as BackendModule);
  const customerTypePerms = usePermission('customer-type' as BackendModule);
  const customerChannelPerms = usePermission('customer-channel' as BackendModule);
  const productFlavourPerms = usePermission('product-flavour' as BackendModule);
  const productVolumePerms = usePermission('product-volume' as BackendModule);
  const productShelfLifePerms = usePermission('product-shelf-life' as BackendModule);
  const productTypePerms = usePermission('product-type' as BackendModule);
  const productTargetGroupPerms = usePermission('product-target-group' as BackendModule);
  const productWebOrderPerms = usePermission('product-web-order' as BackendModule);
  const locationPerms = usePermission('location' as BackendModule);
  const routeEffectivenessPerms = usePermission('route-effectiveness' as BackendModule);
  const erpSyncPerms = usePermission('erp-sync' as BackendModule);
  const reportPerms = usePermission('report' as BackendModule);
  const approvalPerms = usePermission('approval' as BackendModule);
  const exceptionPerms = usePermission('exception' as BackendModule);
  const alertPerms = usePermission('alert' as BackendModule);
  const profilePerms = usePermission('profile' as BackendModule);
  const loginHistoryPerms = usePermission('login-history' as BackendModule);
  const tokenPerms = usePermission('token' as BackendModule);
  const settingPerms = usePermission('setting' as BackendModule);

  const permissions = useMemo(() => ({
    'dashboard': dashboardPerms,
    'company': companyPerms,
    'user': userPerms,
    'role': rolePerms,
    'depot': depotPerms,
    'zone': zonePerms,
    'currency': currencyPerms,
    'route': routePerms,
    'route-type': routeTypePerms,
    'outlet': outletPerms,
    'outlet-group': outletGroupPerms,
    'asset-type': assetTypePerms,
    'asset-master': assetMasterPerms,
    'warehouse': warehousePerms,
    'vehicle': vehiclePerms,
    'brand': brandPerms,
    'product-category': productCategoryPerms,
    'product-sub-category': productSubCategoryPerms,
    'unit-of-measurement': unitOfMeasurementPerms,
    'product': productPerms,
    'pricelist': pricelistPerms,
    'sales-target-group': salesTargetGroupPerms,
    'sales-target': salesTargetPerms,
    'sales-bonus-rule': salesBonusRulePerms,
    'kpi-target': kpiTargetPerms,
    'survey': surveyPerms,
    'promotions': promotionsPerms,
    'order': orderPerms,
    'delivery': deliveryPerms,
    'return': returnPerms,
    'payment': paymentPerms,
    'invoice': invoicePerms,
    'credit-note': creditNotePerms,
    'visit': visitPerms,
    'asset-movement': assetMovementPerms,
    'maintenance': maintenancePerms,
    'installation': installationPerms,
    'inspection': inspectionPerms,
    'van-stock': vanStockPerms,
    'stock-movement': stockMovementPerms,
    'stock-transfer': stockTransferPerms,
    'competitor': competitorPerms,
    'customer-complaint': customerComplaintPerms,
    'customer-category': customerCategoryPerms,
    'customer-type': customerTypePerms,
    'customer-channel': customerChannelPerms,
    'product-flavour': productFlavourPerms,
    'product-volume': productVolumePerms,
    'product-shelf-life': productShelfLifePerms,
    'product-type': productTypePerms,
    'product-target-group': productTargetGroupPerms,
    'product-web-order': productWebOrderPerms,
    'location': locationPerms,
    'route-effectiveness': routeEffectivenessPerms,
    'erp-sync': erpSyncPerms,
    'report': reportPerms,
    'approval': approvalPerms,
    'exception': exceptionPerms,
    'alert': alertPerms,
    'profile': profilePerms,
    'login-history': loginHistoryPerms,
    'token': tokenPerms,
    'setting': settingPerms,
  }), [
    dashboardPerms,
    companyPerms,
    userPerms,
    rolePerms,
    depotPerms,
    zonePerms,
    currencyPerms,
    routePerms,
    routeTypePerms,
    outletPerms,
    outletGroupPerms,
    assetTypePerms,
    assetMasterPerms,
    warehousePerms,
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
    creditNotePerms,
    visitPerms,
    assetMovementPerms,
    maintenancePerms,
    installationPerms,
    inspectionPerms,
    vanStockPerms,
    stockMovementPerms,
    stockTransferPerms,
    competitorPerms,
    customerComplaintPerms,
    customerCategoryPerms,
    customerTypePerms,
    customerChannelPerms,
    productFlavourPerms,
    productVolumePerms,
    productShelfLifePerms,
    productTypePerms,
    productTargetGroupPerms,
    productWebOrderPerms,
    locationPerms,
    routeEffectivenessPerms,
    erpSyncPerms,
    reportPerms,
    approvalPerms,
    exceptionPerms,
    alertPerms,
    profilePerms,
    loginHistoryPerms,
    tokenPerms,
    settingPerms,
  ]);

  const hasPermission = useCallback(
    (menuId: string): boolean => {
      const requiredModule = AUTO_PERMISSION_MAPPINGS[menuId];
      
      if (!requiredModule) {
        return true;
      }
      
      const modulePermission = permissions[requiredModule as keyof typeof permissions];
      return (
        modulePermission?.isRead ||
        modulePermission?.isCreate ||
        modulePermission?.isUpdate ||
        modulePermission?.isDelete ||
        false
      );
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