import React from 'react';
import { Store, Users, TrendingUp } from 'lucide-react';

export const BUSINESS_TYPES = [
  'Retail',
  'Wholesale',
  'Corporate',
  'Industrial',
  'Healthcare',
  'Automotive',
  'Restaurant',
  'Service',
  'Manufacturing',
  'Distribution',
] as const;

export const getBusinessTypeChipColor = (
  type: string
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning' => {
  switch ((type || '').toLowerCase()) {
    case 'retail':
      return 'primary';
    case 'wholesale':
      return 'success';
    case 'corporate':
      return 'warning';
    case 'industrial':
      return 'default';
    case 'healthcare':
      return 'info';
    case 'automotive':
      return 'error';
    case 'restaurant':
      return 'warning';
    case 'service':
      return 'secondary';
    case 'manufacturing':
      return 'info';
    case 'distribution':
      return 'success';
    default:
      return 'default';
  }
};

export const getBusinessTypeIcon = (type: string): React.ReactElement => {
  switch ((type || '').toLowerCase()) {
    case 'retail':
      return <Store className="w-4 h-4" />;
    case 'wholesale':
      return <Users className="w-4 h-4" />;
    case 'corporate':
      return <TrendingUp className="w-4 h-4" />;
    case 'industrial':
      return <TrendingUp className="w-4 h-4" />;
    case 'healthcare':
      return <Users className="w-4 h-4" />;
    case 'automotive':
      return <TrendingUp className="w-4 h-4" />;
    case 'restaurant':
      return <Users className="w-4 h-4" />;
    case 'service':
      return <TrendingUp className="w-4 h-4" />;
    case 'manufacturing':
      return <TrendingUp className="w-4 h-4" />;
    case 'distribution':
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <Store className="w-4 h-4" />;
  }
};
