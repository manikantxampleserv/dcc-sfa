/**
 * Reports React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchOrdersInvoicesReturnsReport,
  type ReportFilters,
  type ReportData,
} from '../services/reports/ordersInvoicesReturns';
import {
  fetchSalesVsTargetReport,
  type SalesVsTargetFilters,
  type SalesVsTargetData,
} from '../services/reports/salesVsTarget';
import {
  fetchAssetMovementStatusReport,
  type AssetMovementStatusFilters,
  type AssetMovementStatusData,
} from '../services/reports/assetMovementStatus';
import {
  fetchVisitFrequencyCompletionReport,
  type VisitFrequencyCompletionFilters,
  type VisitFrequencyCompletionData,
} from '../services/reports/visitFrequencyCompletion';
import {
  fetchPromoEffectivenessReport,
  type PromoEffectivenessFilters,
  type PromoEffectivenessData,
} from '../services/reports/promoEffectiveness';
import {
  fetchRegionTerritorySalesReport,
  type RegionTerritorySalesFilters,
  type RegionTerritorySalesData,
} from '../services/reports/regionTerritorySales';
import {
  fetchRepProductivityReport,
  type RepProductivityFilters,
  type RepProductivityData,
} from '../services/reports/repProductivity';
import {
  fetchCompetitorAnalysisReport,
  type CompetitorAnalysisData,
  type CompetitorAnalysisFilters,
} from '../services/reports/competitorAnalysis';
import {
  fetchOutstandingCollectionReport,
  type OutstandingCollectionFilters,
  type OutstandingCollectionData,
} from '../services/reports/outstandingCollection';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  ordersInvoicesReturns: (filters?: ReportFilters) =>
    [...reportKeys.lists(), 'orders-invoices-returns', filters] as const,
  salesVsTarget: (filters?: SalesVsTargetFilters) =>
    [...reportKeys.lists(), 'sales-vs-target', filters] as const,
  assetMovementStatus: (filters?: AssetMovementStatusFilters) =>
    [...reportKeys.lists(), 'asset-movement-status', filters] as const,
  visitFrequencyCompletion: (filters?: VisitFrequencyCompletionFilters) =>
    [...reportKeys.lists(), 'visit-frequency-completion', filters] as const,
  promoEffectiveness: (filters?: PromoEffectivenessFilters) =>
    [...reportKeys.lists(), 'promo-effectiveness', filters] as const,
  regionTerritorySales: (filters?: RegionTerritorySalesFilters) =>
    [...reportKeys.lists(), 'region-territory-sales', filters] as const,
  repProductivity: (filters?: RepProductivityFilters) =>
    [...reportKeys.lists(), 'rep-productivity', filters] as const,
  competitorAnalysis: (filters?: CompetitorAnalysisFilters) =>
    [...reportKeys.lists(), 'competitor-analysis', filters] as const,
  outstandingCollection: (filters?: OutstandingCollectionFilters) =>
    [...reportKeys.lists(), 'outstanding-collection', filters] as const,
};

/**
 * Hook to fetch Orders, Invoices, and Returns Report
 */
export const useOrdersInvoicesReturnsReport = (filters?: ReportFilters) => {
  return useQuery<ReportData>({
    queryKey: reportKeys.ordersInvoicesReturns(filters),
    queryFn: () => fetchOrdersInvoicesReturnsReport(filters),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch Sales vs Target Report
 */
export const useSalesVsTargetReport = (filters?: SalesVsTargetFilters) => {
  return useQuery<SalesVsTargetData>({
    queryKey: reportKeys.salesVsTarget(filters),
    queryFn: () => fetchSalesVsTargetReport(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch Asset Movement/Status Report
 */
export const useAssetMovementStatusReport = (
  filters?: AssetMovementStatusFilters
) => {
  return useQuery<AssetMovementStatusData>({
    queryKey: reportKeys.assetMovementStatus(filters),
    queryFn: () => fetchAssetMovementStatusReport(filters),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Hook to fetch Visit Frequency/Completion Report
 */
export const useVisitFrequencyCompletionReport = (
  filters?: VisitFrequencyCompletionFilters
) => {
  return useQuery<VisitFrequencyCompletionData>({
    queryKey: reportKeys.visitFrequencyCompletion(filters),
    queryFn: () => fetchVisitFrequencyCompletionReport(filters),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Hook to fetch Promo Effectiveness Report
 */
export const usePromoEffectivenessReport = (
  filters?: PromoEffectivenessFilters
) => {
  return useQuery<PromoEffectivenessData>({
    queryKey: reportKeys.promoEffectiveness(filters),
    queryFn: () => fetchPromoEffectivenessReport(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch Region/Territory Sales Report
 */
export const useRegionTerritorySalesReport = (
  filters?: RegionTerritorySalesFilters
) => {
  return useQuery<RegionTerritorySalesData>({
    queryKey: reportKeys.regionTerritorySales(filters),
    queryFn: () => fetchRegionTerritorySalesReport(filters),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Hook to fetch Rep Productivity Report
 */
export const useRepProductivityReport = (filters?: RepProductivityFilters) => {
  return useQuery<RepProductivityData>({
    queryKey: reportKeys.repProductivity(filters),
    queryFn: () => fetchRepProductivityReport(filters),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Hook to fetch Competitor Analysis Report
 */
export const useCompetitorAnalysisReport = (
  filters?: CompetitorAnalysisFilters
) => {
  return useQuery<CompetitorAnalysisData>({
    queryKey: reportKeys.competitorAnalysis(filters),
    queryFn: () => fetchCompetitorAnalysisReport(filters),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Hook to fetch Outstanding & Collection Report
 */
export const useOutstandingCollectionReport = (
  filters?: OutstandingCollectionFilters
) => {
  return useQuery<OutstandingCollectionData>({
    queryKey: reportKeys.outstandingCollection(filters),
    queryFn: () => fetchOutstandingCollectionReport(filters),
    staleTime: 3 * 60 * 1000,
  });
};
