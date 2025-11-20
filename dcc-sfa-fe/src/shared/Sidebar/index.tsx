import { ChevronRight, ExpandMore, Menu, MenuOpen } from '@mui/icons-material';
import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { usePermission } from 'hooks/usePermission';
import menuItems, { type MenuItem } from 'mock/sidebar';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchInput from 'shared/SearchInput';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    'sidebar-collapsed',
    false
  );
  const [activeSection, setActiveSection] = useLocalStorage<string | null>(
    'sidebar-active-section',
    'dashboards'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const dashboardPerms = usePermission('dashboard');
  const companyPerms = usePermission('company');
  const userPerms = usePermission('user');
  const rolePerms = usePermission('role');
  const depotPerms = usePermission('depot');
  const zonePerms = usePermission('zone');
  const currencyPerms = usePermission('currency');
  const routePerms = usePermission('route');
  const routeTypePerms = usePermission('route-type');
  const outletPerms = usePermission('outlet');
  const outletGroupPerms = usePermission('outlet-group');
  const assetTypePerms = usePermission('asset-type');
  const assetMasterPerms = usePermission('asset-master');
  const warehousePerms = usePermission('warehouse');
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
  const customerComplaintPerms = usePermission('customer-complaint');
  const orderPerms = usePermission('order');
  const deliveryPerms = usePermission('delivery');
  const returnPerms = usePermission('return');
  const paymentPerms = usePermission('payment');
  const invoicePerms = usePermission('invoice');
  const creditNotePerms = usePermission('credit-note');
  const visitPerms = usePermission('visit');
  const assetMovementPerms = usePermission('asset-movement');
  const maintenancePerms = usePermission('maintenance');
  const installationPerms = usePermission('installation');
  const inspectionPerms = usePermission('inspection');
  const vanStockPerms = usePermission('van-stock');
  const stockMovementPerms = usePermission('stock-movement');
  const stockTransferPerms = usePermission('stock-transfer');
  const competitorPerms = usePermission('competitor');
  const reportPerms = usePermission('report');
  const routeEffectivenessPerms = usePermission('route-effectiveness');
  const erpSyncPerms = usePermission('erp-sync');
  const approvalPerms = usePermission('approval');
  const exceptionPerms = usePermission('exception');
  const alertPerms = usePermission('alert');
  const profilePerms = usePermission('profile');
  const loginHistoryPerms = usePermission('login-history');
  const tokenPerms = usePermission('token');
  const settingPerms = usePermission('setting');

  const hasPermissionForMenuItem = useCallback(
    (menuId: string): boolean => {
      const permissionMap: Record<string, boolean> = {
        'executive-dashboard': dashboardPerms.isRead,

        'company-master': companyPerms.isRead,
        'user-master': userPerms.isRead,
        'role-permission': rolePerms.isRead,
        depots: depotPerms.isRead,
        zones: zonePerms.isRead,
        currency: currencyPerms.isRead,
        routes: routePerms.isRead,
        'route-types': routeTypePerms.isRead,
        'outlet-master': outletPerms.isRead,
        'outlet-groups': outletGroupPerms.isRead,
        'asset-types': assetTypePerms.isRead,
        'asset-master': assetMasterPerms.isRead,
        'warehouse-master': warehousePerms.isRead,
        'vehicle-master': vehiclePerms.isRead,
        brands: brandPerms.isRead,
        'product-categories': productCategoryPerms.isRead,
        'product-sub-categories': productSubCategoryPerms.isRead,
        'unit-of-measurement': unitOfMeasurementPerms.isRead,
        'product-catalog': productPerms.isRead,
        products: productPerms.isRead,
        pricelists: pricelistPerms.isRead,
        'price-lists': pricelistPerms.isRead,
        'sales-target-groups': salesTargetGroupPerms.isRead,
        'sales-targets': salesTargetPerms.isRead,
        'sales-bonus-rules': salesBonusRulePerms.isRead,
        'kpi-targets': kpiTargetPerms.isRead,
        'survey-templates': surveyPerms.isRead,
        'customer-complaints': customerComplaintPerms.isRead,

        'order-entry': orderPerms.isRead,
        'delivery-scheduling': deliveryPerms.isRead,
        'return-requests': returnPerms.isRead,
        'payment-collection': paymentPerms.isRead,
        'invoice-management': invoicePerms.isRead,
        'credit-notes': creditNotePerms.isRead,
        'visit-logging': visitPerms.isRead,
        'asset-movement': assetMovementPerms.isRead,
        'asset-maintenance': maintenancePerms.isRead,
        'cooler-installations': installationPerms.isRead,
        'cooler-inspections': inspectionPerms.isRead,
        'van-stock': vanStockPerms.isRead,
        'stock-movements': stockMovementPerms.isRead,
        'stock-transfer-requests': stockTransferPerms.isRead,
        'competitor-activity': competitorPerms.isRead,

        'rep-location': reportPerms.isRead,
        'route-effectiveness': routeEffectivenessPerms.isRead,

        'orders-invoices-returns': reportPerms.isRead,
        'sales-vs-target': reportPerms.isRead,
        'asset-movement-status': reportPerms.isRead,
        'visit-frequency': reportPerms.isRead,
        'promo-effectiveness': reportPerms.isRead,
        'region-territory': reportPerms.isRead,
        'rep-productivity': reportPerms.isRead,
        'competitor-analysis': reportPerms.isRead,
        'outstanding-collection': reportPerms.isRead,
        'attendance-history': reportPerms.isRead,
        'sales-reports': reportPerms.isRead,
        'inventory-reports': reportPerms.isRead,
        'financial-reports': reportPerms.isRead,
        'performance-reports': reportPerms.isRead,
        'erp-sync-logs': erpSyncPerms.isRead,
        'activity-logs': reportPerms.isRead,
        'survey-responses': surveyPerms.isRead,

        'approval-setup': approvalPerms.isRead,
        'approval-requests': approvalPerms.isRead,
        'route-exceptions': exceptionPerms.isRead,
        'alerts-reminders': alertPerms.isRead,

        profile: profilePerms.isRead,
        'login-history': loginHistoryPerms.isRead,
        'api-tokens': tokenPerms.isRead,
        'system-settings': settingPerms.isRead,
      };

      return permissionMap[menuId] ?? true;
    },
    [
      dashboardPerms.isRead,
      companyPerms.isRead,
      userPerms.isRead,
      rolePerms.isRead,
      depotPerms.isRead,
      zonePerms.isRead,
      currencyPerms.isRead,
      routePerms.isRead,
      routeTypePerms.isRead,
      outletPerms.isRead,
      outletGroupPerms.isRead,
      assetTypePerms.isRead,
      assetMasterPerms.isRead,
      warehousePerms.isRead,
      vehiclePerms.isRead,
      brandPerms.isRead,
      productCategoryPerms.isRead,
      productSubCategoryPerms.isRead,
      unitOfMeasurementPerms.isRead,
      productPerms.isRead,
      pricelistPerms.isRead,
      salesTargetGroupPerms.isRead,
      salesTargetPerms.isRead,
      salesBonusRulePerms.isRead,
      kpiTargetPerms.isRead,
      surveyPerms.isRead,
      customerComplaintPerms.isRead,
      orderPerms.isRead,
      deliveryPerms.isRead,
      returnPerms.isRead,
      paymentPerms.isRead,
      invoicePerms.isRead,
      creditNotePerms.isRead,
      visitPerms.isRead,
      assetMovementPerms.isRead,
      maintenancePerms.isRead,
      installationPerms.isRead,
      inspectionPerms.isRead,
      vanStockPerms.isRead,
      stockMovementPerms.isRead,
      stockTransferPerms.isRead,
      competitorPerms.isRead,
      reportPerms.isRead,
      routeEffectivenessPerms.isRead,
      erpSyncPerms.isRead,
      approvalPerms.isRead,
      exceptionPerms.isRead,
      alertPerms.isRead,
      profilePerms.isRead,
      loginHistoryPerms.isRead,
      tokenPerms.isRead,
      settingPerms.isRead,
    ]
  );

  const filteredMenuItems = useMemo(() => {
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .map(item => {
          if (item.children && item.children.length > 0) {
            const filteredChildren = filterMenuItems(item.children);

            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
            return null;
          }

          return hasPermissionForMenuItem(item.id) ? item : null;
        })
        .filter((item): item is MenuItem => item !== null);
    };

    return filterMenuItems(menuItems);
  }, [hasPermissionForMenuItem]);

  const toggleSection = useCallback(
    (sectionId: string) => {
      if (isCollapsed) return;

      setActiveSection(prevActive => {
        if (prevActive === sectionId) {
          return null;
        } else {
          return sectionId;
        }
      });
    },
    [isCollapsed, setActiveSection]
  );

  const getAllMenuItems = useCallback((items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];

    const traverse = (menuItems: MenuItem[]) => {
      menuItems.forEach(item => {
        if (item.href) {
          result.push(item);
        }
        if (item.children) {
          traverse(item.children);
        }
      });
    };

    traverse(items);
    return result;
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      const normalizedValue = value.trim().toLowerCase();
      const normalizedLastQuery = lastSearchQuery.trim().toLowerCase();

      if (normalizedValue && normalizedValue !== normalizedLastQuery) {
        const findMatchingSections = (items: MenuItem[]): string[] => {
          const matchingSections: string[] = [];

          const traverse = (menuItems: MenuItem[]) => {
            menuItems.forEach(item => {
              if (item.children && item.children.length > 0) {
                const hasMatchingChild = item.children.some(child =>
                  child.label.toLowerCase().includes(normalizedValue)
                );
                const parentMatches = item.label
                  .toLowerCase()
                  .includes(normalizedValue);

                if (hasMatchingChild || parentMatches) {
                  matchingSections.push(item.id);
                }
                traverse(item.children);
              }
            });
          };

          traverse(items);
          return matchingSections;
        };

        const matchingSections = findMatchingSections(filteredMenuItems);

        if (matchingSections.length > 0) {
          const firstMatchingSection = matchingSections[0];
          if (!activeSection || !matchingSections.includes(activeSection)) {
            setActiveSection(firstMatchingSection);
          }
        }

        setLastSearchQuery(value);
      } else if (!normalizedValue) {
        setLastSearchQuery('');
      }
    },
    [setActiveSection, activeSection, lastSearchQuery]
  );

  const handleSearchEnter = useCallback(
    (searchValue: string) => {
      if (!searchValue.trim()) return;

      const allItems = getAllMenuItems(filteredMenuItems);
      const matchingItems = allItems.filter(item =>
        item.label.toLowerCase().includes(searchValue.toLowerCase())
      );

      if (matchingItems.length > 0 && matchingItems[0].href) {
        navigate(matchingItems[0].href);
        setSearchQuery('');
      }
    },
    [getAllMenuItems, navigate]
  );

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href) {
      return location.pathname === item.href;
    }
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item);
    const isDirectActive = item.href === location.pathname;
    const Icon = item.icon;

    if (isCollapsed && level > 0) {
      return null;
    }

    if (searchQuery.trim()) {
      if (hasChildren) {
        const hasMatchingChild = item.children?.some(child =>
          child.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const parentMatches = item.label
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        if (!hasMatchingChild && !parentMatches) {
          return null;
        }
      } else {
        if (!item.label.toLowerCase().includes(searchQuery.toLowerCase())) {
          return null;
        }
      }
    }

    return (
      <React.Fragment key={item.id}>
        {item.href && !hasChildren ? (
          <Tooltip title={isCollapsed ? item.label : ''} placement="right">
            <ListItem disablePadding sx={{ pl: level * 1 }}>
              <ListItemButton
                component={Link}
                to={item.href}
                className={`!min-h-10 !px-2 !py-1 !rounded ${
                  isCollapsed
                    ? '!justify-center !mx-1 !my-1'
                    : '!justify-start !mx-1 !mb-px'
                } ${isDirectActive ? '!text-blue-700' : '!text-gray-700'}`}
              >
                {Icon && level === 0 && (
                  <ListItemIcon
                    className={`!min-w-0 p-2 !justify-center ${
                      isCollapsed ? '!pr-0' : '!pr-3'
                    } ${isDirectActive ? '!text-blue-700' : '!text-gray-500'}`}
                  >
                    <Icon fontSize="large" />
                  </ListItemIcon>
                )}
                {level > 0 && !isCollapsed && (
                  <div
                    className={`!w-1.5 !h-1.5 !rounded-full !mr-3 !ml-1 ${
                      isDirectActive ? '!bg-blue-700' : '!bg-gray-400'
                    }`}
                  />
                )}
                <ListItemText
                  primary={item.label}
                  className={`${isCollapsed ? '!opacity-0' : '!opacity-100'}`}
                  slotProps={{
                    primary: {
                      className: `${level > 0 ? '!text-sm' : '!text-base'} ${
                        isDirectActive ? '!font-semibold' : '!font-medium'
                      }`,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ) : (
          <Tooltip title={isCollapsed ? item.label : ''} placement="right">
            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  hasChildren && !isCollapsed
                    ? toggleSection(item.id)
                    : undefined
                }
                className={`!min-h-8 !py-1 !px-2 group !rounded ${
                  isCollapsed
                    ? '!justify-center !mx-1 !my-1'
                    : '!justify-start !mx-1 !mb-px'
                } ${
                  isActive && !isCollapsed
                    ? '!bg-blue-100 !text-blue-700 hover:!bg-blue-200'
                    : isActive
                      ? '!bg-transparent !text-blue-700 hover:!bg-blue-200'
                      : '!bg-transparent !text-gray-700 hover:!bg-gray-100'
                }`}
              >
                {Icon && (
                  <ListItemIcon
                    className={`!min-w-0 !p-1 !justify-center !rounded ${
                      isCollapsed ? '!mr-0' : '!mr-2'
                    } ${isActive ? '!text-white !bg-blue-600' : '!text-gray-500 !bg-gray-100 group-hover:!bg-gray-200'}`}
                  >
                    <Icon />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.label}
                  className={`${isCollapsed ? '!opacity-0' : '!opacity-100'}`}
                  slotProps={{
                    primary: {
                      className: `${level > 0 ? '!text-sm' : '!text-base'} ${
                        isActive ? '!font-semibold' : '!font-medium'
                      }`,
                    },
                  }}
                />
                {hasChildren && !isCollapsed && (
                  <div
                    className={`${isActive ? '!text-blue-700' : '!text-gray-500'}`}
                  >
                    {isExpanded ? <ExpandMore /> : <ChevronRight />}
                  </div>
                )}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        )}

        {hasChildren && !isCollapsed && (
          <Collapse
            in={isExpanded}
            timeout={{ enter: 300, exit: 200 }}
            unmountOnExit
          >
            <List component="div" disablePadding>
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <div
      className={`!h-screen !bg-white !border-r !border-gray-200 !flex !flex-col !transition-all !duration-300 !ease-in-out ${
        isCollapsed ? '!w-16' : '!w-72'
      }`}
    >
      <div
        className={`!p-3 !border-b !border-gray-200 !flex !items-center ${
          isCollapsed ? '!justify-center' : '!justify-between'
        }`}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img
              src="/sfa.png"
              alt="DCC-SFA Logo"
              className="h-[42px] w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="!font-bold text-[#004080] !text-xl leading-tight">
                DCC-SFA
              </span>
              <span className="!font-medium text-[#666666] !text-xs leading-tight">
                Your Reliable IT Partner
              </span>
            </div>
          </div>
        )}

        <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <IconButton
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="small"
            className="!text-gray-500 hover:!text-gray-700"
          >
            {isCollapsed ? <MenuOpen /> : <Menu />}
          </IconButton>
        </Tooltip>
      </div>

      <div
        className={`!flex-1 ${isCollapsed ? '!overflow-hidden !px-1 !py-2' : '!overflow-y-auto'}`}
      >
        {!isCollapsed && (
          <div className="!px-3 !pt-3 !pb-2">
            <SearchInput
              placeholder="Search menus..."
              value={searchQuery}
              onChange={handleSearchChange}
              onEnterPress={handleSearchEnter}
              size="small"
              fullWidth={true}
              debounceMs={200}
              showClear={true}
            />
          </div>
        )}

        <List className={`${isCollapsed ? '!py-0' : '!py-1'}`}>
          {filteredMenuItems.map(item => renderMenuItem(item))}
        </List>
      </div>
    </div>
  );
};

export default Sidebar;
