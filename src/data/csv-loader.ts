import Papa from 'papaparse'
import { parse } from 'date-fns'
import type { Customer, StoreSummary, NationalBenchmark, CategoryData, SegmentBreakdown, Supplier, AudienceSegment, Segment } from './types'

const BASE = import.meta.env.BASE_URL

async function fetchAndParse<T>(url: string): Promise<T[]> {
  const response = await fetch(BASE + url)
  const text = await response.text()
  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => resolve(results.data),
      error: (err: Error) => reject(err),
    })
  })
}

function parseDate(str: string): Date {
  if (str.includes('-') && str.length === 10) {
    return parse(str, 'yyyy-MM-dd', new Date())
  }
  return parse(str, 'yyyy-MM', new Date())
}

function num(val: string | undefined): number {
  return parseFloat(val || '0') || 0
}

function computeOpportunityScore(
  segment: string,
  retentionScore: number,
  daysSinceLastVisit: number,
  avgBasketValue: number,
  nationalAvgBasket: number,
): number {
  let score = 0
  // Churn risk (40%)
  if (segment === 'At-Risk') score += 40
  else if (segment === 'Occasional Visitors') score += 25
  else if (daysSinceLastVisit > 30) score += 20
  else score += Math.max(0, (daysSinceLastVisit / 30) * 15)
  // Basket growth potential (35%)
  const basketRatio = avgBasketValue / Math.max(nationalAvgBasket, 1)
  if (basketRatio < 0.7) score += 35
  else if (basketRatio < 1.0) score += 20
  else score += 5
  // Retention gap (25%)
  score += Math.max(0, (100 - retentionScore) * 0.25)
  return Math.min(100, Math.round(score))
}

function computeAudienceSegment(
  segment: string,
  retentionScore: number,
  daysSinceLastVisit: number,
  totalSpend: number,
  categoryCount: number,
): AudienceSegment {
  if (segment === 'Power Shoppers' && retentionScore >= 70) return 'Retain_HighValue'
  if (segment === 'At-Risk' && daysSinceLastVisit >= 45) return 'Reactivate_Lapsed'
  if (segment === 'New Customers' && totalSpend > 100) return 'Convert_NewHigh'
  if ((segment === 'Regular Shoppers' || segment === 'Power Shoppers') && categoryCount <= 2) return 'Grow_CategoryExpand'
  return 'Nurture_LightTouch'
}

export async function loadCustomers(): Promise<Customer[]> {
  const raw = await fetchAndParse<Record<string, string>>('data/Shopper360_Customers.csv')
  return raw.map((r) => {
    const segment = (r['Segment'] || 'Regular Shoppers') as Segment
    const retentionScore = num(r['RetentionScore'])
    const daysSinceLastVisit = num(r['DaysSinceLastVisit'])
    const avgBasketValue = num(r['AvgBasketValue'])
    const nationalAvgBasket = num(r['NationalAvgBasket'])
    const totalSpend = num(r['TotalSpend'])
    const categoryCount = num(r['CategoryCount'])

    return {
      id: r['CustomerID'] || '',
      customerName: r['CustomerName'] || '',
      postcode: r['Postcode'] || '',
      joinDate: parseDate(r['JoinDate'] || '2025-01-01'),
      lastVisitDate: parseDate(r['LastVisitDate'] || '2025-01-01'),
      totalVisits: num(r['TotalVisits']),
      avgBasketValue,
      totalSpend,
      categoryCount,
      topCategory: r['TopCategory'] || '',
      secondCategory: r['SecondCategory'] || '',
      thirdCategory: r['ThirdCategory'] || '',
      daysSinceLastVisit,
      retentionScore,
      segment,
      onlineOrders: num(r['OnlineOrders']),
      inStoreVisits: num(r['InStoreVisits']),
      promotionRedemptions: num(r['PromotionRedemptions']),
      loyaltyPoints: num(r['LoyaltyPoints']),
      prevMonthSpend: num(r['PrevMonthSpend']),
      spendChange: num(r['SpendChange']),
      nationalAvgBasket,
      nationalAvgVisits: num(r['NationalAvgVisits']),
      opportunityScore: computeOpportunityScore(segment, retentionScore, daysSinceLastVisit, avgBasketValue, nationalAvgBasket),
      audienceSegment: computeAudienceSegment(segment, retentionScore, daysSinceLastVisit, totalSpend, categoryCount),
    }
  })
}

export async function loadSummary(): Promise<StoreSummary[]> {
  const raw = await fetchAndParse<Record<string, string>>('data/Shopper360_Summary.csv')
  return raw.map((r) => ({
    periodMonth: parseDate(r['PeriodMonth'] || '2025-01'),
    totalCustomers: num(r['TotalCustomers']),
    activeCustomers: num(r['ActiveCustomers']),
    newCustomers: num(r['NewCustomers']),
    avgBasketValue: num(r['AvgBasketValue']),
    totalRevenue: num(r['TotalRevenue']),
    visitCount: num(r['VisitCount']),
    retentionRate: num(r['RetentionRate']),
    churnRate: num(r['ChurnRate']),
    categoryPenetration_OTC: num(r['CategoryPenetration_OTC']),
    categoryPenetration_Scripts: num(r['CategoryPenetration_Scripts']),
    categoryPenetration_Beauty: num(r['CategoryPenetration_Beauty']),
    categoryPenetration_Vitamins: num(r['CategoryPenetration_Vitamins']),
    categoryPenetration_PersonalCare: num(r['CategoryPenetration_PersonalCare']),
  }))
}

export async function loadNational(): Promise<NationalBenchmark[]> {
  const raw = await fetchAndParse<Record<string, string>>('data/Shopper360_National.csv')
  return raw.map((r) => ({
    periodMonth: parseDate(r['PeriodMonth'] || '2025-01'),
    avgBasketValue_P25: num(r['AvgBasketValue_P25']),
    avgBasketValue_Median: num(r['AvgBasketValue_Median']),
    avgBasketValue_P75: num(r['AvgBasketValue_P75']),
    avgBasketValue_YourStore: num(r['AvgBasketValue_YourStore']),
    retentionRate_P25: num(r['RetentionRate_P25']),
    retentionRate_Median: num(r['RetentionRate_Median']),
    retentionRate_P75: num(r['RetentionRate_P75']),
    retentionRate_YourStore: num(r['RetentionRate_YourStore']),
    visitsPerCustomer_P25: num(r['VisitsPerCustomer_P25']),
    visitsPerCustomer_Median: num(r['VisitsPerCustomer_Median']),
    visitsPerCustomer_P75: num(r['VisitsPerCustomer_P75']),
    visitsPerCustomer_YourStore: num(r['VisitsPerCustomer_YourStore']),
  }))
}

export async function loadCategories(): Promise<CategoryData[]> {
  const raw = await fetchAndParse<Record<string, string>>('data/Shopper360_Categories.csv')
  return raw.map((r) => ({
    category: r['Category'] || '',
    revenue: num(r['Revenue']),
    transactions: num(r['Transactions']),
    avgItemsPerBasket: num(r['AvgItemsPerBasket']),
    crossSellRate: num(r['CrossSellRate']),
    topPairedCategory: r['TopPairedCategory'] || '',
    growthRate: num(r['GrowthRate']),
    nationalAvgRevenue: num(r['NationalAvgRevenue']),
  }))
}

export async function loadSuppliers(): Promise<Supplier[]> {
  const raw = await fetchAndParse<Record<string, string>>('data/Shopper360_Suppliers.csv')
  return raw.map((r) => ({
    mfrName: r['MFR_NAME'] || '',
    totalTYValue: num(r['Total_TY_Value']),
    mfrMarketSharePct: num(r['MFR_Market_Share_Pct']),
    yoyGrowth: num(r['YoY_Growth']),
    topCategories: (r['TopCategories'] || '').split(';').filter(Boolean),
    productCount: num(r['ProductCount']),
    avgPrice: num(r['AvgPrice']),
    yourStoreRevenue: num(r['YourStoreRevenue']),
    yourStoreShare: num(r['YourStoreShare']),
  }))
}

export async function loadSegments(): Promise<SegmentBreakdown[]> {
  const raw = await fetchAndParse<Record<string, string>>('data/Shopper360_Segments.csv')
  return raw.map((r) => ({
    periodMonth: parseDate(r['PeriodMonth'] || '2025-01'),
    segment: (r['Segment'] || 'Regular Shoppers') as Segment,
    customerCount: num(r['CustomerCount']),
    avgBasketValue: num(r['AvgBasketValue']),
    avgVisits: num(r['AvgVisits']),
    totalRevenue: num(r['TotalRevenue']),
    retentionRate: num(r['RetentionRate']),
  }))
}
