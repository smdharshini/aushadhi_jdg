import { DISTRICTS, MEDICINES, STATES } from './masterData';
import {
  PHC,
  StockLot,
  WeeklyConsumption,
} from '../types';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function createPrng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PHC_SUBDISTRICTS: Record<string, string[]> = {
  // Tamil Nadu
  TN_MDU: ['Vadipatti', 'Alanganallur', 'Thiruparankundram', 'Usilampatti', 'Melur'],
  TN_CBE: ['Pollachi', 'Sulur', 'Mettupalayam', 'Annur', 'Kinathukadavu'],
  TN_TRY: ['Srirangam', 'Lalgudi', 'Manapparai', 'Musiri', 'Thuraiyur'],
  TN_SLM: ['Attur', 'Mettur', 'Omalur', 'Edappadi', 'Sankari'],
  TN_TNV: ['Ambasamudram', 'Tenkasi Road', 'Nanguneri', 'Radhapuram', 'Cheranmahadevi'],
  TN_TNJ: ['Kumbakonam', 'Papanasam', 'Pattukkottai', 'Orathanadu', 'Thiruvaiyaru'],

  // Maharashtra
  MH_PUN: ['Haveli', 'Baramati', 'Shirur', 'Junner', 'Maval'],
  MH_NSK: ['Dindori', 'Sinnar', 'Niphad', 'Malegaon Rural', 'Igatpuri'],
  MH_NGP: ['Katol', 'Kamptee', 'Umred', 'Saoner', 'Ramtek'],
  MH_CSN: ['Paithan', 'Gangapur', 'Vaijapur', 'Kannad', 'Sillod'],
  MH_SLP: ['Pandharpur', 'Barshi', 'Akkalkot', 'Mohol', 'Madha'],
  MH_AMR: ['Achalpur', 'Chandur', 'Morshi', 'Warud', 'Daryapur'],

  // Bihar
  BR_PAT: ['Danapur', 'Phulwari', 'Bakhtiarpur', 'Barh', 'Bikram'],
  BR_GAY: ['Bodh Gaya', 'Sherghati', 'Tekari', 'Manpur', 'Wazirganj'],
  BR_MUZ: ['Kanti', 'Motipur', 'Sakra', 'Saraiya', 'Bochaha'],
  BR_BHG: ['Kahalgaon', 'Nathnagar', 'Sultanganj', 'Colgong', 'Sabour'],
  BR_DAR: ['Benipur', 'Baheri', 'Biraul', 'Hayaghat', 'Jale'],
  BR_PUR: ['Kasba', 'Banmankhi', 'Dhamdaha', 'Baisi', 'Krityanand Nagar'],

  // Kerala
  KL_TVM: ['Nedumangad', 'Neyyattinkara', 'Attingal', 'Varkala', 'Kattakada'],
  KL_EKM: ['Aluva', 'Angamaly', 'Perumbavoor', 'Kothamangalam', 'Muvattupuzha'],
  KL_KKD: ['Vatakara', 'Koyilandy', 'Thamarassery', 'Balussery', 'Perambra'],
  KL_TCR: ['Chalakudy', 'Kodungallur', 'Kunnamkulam', 'Mukundapuram', 'Chavakkad'],
  KL_MLP: ['Tirur', 'Perinthalmanna', 'Ponnani', 'Nilambur', 'Kondotty'],
  KL_PLK: ['Ottapalam', 'Chittur', 'Mannarkkad', 'Alathur', 'Pattambi'],
};

export interface SyntheticDataset {
  phcs: PHC[];
  stockLots: StockLot[];
  consumptionHistory: Record<string, WeeklyConsumption[]>; // key: `${phcId}_${medicineId}`
  metadata: {
    generatedAt: string;
    totalPhcs: number;
    totalDistricts: number;
    totalStates: number;
    totalMedicines: number;
    totalStockLots: number;
    isSynthetic: true;
  };
}

export function generateSyntheticData(seed = 42): SyntheticDataset {
  const rand = createPrng(seed);
  const phcs: PHC[] = [];
  const stockLots: StockLot[] = [];
  const consumptionHistory: Record<string, WeeklyConsumption[]> = {};

  const now = new Date('2026-09-29T12:00:00Z');

  // 1. Generate 120 PHCs
  for (const district of DISTRICTS) {
    const subDistricts = PHC_SUBDISTRICTS[district.id] || [
      'North Sector',
      'South Sector',
      'East Sector',
      'West Sector',
      'Central',
    ];

    for (let i = 0; i < subDistricts.length; i++) {
      const subName = subDistricts[i];
      const phcId = `PHC_${district.id}_${i + 1}`;

      // Distribute coordinates slightly around the district center (approx 5 to 15km)
      const latOffset = (rand() - 0.5) * 0.18;
      const lngOffset = (rand() - 0.5) * 0.18;
      const lat = Number((district.center[0] + latOffset).toFixed(4));
      const lng = Number((district.center[1] + lngOffset).toFixed(4));

      const totalBeds = [6, 8, 10, 12][Math.floor(rand() * 4)];
      // Occupancy varies between 40% and 90%
      const occupiedBeds = Math.min(
        totalBeds,
        Math.max(1, Math.floor(totalBeds * (0.4 + rand() * 0.5)))
      );

      // Staff attendance: realistic high percentages
      const medicalOfficer = rand() > 0.15; // 85% attendance
      const pharmacist = rand() > 0.08; // 92% attendance
      const staffNurse = rand() > 0.05; // 95% attendance
      const anm = rand() > 0.04; // 96% attendance

      const dailyFootfall = Math.floor(50 + rand() * 110); // 50 to 160 patients/day

      const minutesAgo = Math.floor(10 + rand() * 180);
      const reportTime = new Date(now.getTime() - minutesAgo * 60000).toISOString();

      phcs.push({
        id: phcId,
        districtId: district.id,
        stateId: district.stateId,
        name: `${subName} PHC`,
        subDistrict: subName,
        coordinates: [lat, lng],
        totalBeds,
        occupiedBeds,
        dailyFootfall,
        staff: {
          medicalOfficer,
          pharmacist,
          staffNurse,
          anm,
        },
        lastReportedTime: reportTime,
      });
    }
  }

  // 2. Generate Stock Lots and 52-week Consumption History
  let lotCounter = 1000;

  for (const phc of phcs) {
    const isMadurai = phc.districtId === 'TN_MDU';
    const isCoimbatore = phc.districtId === 'TN_CBE';
    const isPune = phc.districtId === 'MH_PUN';
    const isPatna = phc.districtId === 'BR_PAT';

    for (const med of MEDICINES) {
      // Days of cover configuration for realistic operational demo:
      // In Madurai, Paracetamol and ORS have low stock (under 9 days) for our Dengue outbreak demo.
      // In Coimbatore, Paracetamol has high surplus stock (>55 days) to serve as a donor!
      let daysOfCover: number;

      if (isMadurai && (med.id === 'med-01' || med.id === 'med-02')) {
        // Critical / Warning stock in Madurai for Paracetamol & ORS
        daysOfCover = 5 + rand() * 4; // 5 to 9 days of cover
      } else if (isCoimbatore && med.id === 'med-01') {
        // Surplus donor in Coimbatore for Paracetamol
        daysOfCover = 52 + rand() * 15; // 52 to 67 days of cover
      } else if (isPune && med.id === 'med-03') {
        // Warning stock in Pune for Amoxicillin
        daysOfCover = 9 + rand() * 4;
      } else if (isPatna && med.id === 'med-02') {
        // Warning stock in Patna for ORS
        daysOfCover = 7 + rand() * 3;
      } else {
        // Normal baseline distribution across health centres (16 to 48 days of cover)
        daysOfCover = 16 + rand() * 32;
      }

      const totalQuantity = Math.max(10, Math.round(daysOfCover * med.dailyConsumptionBaseline));

      // Split into 1 or 2 lots with distinct batch numbers and realistic expiry
      const splitLots = rand() > 0.4 ? 2 : 1;
      const lot1Qty = splitLots === 2 ? Math.round(totalQuantity * (0.6 + rand() * 0.2)) : totalQuantity;
      const lot2Qty = totalQuantity - lot1Qty;

      // Expiry dates: between 3 and 16 months ahead
      const monthsAhead1 = Math.floor(4 + rand() * 12);
      const expiry1 = new Date(now.getTime() + monthsAhead1 * 30 * 24 * 3600000)
        .toISOString()
        .slice(0, 10);

      lotCounter++;
      stockLots.push({
        id: `LOT_${lotCounter}`,
        phcId: phc.id,
        districtId: phc.districtId,
        stateId: phc.stateId,
        medicineId: med.id,
        batchNumber: `BCH-${phc.stateId}-${lotCounter}`,
        expiryDate: expiry1,
        quantity: lot1Qty,
        receivedDate: new Date(now.getTime() - (30 + rand() * 60) * 86400000).toISOString().slice(0, 10),
      });

      if (splitLots === 2 && lot2Qty > 0) {
        lotCounter++;
        const monthsAhead2 = monthsAhead1 + Math.floor(3 + rand() * 6);
        const expiry2 = new Date(now.getTime() + monthsAhead2 * 30 * 24 * 3600000)
          .toISOString()
          .slice(0, 10);

        stockLots.push({
          id: `LOT_${lotCounter}`,
          phcId: phc.id,
          districtId: phc.districtId,
          stateId: phc.stateId,
          medicineId: med.id,
          batchNumber: `BCH-${phc.stateId}-${lotCounter}`,
          expiryDate: expiry2,
          quantity: lot2Qty,
          receivedDate: new Date(now.getTime() - (10 + rand() * 20) * 86400000).toISOString().slice(0, 10),
        });
      }

      // Generate 52 weeks of historical consumption
      const historyKey = `${phc.id}_${med.id}`;
      const records: WeeklyConsumption[] = [];

      for (let w = 51; w >= 0; w--) {
        const weekDate = new Date(now.getTime() - w * 7 * 86400000);
        const month = weekDate.getMonth() + 1; // 1-12

        // Seasonality factor
        let seasonalFactor = 1.0;
        if (med.seasonalSpikeMonths.includes(month)) {
          seasonalFactor = 1.45 + (rand() - 0.5) * 0.25;
        }

        // Monsoon rainfall factor (June to Sept in India)
        const isMonsoon = month >= 6 && month <= 9;
        const rainfallIndex = isMonsoon ? 0.6 + rand() * 0.35 : 0.05 + rand() * 0.2;

        // Temperature index (higher in summer April-June)
        const isSummer = month >= 4 && month <= 6;
        const temperatureIndex = isSummer ? 0.75 + rand() * 0.2 : 0.35 + rand() * 0.3;

        // Outbreak flag (e.g. sporadic Dengue in monsoon weeks)
        const outbreakFlag = isMonsoon && rand() > 0.85 ? 1 : 0;
        if (outbreakFlag === 1 && (med.id === 'med-01' || med.id === 'med-02')) {
          seasonalFactor *= 1.6;
        }

        // Weekly quantity with noise (baseline * 7 days)
        const weeklyBase = med.dailyConsumptionBaseline * 7;
        const noise = (rand() - 0.5) * 0.25;
        let weeklyQty = Math.round(weeklyBase * seasonalFactor * (1.0 + noise));

        // Occasional random stock-out historical dip (2% chance)
        if (rand() < 0.02) {
          weeklyQty = Math.round(weeklyQty * 0.3); // partial stockout week
        }

        records.push({
          weekIndex: 51 - w,
          date: weekDate.toISOString().slice(0, 10),
          actualQuantity: Math.max(1, weeklyQty),
          rainfallIndex: Number(rainfallIndex.toFixed(2)),
          temperatureIndex: Number(temperatureIndex.toFixed(2)),
          outbreakFlag,
        });
      }

      consumptionHistory[historyKey] = records;
    }
  }

  return {
    phcs,
    stockLots,
    consumptionHistory,
    metadata: {
      generatedAt: now.toISOString(),
      totalPhcs: phcs.length,
      totalDistricts: DISTRICTS.length,
      totalStates: Object.keys(STATES).length,
      totalMedicines: MEDICINES.length,
      totalStockLots: stockLots.length,
      isSynthetic: true,
    },
  };
}
