const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public', 'data');

// Seeded PRNG for reproducibility
let seed = 42;
function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function randFloat(min, max, dec) { dec = dec || 2; return parseFloat((rand() * (max - min) + min).toFixed(dec)); }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

const MONTHS = ['2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03'];

function writeCsv(filename, headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(row.map(v => {
      const s = String(v);
      return (s.includes(',') || s.includes('"')) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(','));
  }
  const fp = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(fp, lines.join('\n') + '\n', 'utf8');
  const stat = fs.statSync(fp);
  console.log('  ' + filename + ': ' + (stat.size / 1024).toFixed(1) + ' KB (' + rows.length + ' rows)');
}

/*
 * ECONOMICS MODEL — Anchored on real CW data
 *
 * Average Australian pharmacy customer spends ~$400/year on OTC alone.
 * CW annual revenue ~$9.5B across ~3.2M tracked shoppers.
 * Average annual spend per shopper: ~$2,970/year = ~$247/month.
 *
 * Category share of wallet (annual per customer):
 *   Prescription:          $890  (30%)
 *   Vitamins & Supplements: $445  (15%)
 *   OTC Medicines:          $400  (13.5%) ← anchor
 *   Beauty & Skincare:      $267  (9%)
 *   Fragrance:              $237  (8%)
 *   Baby & Infant:          $149  (5%)
 *   Personal Care:          $134  (4.5%)
 *   Weight Management:      $119  (4%)
 *   Hair Care:              $89   (3%)
 *   Oral Care:              $74   (2.5%)
 *   First Aid:              $59   (2%)
 *   Eye Care:               $45   (1.5%)
 *   Sun & Tanning:          $30   (1%)
 *   Sports Nutrition:       $27   (0.9%)
 *   Natural Health:         $27   (0.9%)
 *   Medical Devices:        $22   (0.7%)
 *   Pet Care:               $15   (0.5%)
 *   Sexual Health:          $12   (0.4%)
 *   Quit Smoking:           $10   (0.3%)
 *   Incontinence:           $9    (0.3%)
 *   ─────────────────────────────────────
 *   TOTAL:                  ~$2,970/year = ~$247/month
 *
 * With 3.2M shoppers: $2,970 × 3.2M = $9.5B annual = ~$792M/month
 */

// ── FILE 1: Summary ──
// Monthly network totals. Revenue seasonal: winter peak (cold/flu Jun-Aug),
// summer dip (Dec-Feb), back-to-school bump (Feb-Mar).
function generateSummary() {
  const headers = ['PeriodMonth','TotalCustomers','ActiveCustomers','NewCustomers','AvgBasketValue','TotalRevenue','VisitCount','RetentionRate','ChurnRate','CategoryPenetration_OTC','CategoryPenetration_Scripts','CategoryPenetration_Beauty','CategoryPenetration_Vitamins','CategoryPenetration_PersonalCare'];
  // Seasonal revenue multiplier (Jun-Aug peak for cold/flu, Jan dip for summer)
  const seasonal = [0.97, 0.99, 1.08, 1.10, 1.06, 1.00, 0.98, 1.01, 1.04, 0.91, 0.88, 0.98];
  const rows = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const totalCust = Math.round(2840000 + 400000 * t);
    const activePct = 0.62 + t * 0.04 + (rand() - 0.5) * 0.008;
    const activeCust = Math.round(totalCust * activePct);
    const newCust = Math.round(42000 + t * 26000 + (rand() - 0.5) * 3000);
    const avgBasket = parseFloat((58.40 + t * 5.60 + (rand() - 0.5) * 0.80).toFixed(2));
    // Base ~$792M/month, with seasonal and slight growth
    const baseRev = 760000000 + t * 64000000;
    const totalRev = Math.round(baseRev * seasonal[i]);
    // ~3.2 visits/month per active customer
    const visitCount = Math.round(activeCust * (3.0 + t * 0.4 + (rand() - 0.5) * 0.1));
    const retRate = parseFloat((71.4 + t * 3.4 + (rand() - 0.5) * 0.3).toFixed(1));
    const churnRate = parseFloat((100 - retRate).toFixed(1));
    rows.push([MONTHS[i], totalCust, activeCust, newCust, avgBasket, totalRev, visitCount, retRate, churnRate,
      parseFloat((73 + t * 5 + (rand() - 0.5) * 0.8).toFixed(1)),
      parseFloat((46 + t * 6 + (rand() - 0.5) * 0.8).toFixed(1)),
      parseFloat((39 + t * 5 + (rand() - 0.5) * 0.8).toFixed(1)),
      parseFloat((56 + t * 6 + (rand() - 0.5) * 0.8).toFixed(1)),
      parseFloat((66 + t * 5 + (rand() - 0.5) * 0.8).toFixed(1))
    ]);
  }
  writeCsv('Shopper360_Summary.csv', headers, rows);
}

// ── FILE 2: Categories ──
// Monthly revenue = (annual per customer × 3.2M shoppers) / 12
// OTC: $400 × 3.2M / 12 = $106.7M/month
function generateCategories() {
  const headers = ['Category','Revenue','Transactions','AvgItemsPerBasket','CrossSellRate','TopPairedCategory','GrowthRate','NationalAvgRevenue'];
  const rows = [
    ['Prescription',        237000000, 6800000, 2.8, 24.4, 'OTC Medicines',          2.1, 285000000],
    ['Vitamins & Supplements',119000000, 3400000, 1.4, 58.2, 'Weight Management',     8.4, 107000000],
    ['OTC Medicines',        107000000, 5600000, 1.9, 42.1, 'First Aid',              3.7,  96000000],
    ['Beauty & Skincare',     71000000, 2600000, 2.6, 51.3, 'Personal Care',         12.1,  64000000],
    ['Fragrance',             63000000, 1500000, 1.2, 18.6, 'Beauty & Skincare',      5.3,  68000000],
    ['Baby & Infant',         40000000, 1500000, 2.9, 44.7, 'Personal Care',          6.8,  36000000],
    ['Personal Care',         36000000, 2800000, 2.2, 38.5, 'Beauty & Skincare',      1.9,  32000000],
    ['Weight Management',     32000000,  740000, 1.6, 32.8, 'Sports Nutrition',      15.2,  29000000],
    ['Hair Care',             24000000, 1500000, 2.1, 45.3, 'Beauty & Skincare',      4.1,  21000000],
    ['Oral Care',             20000000, 1800000, 2.4, 52.6, 'Personal Care',          2.8,  18000000],
    ['First Aid',             16000000, 1100000, 1.7, 36.9, 'OTC Medicines',          3.2,  14000000],
    ['Eye Care',              12000000,  560000, 1.3, 28.4, 'Prescription',           7.6,  11000000],
    ['Sun & Tanning',          8000000,  600000, 1.8, 41.2, 'Beauty & Skincare',      9.3,   7000000],
    ['Sports Nutrition',       7200000,  270000, 1.5, 27.6, 'Weight Management',     18.5,   6400000],
    ['Natural Health',         7200000,  410000, 1.4, 48.9, 'Vitamins & Supplements',11.3,   6400000],
    ['Medical Devices',        5900000,  180000, 1.1, 19.2, 'Prescription',           4.7,   7100000],
    ['Pet Care',               4000000,  240000, 2.0, 22.3, 'Personal Care',         22.1,   3000000],
    ['Sexual Health',          3200000,  210000, 1.2, 15.8, 'Personal Care',          1.4,   2900000],
    ['Quit Smoking',           2700000,  110000, 1.0, 12.4, 'OTC Medicines',         -3.2,   3300000],
    ['Incontinence',           2400000,  170000, 1.3, 18.7, 'Personal Care',          2.9,   2200000],
  ];
  writeCsv('Shopper360_Categories.csv', headers, rows);
}

// ── FILE 3: Segments ──
function generateSegments() {
  const headers = ['PeriodMonth','Segment','CustomerCount','AvgBasketValue','AvgVisits','TotalRevenue','RetentionRate'];
  const seasonal = [0.97,0.99,1.08,1.10,1.06,1.00,0.98,1.01,1.04,0.91,0.88,0.98];
  // Revenue shares must be proportional to spend-per-customer × count
  // Power: 12% of customers, ~$6,200/yr each → ~47% of revenue
  // Regular: 35%, ~$2,400/yr → ~31%
  // Occasional: 28%, ~$900/yr → ~10%
  // New: 15%, ~$1,200/yr → ~7%
  // At-Risk: 10%, ~$600/yr → ~5%
  const segs = [
    {name:'Power Shoppers',     pct:0.12, bMin:82,bMax:96,  vMin:5.6,vMax:6.4, rPct:0.47, retMin:92,retMax:95.5},
    {name:'Regular Shoppers',   pct:0.35, bMin:42,bMax:50,  vMin:2.6,vMax:3.0, rPct:0.31, retMin:72,retMax:76},
    {name:'Occasional Visitors',pct:0.28, bMin:28,bMax:36,  vMin:1.1,vMax:1.5, rPct:0.10, retMin:34,retMax:42},
    {name:'New Customers',      pct:0.15, bMin:35,bMax:44,  vMin:1.6,vMax:2.2, rPct:0.07, retMin:52,retMax:62},
    {name:'At-Risk',            pct:0.10, bMin:24,bMax:32,  vMin:0.2,vMax:0.5, rPct:0.05, retMin:11,retMax:18},
  ];
  const rows = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const totalCust = Math.round(2840000 + 400000 * t);
    const baseRev = 760000000 + t * 64000000;
    const totalRev = Math.round(baseRev * seasonal[i]);
    for (const seg of segs) {
      const custCount = Math.round(totalCust * seg.pct);
      const basket = parseFloat((seg.bMin + t * (seg.bMax - seg.bMin) + (rand() - 0.5) * 1.2).toFixed(2));
      const visits = parseFloat((seg.vMin + t * (seg.vMax - seg.vMin) + (rand() - 0.5) * 0.12).toFixed(1));
      const segRev = Math.round(totalRev * seg.rPct * (1 + (rand() - 0.5) * 0.03));
      const ret = parseFloat((seg.retMin + t * (seg.retMax - seg.retMin) + (rand() - 0.5) * 0.6).toFixed(1));
      rows.push([MONTHS[i], seg.name, custCount, basket, visits, segRev, ret]);
    }
  }
  writeCsv('Shopper360_Segments.csv', headers, rows);
}

// ── FILE 4: National ──
function generateNational() {
  const headers = ['PeriodMonth','AvgBasketValue_P25','AvgBasketValue_Median','AvgBasketValue_P75','AvgBasketValue_YourStore','RetentionRate_P25','RetentionRate_Median','RetentionRate_P75','RetentionRate_YourStore','VisitsPerCustomer_P25','VisitsPerCustomer_Median','VisitsPerCustomer_P75','VisitsPerCustomer_YourStore'];
  const seasonal = [0,0.01,0.03,0.04,0.02,0,-0.01,0,0.01,-0.03,-0.04,-0.01];
  const rows = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const s = seasonal[i];
    rows.push([MONTHS[i],
      parseFloat((38 + t * 4 + s * 8 + (rand() - 0.5) * 0.3).toFixed(2)),
      parseFloat((52 + t * 5 + s * 8 + (rand() - 0.5) * 0.3).toFixed(2)),
      parseFloat((68 + t * 6 + s * 8 + (rand() - 0.5) * 0.4).toFixed(2)),
      parseFloat((62 + t * 5 + s * 8 + (rand() - 0.5) * 0.4).toFixed(2)),
      parseFloat((56 + t * 4 + (rand() - 0.5) * 0.5).toFixed(1)),
      parseFloat((64 + t * 4 + (rand() - 0.5) * 0.4).toFixed(1)),
      parseFloat((74 + t * 4 + (rand() - 0.5) * 0.4).toFixed(1)),
      parseFloat((71 + t * 4 + (rand() - 0.5) * 0.4).toFixed(1)),
      parseFloat((1.4 + t * 0.4 + (rand() - 0.5) * 0.08).toFixed(1)),
      parseFloat((2.2 + t * 0.4 + (rand() - 0.5) * 0.08).toFixed(1)),
      parseFloat((3.4 + t * 0.5 + (rand() - 0.5) * 0.08).toFixed(1)),
      parseFloat((3.0 + t * 0.4 + (rand() - 0.5) * 0.08).toFixed(1)),
    ]);
  }
  writeCsv('Shopper360_National.csv', headers, rows);
}

// ── FILE 5: Suppliers ──
// YourStoreRevenue = what CW's network generates for this supplier annually
// Total_TY_Value = total Australian pharmacy market for this supplier
function generateSuppliers() {
  const headers = ['MFR_NAME','Total_TY_Value','MFR_Market_Share_Pct','YoY_Growth','TopCategories','ProductCount','AvgPrice','YourStoreRevenue','YourStoreShare'];
  const rows = [
    ['HALEON',                    892000000, 6.8,  2.1, 'OTC Medicines;Oral Care;Vitamins & Supplements',    485, 14.80, 824000000, 7.2],
    ['KENVUE',                    756000000, 6.2,  3.8, 'Personal Care;Baby & Infant;OTC Medicines',          412, 12.45, 698000000, 6.5],
    ['SANOFI CONSUMER HEALTHCARE',634000000, 5.1,  1.4, 'OTC Medicines;Vitamins & Supplements;Natural Health',328, 16.90, 572000000, 5.4],
    ['BLACKMORES GROUP',          528000000, 4.4,  7.2, 'Vitamins & Supplements;Natural Health;Sports Nutrition',296, 18.90, 512000000, 4.8],
    ['SWISSE (H&H GROUP)',        487000000, 4.1,  5.6, 'Vitamins & Supplements;Beauty & Skincare;Weight Management',264, 22.40, 468000000, 4.4],
    ['RECKITT BENCKISER',         445000000, 3.9,  2.3, 'OTC Medicines;Personal Care;Sexual Health',          342, 11.60, 398000000, 3.7],
    ['BAYER CONSUMER HEALTH',     412000000, 3.5, -0.8, 'OTC Medicines;Vitamins & Supplements;Medical Devices',278, 15.20, 378000000, 3.3],
    ['ASPEN PHARMACARE',          398000000, 3.3,  1.2, 'Prescription;OTC Medicines;Eye Care',                312, 16.80, 362000000, 3.1],
    ["L'OREAL AUSTRALIA",         367000000, 3.1,  9.4, 'Beauty & Skincare;Hair Care;Sun & Tanning',          224, 24.50, 356000000, 3.4],
    ['PROCTER & GAMBLE',          342000000, 2.9,  3.1, 'Personal Care;Oral Care;Hair Care',                  298, 10.80, 312000000, 2.8],
    ['JOHNSON & JOHNSON',         318000000, 2.7,  1.9, 'Baby & Infant;Personal Care;First Aid',              256, 13.40, 288000000, 2.5],
    ['COLGATE-PALMOLIVE',         295000000, 2.5,  2.7, 'Oral Care;Personal Care;Pet Care',                   186,  9.80, 274000000, 2.6],
    ['PERRIGO AUSTRALIA',         267000000, 2.3,  4.5, 'OTC Medicines;First Aid;Incontinence',               342,  8.60, 248000000, 2.4],
    ['VIATRIS',                   243000000, 2.1, -1.2, 'Prescription;OTC Medicines;Eye Care',                198, 18.40, 218000000, 1.9],
    ["NATURE'S OWN (SANOFI)",     224000000, 1.9,  6.3, 'Vitamins & Supplements;Natural Health;Weight Management',176, 16.20, 214000000, 2.0],
    ['COTY',                      198000000, 1.7,  8.1, 'Fragrance;Beauty & Skincare;Personal Care',          142, 32.80, 192000000, 1.8],
    ['CHURCH & DWIGHT',           176000000, 1.5,  3.4, 'Personal Care;Oral Care;First Aid',                  164, 11.20, 162000000, 1.4],
    ['EGO PHARMACEUTICALS',       154000000, 1.3,  5.7, 'Beauty & Skincare;Sun & Tanning;Baby & Infant',      128, 14.60, 148000000, 1.4],
    ['EDGEWELL PERSONAL CARE',    132000000, 1.1,  2.2, 'Personal Care;Sun & Tanning;Hair Care',               96, 12.40, 118000000, 1.0],
    ['VITA HEALTH GROUP',         118000000, 1.0, 11.8, 'Vitamins & Supplements;Sports Nutrition;Natural Health',84, 19.80, 116000000, 1.1],
  ];
  writeCsv('Shopper360_Suppliers.csv', headers, rows);
}

// ── FILE 6: Customers (8000 rows) ──
// Each row = one shopper from CW's loyalty/credit-card linked base.
// Spending anchored to the economics model above.
//
// Annual spend by segment:
//   Power:      $5,200-$12,800  (high frequency, big baskets, many categories)
//   Regular:    $1,800-$3,600   (steady monthly shoppers)
//   Occasional: $300-$1,200     (quarterly/seasonal shoppers)
//   New:        $80-$600        (just started, building habits)
//   At-Risk:    $400-$2,800     (were regular, now lapsed — lifetime value high)
/*
 * AUSTRALIAN SHOPPER BEHAVIOUR MODEL (CBA Credit Card Insights)
 *
 * CBA credit card transaction data reveals WHERE shoppers spend beyond CW:
 *
 * Average Australian household annual spending (ABS 2024-25):
 *   Groceries:           ~$12,480/yr ($240/week)
 *   Dining out:          ~$5,200/yr  ($100/week)
 *   Health & pharmacy:   ~$2,970/yr  (our CW anchor)
 *   Clothing & footwear: ~$2,600/yr
 *   Recreation:          ~$3,900/yr
 *
 * Pharmacy market share (Australian retail pharmacy):
 *   Chemist Warehouse:   ~28% market share (dominant)
 *   Priceline Pharmacy:  ~12%
 *   Terry White Chemmart:~8%
 *   Amcal:               ~6%
 *   Blooms The Chemist:  ~3%
 *   Discount Drug Stores:~4%
 *   Independent:         ~39%
 *
 * CW share of wallet by segment:
 *   Power:      60-85% (CW loyalists)
 *   Regular:    35-55% (shop around somewhat)
 *   Occasional: 15-35% (CW is secondary)
 *   New:        20-50% (still forming habits)
 *   At-Risk:    10-25% (shifted spend elsewhere)
 *
 * Channel preferences (post-COVID Australian pharmacy):
 *   In-Store:        72% of transactions
 *   Online:          18% of transactions
 *   Click & Collect: 10% of transactions
 *
 * Life stage distribution (Australian adult population):
 *   Young Adult (18-29):        22%
 *   Young Family (30-39):       20%
 *   Established Family (40-54): 25%
 *   Empty Nester (55-69):       20%
 *   Retiree (70+):              13%
 */
function generateCustomers() {
  const headers = ['CustomerID','CustomerName','Postcode','JoinDate','LastVisitDate','TotalVisits','AvgBasketValue','TotalSpend','CategoryCount','TopCategory','SecondCategory','ThirdCategory','DaysSinceLastVisit','RetentionScore','Segment','OnlineOrders','InStoreVisits','PromotionRedemptions','LoyaltyPoints','PrevMonthSpend','SpendChange','NationalAvgBasket','NationalAvgVisits','ShareOfWallet','TotalPharmacySpend','CrossShopRetailer','PreferredChannel','LifeStage','AvgMonthlyGrocerySpend','HealthConscious'];

  const firstNames = ['James','William','Oliver','Jack','Noah','Thomas','Henry','Leo','Charlie','Lucas','Liam','Ethan','Alexander','Oscar','Archie','George','Max','Harry','Chloe','Charlotte','Mia','Amelia','Olivia','Isla','Ava','Grace','Harper','Ella','Sophie','Emily','Lily','Isabella','Hannah','Sarah','Jessica','Emma','Madison','Zoe','Aria','Ruby','Matilda','Sienna','Willow','Phoebe','Evie','Aisha','Fatima','Priya','Wei','Mei','Yuki','Hana','Min','Ji','Soo','Kai','Ravi','Arjun','Ananya','Devi','Omar','Nadia','Yasmin','Hassan','Ali','Maria','Sofia','Elena','Marco','Luca','Andreas','Dimitri','Nikolai','Pierre','Jacques','Lars','Sven','Finn','Riley','Jayden','Zara','Chen','Daniel','Benjamin','Samuel','Nathan','Joshua','David','Michael','Ryan','Aiden','Logan','Mason','Jackson','Sebastian','Theodore','Caleb','Owen','Dylan','Luke'];

  const lastNames = ['Smith','Jones','Williams','Brown','Wilson','Taylor','Johnson','White','Martin','Anderson','Thompson','Walker','Harris','Lee','Robinson','Clark','Lewis','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Hill','Campbell','Mitchell','Roberts','Carter','Phillips','Evans','Turner','Torres','Parker','Collins','Edwards','Stewart','Nguyen','Chen','Wang','Li','Zhang','Patel','Singh','Kumar','Sharma','Khan','Ali','Rahman','Kim','Park','Tanaka','Nakamura','Sato',"O'Brien",'Murphy','Kelly',"O'Connor",'Sullivan','Ryan','Walsh','Murray','Papadopoulos','Costa','Silva','Ferrari','Schmidt','Mueller','Petrov','Johansson','Hansen','Nielsen','van den Berg','De Vries','Rossi','Martinez','Garcia','Lopez','Cooper','Morgan','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster'];

  // Weighted category pools: Prescription & OTC are most common top categories
  const topCatWeighted = ['Prescription','Prescription','Prescription','OTC Medicines','OTC Medicines','OTC Medicines','Vitamins & Supplements','Vitamins & Supplements','Beauty & Skincare','Beauty & Skincare','Fragrance','Personal Care','Baby & Infant','Hair Care','Weight Management','Oral Care','First Aid','Eye Care','Natural Health','Sports Nutrition'];
  const allCategories = ['Prescription','Vitamins & Supplements','OTC Medicines','Beauty & Skincare','Fragrance','Baby & Infant','Personal Care','Weight Management','Hair Care','Oral Care','First Aid','Eye Care','Sun & Tanning','Sports Nutrition','Natural Health','Medical Devices','Pet Care','Sexual Health','Quit Smoking','Incontinence'];

  // Cross-shopping retailers (where CBA sees CW shoppers also transact)
  const crossShopRetailers = [
    'Priceline Pharmacy', 'Priceline Pharmacy', 'Priceline Pharmacy',   // 30% weight (biggest competitor)
    'Terry White Chemmart', 'Terry White Chemmart',                       // 20%
    'Amcal', 'Amcal',                                                     // 15%
    'Discount Drug Stores',                                                // 10%
    'Blooms The Chemist',                                                  // 8%
    'My Chemist',                                                          // 5%
    'Star Discount Chemist',                                               // 5%
    'Good Price Pharmacy',                                                 // 4%
    'Woolworths Pharmacy',                                                 // 3%
  ];

  const lifeStages = ['Young Adult','Young Family','Established Family','Empty Nester','Retiree'];
  // Weighted for Australian demographics
  const lifeStageWeighted = [
    'Young Adult','Young Adult','Young Adult','Young Adult',               // 22%
    'Young Family','Young Family','Young Family','Young Family',           // 20%
    'Established Family','Established Family','Established Family','Established Family','Established Family', // 25%
    'Empty Nester','Empty Nester','Empty Nester','Empty Nester',           // 20%
    'Retiree','Retiree','Retiree',                                         // 13%
  ];

  const channels = ['In-Store','Online','Click & Collect'];

  function randomPostcode() {
    const r = rand();
    if (r < 0.35) return randInt(2000, 2999);   // Sydney/NSW
    if (r < 0.65) return randInt(3000, 3999);   // Melbourne/VIC
    if (r < 0.78) return randInt(4000, 4999);   // Brisbane/QLD
    if (r < 0.87) return randInt(5000, 5999);   // Adelaide/SA
    if (r < 0.95) return randInt(6000, 6999);   // Perth/WA
    return randInt(7000, 7999);                  // Tasmania
  }

  function fmtDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function randDate(start, end) {
    return new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
  }

  // Segment definitions with realistic spend-per-visit economics
  const segDefs = {
    'Power Shoppers': {
      count: 960,
      visits: [52, 168],       // weekly+ shoppers over their tenure
      basket: [78, 165],       // big baskets: scripts + vitamins + beauty
      spend: [5200, 12800],    // ~$5.2K-$12.8K annual
      catCount: [6, 14],
      retention: [80, 99],
      days: [0, 6],            // visited in last week
      online: [8, 40],
      loyalty: [12000, 48000],
      joinS: new Date('2023-01-15'), joinE: new Date('2024-06-30'),
      lastS: new Date('2026-02-24'), lastE: new Date('2026-03-05'),
      chg: [2, 28],
      // CBA insights
      sow: [60, 85],           // Share of wallet at CW
      grocery: [680, 1450],    // Monthly grocery spend ($)
      healthConscious: 0.65,   // 65% are health-conscious
      channelWeights: [0.55, 0.30, 0.15], // In-Store, Online, Click&Collect
      lifeStageWeights: [0.08, 0.18, 0.32, 0.28, 0.14], // skew older & families
    },
    'Regular Shoppers': {
      count: 2800,
      visits: [18, 56],        // 1.5-4.5x/month
      basket: [48, 78],        // moderate baskets
      spend: [1800, 3600],     // ~$1.8-3.6K annual
      catCount: [3, 8],
      retention: [56, 82],
      days: [1, 22],
      online: [1, 14],
      loyalty: [2000, 14000],
      joinS: new Date('2023-03-01'), joinE: new Date('2025-06-30'),
      lastS: new Date('2026-02-10'), lastE: new Date('2026-03-04'),
      chg: [-8, 18],
      sow: [35, 55],
      grocery: [720, 1380],
      healthConscious: 0.42,
      channelWeights: [0.72, 0.18, 0.10],
      lifeStageWeights: [0.20, 0.22, 0.26, 0.20, 0.12],
    },
    'Occasional Visitors': {
      count: 2240,
      visits: [3, 16],         // quarterly/seasonal
      basket: [32, 58],        // small/medium baskets
      spend: [300, 1200],      // ~$300-1.2K annual
      catCount: [1, 4],
      retention: [22, 52],
      days: [18, 80],
      online: [0, 3],
      loyalty: [100, 2800],
      joinS: new Date('2023-06-01'), joinE: new Date('2025-10-30'),
      lastS: new Date('2025-12-15'), lastE: new Date('2026-02-15'),
      chg: [-22, 12],
      sow: [15, 35],
      grocery: [580, 1250],
      healthConscious: 0.28,
      channelWeights: [0.78, 0.12, 0.10],
      lifeStageWeights: [0.30, 0.18, 0.22, 0.18, 0.12],
    },
    'New Customers': {
      count: 1200,
      visits: [1, 10],         // just started
      basket: [38, 72],        // exploring
      spend: [80, 600],        // early spend
      catCount: [1, 4],
      retention: [42, 74],
      days: [2, 30],
      online: [0, 5],
      loyalty: [20, 1800],
      joinS: new Date('2025-10-01'), joinE: new Date('2026-02-28'),
      lastS: new Date('2026-01-28'), lastE: new Date('2026-03-04'),
      chg: [8, 45],
      sow: [20, 50],
      grocery: [520, 1180],
      healthConscious: 0.38,
      channelWeights: [0.60, 0.28, 0.12],  // new customers skew more online
      lifeStageWeights: [0.35, 0.25, 0.20, 0.12, 0.08],  // skew younger
    },
    'At-Risk': {
      count: 800,
      visits: [10, 48],        // were active, now lapsed
      basket: [34, 64],        // used to spend more
      spend: [400, 2800],      // lifetime value
      catCount: [2, 6],
      retention: [4, 28],
      days: [50, 190],
      online: [0, 3],
      loyalty: [400, 5500],
      joinS: new Date('2023-01-15'), joinE: new Date('2025-03-30'),
      lastS: new Date('2025-06-01'), lastE: new Date('2026-01-12'),
      chg: [-35, -8],
      sow: [10, 25],           // shifted spend to competitors
      grocery: [600, 1300],
      healthConscious: 0.32,
      channelWeights: [0.82, 0.10, 0.08],
      lifeStageWeights: [0.15, 0.20, 0.25, 0.25, 0.15],
    },
  };

  const rows = [];
  let id = 1;
  const refDate = new Date('2026-03-05');

  for (const [segName, def] of Object.entries(segDefs)) {
    for (let c = 0; c < def.count; c++) {
      const custId = 'CUST-' + String(id).padStart(5, '0');
      const name = pick(firstNames) + ' ' + pick(lastNames);
      const postcode = randomPostcode();
      const joinDate = randDate(def.joinS, def.joinE);
      const lastVisitDate = randDate(def.lastS, def.lastE);
      const totalVisits = randInt(def.visits[0], def.visits[1]);
      const avgBasket = randFloat(def.basket[0], def.basket[1]);

      // TotalSpend = basket × visits, clamped to realistic range
      let totalSpend = parseFloat((avgBasket * totalVisits).toFixed(2));
      totalSpend = Math.max(def.spend[0], Math.min(def.spend[1], totalSpend));

      const catCount = randInt(def.catCount[0], def.catCount[1]);

      // Top category weighted toward high-revenue categories
      const topCat = pick(topCatWeighted);
      // Second/third from remaining categories
      const remaining = allCategories.filter(c => c !== topCat);
      const shuffled = [...remaining];
      for (let si = shuffled.length - 1; si > 0; si--) {
        const j = randInt(0, si);
        [shuffled[si], shuffled[j]] = [shuffled[j], shuffled[si]];
      }
      const secondCat = shuffled[0];
      const thirdCat = catCount >= 3 ? shuffled[1] : shuffled[0];

      const diffMs = refDate.getTime() - lastVisitDate.getTime();
      let daysSince = Math.max(0, Math.round(diffMs / 86400000));
      daysSince = Math.max(def.days[0], Math.min(def.days[1], daysSince));

      const retScore = randInt(def.retention[0], def.retention[1]);
      let onlineOrders = Math.min(randInt(def.online[0], def.online[1]), Math.max(0, totalVisits - 1));
      const inStoreVisits = totalVisits - onlineOrders;
      const promoRedemptions = randInt(0, Math.min(20, Math.round(totalVisits * 0.25)));
      const loyaltyPoints = randInt(def.loyalty[0], def.loyalty[1]);

      // PrevMonthSpend: estimate monthly run-rate
      const monthsActive = Math.max(1, Math.round((refDate.getTime() - joinDate.getTime()) / (30 * 86400000)));
      const monthlyEst = Math.max(0.5, totalVisits / monthsActive);
      const prevMonthSpend = parseFloat((avgBasket * monthlyEst * (0.75 + rand() * 0.5)).toFixed(2));

      const spendChange = randFloat(def.chg[0], def.chg[1]);
      const natAvgBasket = randFloat(54, 62);
      const natAvgVisits = randFloat(2.4, 2.8, 1);

      // ── Australian Shopper Behaviour fields (CBA credit card insights) ──

      // Share of wallet: % of total pharmacy spend at CW
      const shareOfWallet = randFloat(def.sow[0], def.sow[1], 1);

      // Total annual pharmacy spend across ALL retailers (derived from share of wallet)
      const annualCWSpend = totalSpend; // what they spend at CW
      const totalPharmacySpend = parseFloat((annualCWSpend / (shareOfWallet / 100)).toFixed(2));

      // Cross-shop retailer: where CBA sees them also spending
      const crossShop = shareOfWallet >= 75 ? 'None' : pick(crossShopRetailers);

      // Preferred channel (weighted by segment)
      const chanRoll = rand();
      let prefChannel;
      if (chanRoll < def.channelWeights[0]) prefChannel = 'In-Store';
      else if (chanRoll < def.channelWeights[0] + def.channelWeights[1]) prefChannel = 'Online';
      else prefChannel = 'Click & Collect';

      // Life stage (weighted by segment demographics)
      const lsRoll = rand();
      let lifeStage;
      let cumul = 0;
      for (let li = 0; li < lifeStages.length; li++) {
        cumul += def.lifeStageWeights[li];
        if (lsRoll < cumul) { lifeStage = lifeStages[li]; break; }
      }
      if (!lifeStage) lifeStage = 'Established Family';

      // Monthly grocery spend (ABS: avg Aus household ~$240/week = $1,040/month)
      // Varies by life stage
      let groceryBase;
      switch (lifeStage) {
        case 'Young Adult':        groceryBase = randFloat(420, 780); break;   // single/share house
        case 'Young Family':       groceryBase = randFloat(880, 1480); break;  // growing family, nappies/formula
        case 'Established Family': groceryBase = randFloat(980, 1620); break;  // largest basket, teens eat a lot
        case 'Empty Nester':       groceryBase = randFloat(680, 1120); break;  // couple, quality over quantity
        case 'Retiree':            groceryBase = randFloat(520, 880); break;   // smaller household, fixed income
        default:                   groceryBase = randFloat(680, 1200);
      }

      // Health conscious flag: higher for vitamin/supplement buyers, power shoppers
      let healthProb = def.healthConscious;
      if (topCat === 'Vitamins & Supplements' || secondCat === 'Vitamins & Supplements') healthProb += 0.20;
      if (topCat === 'Sports Nutrition' || secondCat === 'Sports Nutrition') healthProb += 0.15;
      if (topCat === 'Weight Management' || secondCat === 'Weight Management') healthProb += 0.10;
      if (lifeStage === 'Empty Nester' || lifeStage === 'Retiree') healthProb += 0.08;
      const healthConscious = rand() < Math.min(0.95, healthProb) ? 'Y' : 'N';

      rows.push([custId, name, postcode, fmtDate(joinDate), fmtDate(lastVisitDate),
        totalVisits, avgBasket, totalSpend, catCount, topCat, secondCat, thirdCat,
        daysSince, retScore, segName, onlineOrders, inStoreVisits,
        promoRedemptions, loyaltyPoints, prevMonthSpend, spendChange,
        natAvgBasket, natAvgVisits,
        shareOfWallet, totalPharmacySpend, crossShop, prefChannel,
        lifeStage, groceryBase, healthConscious
      ]);
      id++;
    }
  }
  writeCsv('Shopper360_Customers.csv', headers, rows);
}

// Run all
console.log('Generating Shopper360 CSV data (anchored: $400/yr OTC per customer)...\n');
generateSummary();
generateCategories();
generateSegments();
generateNational();
generateSuppliers();
generateCustomers();
console.log('\nAll 6 files generated. Economics model:');
console.log('  OTC per customer:  $400/year');
console.log('  Total per customer: ~$2,970/year');
console.log('  Network monthly:   ~$792M');
console.log('  Annual revenue:    ~$9.5B');
