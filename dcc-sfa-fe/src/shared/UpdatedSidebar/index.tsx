import { ChevronRight } from '@mui/icons-material';
import { Collapse, ListItemButton, Skeleton } from '@mui/material';
import { useMenuPermissions } from 'hooks/useMenuPermissions';
import type { MenuItem } from 'mock/sidebar';
import menuItems from 'mock/sidebar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchInput from 'shared/SearchInput';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { filterMenuItems, isLoading: permissionsLoading } =
    useMenuPermissions();

  const isActive = (href?: string) => {
    if (!href) return false;
    return (
      location.pathname === href || location.pathname.startsWith(href + '/')
    );
  };

  const matchesSearch = (text: string, query: string): boolean => {
    if (!query.trim()) return true;
    return text.toLowerCase().includes(query.toLowerCase());
  };

  const permissionFilteredItems = useMemo(() => {
    return filterMenuItems(menuItems);
  }, [filterMenuItems]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return permissionFilteredItems;

    const query = searchQuery.toLowerCase();
    return permissionFilteredItems
      .map(item => {
        const filteredChildren = item.children
          ?.map(child => {
            const childMatches = matchesSearch(child.label, query);
            const filteredGrandchildren = child.children?.filter(gc =>
              matchesSearch(gc.label, query)
            );
            const hasMatchingGrandchildren =
              filteredGrandchildren && filteredGrandchildren.length > 0;

            if (childMatches || hasMatchingGrandchildren) {
              return {
                ...child,
                children: hasMatchingGrandchildren
                  ? filteredGrandchildren
                  : child.children,
              };
            }
            return null;
          })
          .filter(Boolean) as MenuItem[];

        if (filteredChildren && filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as typeof menuItems;
  }, [searchQuery, permissionFilteredItems]);

  useEffect(() => {
    const findAndExpandParents = (items: typeof menuItems) => {
      items.forEach(item => {
        if (item.children) {
          item.children.forEach(child => {
            if (child.children) {
              const hasActiveGrandchild = child.children.some(gc =>
                isActive(gc.href)
              );
              if (hasActiveGrandchild) {
                setExpandedItems(prev => {
                  if (prev.has(child.id)) return prev;
                  return new Set(prev).add(child.id);
                });
              }
            }
          });
        }
      });
    };
    findAndExpandParents(permissionFilteredItems);
  }, [location.pathname, permissionFilteredItems]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const itemsToExpand = new Set<string>();
      filteredMenuItems.forEach(item => {
        item.children?.forEach(child => {
          if (child.children && child.children.length > 0) {
            itemsToExpand.add(child.id);
          }
        });
      });
      setExpandedItems(itemsToExpand);
    }
  }, [searchQuery, filteredMenuItems]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleNavigation = useCallback(
    (href: string) => {
      if (!href) return;

      const targetPath = href;
      const currentPath = location.pathname;
      const navigationState = { forceReload: Date.now() };

      if (targetPath === currentPath) {
        navigate(targetPath, {
          replace: true,
          state: navigationState,
        });
      } else {
        navigate(targetPath, {
          replace: false,
          state: navigationState,
        });
      }

      if (searchQuery.trim()) {
        setTimeout(() => {
          setSearchQuery('');
        }, 100);
      }
    },
    [navigate, location.pathname, searchQuery]
  );

  return (
    <div className="h-screen w-72 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
      <div className="p-3 border-b border-gray-200 flex items-center gap-2">
        <img
          src="/sfa.png"
          alt="DCC-SFA Logo"
          className="h-[42px] w-auto object-contain"
        />
        <div className="flex flex-col">
          <span className="font-bold text-[#004080] text-xl leading-tight">
            DCC-SFA
          </span>
          <span className="font-medium text-[#666666] text-xs leading-tight">
            Your Reliable IT Partner
          </span>
        </div>
      </div>
      <div className="p-3 border-b border-gray-200">
        <SearchInput
          placeholder="Search menu..."
          value={searchQuery}
          onChange={setSearchQuery}
          debounceMs={200}
          showClear={true}
          fullWidth={true}
          size="small"
        />
      </div>
      <div className="flex flex-col overflow-y-auto">
        {permissionsLoading ? (
          <div className="p-2 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(index => (
              <div key={index} className="flex items-center gap-2 p-2">
                <Skeleton
                  variant="rectangular"
                  width={24}
                  height={24}
                  className="!rounded"
                />
                <Skeleton variant="text" width="80%" height={24} />
              </div>
            ))}
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <span className="text-sm text-gray-500 text-center">
              {searchQuery.trim()
                ? `No menu items found matching "${searchQuery}"`
                : 'No menu items available'}
            </span>
          </div>
        ) : (
          filteredMenuItems.map(item => (
            <div key={item.id}>
              <div className="flex flex-col">
                <span className="text-sm px-2 py-2 leading-tight font-medium uppercase text-gray-600">
                  {item.label}
                </span>
                {item.children && item.children.length > 0 && (
                  <div className="flex flex-col p-1">
                    {item.children.map(child => {
                      const hasActiveChild = child.children?.some(gc =>
                        isActive(gc.href)
                      );
                      const isChildActive =
                        isActive(child.href) || hasActiveChild;
                      const isExpanded = expandedItems.has(child.id);
                      const hasChildren =
                        child.children && child.children.length > 0;

                      return (
                        <React.Fragment key={child.id}>
                          <ListItemButton
                            key={child.id}
                            onClick={() =>
                              hasChildren
                                ? toggleExpand(child.id)
                                : handleNavigation(child.href as string)
                            }
                            className={`group !justify-between !cursor-pointer !mb-0.5 !flex !items-center hover:!bg-blue-200 !rounded !p-1.5 !transition-colors !duration-300 ${
                              isChildActive ? '!bg-blue-200' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {child.icon && (
                                <div
                                  className={`flex items-center h-8 w-8 justify-center rounded transition-colors duration-300 ease-in-out ${
                                    isChildActive
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white'
                                  }`}
                                >
                                  <child.icon
                                    className={`pointer-events-none transition-colors duration-300 ${
                                      isChildActive
                                        ? 'text-white'
                                        : 'text-gray-600 group-hover:text-white'
                                    }`}
                                  />
                                </div>
                              )}
                              <span
                                className={`text-sm truncate !font-medium transition-colors duration-300 ease-in-out flex items-center gap-1 ${
                                  isChildActive
                                    ? 'text-blue-600 !font-semibold'
                                    : 'text-gray-600 group-hover:text-blue-600'
                                }`}
                              >
                                {child.label?.length > 22
                                  ? child.label?.slice(0, 22) + '...'
                                  : child.label}
                              </span>
                            </div>
                            {child.children && child.children.length > 0 && (
                              <div className="flex items-center gap-2">
                                <ChevronRight
                                  fontSize="small"
                                  className={`transition-all duration-300 ease-in-out ${
                                    isExpanded ? 'rotate-90' : ''
                                  } ${
                                    isChildActive
                                      ? 'text-blue-600'
                                      : 'text-gray-600 group-hover:text-blue-600'
                                  }`}
                                />
                              </div>
                            )}
                          </ListItemButton>

                          {child.children && child.children.length > 0 && (
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <div className="flex flex-col">
                                {child.children.map(grandchild => {
                                  const isGrandchildActive = isActive(
                                    grandchild.href
                                  );
                                  return (
                                    <ListItemButton
                                      key={grandchild.id}
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleNavigation(
                                          grandchild.href as string
                                        );
                                      }}
                                      className={`group !justify-between !cursor-pointer !flex !items-center hover:!bg-transparent !rounded !p-0 !pl-6 !transition-colors !duration-300`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`text-2xl transition-colors duration-300 ${
                                            isGrandchildActive
                                              ? 'text-blue-600'
                                              : 'text-gray-600 group-hover:text-blue-600'
                                          }`}
                                        >
                                          •
                                        </span>
                                        <span
                                          className={`text-sm truncate transition-colors !font-medium duration-300 ease-in-out flex items-center gap-1 ${
                                            isGrandchildActive
                                              ? 'text-blue-600 !font-semibold'
                                              : 'text-gray-600 group-hover:text-blue-600'
                                          }`}
                                        >
                                          {grandchild.label}
                                        </span>
                                      </div>
                                    </ListItemButton>
                                  );
                                })}
                              </div>
                            </Collapse>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
