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
import { useMenuPermissions } from 'hooks/useMenuPermissions';
import menuItems, { type MenuItem } from 'mock/sidebar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchInput from 'shared/SearchInput';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    'sidebar-collapsed',
    false
  );
  const [expandedSections, setExpandedSections] = useLocalStorage<string[]>(
    'sidebar-expanded-sections',
    ['dashboards']
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  const { filterMenuItems, isLoading } = useMenuPermissions();

  const filteredMenuItems = useMemo(() => {
    if (isLoading) return [];
    return filterMenuItems(menuItems);
  }, [filterMenuItems, isLoading]);

  const prevPathnameRef = React.useRef<string>('');
  const filteredMenuItemsRef = React.useRef<MenuItem[]>([]);

  useEffect(() => {
    filteredMenuItemsRef.current = filteredMenuItems;
  }, [filteredMenuItems]);

  useEffect(() => {
    if (isLoading || isCollapsed) return;
    if (prevPathnameRef.current === location.pathname) return;

    const findParentSections = (
      items: MenuItem[],
      targetPath: string,
      parents: string[] = []
    ): string[] => {
      for (const item of items) {
        if (item.href === targetPath) {
          return parents;
        }
        if (item.children && item.children.length > 0) {
          const found = findParentSections(item.children, targetPath, [
            ...parents,
            item.id,
          ]);
          if (found.length > 0) {
            return found;
          }
        }
      }
      return [];
    };

    const parentSections = findParentSections(
      filteredMenuItemsRef.current,
      location.pathname
    );

    if (parentSections.length > 0) {
      setExpandedSections(prevExpanded => {
        const newExpanded = [...new Set([...prevExpanded, ...parentSections])];
        if (
          newExpanded.length === prevExpanded.length &&
          newExpanded.every(id => prevExpanded.includes(id))
        ) {
          return prevExpanded;
        }
        return newExpanded;
      });
    }

    prevPathnameRef.current = location.pathname;
  }, [location.pathname, isLoading, isCollapsed, setExpandedSections]);

  const toggleSection = useCallback(
    (sectionId: string) => {
      if (isCollapsed) return;

      setExpandedSections(prevExpanded => {
        if (prevExpanded.includes(sectionId)) {
          return prevExpanded.filter(id => id !== sectionId);
        } else {
          return [...prevExpanded, sectionId];
        }
      });
    },
    [isCollapsed, setExpandedSections]
  );

  const getAllMenuItems = useCallback((items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];

    const traverse = (menuItems: MenuItem[], currentLevel: number = 0) => {
      menuItems.forEach(item => {
        if (currentLevel === 2 && item.href) {
          result.push(item);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children, currentLevel + 1);
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
        const findMatchingSections = (
          items: MenuItem[],
          level: number = 0
        ): string[] => {
          const matchingSections: string[] = [];

          const traverse = (menuItems: MenuItem[], currentLevel: number) => {
            menuItems.forEach(item => {
              if (
                currentLevel < 2 &&
                item.children &&
                item.children.length > 0
              ) {
                const hasMatchingChild = item.children.some(child => {
                  if (
                    currentLevel === 0 &&
                    child.children &&
                    child.children.length > 0
                  ) {
                    return (
                      child.children.some(grandchild =>
                        grandchild.label.toLowerCase().includes(normalizedValue)
                      ) || child.label.toLowerCase().includes(normalizedValue)
                    );
                  }
                  return child.label.toLowerCase().includes(normalizedValue);
                });
                const parentMatches = item.label
                  .toLowerCase()
                  .includes(normalizedValue);

                if (hasMatchingChild || parentMatches) {
                  matchingSections.push(item.id);
                }
                traverse(item.children, currentLevel + 1);
              }
            });
          };

          traverse(items, level);
          return matchingSections;
        };

        const matchingSections = findMatchingSections(filteredMenuItems);

        if (matchingSections.length > 0) {
          setExpandedSections(prevExpanded => {
            const newExpanded = [
              ...new Set([...prevExpanded, ...matchingSections]),
            ];
            return newExpanded;
          });
        }

        setLastSearchQuery(value);
      } else if (!normalizedValue) {
        setLastSearchQuery('');
      }
    },
    [setExpandedSections, lastSearchQuery, filteredMenuItems]
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

  const isItemActive = (item: MenuItem, level: number = 0): boolean => {
    if (level === 2 && item.href) {
      return location.pathname === item.href;
    }
    if (level < 2 && item.children && item.children.length > 0) {
      return item.children.some(child => isItemActive(child, level + 1));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedSections.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item);
    const isDirectActive = item.href === location.pathname;
    const Icon = item.icon;

    if (isCollapsed && level > 0) {
      return null;
    }

    if (searchQuery.trim()) {
      if (hasChildren) {
        const hasMatchingChild = item.children?.some(child => {
          if (child.children && child.children.length > 0) {
            return (
              child.children.some(grandchild =>
                grandchild.label
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ) || child.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          return child.label.toLowerCase().includes(searchQuery.toLowerCase());
        });
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

    const getPaddingLeft = () => {
      if (level === 0) return 0;
      if (level === 1) return 16;
      return 32;
    };

    return (
      <React.Fragment key={item.id}>
        {item.href && !hasChildren ? (
          <Tooltip title={isCollapsed ? item.label : ''} placement="right">
            <ListItem disablePadding>
              <Link
                to={item.href}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  width: '100%',
                }}
              >
                <ListItemButton
                  sx={{
                    pl: `${getPaddingLeft() + 12}px`,
                    pr: '12px',
                    py: '6px',
                    minHeight: '36px',
                  }}
                  className={`${
                    isDirectActive
                      ? '!bg-transparent !text-blue-600'
                      : '!bg-transparent !text-gray-700 hover:!bg-gray-100'
                  }`}
                >
                  <ListItemText
                    primary={item.label}
                    className={`${isCollapsed ? '!opacity-0' : '!opacity-100'}`}
                    slotProps={{
                      primary: {
                        className: `!text-sm ${
                          isDirectActive
                            ? '!font-medium !text-blue-600'
                            : '!font-normal !text-gray-700'
                        }`,
                      },
                    }}
                  />
                </ListItemButton>
              </Link>
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
                sx={{
                  pl: `${getPaddingLeft() + 12}px`,
                  pr: '12px',
                  py: level === 0 ? '10px' : '8px',
                  minHeight: level === 0 ? '44px' : '36px',
                }}
                className={`${
                  isActive && level === 1 && !isCollapsed
                    ? '!bg-blue-600 !text-black'
                    : isActive && level === 0
                      ? '!bg-blue-50 !text-blue-700'
                      : '!bg-transparent !text-gray-700 hover:!bg-gray-100'
                }`}
              >
                {Icon && level === 0 && (
                  <ListItemIcon
                    sx={{
                      minWidth: '40px',
                      mr: '12px',
                    }}
                    className={`!justify-center ${
                      isActive && level === 0
                        ? '!text-blue-600'
                        : '!text-gray-500'
                    }`}
                  >
                    <Icon fontSize="medium" />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.label}
                  className={`${isCollapsed ? '!opacity-0' : '!opacity-100'}`}
                  slotProps={{
                    primary: {
                      className: `!text-sm ${
                        isActive && level === 1
                          ? '!font-semibold !text-white'
                          : isActive && level === 0
                            ? '!font-semibold !text-blue-700'
                            : '!font-medium !text-gray-700'
                      }`,
                    },
                  }}
                />
                {hasChildren && !isCollapsed && (
                  <div
                    className={`!ml-auto ${
                      isActive && level === 1
                        ? '!text-white'
                        : isActive
                          ? '!text-blue-700'
                          : '!text-gray-500'
                    }`}
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

  if (isLoading) {
    return (
      <div className="!h-screen !bg-white !border-r !border-gray-200 !flex !items-center !justify-center !w-72">
        <div className="!text-gray-500">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div
      className={`!h-screen !bg-white !border-r !border-gray-200 !flex !flex-col !transition-all !duration-300 !ease-in-out ${
        isCollapsed ? '!w-16' : '!w-75'
      }`}
    >
      <div
        className={`!p-3 !border-b !border-gray-200 !flex !items-center ${
          isCollapsed ? '!justify-center' : '!justify-between'
        }`}
      >
        {!isCollapsed && (
          <div className="!flex !items-center !gap-3">
            <img
              src="/sfa.png"
              alt="DCC-SFA Logo"
              className="!h-[42px] !w-auto !object-contain"
            />
            <div className="!flex !flex-col">
              <span className="!font-bold !text-[#004080] !text-xl !leading-tight">
                DCC-SFA
              </span>
              <span className="!font-medium !text-[#666666] !text-xs !leading-tight">
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
