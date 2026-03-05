export interface Customer {
  id: string
  customerName: string
  postcode: string
  joinDate: Date
  lastVisitDate: Date
  totalVisits: number
  avgBasketValue: number
  totalSpend: number
  categoryCount: number
  topCategory: string
  secondCategory: string
  thirdCategory: string
  daysSinceLastVisit: number
  retentionScore: number
  segment: Segment
  onlineOrders: number
  inStoreVisits: number
  promotionRedemptions: number
  loyaltyPoints: number
  prevMonthSpend: number
  spendChange: number
  nationalAvgBasket: number
  nationalAvgVisits: number
  // CBA credit card behavioural insights
  shareOfWallet: number
  totalPharmacySpend: number
  crossShopRetailer: string
  preferredChannel: string
  lifeStage: string
  avgMonthlyGrocerySpend: number
  healthConscious: string
  // computed
  opportunityScore: number
  audienceSegment: AudienceSegment
}

export type Segment =
  | 'Power Shoppers'
  | 'Regular Shoppers'
  | 'Occasional Visitors'
  | 'New Customers'
  | 'At-Risk'

export type AudienceSegment =
  | 'Retain_HighValue'
  | 'Grow_CategoryExpand'
  | 'Reactivate_Lapsed'
  | 'Convert_NewHigh'
  | 'Nurture_LightTouch'

export interface StoreSummary {
  periodMonth: Date
  totalCustomers: number
  activeCustomers: number
  newCustomers: number
  avgBasketValue: number
  totalRevenue: number
  visitCount: number
  retentionRate: number
  churnRate: number
  categoryPenetration_OTC: number
  categoryPenetration_Scripts: number
  categoryPenetration_Beauty: number
  categoryPenetration_Vitamins: number
  categoryPenetration_PersonalCare: number
}

export interface NationalBenchmark {
  periodMonth: Date
  avgBasketValue_P25: number
  avgBasketValue_Median: number
  avgBasketValue_P75: number
  avgBasketValue_YourStore: number
  retentionRate_P25: number
  retentionRate_Median: number
  retentionRate_P75: number
  retentionRate_YourStore: number
  visitsPerCustomer_P25: number
  visitsPerCustomer_Median: number
  visitsPerCustomer_P75: number
  visitsPerCustomer_YourStore: number
}

export interface CategoryData {
  category: string
  revenue: number
  transactions: number
  avgItemsPerBasket: number
  crossSellRate: number
  topPairedCategory: string
  growthRate: number
  nationalAvgRevenue: number
}

export interface SegmentBreakdown {
  periodMonth: Date
  segment: Segment
  customerCount: number
  avgBasketValue: number
  avgVisits: number
  totalRevenue: number
  retentionRate: number
}

export interface Supplier {
  mfrName: string
  totalTYValue: number
  mfrMarketSharePct: number
  yoyGrowth: number
  topCategories: string[]
  productCount: number
  avgPrice: number
  yourStoreRevenue: number
  yourStoreShare: number
}

export interface Cohort {
  id: string
  name: string
  description: string
  createdAt: Date
  customerIds: string[]
  filters?: CohortFilters
}

export interface CohortFilters {
  segment?: Segment
  minSpend?: number
  maxSpend?: number
  minBasketValue?: number
  maxBasketValue?: number
  minDaysSinceVisit?: number
  maxDaysSinceVisit?: number
  minDaysSinceJoin?: number
  maxDaysSinceJoin?: number
  maxCategories?: number
  minTotalSpend?: number
  postcodes?: string[]
}
