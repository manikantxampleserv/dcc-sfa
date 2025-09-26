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
  Typography,
} from '@mui/material';
import menuItems, { type MenuItem } from 'mock/sidebar';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(
    new Set(['dashboards'])
  );

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) return;

    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

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
    const isExpanded = expandedSections.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item);
    const isDirectActive = item.href === location.pathname;
    const Icon = item.icon;

    if (isCollapsed && level > 0) {
      return null;
    }

    return (
      <React.Fragment key={item.id}>
        {item.href && !hasChildren ? (
          <Tooltip title={isCollapsed ? item.label : ''} placement="right">
            <ListItem disablePadding sx={{ pl: level * 1 }}>
              <ListItemButton
                component={Link}
                to={item.href}
                className={`!min-h-10 !mx-1 !px-2 !py-1 !mb-px !rounded ${
                  isCollapsed ? '!justify-center' : '!justify-start'
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
                className={`!min-h-8 !py-1 !px-2 !mx-1 group !mb-px !rounded ${
                  isCollapsed ? '!justify-center' : '!justify-start'
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

        {hasChildren && (
          <Collapse
            in={isExpanded && !isCollapsed}
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
      {/* Header */}
      <div
        className={`!p-4 !border-b !border-gray-100 !flex !items-center ${
          isCollapsed ? '!justify-center' : '!justify-between'
        }`}
      >
        {!isCollapsed && (
          <Typography
            variant="h6"
            className="!font-bold !text-blue-600 !text-xl"
          >
            DCC-SFA
          </Typography>
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

      {/* Navigation */}
      <div className="!flex-1 !overflow-y-auto !pb-4">
        <List className="!py-1">
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </div>
    </div>
  );
};

export default Sidebar;
