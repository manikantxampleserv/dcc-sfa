/**
 * @fileoverview Authentication Loading Component
 * @description Shows skeleton loading state while authentication is being verified
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import { Skeleton } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface AuthLoaderProps {
  message?: string;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({
  message = 'Loading your profile...',
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 8 + 2;
      });
    }, 600);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Layout Skeleton */}
      <div className="flex h-screen">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Skeleton
                variant="rectangular"
                width={32}
                height={32}
                className="!rounded-lg !bg-blue-600"
              />
              <Skeleton variant="text" width={100} height={24} />
            </div>
          </div>

          {/* Navigation Menu Skeleton */}
          <div className="flex-1 p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map(index => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 rounded-lg"
              >
                <Skeleton variant="rectangular" width={20} height={20} />
                <Skeleton variant="text" width={120} height={16} />
              </div>
            ))}
          </div>

          {/* User Profile Skeleton */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1">
                <Skeleton
                  variant="text"
                  width={80}
                  height={16}
                  className="!mb-1"
                />
                <Skeleton variant="text" width={60} height={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton variant="text" width={200} height={24} />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={40} height={40} />
              </div>
            </div>
          </div>

          {/* Content Area Skeleton */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Page Title Skeleton */}
            <div className="mb-6">
              <Skeleton
                variant="text"
                width={300}
                height={32}
                className="!mb-2"
              />
              <Skeleton variant="text" width={400} height={16} />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map(index => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={16}
                        className="!mb-2"
                      />
                      <Skeleton
                        variant="text"
                        width="40%"
                        height={28}
                        className="!mb-1"
                      />
                      <Skeleton variant="text" width="30%" height={14} />
                    </div>
                    <Skeleton
                      variant="rectangular"
                      width={48}
                      height={48}
                      className="!rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Card Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Table Header Skeleton */}
              <div className="flex items-center justify-between mb-6">
                <Skeleton variant="text" width={150} height={24} />
                <div className="flex items-center space-x-3">
                  <Skeleton
                    variant="rectangular"
                    width={200}
                    height={40}
                    className="!rounded-lg"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={40}
                    className="!rounded-lg"
                  />
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 pb-2 border-b border-gray-200">
                  {[1, 2, 3, 4, 5, 6].map(index => (
                    <Skeleton
                      key={index}
                      variant="text"
                      width="80%"
                      height={16}
                    />
                  ))}
                </div>

                {/* Table Rows */}
                {[1, 2, 3, 4, 5].map(rowIndex => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100"
                  >
                    {[1, 2, 3, 4, 5, 6].map(colIndex => (
                      <div
                        key={colIndex}
                        className="flex items-center space-x-2"
                      >
                        {colIndex === 1 && (
                          <Skeleton variant="circular" width={32} height={32} />
                        )}
                        <Skeleton variant="text" width="70%" height={16} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <Skeleton variant="text" width={150} height={16} />
                <div className="flex items-center space-x-2">
                  <Skeleton
                    variant="rectangular"
                    width={32}
                    height={32}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={32}
                    height={32}
                    className="!rounded"
                  />
                  <Skeleton
                    variant="rectangular"
                    width={32}
                    height={32}
                    className="!rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="p-8 text-center min-w-[400px] max-w-[500px]">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-sm sm:text-lg">D</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              DCC-SFA
            </span>
          </div>

          {/* Animated Loading Dots */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>

          {/* Funny Loading Message */}
          <div className="mb-4">
            <div className="text-sm text-gray-500">
              {Math.round(loadingProgress)}% complete
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>

          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoader;
