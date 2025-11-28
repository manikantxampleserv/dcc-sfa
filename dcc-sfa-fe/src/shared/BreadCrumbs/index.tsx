import { CloseTwoTone } from '@mui/icons-material';
import { Chip } from '@mui/material';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BreadCrumbItem {
  id: string | number;
  navItem: string;
  navLink: string;
}

interface BreadCrumbsProps {
  navItem: string;
  navLink: string;
  id: string | number;
}

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ navItem, navLink, id }) => {
  const [breadCrumbs, setBreadCrumbs] = useState<BreadCrumbItem[]>([]);
  const [value, setValue] = useState<unknown>('');
  const { state } = useLocation();

  useEffect(() => {
    if (state) {
      setValue(state);
    }
  }, [state]);

  const navigate = useNavigate();

  const handleClose = (
    event: React.MouseEvent,
    id: string | number,
    index: number
  ) => {
    event.stopPropagation();

    if (index !== 0) {
      navigate(breadCrumbs[index - 1].navLink, { state: value });
    } else if (breadCrumbs.length > 1) {
      navigate(breadCrumbs[index + 1].navLink, { state: value });
    } else {
      return;
    }
    setBreadCrumbs(breadCrumbs.filter(item => item.id !== id));
  };

  useEffect(() => {
    setBreadCrumbs(prev => {
      const isNumericId = typeof navItem === 'string' && /^\d+$/.test(navItem);

      if (isNumericId && prev.length > 0) {
        const lastBreadcrumb = prev[prev.length - 1];
        if (lastBreadcrumb && lastBreadcrumb.id !== id) {
          const updatedBreadcrumbs = [...prev];
          updatedBreadcrumbs[updatedBreadcrumbs.length - 1] = {
            ...lastBreadcrumb,
            navItem: `${lastBreadcrumb.navItem} ${navItem}`,
            navLink,
            id,
          };
          return updatedBreadcrumbs;
        }
        return prev;
      }

      if (
        prev.length === 0 ||
        prev.filter(item => item.id === id).length === 0
      ) {
        return [...prev, { id, navItem, navLink }];
      }

      const existingIndex = prev.findIndex(item => item.id === id);
      if (existingIndex !== -1) {
        const updatedBreadcrumbs = [...prev];
        updatedBreadcrumbs[existingIndex] = { id, navItem, navLink };
        return updatedBreadcrumbs;
      }

      return prev;
    });
  }, [id, navItem, navLink]);

  useEffect(() => {
    document.title = navItem;
  }, [navItem]);

  return (
    <div className="flex !p-0 items-center gap-1 border-b overflow-x-auta border-gray-300">
      <div className="flex items-center hide-scrollbar gap-0.5 w-[84vw] transition-all duration-300 overflow-x-auto overflow-y-hidden breadcrambs rounded-lg px-0.5 py-1">
        {breadCrumbs.map((item, index) => {
          return (
            <Chip
              label={item.navItem?.replaceAll('-', ' ')}
              className={classNames(
                '!rounded-md flex items-center !capitalize !text-white px-2 py-1',
                item.id === id
                  ? '!text-white !bg-blue-600'
                  : '!text-white !bg-blue-300'
              )}
              onClick={() => navigate(item.navLink, { state: value })}
              onDelete={e => handleClose(e, item.id, index)}
              deleteIcon={<CloseTwoTone className="!text-white" />}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BreadCrumbs;
