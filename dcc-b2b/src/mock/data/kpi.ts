export interface KPI {
  id: string;
  name: string;
  value: number; // The actual performance value
  target: string;
  targetValue: number; // The target as a number for progress bars
  weight: number; // The percentage weight
  unit: string; // '%', 'hrs', 'score', etc
  trend: 'up' | 'down' | 'neutral';
}

export interface KPICategory {
  id: string;
  name: string;
  weight: number;
  score: number;
  kpis: KPI[];
}

export interface KPIScorecardData {
  overallScore: number;
  classification: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Improvement Required';
  lastUpdated: string;
  categories: KPICategory[];
}

export const mockKPIData: KPIScorecardData = {
  overallScore: 84.5,
  classification: 'Gold',
  lastUpdated: '2026-08-27T08:00:00Z',
  categories: [
    {
      id: 'commercial',
      name: 'Commercial KPIs',
      weight: 30,
      score: 25.5, // out of 30
      kpis: [
        {
          id: 'sales-achievement',
          name: 'Sales Achievement',
          value: 92,
          target: '>90%',
          targetValue: 90,
          weight: 10,
          unit: '%',
          trend: 'up',
        },
        {
          id: 'volume-growth',
          name: 'Volume Growth',
          value: 8,
          target: '>5%',
          targetValue: 5,
          weight: 10,
          unit: '%',
          trend: 'up',
        },
        {
          id: 'sku-mix-achievement',
          name: 'SKU Mix Achievement',
          value: 85,
          target: '>90%',
          targetValue: 90,
          weight: 10,
          unit: '%',
          trend: 'down',
        },
      ],
    },
    {
      id: 'service',
      name: 'Service KPIs',
      weight: 30,
      score: 28.5, // out of 30
      kpis: [
        {
          id: 'order-fill-rate',
          name: 'Order Fill Rate',
          value: 98.5,
          target: '>98%',
          targetValue: 98,
          weight: 10,
          unit: '%',
          trend: 'up',
        },
        {
          id: 'order-accuracy',
          name: 'Order Accuracy',
          value: 99.2,
          target: '>99%',
          targetValue: 99,
          weight: 10,
          unit: '%',
          trend: 'neutral',
        },
        {
          id: 'on-time-delivery',
          name: 'On-Time Delivery',
          value: 96,
          target: '>95%',
          targetValue: 95,
          weight: 10,
          unit: '%',
          trend: 'up',
        },
      ],
    },
    {
      id: 'operational',
      name: 'Operational KPIs',
      weight: 20,
      score: 16.5, // out of 20
      kpis: [
        {
          id: 'inventory-accuracy',
          name: 'Inventory Accuracy',
          value: 97.5,
          target: '>98%',
          targetValue: 98,
          weight: 5,
          unit: '%',
          trend: 'down',
        },
        {
          id: 'stock-days-cover',
          name: 'Stock Days Cover',
          value: 12,
          target: '10-15 days',
          targetValue: 10,
          weight: 5,
          unit: 'days',
          trend: 'neutral',
        },
        {
          id: 'forecast-accuracy',
          name: 'Forecast Accuracy',
          value: 88,
          target: '>90%',
          targetValue: 90,
          weight: 5,
          unit: '%',
          trend: 'up',
        },
        {
          id: 'pod-completion',
          name: 'POD Completion Rate',
          value: 100,
          target: '100%',
          targetValue: 100,
          weight: 5,
          unit: '%',
          trend: 'up',
        },
      ],
    },
    {
      id: 'customer-service',
      name: 'Customer Service KPIs',
      weight: 20,
      score: 14.0, // out of 20
      kpis: [
        {
          id: 'complaint-rate',
          name: 'Complaint Rate',
          value: 1.2,
          target: '<1%',
          targetValue: 1,
          weight: 5,
          unit: '%',
          trend: 'down', // actually up in value which is bad, but visual trend for down is worse
        },
        {
          id: 'issue-resolution',
          name: 'Issue Resolution Time',
          value: 36,
          target: '<48 hrs',
          targetValue: 48,
          weight: 5,
          unit: 'hrs',
          trend: 'up',
        },
        {
          id: 'customer-satisfaction',
          name: 'Customer Satisfaction',
          value: 85,
          target: '>90%',
          targetValue: 90,
          weight: 5,
          unit: '%',
          trend: 'down',
        },
        {
          id: 'feedback-response',
          name: 'Feedback Response Rate',
          value: 95,
          target: '>90%',
          targetValue: 90,
          weight: 5,
          unit: '%',
          trend: 'up',
        },
      ],
    },
  ],
};
