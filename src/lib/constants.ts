export const STORE_NAME = 'George Street Pharmacy'

export const SEGMENT_THRESHOLDS = {
  power: 0.7,
  regular: 0.4,
  occasional: 0.2,
} as const

export const SEGMENT_COLORS: Record<string, string> = {
  'Power Shoppers': 'var(--color-seg-power)',
  'Regular Shoppers': 'var(--color-seg-regular)',
  'Occasional Visitors': 'var(--color-seg-occasional)',
  'New Customers': 'var(--color-seg-new)',
  'At-Risk': 'var(--color-seg-atrisk)',
}

export const SEGMENT_LABELS: Record<string, string> = {
  'Power Shoppers': 'Power Shoppers — Visit weekly+, high basket value',
  'Regular Shoppers': 'Regular Shoppers — Visit 2-3x/month, moderate spend',
  'Occasional Visitors': 'Occasional Visitors — Visit monthly or less',
  'New Customers': 'New Customers — Joined in last 90 days',
  'At-Risk': 'At-Risk — No visit in 45+ days, declining activity',
}

export const CATEGORIES = [
  'OTC Medicines',
  'Prescription',
  'Vitamins & Supplements',
  'Beauty & Skincare',
  'Personal Care',
  'Baby & Child',
  'First Aid',
  'Health Devices',
  'Fragrance',
  'Sun Care',
  'Weight Management',
  'Oral Care',
  'Eye Care',
  'Digestive Health',
  'Allergy & Sinus',
] as const

export const COHORT_TEMPLATES = [
  {
    id: 'lapsed-high-value',
    name: 'Lapsed High-Value Shoppers',
    description: 'Customers who spent $200+/month but haven\'t visited in 30+ days',
    filters: { minSpend: 200, minDaysSinceVisit: 30, segment: 'At-Risk' },
  },
  {
    id: 'new-high-potential',
    name: 'New High-Potential',
    description: 'New customers in the last 90 days with above-average basket',
    filters: { maxDaysSinceJoin: 90, minBasketValue: 45 },
  },
  {
    id: 'category-expanders',
    name: 'Category Expanders',
    description: 'Regular shoppers buying from 1-2 categories only',
    filters: { segment: 'Regular Shoppers', maxCategories: 2 },
  },
  {
    id: 'power-retainers',
    name: 'Power Shoppers to Protect',
    description: 'Top-tier customers — reward and retain',
    filters: { segment: 'Power Shoppers' },
  },
  {
    id: 'winback-occasional',
    name: 'Winback Occasional',
    description: 'Occasional visitors with past high-value purchases',
    filters: { segment: 'Occasional Visitors', minTotalSpend: 500 },
  },
] as const

export const INTERVENTION_TYPES = [
  { id: 'sms', label: 'SMS', icon: 'MessageSquare' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'instore', label: 'In-Store Offer', icon: 'Store' },
  { id: 'loyalty', label: 'Loyalty Points', icon: 'Gift' },
] as const
