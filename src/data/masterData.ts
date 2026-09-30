import { District, Medicine, Role, StateId, StateInfo, UserProfile } from '../types';

export const STATES: Record<StateId, StateInfo> = {
  TN: {
    id: 'TN',
    name: 'Tamil Nadu',
    code: 'TN',
    capital: 'Chennai',
    center: [11.1271, 78.6569],
  },
  MH: {
    id: 'MH',
    name: 'Maharashtra',
    code: 'MH',
    capital: 'Mumbai',
    center: [19.7515, 75.7139],
  },
  BR: {
    id: 'BR',
    name: 'Bihar',
    code: 'BR',
    capital: 'Patna',
    center: [25.0961, 85.3131],
  },
  KL: {
    id: 'KL',
    name: 'Kerala',
    code: 'KL',
    capital: 'Thiruvananthapuram',
    center: [10.8505, 76.2711],
  },
};

export const DISTRICTS: District[] = [
  // Tamil Nadu
  { id: 'TN_MDU', stateId: 'TN', name: 'Madurai', center: [9.9252, 78.1198] },
  { id: 'TN_CBE', stateId: 'TN', name: 'Coimbatore', center: [11.0168, 76.9558] },
  { id: 'TN_TRY', stateId: 'TN', name: 'Tiruchirappalli', center: [10.7905, 78.7047] },
  { id: 'TN_SLM', stateId: 'TN', name: 'Salem', center: [11.6643, 78.1460] },
  { id: 'TN_TNV', stateId: 'TN', name: 'Tirunelveli', center: [8.7139, 77.7567] },
  { id: 'TN_TNJ', stateId: 'TN', name: 'Thanjavur', center: [10.7870, 79.1378] },

  // Maharashtra
  { id: 'MH_PUN', stateId: 'MH', name: 'Pune', center: [18.5204, 73.8567] },
  { id: 'MH_NSK', stateId: 'MH', name: 'Nashik', center: [19.9975, 73.7898] },
  { id: 'MH_NGP', stateId: 'MH', name: 'Nagpur', center: [21.1458, 79.0882] },
  { id: 'MH_CSN', stateId: 'MH', name: 'Chhatrapati Sambhaji Nagar', center: [19.8762, 75.3433] },
  { id: 'MH_SLP', stateId: 'MH', name: 'Solapur', center: [17.6599, 75.9064] },
  { id: 'MH_AMR', stateId: 'MH', name: 'Amravati', center: [20.9320, 77.7523] },

  // Bihar
  { id: 'BR_PAT', stateId: 'BR', name: 'Patna', center: [25.5941, 85.1376] },
  { id: 'BR_GAY', stateId: 'BR', name: 'Gaya', center: [24.7914, 85.0002] },
  { id: 'BR_MUZ', stateId: 'BR', name: 'Muzaffarpur', center: [26.1209, 85.3647] },
  { id: 'BR_BHG', stateId: 'BR', name: 'Bhagalpur', center: [25.2425, 87.0000] },
  { id: 'BR_DAR', stateId: 'BR', name: 'Darbhanga', center: [26.1542, 85.8918] },
  { id: 'BR_PUR', stateId: 'BR', name: 'Purnia', center: [25.7771, 87.4753] },

  // Kerala
  { id: 'KL_TVM', stateId: 'KL', name: 'Thiruvananthapuram', center: [8.5241, 76.9366] },
  { id: 'KL_EKM', stateId: 'KL', name: 'Ernakulam', center: [9.9816, 76.2999] },
  { id: 'KL_KKD', stateId: 'KL', name: 'Kozhikode', center: [11.2588, 75.7804] },
  { id: 'KL_TCR', stateId: 'KL', name: 'Thrissur', center: [10.5276, 76.2144] },
  { id: 'KL_MLP', stateId: 'KL', name: 'Malappuram', center: [11.0510, 76.0711] },
  { id: 'KL_PLK', stateId: 'KL', name: 'Palakkad', center: [10.7867, 76.6548] },
];

export const MEDICINES: Medicine[] = [
  {
    id: 'med-01',
    name: 'Paracetamol',
    strength: '500mg',
    form: 'Tablet',
    category: 'analgesic',
    dailyConsumptionBaseline: 140, // units/day per PHC
    leadTimeDays: 14,
    seasonalSpikeMonths: [6, 7, 8, 9], // monsoon fever spikes
  },
  {
    id: 'med-02',
    name: 'Oral Rehydration Salts (ORS)',
    strength: '21.8g sachet',
    form: 'Powder sachet',
    category: 'emergency',
    dailyConsumptionBaseline: 90,
    leadTimeDays: 10,
    seasonalSpikeMonths: [4, 5, 6, 7], // summer and early monsoon diarrhea
  },
  {
    id: 'med-03',
    name: 'Amoxicillin',
    strength: '500mg',
    form: 'Capsule',
    category: 'antibiotic',
    dailyConsumptionBaseline: 80,
    leadTimeDays: 14,
    seasonalSpikeMonths: [11, 12, 1, 2], // winter respiratory infections
  },
  {
    id: 'med-04',
    name: 'Metformin',
    strength: '500mg',
    form: 'Tablet',
    category: 'chronic',
    dailyConsumptionBaseline: 160,
    leadTimeDays: 21,
    seasonalSpikeMonths: [], // chronic, steady throughout year
  },
  {
    id: 'med-05',
    name: 'Amlodipine',
    strength: '5mg',
    form: 'Tablet',
    category: 'chronic',
    dailyConsumptionBaseline: 150,
    leadTimeDays: 21,
    seasonalSpikeMonths: [], // steady chronic
  },
  {
    id: 'med-06',
    name: 'Iron-Folic Acid',
    strength: '100mg Fe + 0.5mg FA',
    form: 'Tablet',
    category: 'maternal',
    dailyConsumptionBaseline: 120,
    leadTimeDays: 14,
    seasonalSpikeMonths: [], // maternal program
  },
  {
    id: 'med-07',
    name: 'Ceftriaxone',
    strength: '1g',
    form: 'Injection vial',
    category: 'emergency',
    dailyConsumptionBaseline: 25,
    leadTimeDays: 14,
    seasonalSpikeMonths: [7, 8, 9],
  },
  {
    id: 'med-08',
    name: 'Albendazole',
    strength: '400mg',
    form: 'Chewable tablet',
    category: 'maternal',
    dailyConsumptionBaseline: 45,
    leadTimeDays: 28,
    seasonalSpikeMonths: [2, 8], // National Deworming Days
  },
  {
    id: 'med-09',
    name: 'Salbutamol',
    strength: '100mcg/dose',
    form: 'Inhaler',
    category: 'emergency',
    dailyConsumptionBaseline: 20,
    leadTimeDays: 14,
    seasonalSpikeMonths: [10, 11, 12, 1], // winter smog and asthmatic spikes
  },
  {
    id: 'med-10',
    name: 'Oral Contraceptives (Mala-N)',
    strength: 'Standard cycle',
    form: 'Strip',
    category: 'maternal',
    dailyConsumptionBaseline: 35,
    leadTimeDays: 21,
    seasonalSpikeMonths: [],
  },
  {
    id: 'med-11',
    name: 'Chloroquine / ACT',
    strength: 'Co-formulated',
    form: 'Tablet strip',
    category: 'vector_borne',
    dailyConsumptionBaseline: 30,
    leadTimeDays: 14,
    seasonalSpikeMonths: [7, 8, 9, 10], // post-monsoon malaria
  },
  {
    id: 'med-12',
    name: 'Doxycycline',
    strength: '100mg',
    form: 'Capsule',
    category: 'vector_borne',
    dailyConsumptionBaseline: 40,
    leadTimeDays: 14,
    seasonalSpikeMonths: [7, 8, 9], // leptospirosis and vector outbreaks
  },
  {
    id: 'med-13',
    name: 'Human Insulin',
    strength: '40IU/ml (10ml)',
    form: 'Vial',
    category: 'chronic',
    dailyConsumptionBaseline: 15,
    leadTimeDays: 14,
    seasonalSpikeMonths: [], // cold-chain required
  },
  {
    id: 'med-14',
    name: 'Anti-Snake Venom (ASV)',
    strength: 'Polyvalent (10ml)',
    form: 'Lyophilized vial',
    category: 'emergency',
    dailyConsumptionBaseline: 8,
    leadTimeDays: 14,
    seasonalSpikeMonths: [6, 7, 8, 9, 10], // monsoon agricultural season
  },
];

export const ROLE_PROFILES: Record<Role, UserProfile> = {
  phc_staff: {
    name: 'K. Selvi',
    role: 'phc_staff',
    title: 'Staff Nurse & PHC Inventory In-Charge',
    location: 'Vadipatti PHC, Madurai, TN',
    assignedPhcId: 'PHC_TN_MDU_1',
    assignedDistrictId: 'TN_MDU',
    assignedStateId: 'TN',
  },
  district_officer: {
    name: 'Dr. P. Sundaram',
    role: 'district_officer',
    title: 'Deputy Director of Health Services (DDHS)',
    location: 'Madurai District, Tamil Nadu',
    assignedDistrictId: 'TN_MDU',
    assignedStateId: 'TN',
  },
  state_officer: {
    name: 'M. Anbarasan, IAS',
    role: 'state_officer',
    title: 'State Nodal Officer (Supply Chain)',
    location: 'Directorate of Public Health, Tamil Nadu',
    assignedStateId: 'TN',
  },
  national_observer: {
    name: 'Dr. Aarti Sharma',
    role: 'national_observer',
    title: 'National Healthcare Observer',
    location: 'National Health Systems Resource Centre, New Delhi',
  },
};

