import {
  ArrowBack,
  BusinessOutlined,
  DomainOutlined,
  FolderOpenOutlined,
  GroupOutlined,
  HomeOutlined,
  MapOutlined,
  PersonOutlined,
  RouteOutlined,
  StoreOutlined,
} from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import { useOrgChart, type TreeNode } from 'hooks/useOrgChart';
import React, { useMemo, useState } from 'react';
import { ActionButton } from 'shared/ActionButton';

const typeIconMap: Record<string, React.ReactElement> = {
  role: <GroupOutlined className="!size-6" />,
  company: <DomainOutlined className="!size-6" />,
  user: <PersonOutlined className="!size-6" />,
  depot: <BusinessOutlined className="!size-6" />,
  zone: <MapOutlined className="!size-6" />,
  route: <RouteOutlined className="!size-6" />,
  outlet: <StoreOutlined className="!size-6" />,
};

const typeColorMap: Record<string, string> = {
  role: 'text-teal-600 bg-teal-100',
  company: 'text-indigo-600 bg-indigo-100',
  user: 'text-blue-600 bg-blue-100',
  depot: 'text-purple-600 bg-purple-100',
  zone: 'text-orange-600 bg-orange-100',
  route: 'text-green-600 bg-green-100',
  outlet: 'text-red-600 bg-red-100',
};

const typeBorderMap: Record<string, string> = {
  role: 'border-teal-200 hover:border-teal-400',
  company: 'border-indigo-200 hover:border-indigo-400',
  user: 'border-blue-200 hover:border-blue-400',
  depot: 'border-purple-200 hover:border-purple-400',
  zone: 'border-orange-200 hover:border-orange-400',
  route: 'border-green-200 hover:border-green-400',
  outlet: 'border-red-200 hover:border-red-400',
};

const OrganizationChart: React.FC = () => {
  const { data = [], isLoading: loading } = useOrgChart();
  const [currentPath, setCurrentPath] = useState<TreeNode[]>([]);

  const currentGridNodes = useMemo(() => {
    let nodesToSort = data;
    if (currentPath.length > 0) {
      let currentNode = data;
      let foundNode: TreeNode | null = null;
      for (const pathItem of currentPath) {
        const match = currentNode.find(n => n.id === pathItem.id);
        if (match) {
          foundNode = match;
          currentNode = match.children || [];
        } else {
          break;
        }
      }
      nodesToSort = foundNode ? foundNode.children : data;
    }

    const typeOrder = [
      'company',
      'role',
      'user',
      'depot',
      'zone',
      'route',
      'outlet',
    ];

    return [...nodesToSort].sort((a, b) => {
      const weightA = typeOrder.indexOf(a.type.toLowerCase());
      const weightB = typeOrder.indexOf(b.type.toLowerCase());

      const wA = weightA === -1 ? 999 : weightA;
      const wB = weightB === -1 ? 999 : weightB;

      if (wA !== wB) {
        return wA - wB;
      }
      return a.label.localeCompare(b.label);
    });
  }, [currentPath, data]);

  return (
    <div className="flex flex-col select-none h-full bg-gray-50">
      {loading ? (
        <div className="flex flex-col w-full h-full">
          <div className="flex justify-between items-center mb-4">
            <Skeleton
              variant="rounded"
              width="40%"
              height={44}
              className="!rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
            {Array.from(new Array(12)).map((_, index) => (
              <div
                key={index}
                className="w-full flex flex-col items-center justify-start p-3 rounded-xl border-2 border-gray-100 shadow-sm bg-white"
              >
                <Skeleton
                  variant="rounded"
                  width={56}
                  height={56}
                  className="!rounded-xl mb-3"
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={20}
                  className="mb-1"
                />
                <Skeleton variant="text" width="40%" height={16} />
              </div>
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p className="text-gray-700 font-semibold text-lg">
            No Data Available
          </p>
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1 bg-white p-1.5 pr-2 rounded-xl border border-gray-200 shadow-sm max-w-[65%] sm:max-w-[70%]">
              <span className="shrink-0">
                <ActionButton
                  size="small"
                  onClick={() => setCurrentPath(prev => prev.slice(0, -1))}
                  disabled={currentPath.length === 0}
                  icon={<ArrowBack fontSize="small" />}
                  tooltip="Go Back"
                />
              </span>
              <div className="w-px h-5 bg-gray-300 mx-1 shrink-0"></div>

              <div className="flex items-center space-x-1 text-sm font-medium overflow-x-auto whitespace-nowrap flex-1 hide-scrollbar">
                <button
                  onClick={() => setCurrentPath([])}
                  className={`flex items-center transition-colors shrink-0 ${
                    currentPath.length === 0
                      ? 'text-gray-900 cursor-default'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <HomeOutlined className="!w-5 !h-5" /> Home
                </button>
                {currentPath.map((node, index) => {
                  const isLast = index === currentPath.length - 1;
                  const showNode =
                    currentPath.length <= 4 ||
                    index === 0 ||
                    index >= currentPath.length - 2;
                  const showEllipsis = currentPath.length > 4 && index === 1;

                  if (!showNode && !showEllipsis) return null;

                  if (showEllipsis) {
                    return (
                      <React.Fragment key="ellipsis">
                        <span className="text-gray-400 shrink-0">/</span>
                        <span className="text-gray-500 font-bold shrink-0 tracking-widest px-1">
                          ...
                        </span>
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={node.id}>
                      <span className="text-gray-400 shrink-0">/</span>
                      {isLast ? (
                        <span className="font-semibold !text-gray-700 flex items-center gap-1 shrink-0">
                          {typeIconMap[node.type] || <FolderOpenOutlined />}
                          <span
                            className="truncate max-w-[150px]"
                            title={node.label}
                          >
                            {node.label.split(' (')[0]}
                          </span>
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setCurrentPath(currentPath.slice(0, index + 1))
                          }
                          className="text-gray-600 cursor-pointer hover:text-blue-600 flex items-center gap-1 transition-colors shrink-0"
                          title={node.label}
                        >
                          {typeIconMap[node.type] || <FolderOpenOutlined />}
                          <span className="truncate max-w-[100px] sm:max-w-[120px]">
                            {node.label.split(' (')[0]}
                          </span>
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
            {currentGridNodes.map(node => {
              const hasChildren = node.children && node.children.length > 0;
              const Icon = typeIconMap[node.type] || <FolderOpenOutlined />;
              const borderClass =
                typeBorderMap[node.type] ||
                'border-gray-200 hover:border-gray-400';
              const highlightClass = 'bg-white';
              const colorClass =
                typeColorMap[node.type] || 'text-gray-600 bg-gray-100';

              const labelParts = node.label.split(' (');
              const displayName = labelParts[0];
              const displayCode =
                labelParts.length > 1
                  ? labelParts[1].replace(')', '')
                  : node.type;

              return (
                <div
                  onDoubleClick={() => {
                    if (hasChildren) {
                      setCurrentPath(prev => [...prev, node]);
                    }
                  }}
                  className={`w-full group relative flex flex-col items-center justify-start p-3 rounded-xl border-2 shadow-sm transition-all duration-200 ${borderClass} ${highlightClass} cursor-pointer`}
                >
                  {hasChildren && (
                    <div
                      className={`absolute top-2 right-2 z-10 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-semibold rounded ${colorClass}`}
                      title={`${node.children?.length} items`}
                    >
                      {node.children?.length}
                    </div>
                  )}
                  <div
                    className={`rounded-xl flex justify-center items-center mb-3 text-3xl p-3 transition-transform group-hover:scale-110 ${colorClass}`}
                  >
                    {Icon}
                  </div>
                  <p
                    className="font-semibold text-gray-800 text-xs sm:text-sm text-center break-words w-full leading-snug line-clamp-2"
                    title={node.label}
                  >
                    {displayName}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                    {displayCode}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationChart;
