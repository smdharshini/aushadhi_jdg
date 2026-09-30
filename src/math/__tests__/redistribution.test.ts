import { describe, expect, it } from 'vitest';
import {
  calculateHaversineKm,
  calculateRoadDistanceKm,
  estimateTransitCostInr,
  estimateTransitHours,
  solveRedistribution,
} from '../redistribution';
import { District, Medicine, PHC, StockLot } from '../../types';

describe('Redistribution & Distance Solver', () => {
  it('computes Haversine and road distance with 1.3 tortuosity factor', () => {
    // Madurai: [9.9252, 78.1198], Coimbatore: [11.0168, 76.9558]
    const directKm = calculateHaversineKm(9.9252, 78.1198, 11.0168, 76.9558);
    expect(directKm).toBeGreaterThan(170);
    expect(directKm).toBeLessThan(210);

    const roadKm = calculateRoadDistanceKm(9.9252, 78.1198, 11.0168, 76.9558);
    expect(roadKm).toBeCloseTo(directKm * 1.3, 1);
  });

  it('computes realistic transit time and cost estimates', () => {
    const roadKm = 200;
    const hours = estimateTransitHours(roadKm);
    // 200 / 45 + 1.0 = ~5.4 hours
    expect(hours).toBeGreaterThan(5.0);
    expect(hours).toBeLessThan(6.0);

    const cost = estimateTransitCostInr(roadKm);
    // 200 * 22 = 4400 INR
    expect(cost).toBe(4400);
  });

  it('enforces donor retention constraint >= 30 days of cover', () => {
    const med: Medicine = {
      id: 'med-01',
      name: 'Paracetamol',
      strength: '500mg',
      form: 'Tablet',
      category: 'analgesic',
      dailyConsumptionBaseline: 100,
      leadTimeDays: 14,
      seasonalSpikeMonths: [],
    };

    // Donor district with 50 days of cover (5000 units, 100/day demand)
    const donorDistrict: District = {
      id: 'D_DONOR',
      stateId: 'TN',
      name: 'Surplus District',
      center: [10.0, 77.0],
    };

    // Recipient district with 5 days of cover (500 units, 100/day demand)
    const recipientDistrict: District = {
      id: 'D_RECIP',
      stateId: 'TN',
      name: 'Deficit District',
      center: [10.5, 77.5],
    };

    const phcs: PHC[] = [
      {
        id: 'PHC_1',
        districtId: 'D_DONOR',
        stateId: 'TN',
        name: 'Donor PHC',
        subDistrict: 'Sector A',
        coordinates: [10.0, 77.0],
        totalBeds: 10,
        occupiedBeds: 5,
        dailyFootfall: 80,
        staff: { medicalOfficer: true, pharmacist: true, staffNurse: true, anm: true },
        lastReportedTime: new Date().toISOString(),
      },
      {
        id: 'PHC_2',
        districtId: 'D_RECIP',
        stateId: 'TN',
        name: 'Recipient PHC',
        subDistrict: 'Sector B',
        coordinates: [10.5, 77.5],
        totalBeds: 10,
        occupiedBeds: 5,
        dailyFootfall: 80,
        staff: { medicalOfficer: true, pharmacist: true, staffNurse: true, anm: true },
        lastReportedTime: new Date().toISOString(),
      },
    ];

    const stockLots: StockLot[] = [
      {
        id: 'LOT_D1',
        phcId: 'PHC_1',
        districtId: 'D_DONOR',
        stateId: 'TN',
        medicineId: 'med-01',
        batchNumber: 'BCH-01',
        expiryDate: '2027-06-01',
        quantity: 5000,
        receivedDate: '2026-01-01',
      },
      {
        id: 'LOT_R1',
        phcId: 'PHC_2',
        districtId: 'D_RECIP',
        stateId: 'TN',
        medicineId: 'med-01',
        batchNumber: 'BCH-02',
        expiryDate: '2027-06-01',
        quantity: 500,
        receivedDate: '2026-01-01',
      },
    ];

    const orders = solveRedistribution(
      med,
      [donorDistrict, recipientDistrict],
      phcs,
      stockLots,
      { D_DONOR: 100, D_RECIP: 100 }
    );

    expect(orders.length).toBe(1);
    const order = orders[0];
    expect(order.sourceDistrictId).toBe('D_DONOR');
    expect(order.destDistrictId).toBe('D_RECIP');

    // Donor has 5000 units, must retain 30 * 100 = 3000 units. Max donable is 2000 units.
    // Recipient needs to reach 28 days = 2800 units. Deficit = 2800 - 500 = 2300 units.
    // Transferred quantity should be capped at donor maximum donable (2000 units).
    expect(order.quantity).toBeLessThanOrEqual(2000);
    expect(order.requiredRole).toBe('state_officer'); // Same state TN
  });
});
