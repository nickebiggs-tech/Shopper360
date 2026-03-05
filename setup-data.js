import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const OUTPUT_DIR = join(import.meta.dirname, 'public', 'data')
mkdirSync(OUTPUT_DIR, { recursive: true })

// ---------- helpers ----------
const rand = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.floor(rand(min, max + 1))
const pick = (arr) => arr[randInt(0, arr.length - 1)]
const pad = (n, len = 5) => String(n).padStart(len, '0')

const firstNames = ['Liam','Noah','Oliver','James','Elijah','William','Henry','Lucas','Benjamin','Jack','Alexander','Daniel','Matthew','Samuel','Joseph','David','Andrew','Thomas','Joshua','Ryan','Emma','Olivia','Ava','Sophia','Isabella','Mia','Charlotte','Amelia','Harper','Evelyn','Abigail','Emily','Elizabeth','Sofia','Ella','Madison','Scarlett','Grace','Chloe','Victoria','Riley','Aria','Lily','Hannah','Nora','Zoe','Stella','Leah','Hazel','Aurora','Savannah','Brooklyn','Bella','Claire','Lucy','Anna','Caroline','Sarah','Aaliyah','Genesis','Naomi','Elena','Maya','Willow','Paisley','Emilia','Quinn','Sadie','Piper','Ruby','Serenity','Violet','Penelope','Isla','Mila','Eva','Layla','Ivy','Kinsley','Alice','Madelyn','Mackenzie','Kylie','Aubrey','Adeline','Katherine','Eleanor','Josephine','Margaret','Lillian','Natalie','Hailey','Valentina','Melody','Delilah','Jasmine','Andrea','Julia','Camila','Ariana','Lydia','Allison','Peyton','Maria','Ellie','Brianna','Samantha','Vivian','Sydney','Reagan','Autumn','Gianna','Nevaeh','Kaylee','Alyssa','Madeline','Rose','Gabriella','Trinity','Lyla']
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Chen','Wang','Li','Zhang','Liu','Singh','Kumar','Patel','Kim','Park','O\'Brien','Murphy','Kelly','Sullivan','Walsh','Ryan','O\'Connor','Byrne','Doyle','Murray','Lynch','Brennan','Gallagher','Burke','Quinn','Duffy','Nolan','Kennedy','McCarthy','Daly','Hayes','Carroll','Hughes','Fitzgerald','O\'Neill','Power','Dunne','Long','Regan','Kavanagh']
const postcodes = ['2000','2010','2020','2025','2030','2040','2042','2050','2060','2065','2070','2075','2077','2080','2085','2090','2095','2100','2110','2112','2114','2120','2125','2130','2140','2145','2150','2153','2155','2160','2170','2176','2190','2195','2200','2205','2210','2216','2220','2224','2228','2230','2232','2234']
const categories = ['OTC Medicines','Prescription','Vitamins & Supplements','Beauty & Skincare','Personal Care','Baby & Child','First Aid','Health Devices','Fragrance','Sun Care','Weight Management','Oral Care','Eye Care','Digestive Health','Allergy & Sinus']
const segments = ['Power Shoppers','Regular Shoppers','Occasional Visitors','New Customers','At-Risk']
const segWeights = [0.12, 0.30, 0.28, 0.15, 0.15]

function weightedPick(items, weights) {
  const r = Math.random()
  let cum = 0
  for (let i = 0; i < items.length; i++) {
    cum += weights[i]
    if (r < cum) return items[i]
  }
  return items[items.length - 1]
}

function genDate(startDays, endDays) {
  const now = new Date('2026-03-01')
  const d = new Date(now)
  d.setDate(d.getDate() - randInt(startDays, endDays))
  return d.toISOString().split('T')[0]
}

function genCustomer(i) {
  const segment = weightedPick(segments, segWeights)
  let totalVisits, avgBasket, daysSinceLast, categoryCount, joinDaysAgo

  switch (segment) {
    case 'Power Shoppers':
      totalVisits = randInt(48, 120)
      avgBasket = rand(55, 140).toFixed(2)
      daysSinceLast = randInt(1, 10)
      categoryCount = randInt(5, 12)
      joinDaysAgo = randInt(180, 900)
      break
    case 'Regular Shoppers':
      totalVisits = randInt(20, 55)
      avgBasket = rand(30, 75).toFixed(2)
      daysSinceLast = randInt(3, 21)
      categoryCount = randInt(3, 8)
      joinDaysAgo = randInt(90, 730)
      break
    case 'Occasional Visitors':
      totalVisits = randInt(4, 22)
      avgBasket = rand(15, 50).toFixed(2)
      daysSinceLast = randInt(14, 60)
      categoryCount = randInt(1, 4)
      joinDaysAgo = randInt(60, 600)
      break
    case 'New Customers':
      totalVisits = randInt(1, 8)
      avgBasket = rand(20, 70).toFixed(2)
      daysSinceLast = randInt(1, 30)
      categoryCount = randInt(1, 4)
      joinDaysAgo = randInt(1, 90)
      break
    case 'At-Risk':
      totalVisits = randInt(10, 50)
      avgBasket = rand(25, 80).toFixed(2)
      daysSinceLast = randInt(45, 180)
      categoryCount = randInt(2, 6)
      joinDaysAgo = randInt(150, 900)
      break
  }

  const totalSpend = (totalVisits * parseFloat(avgBasket)).toFixed(2)
  const prevMonthSpend = (parseFloat(avgBasket) * rand(1, 5)).toFixed(2)
  const spendChange = (rand(-30, 30)).toFixed(1)
  const retentionScore = segment === 'Power Shoppers' ? randInt(75, 99)
    : segment === 'Regular Shoppers' ? randInt(50, 80)
    : segment === 'Occasional Visitors' ? randInt(25, 55)
    : segment === 'New Customers' ? randInt(40, 70)
    : randInt(5, 30)

  const custCategories = []
  const available = [...categories]
  for (let c = 0; c < Math.min(categoryCount, available.length); c++) {
    const idx = randInt(0, available.length - 1)
    custCategories.push(available[idx])
    available.splice(idx, 1)
  }

  const nationalAvgBasket = rand(32, 48).toFixed(2)
  const nationalAvgVisits = rand(18, 35).toFixed(0)
  const loyaltyPoints = Math.round(parseFloat(totalSpend) * rand(0.8, 1.5))
  const onlineOrders = segment === 'Power Shoppers' ? randInt(2, 20) : randInt(0, 5)
  const promoRedemptions = randInt(0, Math.min(totalVisits, 15))

  return [
    `CUST-${pad(i)}`,
    `${pick(firstNames)} ${pick(lastNames)}`,
    pick(postcodes),
    genDate(joinDaysAgo, joinDaysAgo),
    genDate(daysSinceLast, daysSinceLast),
    totalVisits,
    avgBasket,
    totalSpend,
    categoryCount,
    custCategories[0] || 'OTC Medicines',
    custCategories[1] || '',
    custCategories[2] || '',
    daysSinceLast,
    retentionScore,
    segment,
    onlineOrders,
    totalVisits - onlineOrders,
    promoRedemptions,
    loyaltyPoints,
    prevMonthSpend,
    spendChange,
    nationalAvgBasket,
    nationalAvgVisits,
  ].join(',')
}

// ---------- Generate Customers CSV ----------
const customerHeader = 'CustomerID,CustomerName,Postcode,JoinDate,LastVisitDate,TotalVisits,AvgBasketValue,TotalSpend,CategoryCount,TopCategory,SecondCategory,ThirdCategory,DaysSinceLastVisit,RetentionScore,Segment,OnlineOrders,InStoreVisits,PromotionRedemptions,LoyaltyPoints,PrevMonthSpend,SpendChange,NationalAvgBasket,NationalAvgVisits'
const customerRows = [customerHeader]
for (let i = 1; i <= 5200; i++) {
  customerRows.push(genCustomer(i))
}
writeFileSync(join(OUTPUT_DIR, 'Shopper360_Customers.csv'), customerRows.join('\n'))
console.log(`Generated ${customerRows.length - 1} customers`)

// ---------- Generate Summary CSV ----------
const summaryHeader = 'PeriodMonth,TotalCustomers,ActiveCustomers,NewCustomers,AvgBasketValue,TotalRevenue,VisitCount,RetentionRate,ChurnRate,CategoryPenetration_OTC,CategoryPenetration_Scripts,CategoryPenetration_Beauty,CategoryPenetration_Vitamins,CategoryPenetration_PersonalCare'
const summaryRows = [summaryHeader]
const months = ['2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03']
let baseCust = 4200
months.forEach((m, idx) => {
  baseCust += randInt(50, 120)
  const active = Math.round(baseCust * rand(0.55, 0.72))
  const newCust = randInt(80, 200)
  const avgBasket = rand(36, 52).toFixed(2)
  const totalRev = Math.round(active * parseFloat(avgBasket) * rand(2.5, 4.2))
  const visits = Math.round(active * rand(2.2, 3.8))
  const retention = rand(62, 78).toFixed(1)
  const churn = (100 - parseFloat(retention)).toFixed(1)
  summaryRows.push(`${m},${baseCust},${active},${newCust},${avgBasket},${totalRev},${visits},${retention},${churn},${rand(65, 82).toFixed(1)},${rand(40, 58).toFixed(1)},${rand(25, 42).toFixed(1)},${rand(30, 48).toFixed(1)},${rand(35, 55).toFixed(1)}`)
})
writeFileSync(join(OUTPUT_DIR, 'Shopper360_Summary.csv'), summaryRows.join('\n'))
console.log(`Generated ${summaryRows.length - 1} summary rows`)

// ---------- Generate National Benchmarks ----------
const nationalHeader = 'PeriodMonth,AvgBasketValue_P25,AvgBasketValue_Median,AvgBasketValue_P75,AvgBasketValue_YourStore,RetentionRate_P25,RetentionRate_Median,RetentionRate_P75,RetentionRate_YourStore,VisitsPerCustomer_P25,VisitsPerCustomer_Median,VisitsPerCustomer_P75,VisitsPerCustomer_YourStore'
const nationalRows = [nationalHeader]
months.forEach(m => {
  const bP25 = rand(28, 34).toFixed(2)
  const bMed = rand(36, 44).toFixed(2)
  const bP75 = rand(46, 58).toFixed(2)
  const bYou = rand(38, 50).toFixed(2)
  const rP25 = rand(55, 62).toFixed(1)
  const rMed = rand(64, 72).toFixed(1)
  const rP75 = rand(74, 82).toFixed(1)
  const rYou = rand(66, 78).toFixed(1)
  const vP25 = rand(1.8, 2.4).toFixed(1)
  const vMed = rand(2.6, 3.2).toFixed(1)
  const vP75 = rand(3.4, 4.2).toFixed(1)
  const vYou = rand(2.8, 3.8).toFixed(1)
  nationalRows.push(`${m},${bP25},${bMed},${bP75},${bYou},${rP25},${rMed},${rP75},${rYou},${vP25},${vMed},${vP75},${vYou}`)
})
writeFileSync(join(OUTPUT_DIR, 'Shopper360_National.csv'), nationalRows.join('\n'))
console.log(`Generated ${nationalRows.length - 1} national benchmark rows`)

// ---------- Generate Categories CSV ----------
const catHeader = 'Category,Revenue,Transactions,AvgItemsPerBasket,CrossSellRate,TopPairedCategory,GrowthRate,NationalAvgRevenue'
const catRows = [catHeader]
categories.forEach(cat => {
  const rev = randInt(15000, 180000)
  const txn = randInt(200, 4500)
  const avgItems = rand(1.2, 3.8).toFixed(1)
  const crossSell = rand(15, 65).toFixed(1)
  const paired = pick(categories.filter(c => c !== cat))
  const growth = rand(-12, 25).toFixed(1)
  const natAvg = randInt(Math.round(rev * 0.6), Math.round(rev * 1.4))
  catRows.push(`${cat},${rev},${txn},${avgItems},${crossSell},${paired},${growth},${natAvg}`)
})
writeFileSync(join(OUTPUT_DIR, 'Shopper360_Categories.csv'), catRows.join('\n'))
console.log(`Generated ${catRows.length - 1} category rows`)

// ---------- Generate Segment Breakdown CSV ----------
const segHeader = 'PeriodMonth,Segment,CustomerCount,AvgBasketValue,AvgVisits,TotalRevenue,RetentionRate'
const segRows = [segHeader]
months.forEach(m => {
  segments.forEach(seg => {
    let count, basket, visits, retention
    switch (seg) {
      case 'Power Shoppers':
        count = randInt(400, 650); basket = rand(65, 110).toFixed(2); visits = rand(6, 12).toFixed(1); retention = rand(85, 96).toFixed(1); break
      case 'Regular Shoppers':
        count = randInt(1100, 1700); basket = rand(38, 62).toFixed(2); visits = rand(2.5, 5).toFixed(1); retention = rand(65, 80).toFixed(1); break
      case 'Occasional Visitors':
        count = randInt(900, 1500); basket = rand(22, 42).toFixed(2); visits = rand(1, 2.5).toFixed(1); retention = rand(35, 55).toFixed(1); break
      case 'New Customers':
        count = randInt(500, 900); basket = rand(28, 55).toFixed(2); visits = rand(1, 3).toFixed(1); retention = rand(45, 65).toFixed(1); break
      case 'At-Risk':
        count = randInt(500, 900); basket = rand(30, 55).toFixed(2); visits = rand(0.2, 1).toFixed(1); retention = rand(10, 30).toFixed(1); break
    }
    const rev = Math.round(count * parseFloat(basket) * parseFloat(visits))
    segRows.push(`${m},${seg},${count},${basket},${visits},${rev},${retention}`)
  })
})
writeFileSync(join(OUTPUT_DIR, 'Shopper360_Segments.csv'), segRows.join('\n'))
console.log(`Generated ${segRows.length - 1} segment breakdown rows`)

console.log('\nAll CSV files generated in public/data/')
