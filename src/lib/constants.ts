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

export const SEGMENT_DEFINITIONS: Record<string, { title: string; short: string; detail: string; criteria: string; action: string; color: string }> = {
  'Power Shoppers': {
    title: 'Power Shoppers',
    short: 'Your most valuable loyalists',
    detail: 'High-frequency, high-value shoppers who consolidate most of their pharmacy spend at CW. They visit weekly or more, maintain large basket sizes, and actively engage with loyalty programs. CBA data confirms 70%+ of their pharmacy wallet flows through CW.',
    criteria: 'Retention score 70+, visits 4+/month, basket $80+',
    action: 'Protect & reward — exclusive offers, early access, premium service',
    color: '#003B73',
  },
  'Regular Shoppers': {
    title: 'Regular Shoppers',
    short: 'Consistent mid-tier contributors',
    detail: 'Reliable shoppers who visit 2-3 times per month with moderate basket values. They shop across multiple categories and represent the stable core of CW revenue. Some potential to upsell into Power Shopper territory with the right nudges.',
    criteria: 'Retention score 40-69, visits 2-3/month, basket $40-$80',
    action: 'Grow — category expansion offers, basket-building bundles',
    color: '#0072CE',
  },
  'Occasional Visitors': {
    title: 'Occasional Visitors',
    short: 'Light-touch, cherry-picking shoppers',
    detail: 'Shoppers who visit monthly or less, often for specific needs (scripts, seasonal items). They browse 1-2 categories and have lower share-of-wallet at CW. CBA data shows significant pharmacy spend at competitors.',
    criteria: 'Retention score 20-39, visits 1/month or less, narrow categories',
    action: 'Engage — targeted campaigns, category discovery, incentivise frequency',
    color: '#F7C600',
  },
  'New Customers': {
    title: 'New Customers',
    short: 'Recently acquired — the onboarding window',
    detail: 'Shoppers who joined in the last 90 days. Critical onboarding period where shopping habits form. Early behaviour (basket size, repeat visits, category count) predicts long-term segment placement. High-potential cohort.',
    criteria: 'Joined within 90 days, any spend level',
    action: 'Nurture — welcome offers, guided category discovery, loyalty sign-up',
    color: '#10B981',
  },
  'At-Risk': {
    title: 'At-Risk',
    short: 'Declining activity — churn imminent',
    detail: 'Previously active shoppers showing declining visit frequency, shrinking baskets, or no visit in 45+ days. CBA credit card data confirms spend shifting to competitor pharmacies. Revenue at risk without intervention.',
    criteria: 'No visit 45+ days, declining spend trend, retention score <20',
    action: 'Win-back — re-engagement SMS, personalised offers, competitive pricing',
    color: '#E30613',
  },
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
