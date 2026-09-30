# Aushadhi Grid | औषधी ग्रिड
### Resilient Federated Healthcare Supply Chain Intelligence for India's Primary Health Centres
**Submission for Google "Build with AI: Code for Communities, Second Edition" Hackathon**

---

## 1. Executive Summary & Problem Statement

Public healthcare systems across India face persistent supply chain vulnerabilities. The inability to track medicines, patient footfall, and resource utilization in real time across vast networks of Primary Health Centres (PHCs) leads to localized stock-outs, expiry waste, and severely limits rapid response during seasonal epidemics (e.g., Dengue outbreaks, monsoon floods).

**Aushadhi Grid** is a federated AI operational platform that provides:
1. **Real-Time Visibility**: Facility-level tracking of 14 National List of Essential Medicines (NLEM), bed occupancy, and medical personnel attendance across 120 PHCs spanning 4 Indian states (Tamil Nadu, Maharashtra, Bihar, Kerala).
2. **Transparent Demand Forecasting**: Ridge and Poisson regression forecasting with cyclic seasonality and 80%/95% confidence intervals, without opaque black-box predictions.
3. **Automated Cross-District Redistribution**: Constrained min-cost solver that matches donor facilities (buffer $\ge 30$ days) to deficit facilities ($<14$ days cover) via Haversine $\times 1.3$ road routing, prioritizing lots with soonest safe expiry.
4. **Federated Learning (FedAvg)**: Distributed model training in sandboxed Web Worker threads—state partitions compute local gradient updates without ever transmitting raw facility or clinical records.
5. **Zero Patient Data Guarantee**: Strict adherence to the **Digital Personal Data Protection (DPDP) Act 2023**; the platform operates exclusively on aggregate logistics and resource counts.
6. **Low-Bandwidth Offline PHC Entry**: Fast 30-second mobile entry workflow with IndexedDB queuing and automatic synchronization when network re-establishes.
7. **Emergency Outbreak Simulator**: Live sandbox testing epidemiological shocks (e.g. $2.5\times$ surge in Madurai) with instant alert generation and mitigation manifests.
8. **Ask Aushadhi Grounded Assistant**: Gemini 2.5 Flash proxy executing factual tool calling against live supply indices, generating official weekly situation briefs.

---

## 2. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  Aushadhi Grid UI                                 |
|                                                                                   |
|  [ National View ] <---> [ State Officer ] <---> [ District Officer ] <---> [ PHC ] |
|  - Multi-state maps      - Inter-district       - Intra-district        - 30s entry |
|  - Cross-state transfers - Local training       - Alert ack/resolve     - Offline DB|
|  - FedAvg central coord  - Situation brief      - Local stock dispatch  - Sync queue|
+-----------------------------------------------------------------------------------+
                                         |
     +-----------------------------------+-----------------------------------+
     |                                   |                                   |
     v                                   v                                   v
+-----------------------+   +-----------------------+   +-----------------------+
|  Mathematical Engines |   | Federated ML Engine   |   | Grounded LLM Proxy    |
|  - Ridge Regression   |   | - Web Worker Threads  |   | - Gemini 2.5 Flash    |
|  - Poisson Seasonality|   | - Local SGD Epochs    |   | - Structured Tools    |
|  - Min-Cost Solver    |   | - FedAvg Aggregator   |   | - Situation Briefs    |
|  - Haversine x 1.3    |   | - MAPE Benchmark      |   | - Zero Hallucinations |
+-----------------------+   +-----------------------+   +-----------------------+
```

---

## 3. Core Features & Mathematical Engines

### Transparent Demand Forecasting
- Mathematical model: Ridge regression with L2 regularization ($\lambda = 0.01$) and harmonic cyclic seasonality terms:
  $$\hat{y}(t) = \beta_0 + \beta_1 t + \beta_2 \sin\left(\frac{2\pi t}{52}\right) + \beta_3 \cos\left(\frac{2\pi t}{52}\right) + \sum_j \gamma_j X_j$$
- Computes lead-time stock-out probability using Gaussian cumulative distribution functions:
  $$P(\text{Stockout}) = 1 - \Phi\left(\frac{S - \mu_L}{\sigma_L}\right)$$
- Displays 80% and 95% forecast confidence bands.

### Constrained Min-Cost Redistribution Solver
- **Donors**: Facilities with $>45$ days of cover (and guaranteed post-transfer buffer $\ge 30$ days).
- **Recipients**: Facilities with $<14$ days of cover.
- **Objective**: Minimize road transit distance and freight cost ($₹22/\text{km}$) while matching earliest-expiring lots that will be fully consumed before expiration.
- **Distance**: Great-circle Haversine formula adjusted by India's national highway tortuosity factor ($\times 1.3$).

### Federated Learning Coordinator (FedAvg)
- Local model training runs inside independent Web Workers per state partition (TN, MH, BR, KL).
- Aggregates weight vectors proportional to sample size:
  $$w_{t+1} = \sum_{k=1}^K \frac{n_k}{n} w_{t+1}^k$$
- Quantifiable validation MAPE comparing uncoordinated local models against the federated consensus model.

---

## 4. Visual Design Language

Designed strictly according to the **Government of India Health Informatics Operational Standards**:
- **Palette**:
  - Forest Teal: `#0F5C4D` (Primary command, navigation, active states)
  - Warm Signal Orange: `#D9822B` (Early warnings, transfer indicators)
  - Alert Crimson: `#B3261E` (Critical stock-outs, emergency alerts)
  - Paper Background: `#F6F3EC` (Operational readability, low eye fatigue)
  - Deep Slate Ink: `#14211C` (High-contrast typography)
- **Typography**: IBM Plex Sans for UI metrics, IBM Plex Mono for timestamps and lot batches, Source Serif for authoritative headings.
- High-density tabular layouts with instant sorting and contextual badge states.

---

## 5. Synthetic Dataset Disclosure

Aushadhi Grid uses an auditable, deterministic synthetic dataset designed strictly for research, simulation, and hackathon evaluation:
- **Geography**: 4 States, 24 Districts, 120 Primary Health Centres with exact GPS coordinates.
- **Essential Medicines**: 14 NLEM medicines (Paracetamol, Amoxicillin, ORS, Metformin, Artemether, Rabies Vaccine, Oxytocin, etc.) with realistic batch numbers and expiry horizons.
- **Historical Depth**: 52 weeks of synthetic weekly consumption with seasonal spikes (e.g. monsoon dengue waves in July-September).
- All screens carry an explicit **"Simulated operational dataset &bull; Hackathon prototype"** disclosure banner.

---

## 6. Getting Started

### Prerequisites
- Node.js 20+ (tested on Node v24)
- npm or pnpm

### Installation
```bash
git clone <repo-url>
cd gle
npm install
```

### Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173/`.

### Linting
```bash
npm run lint
```

### Firebase Deployment
```bash
npm run build
firebase deploy --only hosting
```

---

## 7. 2-Minute Judge Evaluation Walkthrough

To review the complete system capabilities in under 2 minutes:

1. **Step 1: Role Switcher (`/judge`)**
   - Navigate to `/judge` to explore 1-click logins for all 4 personas:
     - **PHC Staff**: Mobile data entry & offline sync.
     - **District Health Officer**: Intra-district inventory & approval.
     - **State Nodal Officer**: Cross-district redistribution & state training.
     - **National Supply Observer**: Multi-state overview & global FedAvg aggregation.

2. **Step 2: Operations Map (`/map`)**
   - Click on the interactive Leaflet map.
   - Filter by **Tamil Nadu** and **Paracetamol 500mg**.
   - Notice the critical red marker on **Madurai** and healthy green marker on **Coimbatore**.

3. **Step 3: Emergency Simulator (`/simulator`)**
   - Select **Dengue Outbreak in Madurai, Tamil Nadu** ($2.5\times$ demand surge).
   - Click **Run Outbreak Simulation**.
   - Observe days of cover instantly drop from 18 days to 6.8 days, triggering an automated critical alert.

4. **Step 4: Automated Redistribution (`/transfers`)**
   - Navigate to `/transfers`.
   - See the generated transfer recommendation: **Coimbatore Depot $\rightarrow$ Madurai PHC** (2,000 units, 215 km road route, 5.4 hours ETA).
   - Click **Approve Transfer Order**; observe the status transition to Approved with audit timestamp.
   - Click **Export CSV** to verify the manifest output.

5. **Step 5: Federated Learning Lab (`/federated`)**
   - Switch to the `/federated` lab.
   - Click **Run Federated Round (FedAvg)**.
   - Watch the Web Worker threads compute local SGD epochs across TN, MH, BR, and KL.
   - Inspect the global model convergence and validation MAPE improvements.

6. **Step 6: Ask Aushadhi AI (`/ask`)**
   - Click one of the grounded prompt presets: *"Which Bihar districts run out of ORS in 10 days?"*
   - Inspect the executed tool call and grounded operational response.
   - Click **Export Brief (.txt)** or **Print Brief** to generate an official situational report.

7. **Step 7: Low-Bandwidth PHC Entry (`/phc-entry`)**
   - Test the 30-second mobile return screen.
   - Toggle offline mode or test local updates with automatic queue synchronization.

---

## 8. Compliance & Legal Disclosures

- **Zero Patient Data Guarantee**: Operates exclusively at facility-level supply aggregates.
- **DPDP Act 2023 Alignment**: No personal identifiers or biometric health records collected.
- Full methodological and governance disclosures available in `/method`, `/privacy`, `/terms`, and `/data`.
