import {
  District,
  Medicine,
  PHC,
  Role,
  StockLot,
  TransferOrder,
} from '../types';

export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const direct = calculateHaversineKm(lat1, lon1, lat2, lon2);
  // 1.3 road tortuosity multiplier for Indian highway and district road networks
  return Number((direct * 1.3).toFixed(1));
}

export function estimateTransitHours(roadDistanceKm: number): number {
  const avgSpeedKmH = 45; // average medical transport van speed in km/h
  const dispatchOverheadHrs = 1.0; // packing, dispatch check, signoff
  return Number((roadDistanceKm / avgSpeedKmH + dispatchOverheadHrs).toFixed(1));
}

export function estimateTransitCostInr(roadDistanceKm: number): number {
  const ratePerKm = 22; // INR per km for dedicated temperature-monitored light transport
  return Math.round(roadDistanceKm * ratePerKm);
}

export interface DistrictInventorySummary {
  district: District;
  totalStock: number;
  dailyDemand: number;
  daysOfCover: number;
  lots: StockLot[];
}

// Solve min-cost redistribution problem for a single medicine
export function solveRedistribution(
  medicine: Medicine,
  districts: District[],
  phcs: PHC[],
  stockLots: StockLot[],
  forecastDailyDemandByDistrict: Record<string, number>,
  emergencyMultiplierByDistrict: Record<string, number> = {}
): TransferOrder[] {
  const transferOrders: TransferOrder[] = [];

  // Group lots and calculate inventory by district
  const districtSummaries: Record<string, DistrictInventorySummary> = {};

  for (const d of districts) {
    const dLots = stockLots.filter(
      (l) => l.districtId === d.id && l.medicineId === medicine.id
    );
    const totalStock = dLots.reduce((acc, l) => acc + l.quantity, 0);

    const mult = emergencyMultiplierByDistrict[d.id] || 1.0;
    const baseDemand = forecastDailyDemandByDistrict[d.id] || medicine.dailyConsumptionBaseline * 5;
    const dailyDemand = baseDemand * mult;

    const daysOfCover = dailyDemand > 0 ? totalStock / dailyDemand : 999;

    districtSummaries[d.id] = {
      district: d,
      totalStock,
      dailyDemand,
      daysOfCover,
      lots: [...dLots].sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      ),
    };
  }

  // Identify Recipient Districts: days of cover < 14 days
  const recipients = Object.values(districtSummaries)
    .filter((s) => s.daysOfCover < 14)
    .sort((a, b) => a.daysOfCover - b.daysOfCover); // most critical first

  // Identify Potential Donor Districts: days of cover > 45 days
  const donors = Object.values(districtSummaries)
    .filter((s) => s.daysOfCover > 45)
    .sort((a, b) => b.daysOfCover - a.daysOfCover); // highest surplus first

  // Track remaining donation capacity per donor (must keep >= 30 days of cover)
  const remainingDonorCapacity: Record<string, number> = {};
  for (const d of donors) {
    const minRetain = Math.ceil(30 * d.dailyDemand);
    const maxDonate = Math.max(0, d.totalStock - minRetain);
    remainingDonorCapacity[d.district.id] = maxDonate;
  }

  let orderCounter = 1;

  for (const recipient of recipients) {
    // Target buffer for recipient is 28 days of cover
    const targetBufferUnits = Math.ceil(28 * recipient.dailyDemand);
    let deficit = Math.max(0, targetBufferUnits - recipient.totalStock);

    if (deficit <= 0) continue;

    // Find candidate donors sorted by road distance from recipient
    const candidateDonors = donors
      .filter((d) => remainingDonorCapacity[d.district.id] > 0)
      .map((d) => {
        const roadDist = calculateRoadDistanceKm(
          d.district.center[0],
          d.district.center[1],
          recipient.district.center[0],
          recipient.district.center[1]
        );
        return { donor: d, roadDist };
      })
      .sort((a, b) => a.roadDist - b.roadDist);

    for (const { donor, roadDist } of candidateDonors) {
      if (deficit <= 0) break;
      const availableFromDonor = remainingDonorCapacity[donor.district.id];
      if (availableFromDonor <= 0) continue;

      const transferQty = Math.min(deficit, availableFromDonor);
      if (transferQty < 50 && deficit > 100) {
        // Skip tiny uneconomic transfers unless covering whole deficit
        continue;
      }

      // Pick earliest expiring available lot from donor
      const donorLot = donor.lots.find((l) => l.quantity > 0) || donor.lots[0];
      if (!donorLot) continue;

      // Find representative PHCs
      const sourcePhc = phcs.find((p) => p.districtId === donor.district.id) || {
        id: `PHC_${donor.district.id}_1`,
        name: `${donor.district.name} Central PHC`,
      };
      const destPhc = phcs.find((p) => p.districtId === recipient.district.id) || {
        id: `PHC_${recipient.district.id}_1`,
        name: `${recipient.district.name} Central PHC`,
      };

      const transitHrs = estimateTransitHours(roadDist);
      const costInr = estimateTransitCostInr(roadDist);

      const isCrossState = donor.district.stateId !== recipient.district.stateId;

      let requiredRole: Role;
      if (donor.district.id === recipient.district.id) {
        requiredRole = 'district_officer';
      } else if (!isCrossState) {
        requiredRole = 'state_officer';
      } else {
        requiredRole = 'national_observer';
      }

      transferOrders.push({
        id: `TRF-${new Date().getFullYear()}-${String(orderCounter++).padStart(4, '0')}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        sourceDistrictId: donor.district.id,
        sourceDistrictName: donor.district.name,
        sourcePhcId: sourcePhc.id,
        sourcePhcName: sourcePhc.name,
        destDistrictId: recipient.district.id,
        destDistrictName: recipient.district.name,
        destPhcId: destPhc.id,
        destPhcName: destPhc.name,
        stateId: donor.district.stateId,
        isCrossState,
        destStateId: recipient.district.stateId,
        lotId: donorLot.id,
        batchNumber: donorLot.batchNumber,
        lotExpiryDate: donorLot.expiryDate,
        quantity: transferQty,
        roadDistanceKm: roadDist,
        transitHours: transitHrs,
        estimatedCostInr: costInr,
        status: 'pending',
        requiredRole,
        createdAt: new Date().toISOString(),
      });

      remainingDonorCapacity[donor.district.id] -= transferQty;
      deficit -= transferQty;
    }
  }

  return transferOrders;
}
