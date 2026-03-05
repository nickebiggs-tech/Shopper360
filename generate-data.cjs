const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'public', 'data');

// Seeded PRNG for reproducibility
let seed = 42;
function rand() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
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

// ── FILE 1: Summary ──
function generateSummary() {
  const headers = ['PeriodMonth','TotalCustomers','ActiveCustomers','NewCustomers','AvgBasketValue','TotalRevenue','VisitCount','RetentionRate','ChurnRate','CategoryPenetration_OTC','CategoryPenetration_Scripts','CategoryPenetration_Beauty','CategoryPenetration_Vitamins','CategoryPenetration_PersonalCare'];
  const seasonal = [0.96,0.99,1.06,1.08,1.04,1.00,0.98,1.01,1.03,0.92,0.90,0.97];
  const rows = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const totalCust = Math.round(2840000 + 400000 * t);
    const activePct = 0.60 + t * 0.05 + (rand() - 0.5) * 0.01;
    const activeCust = Math.round(totalCust * activePct);
    const newCust = Math.round(45000 + t * 23000 + (rand() - 0.5) * 4000);
    const avgBasket = parseFloat((42.50 + t * 4.30 + (rand() - 0.5) * 0.60).toFixed(2));
    const totalRev = Math.round((680000000 + t * 140000000) * seasonal[i]);
    const visitCount = Math.round((11000000 + t * 3500000) * seasonal[i]);
    const retRate = parseFloat((71.2 + t * 3.6 + (rand() - 0.5) * 0.4).toFixed(1));
    const churnRate = parseFloat((100 - retRate).toFixed(1));
    rows.push([MONTHS[i], totalCust, activeCust, newCust, avgBasket, totalRev, visitCount, retRate, churnRate,
      parseFloat((72 + t * 6 + (rand() - 0.5) * 1.0).toFixed(1)),
      parseFloat((45 + t * 7 + (rand() - 0.5) * 1.0).toFixed(1)),
      parseFloat((38 + t * 6 + (rand() - 0.5) * 1.0).toFixed(1)),
      parseFloat((55 + t * 7 + (rand() - 0.5) * 1.0).toFixed(1)),
      parseFloat((65 + t * 6 + (rand() - 0.5) * 1.0).toFixed(1))
    ]);
  }
  writeCsv('Shopper360_Summary.csv', headers, rows);
}

// ── FILE 2: Categories ──
function generateCategories() {
  const headers = ['Category','Revenue','Transactions','AvgItemsPerBasket','CrossSellRate','TopPairedCategory','GrowthRate','NationalAvgRevenue'];
  const rows = [
    ['Prescription',285000000,8200000,2.8,24.4,'OTC Medicines',2.1,342000000],
    ['Vitamins & Supplements',142000000,4100000,1.4,58.2,'Weight Management',8.4,128000000],
    ['OTC Medicines',98000000,6800000,1.9,42.1,'First Aid',3.7,88000000],
    ['Beauty & Skincare',87000000,3200000,2.6,51.3,'Personal Care',12.1,78000000],
    ['Fragrance',76000000,1800000,1.2,18.6,'Beauty & Skincare',5.3,82000000],
    ['Baby & Infant',54000000,2100000,2.9,44.7,'Personal Care',6.8,48000000],
    ['Personal Care',48000000,3900000,2.2,38.5,'Beauty & Skincare',1.9,44000000],
    ['Weight Management',42000000,980000,1.6,32.8,'Sports Nutrition',15.2,38000000],
    ['Hair Care',38000000,2400000,2.1,45.3,'Beauty & Skincare',4.1,35000000],
    ['Oral Care',31000000,2800000,2.4,52.6,'Personal Care',2.8,28000000],
    ['First Aid',24000000,1600000,1.7,36.9,'OTC Medicines',3.2,21000000],
    ['Eye Care',19000000,890000,1.3,28.4,'Prescription',7.6,17000000],
    ['Sun & Tanning',16000000,1200000,1.8,41.2,'Beauty & Skincare',9.3,14000000],
    ['Sports Nutrition',14000000,520000,1.5,27.6,'Weight Management',18.5,12000000],
    ['Natural Health',12000000,680000,1.4,48.9,'Vitamins & Supplements',11.3,10000000],
    ['Medical Devices',11000000,340000,1.1,19.2,'Prescription',4.7,13000000],
    ['Pet Care',8000000,480000,2.0,22.3,'Personal Care',22.1,6000000],
    ['Sexual Health',6000000,390000,1.2,15.8,'Personal Care',1.4,5500000],
    ['Quit Smoking',5000000,210000,1.0,12.4,'OTC Medicines',-3.2,6200000],
    ['Incontinence',4000000,280000,1.3,18.7,'Personal Care',2.9,3800000],
  ];
  writeCsv('Shopper360_Categories.csv', headers, rows);
}

// ── FILE 3: Segments ──
function generateSegments() {
  const headers = ['PeriodMonth','Segment','CustomerCount','AvgBasketValue','AvgVisits','TotalRevenue','RetentionRate'];
  const seasonal = [0.96,0.99,1.06,1.08,1.04,1.00,0.98,1.01,1.03,0.92,0.90,0.97];
  const segs = [
    {name:'Power Shoppers',pct:0.12,bMin:88,bMax:96,vMin:5.8,vMax:6.4,rPct:0.45,retMin:92,retMax:95},
    {name:'Regular Shoppers',pct:0.35,bMin:44,bMax:50,vMin:2.6,vMax:3.0,rPct:0.30,retMin:72,retMax:76},
    {name:'Occasional Visitors',pct:0.28,bMin:32,bMax:38,vMin:1.2,vMax:1.6,rPct:0.12,retMin:35,retMax:42},
    {name:'New Customers',pct:0.15,bMin:38,bMax:44,vMin:1.8,vMax:2.4,rPct:0.09,retMin:54,retMax:62},
    {name:'At-Risk',pct:0.10,bMin:28,bMax:34,vMin:0.2,vMax:0.5,rPct:0.04,retMin:12,retMax:18},
  ];
  const rows = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const totalCust = Math.round(2840000 + 400000 * t);
    const totalRev = Math.round((680000000 + t * 140000000) * seasonal[i]);
    for (const seg of segs) {
      const custCount = Math.round(totalCust * seg.pct);
      const basket = parseFloat((seg.bMin + t * (seg.bMax - seg.bMin) + (rand() - 0.5) * 1.5).toFixed(2));
      const visits = parseFloat((seg.vMin + t * (seg.vMax - seg.vMin) + (rand() - 0.5) * 0.15).toFixed(1));
      const segRev = Math.round(totalRev * seg.rPct * (1 + (rand() - 0.5) * 0.04));
      const ret = parseFloat((seg.retMin + t * (seg.retMax - seg.retMin) + (rand() - 0.5) * 0.8).toFixed(1));
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
      parseFloat((26 + t * 3 + s * 10 + (rand() - 0.5) * 0.4).toFixed(2)),
      parseFloat((36 + t * 4 + s * 10 + (rand() - 0.5) * 0.4).toFixed(2)),
      parseFloat((48 + t * 6 + s * 10 + (rand() - 0.5) * 0.5).toFixed(2)),
      parseFloat((42 + t * 5 + s * 10 + (rand() - 0.5) * 0.5).toFixed(2)),
      parseFloat((56 + t * 4 + (rand() - 0.5) * 0.6).toFixed(1)),
      parseFloat((64 + t * 4 + (rand() - 0.5) * 0.5).toFixed(1)),
      parseFloat((74 + t * 4 + (rand() - 0.5) * 0.5).toFixed(1)),
      parseFloat((71 + t * 4 + (rand() - 0.5) * 0.5).toFixed(1)),
      parseFloat((1.4 + t * 0.4 + (rand() - 0.5) * 0.1).toFixed(1)),
      parseFloat((2.2 + t * 0.4 + (rand() - 0.5) * 0.1).toFixed(1)),
      parseFloat((3.4 + t * 0.6 + (rand() - 0.5) * 0.1).toFixed(1)),
      parseFloat((2.8 + t * 0.6 + (rand() - 0.5) * 0.1).toFixed(1)),
    ]);
  }
  writeCsv('Shopper360_National.csv', headers, rows);
}

// ── FILE 5: Suppliers ──
function generateSuppliers() {
  const headers = ['MFR_NAME','Total_TY_Value','MFR_Market_Share_Pct','YoY_Growth','TopCategories','ProductCount','AvgPrice','YourStoreRevenue','YourStoreShare'];
  const rows = [
    ['HALEON',892000000,6.8,2.1,'OTC Medicines;Oral Care;Vitamins & Supplements',485,14.80,824000000,7.2],
    ['KENVUE',756000000,6.2,3.8,'Personal Care;Baby & Infant;OTC Medicines',412,12.45,698000000,6.5],
    ['SANOFI CONSUMER HEALTHCARE',634000000,5.1,1.4,'OTC Medicines;Vitamins & Supplements;Natural Health',328,16.90,572000000,5.4],
    ['BLACKMORES GROUP',528000000,4.4,7.2,'Vitamins & Supplements;Natural Health;Sports Nutrition',296,18.90,512000000,4.8],
    ['SWISSE (H&H GROUP)',487000000,4.1,5.6,'Vitamins & Supplements;Beauty & Skincare;Weight Management',264,22.40,468000000,4.4],
    ['RECKITT BENCKISER',445000000,3.9,2.3,'OTC Medicines;Personal Care;Sexual Health',342,11.60,398000000,3.7],
    ['BAYER CONSUMER HEALTH',412000000,3.5,-0.8,'OTC Medicines;Vitamins & Supplements;Medical Devices',278,15.20,378000000,3.3],
    ['ASPEN PHARMACARE',398000000,3.3,1.2,'Prescription;OTC Medicines;Eye Care',312,16.80,362000000,3.1],
    ["L'OREAL AUSTRALIA",367000000,3.1,9.4,'Beauty & Skincare;Hair Care;Sun & Tanning',224,24.50,356000000,3.4],
    ['PROCTER & GAMBLE',342000000,2.9,3.1,'Personal Care;Oral Care;Hair Care',298,10.80,312000000,2.8],
    ['JOHNSON & JOHNSON',318000000,2.7,1.9,'Baby & Infant;Personal Care;First Aid',256,13.40,288000000,2.5],
    ['COLGATE-PALMOLIVE',295000000,2.5,2.7,'Oral Care;Personal Care;Pet Care',186,9.80,274000000,2.6],
    ['PERRIGO AUSTRALIA',267000000,2.3,4.5,'OTC Medicines;First Aid;Incontinence',342,8.60,248000000,2.4],
    ['VIATRIS',243000000,2.1,-1.2,'Prescription;OTC Medicines;Eye Care',198,18.40,218000000,1.9],
    ["NATURE'S OWN (SANOFI)",224000000,1.9,6.3,'Vitamins & Supplements;Natural Health;Weight Management',176,16.20,214000000,2.0],
    ['COTY',198000000,1.7,8.1,'Fragrance;Beauty & Skincare;Personal Care',142,32.80,192000000,1.8],
    ['CHURCH & DWIGHT',176000000,1.5,3.4,'Personal Care;Oral Care;First Aid',164,11.20,162000000,1.4],
    ['EGO PHARMACEUTICALS',154000000,1.3,5.7,'Beauty & Skincare;Sun & Tanning;Baby & Infant',128,14.60,148000000,1.4],
    ['EDGEWELL PERSONAL CARE',132000000,1.1,2.2,'Personal Care;Sun & Tanning;Hair Care',96,12.40,118000000,1.0],
    ['VITA HEALTH GROUP',118000000,1.0,11.8,'Vitamins & Supplements;Sports Nutrition;Natural Health',84,19.80,116000000,1.1],
  ];
  writeCsv('Shopper360_Suppliers.csv', headers, rows);
}

// ── FILE 6: Customers (8000 rows) ──
function generateCustomers() {
  const headers = ['CustomerID','CustomerName','Postcode','JoinDate','LastVisitDate','TotalVisits','AvgBasketValue','TotalSpend','CategoryCount','TopCategory','SecondCategory','ThirdCategory','DaysSinceLastVisit','RetentionScore','Segment','OnlineOrders','InStoreVisits','PromotionRedemptions','LoyaltyPoints','PrevMonthSpend','SpendChange','NationalAvgBasket','NationalAvgVisits'];

  const firstNames = ['James','William','Oliver','Jack','Noah','Thomas','Henry','Leo','Charlie','Lucas','Liam','Ethan','Alexander','Oscar','Archie','George','Max','Harry','Chloe','Charlotte','Mia','Amelia','Olivia','Isla','Ava','Grace','Harper','Ella','Sophie','Emily','Lily','Isabella','Hannah','Sarah','Jessica','Emma','Madison','Zoe','Aria','Ruby','Matilda','Sienna','Willow','Phoebe','Evie','Aisha','Fatima','Priya','Wei','Mei','Yuki','Hana','Min','Ji','Soo','Kai','Ravi','Arjun','Ananya','Devi','Omar','Nadia','Yasmin','Hassan','Ali','Maria','Sofia','Elena','Marco','Luca','Andreas','Dimitri','Nikolai','Pierre','Jacques','Lars','Sven','Finn','Riley','Jayden','Zara','Chen','Daniel','Benjamin','Samuel','Nathan','Joshua','David','Michael','Ryan','Aiden','Logan','Mason','Jackson','Sebastian','Theodore','Caleb','Owen','Dylan','Luke'];

  const lastNames = ['Smith','Jones','Williams','Brown','Wilson','Taylor','Johnson','White','Martin','Anderson','Thompson','Walker','Harris','Lee','Robinson','Clark','Lewis','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Hill','Campbell','Mitchell','Roberts','Carter','Phillips','Evans','Turner','Torres','Parker','Collins','Edwards','Stewart','Nguyen','Chen','Wang','Li','Zhang','Patel','Singh','Kumar','Sharma','Khan','Ali','Rahman','Kim','Park','Tanaka','Nakamura','Sato',"O'Brien",'Murphy','Kelly',"O'Connor",'Sullivan','Ryan','Walsh','Murray','Papadopoulos','Costa','Silva','Ferrari','Schmidt','Mueller','Petrov','Johansson','Hansen','Nielsen','van den Berg','De Vries','Rossi','Martinez','Garcia','Lopez','Cooper','Morgan','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Powell','Long','Patterson','Hughes','Flores','Washington','Butler','Simmons','Foster'];

  const categories = ['Prescription','Vitamins & Supplements','OTC Medicines','Beauty & Skincare','Fragrance','Baby & Infant','Personal Care','Weight Management','Hair Care','Oral Care','First Aid','Eye Care','Sun & Tanning','Sports Nutrition','Natural Health','Medical Devices','Pet Care','Sexual Health','Quit Smoking','Incontinence'];

  function randomPostcode() {
    const r = rand();
    if (r < 0.40) return randInt(2000, 2999);
    if (r < 0.70) return randInt(3000, 3999);
    if (r < 0.82) return randInt(4000, 4999);
    if (r < 0.90) return randInt(5000, 5999);
    return randInt(6000, 6999);
  }

  function fmtDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function randDate(start, end) {
    return new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
  }

  const segDefs = {
    'Power Shoppers': { count: 960, visits: [48,156], basket: [65,185], spend: [4800,28000], catCount: [6,14], retention: [78,99], days: [0,8], online: [8,45], loyalty: [8000,45000], joinS: new Date('2023-01-15'), joinE: new Date('2024-06-30'), lastS: new Date('2026-02-20'), lastE: new Date('2026-03-01'), chg: [2,40] },
    'Regular Shoppers': { count: 2800, visits: [15,52], basket: [35,72], spend: [900,5200], catCount: [3,8], retention: [55,82], days: [2,25], online: [1,15], loyalty: [1500,12000], joinS: new Date('2023-03-01'), joinE: new Date('2025-06-30'), lastS: new Date('2026-02-03'), lastE: new Date('2026-03-01'), chg: [-10,25] },
    'Occasional Visitors': { count: 2240, visits: [4,18], basket: [18,48], spend: [120,1400], catCount: [1,4], retention: [25,55], days: [15,75], online: [0,4], loyalty: [200,3000], joinS: new Date('2023-06-01'), joinE: new Date('2025-10-30'), lastS: new Date('2025-12-15'), lastE: new Date('2026-02-14'), chg: [-20,15] },
    'New Customers': { count: 1200, visits: [1,12], basket: [28,65], spend: [30,780], catCount: [1,5], retention: [40,72], days: [3,35], online: [0,6], loyalty: [50,2500], joinS: new Date('2025-10-01'), joinE: new Date('2026-02-28'), lastS: new Date('2026-01-24'), lastE: new Date('2026-03-01'), chg: [5,40] },
    'At-Risk': { count: 800, visits: [8,45], basket: [22,52], spend: [400,3800], catCount: [2,6], retention: [5,30], days: [45,180], online: [0,3], loyalty: [500,6000], joinS: new Date('2023-01-15'), joinE: new Date('2025-03-30'), lastS: new Date('2025-06-01'), lastE: new Date('2026-01-15'), chg: [-30,-5] },
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
      let totalSpend = parseFloat((avgBasket * totalVisits).toFixed(2));
      totalSpend = Math.max(def.spend[0], Math.min(def.spend[1], totalSpend));
      const catCount = randInt(def.catCount[0], def.catCount[1]);

      // Shuffle categories for random assignment
      const shuffled = [...categories];
      for (let si = shuffled.length - 1; si > 0; si--) {
        const j = randInt(0, si);
        [shuffled[si], shuffled[j]] = [shuffled[j], shuffled[si]];
      }

      const diffMs = refDate.getTime() - lastVisitDate.getTime();
      let daysSince = Math.max(0, Math.round(diffMs / 86400000));
      daysSince = Math.max(def.days[0], Math.min(def.days[1], daysSince));
      const retScore = randInt(def.retention[0], def.retention[1]);
      let onlineOrders = Math.min(randInt(def.online[0], def.online[1]), Math.max(0, totalVisits - 1));
      const inStoreVisits = totalVisits - onlineOrders;
      const promoRedemptions = randInt(0, Math.min(25, Math.round(totalVisits * 0.3)));
      const loyaltyPoints = randInt(def.loyalty[0], def.loyalty[1]);
      const monthsActive = Math.max(1, Math.round((refDate.getTime() - joinDate.getTime()) / (30 * 86400000)));
      const monthlyEst = Math.max(0.5, totalVisits / monthsActive);
      const prevMonthSpend = parseFloat((avgBasket * monthlyEst * (0.7 + rand() * 0.6)).toFixed(2));
      const spendChange = randFloat(def.chg[0], def.chg[1]);
      const natAvgBasket = randFloat(38, 42);
      const natAvgVisits = randFloat(2.4, 2.8, 1);

      rows.push([custId, name, postcode, fmtDate(joinDate), fmtDate(lastVisitDate),
        totalVisits, avgBasket, totalSpend, catCount, shuffled[0], shuffled[1], catCount >= 3 ? shuffled[2] : shuffled[1],
        daysSince, retScore, segName, onlineOrders, inStoreVisits,
        promoRedemptions, loyaltyPoints, prevMonthSpend, spendChange,
        natAvgBasket, natAvgVisits
      ]);
      id++;
    }
  }
  writeCsv('Shopper360_Customers.csv', headers, rows);
}

// Run all
console.log('Generating Shopper360 CSV data files...\n');
generateSummary();
generateCategories();
generateSegments();
generateNational();
generateSuppliers();
generateCustomers();
console.log('\nAll 6 files generated successfully.');
