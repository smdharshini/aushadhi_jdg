export type Role = 'phc_staff' | 'district_officer' | 'state_officer' | 'national_observer';

export interface UserProfile {
  name: string;
  role: Role;
  title: string;
  location: string;
  assignedPhcId?: string;
  assignedDistrictId?: string;
  assignedStateId?: StateId;
}

export type StateId = 'TN' | 'MH' | 'BR' | 'KL';

export interface StateInfo {
  id: StateId;
  name: string;
  code: string;
  capital: string;
  center: [number, number]; // [lat, lng]
}

export interface District {
  id: string;
  stateId: StateId;
  name: string;
  center: [number, number]; // [lat, lng]
}

export interface StaffAttendance {
  medicalOfficer: boolean;
  pharmacist: boolean;
  staffNurse: boolean;
  anm: boolean; // Auxiliary Nurse Midwife
}

export interface PHC {
  id: string;
  districtId: string;
  stateId: StateId;
  name: string;
  subDistrict: string;
  coordinates: [number, number];
  totalBeds: number;
  occupiedBeds: number;
  dailyFootfall: number;
  staff: StaffAttendance;
  lastReportedTime: string;
}

export interface Medicine {
  id: string;
  name: string;
  strength: string;
  form: string;
  category: 'antibiotic' | 'analgesic' | 'chronic' | 'emergency' | 'maternal' | 'vector_borne';
  dailyConsumptionBaseline: number; // typical PHC daily run rate
  leadTimeDays: number; // supplier replenishment lead time
  seasonalSpikeMonths: number[]; // 1-12
}

export interface StockLot {
  id: string;
  phcId: string;
  districtId: string;
  stateId: StateId;
  medicineId: string;
  batchNumber: string;
  expiryDate: string; // ISO date string YYYY-MM-DD
  quantity: number;
  receivedDate: string;
}

export interface WeeklyConsumption {
  weekIndex: number; // 0 to 51
  date: string;
  actualQuantity: number;
  rainfallIndex: number; // 0.0 to 1.0
  temperatureIndex: number; // 0.0 to 1.0
  outbreakFlag: number; // 0 or 1
}

export interface DemandForecastPoint {
  weekOffset: number; // +1 to +8
  targetDate: string;
  predictedDemand: number;
  lowerBound80: number;
  upperBound80: number;
  lowerBound95: number;
  upperBound95: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'watch';

export interface StockAlert {
  id: string;
  severity: AlertSeverity;
  medicineId: string;
  medicineName: string;
  districtId: string;
  districtName: string;
  stateId: StateId;
  phcId?: string;
  phcName?: string;
  currentStock: number;
  daysOfCover: number;
  stockoutProbabilityLeadTime: number; // 0.0 to 1.0
  reason: string;
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

export type TransferStatus = 'pending' | 'approved' | 'in_transit' | 'delivered';

export interface TransferOrder {
  id: string;
  medicineId: string;
  medicineName: string;
  sourceDistrictId: string;
  sourceDistrictName: string;
  sourcePhcId: string;
  sourcePhcName: string;
  destDistrictId: string;
  destDistrictName: string;
  destPhcId: string;
  destPhcName: string;
  stateId: StateId;
  isCrossState: boolean;
  destStateId: StateId;
  lotId: string;
  batchNumber: string;
  lotExpiryDate: string;
  quantity: number;
  roadDistanceKm: number;
  transitHours: number;
  estimatedCostInr: number;
  status: TransferStatus;
  requiredRole: Role;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  targetEntity: string;
  details: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  stateId: StateId;
  districtId: string;
  medicineId: string;
  demandMultiplier: number;
  durationWeeks: number;
}

export interface FederatedModelWeights {
  weights: number[];
  bias: number;
}

export interface FederatedRoundResult {
  round: number;
  globalLoss: number;
  globalMape: number;
  localOnlyMape: number;
  stateLosses: Record<StateId, number>;
  stateSamples: Record<StateId, number>;
  timestamp: string;
}
