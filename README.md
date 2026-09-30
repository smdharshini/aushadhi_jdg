# Aushadhi Grid

### Federated Forecasting & Redistribution Platform for Primary Health Centres in India

Aushadhi Grid is an AI-powered, privacy-conscious health supply-chain platform designed to help health authorities **predict medicine shortages, detect stock-out risks, and coordinate redistribution between districts**.

It combines demand forecasting, early-warning alerts, geospatial visualization, redistribution planning, federated learning, and an AI assistant into a single platform.

> Built for Google's Build with AI: Code for Communities, Second Edition — Problem 03: Smart Health & Supply Chain Resilience.

---

## The Problem

Primary Health Centres (PHCs) often report medicine stock manually or with delays. This can make it difficult for district and state authorities to identify shortages before they affect patients.

At the same time:

* Surplus medicines may exist in nearby districts.
* Demand can change rapidly during dengue outbreaks, floods, and heatwaves.
* Stock, bed availability, staff attendance, and patient footfall are often not viewed together.
* Different states may have useful local data but cannot easily collaborate on forecasting without sharing raw data.

This can result in **late detection of shortages and inefficient redistribution of available resources**.

---

## Our Solution

Aushadhi Grid provides a centralized operational view while supporting **local and federated forecasting**.

The platform helps health officers answer:

> **What medicine is likely to run out, when will it happen, and where can it be sourced from?**

### Core Capabilities

| Module             | Function                                                            |
| ------------------ | ------------------------------------------------------------------- |
| PHC Entry          | Record stock, beds, staff attendance and footfall                   |
| Live Map           | View stock-out risk across national, state, district and PHC levels |
| Forecasting        | Predict 4–8 week medicine demand                                    |
| Early Warning      | Calculate days of cover and stock-out probability                   |
| Redistribution     | Identify donors and recipients and create transfer orders           |
| Federated Learning | Train state-level models without sharing raw data                   |
| Scenario Simulator | Simulate dengue, flood and heatwave demand changes                  |
| Ask Aushadhi       | Query operational data using Gemini                                 |
| Reports            | Export situation briefs and transfer orders as PDF/CSV              |

The prototype uses **synthetic data only**. No patient-level data is stored or processed.

---

## How It Works

```text
PHC Data
   |
   v
Firestore
   |
   +--> Forecast Engine
   |       |
   |       v
   |   Demand Forecast
   |       |
   |       v
   |   Risk Detection
   |       |
   |       v
   |     Alerts
   |
   +--> Redistribution Solver
   |       |
   |       v
   |   Transfer Orders
   |       |
   |       v
   |   Approval Workflow
   |       |
   |       v
   |    Audit Log
   |
   +--> Federated Learning
           |
           v
      State Models
           |
           v
         FedAvg
           |
           v
      Shared Model
```

The architecture uses Firestore security rules for role and geographic access control, while state-level training nodes exchange model weights rather than raw data.

---

## Forecasting Engine

Aushadhi Grid uses **Ridge Regression** implemented in TypeScript.

### Features

* Lagged medicine consumption
* Week-of-year seasonality
* Sine/cosine seasonal features
* Rainfall and temperature index
* Outbreak indicator

The system generates **4–8 week demand forecasts with prediction intervals**.

### Days of Cover

```text
Days of Cover =
Current Stock / Forecast Daily Demand
```

The system uses the forecast interval to estimate the probability of a stock-out occurring within supplier lead time.

Risk levels are categorized as:

* Watch
* Warning
* Critical

---

## Early Warning System

The alert engine identifies medicines that may become unavailable before the shortage occurs.

Alerts include:

* Days of cover
* Stock-out probability
* Supplier lead-time context
* Reason for the alert
* Acknowledgement status
* Resolution status

This allows health officers to act **before a projected shortage becomes an actual stock-out**.

---

## Intelligent Redistribution

Aushadhi Grid identifies potential donor and recipient districts.

### Donor Conditions

A district can act as a donor when:

* It has more than **45 days of cover**
* It will remain above **30 days of cover** after the transfer

### Recipient Conditions

A district becomes a potential recipient when:

* It has fewer than **14 days of cover**

Transfers are matched using:

* Road distance
* Transfer cost
* Medicine expiry
* Current stock
* Projected consumption

Road distance is estimated using:

```text
Haversine Distance x 1.3
```

The system prioritizes lots that will be consumed before their expiry date.

---

## Federated Learning

Aushadhi Grid demonstrates a federated learning architecture where each state trains locally.

```text
Tamil Nadu -----+
Maharashtra ----+
Bihar ----------+----> FedAvg Aggregator ----> Shared Model
Kerala ---------+
```

Instead of sharing raw local data:

1. Each state trains its model locally.
2. Only model weights are sent to the aggregator.
3. The aggregator performs **Federated Averaging (FedAvg)**.
4. The shared model is generated.
5. Local-only and federated model errors are compared.

The prototype calculates MAPE from seeded data rather than using hardcoded accuracy values.

---

## Scenario Simulator

The platform can simulate sudden demand changes caused by:

* Dengue outbreaks
* Floods
* Heatwaves

A scenario applies a demand multiplier to a selected district and regenerates:

* Forecasts
* Alerts
* Risk levels
* Redistribution recommendations

This demonstrates how the system can respond to rapidly changing healthcare demand.

---

## Ask Aushadhi

Aushadhi Grid includes an AI assistant powered by **Gemini**.

It uses function calling to query operational data rather than generating answers from unsupported assumptions.

The assistant is designed to:

* Answer questions about available operational data
* Retrieve relevant information through functions
* Clearly state when the available data cannot answer a question

Gemini access is handled through a **server-side proxy**, keeping the API key away from the client.

---

## User Roles

| Role                        | Access                                                                    |
| --------------------------- | ------------------------------------------------------------------------- |
| **PHC Staff**               | Enter data for their own PHC                                              |
| **District Health Officer** | View their district and approve district-level transfers                  |
| **State Nodal Officer**     | View their state, approve inter-district transfers and run local training |
| **National Observer**       | Read-only national view and approval of cross-state transfers             |

Roles are stored using Firebase Authentication custom claims and enforced through Firestore security rules.

---

# Demo Flow

Aushadhi Grid is designed to be demonstrated using the seeded synthetic dataset.

The recommended demo follows the operational workflow:

```text
Login
  |
  v
Dashboard
  |
  v
Identify Medicine at Risk
  |
  v
Inspect Forecast and Alert
  |
  v
Find Available Surplus
  |
  v
Create / Review Redistribution
  |
  v
Approve Transfer
  |
  v
View Audit Trail
  |
  v
Run Scenario Simulation
  |
  v
Observe Updated Alerts and Transfers
```

### 1. Open the Demo

Open the deployed application:

```text
https://your-project.web.app
```

For the judge environment:

```text
/judge
```

The `/judge` route provides one-click access to the available demonstration roles.

### 2. Choose a Role

Select one of the available operational roles:

| Role                    | Demo Purpose                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| PHC Staff               | Enter and inspect PHC-level operational data                        |
| District Health Officer | Monitor district shortages and approve district transfers           |
| State Nodal Officer     | Monitor state-level conditions and approve inter-district transfers |
| National Observer       | View the national picture and cross-state transfers                 |

### 3. Start at the Dashboard

Begin with the dashboard and map.

Explore the hierarchy:

```text
India
 |
 +-- State
      |
      +-- District
           |
           +-- PHC
```

Use the available filters to narrow the view by state, medicine, district or PHC.

### 4. Inspect a Medicine Risk

Select a medicine with an elevated risk level.

Review:

* Current stock
* Forecast demand
* Days of cover
* Predicted stock-out probability
* Supplier lead-time context
* Alert severity
* Reason for the alert

### 5. Inspect the Forecast

Open the forecasting view and examine the projected demand for the next **4–8 weeks**.

Review the forecast and its prediction interval.

### 6. Find a Redistribution Opportunity

When a district is projected to run short, inspect potential donor districts.

```text
Recipient:
< 14 days of cover

Donor:
> 45 days of cover

Donor after transfer:
>= 30 days of cover
```

Review the proposed transfer based on distance, cost, available stock and expiry.

### 7. Review and Approve the Transfer

Open a transfer order and review:

* Donor district
* Recipient district
* Medicine
* Quantity
* Selected lot
* Expiry
* Route
* Estimated distance
* ETA
* Cost

Then demonstrate the approval workflow.

```text
Transfer Recommendation
        |
        v
Approval
        |
        v
Transfer Order
        |
        v
Audit Log
```

### 8. Run the Scenario Simulator

Open the scenario simulator and apply:

* Dengue
* Flood
* Heatwave

Observe how the scenario changes:

```text
Scenario
   |
   v
Demand
   |
   v
Forecast
   |
   v
Risk
   |
   v
Alerts
   |
   v
Redistribution Recommendations
```

### 9. Demonstrate Federated Learning

Open the federated learning section and show the simulated state nodes.

```text
State A -----+
State B -----+
State C -----+----> FedAvg ----> Shared Model
State D -----+
```

Demonstrate that the state nodes train locally and the aggregator receives model weights.

### 10. Ask Aushadhi

Use the AI assistant to ask questions about the operational data.

Example questions:

```text
Which districts are at highest stock-out risk?

Which medicines have less than 14 days of cover?

Where is there enough surplus to support a shortage?

Why was this transfer recommended?

Which districts were affected by the dengue scenario?
```

---

# Recommended 3-Minute Judge Demo

If the demonstration time is limited, use the following sequence.

### 0:00–0:30 — Problem

Show the national or state map and explain how the platform identifies projected medicine shortages before they become stock-outs.

### 0:30–1:00 — Forecast and Alert

Select an at-risk medicine and demonstrate:

```text
Forecast
   |
Days of Cover
   |
Stock-out Probability
   |
Alert
```

### 1:00–1:30 — Redistribution

Show a shortage, identify a potential surplus donor, and walk through the transfer recommendation.

### 1:30–2:00 — Scenario Simulation

Apply a dengue, flood or heatwave scenario and show the resulting changes in forecasts, alerts and redistribution recommendations.

### 2:00–2:30 — Federated Learning

Show the state nodes training locally and the FedAvg aggregation process.

### 2:30–3:00 — Ask Aushadhi

Ask a data-backed operational question and demonstrate the AI assistant's response.

---

# Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend and Cloud

* Firebase Authentication
* Firebase Firestore
* Firebase Hosting
* Firebase Cloud Functions

### AI

* Gemini API
* Function Calling
* Server-side API proxy

### Visualization

* Leaflet
* OpenStreetMap
* Recharts

### Other

* Progressive Web App (PWA)
* Service Worker
* Offline persistence
* English, Hindi and Tamil i18n
* Vitest
* Firebase Emulator

---

# Project Structure

```text
aushadhi-grid/
|
+-- src/
|   +-- components/       # Reusable UI components
|   +-- pages/            # Application pages/routes
|   +-- lib/
|   |   +-- forecast/     # Ridge regression and prediction intervals
|   |   +-- federated/    # FedAvg and Web Worker clients
|   |   +-- alerts/       # Days-of-cover and stock-out probability
|   |   +-- transfer/     # Redistribution solver
|   |
|   +-- i18n/             # English, Hindi and Tamil translations
|
+-- scripts/
|   +-- seed.ts           # Synthetic dataset generator
|
+-- functions/
|   +-- ...               # Gemini proxy Cloud Function
|
+-- firestore.rules       # Firestore security rules
+-- .env.example
+-- package.json
+-- README.md
```

---

# Local Setup

## Prerequisites

Make sure you have:

* Node.js 20 or later
* Firebase project
* Firebase Authentication enabled
* Firestore enabled
* Gemini API key
* Firebase CLI

---

## 1. Clone the Repository

```bash
git clone https://github.com/smdharshini/aushadhi_jdg.git

cd aushadhi-grid
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create the environment file:

```bash
cp .env.example .env
```

Add your Firebase web configuration to `.env`.

> Do not put the Gemini API key in the frontend `.env` file.

---

## 4. Configure Gemini

Store the Gemini API key as a Firebase server-side secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

The Gemini API is accessed through the server-side Cloud Function proxy.

---

## 5. Seed Demo Data

Run:

```bash
npm run seed
```

The seed script generates reproducible synthetic data containing:

* 4 states
* Approximately 6 districts per state
* Approximately 5 PHCs per district
* 14 essential medicines
* 12 months of weekly consumption data
* Seasonality and noise
* Stock lots and expiry dates
* Bed counts
* Staff rosters
* Aggregate footfall

The dataset uses a fixed random seed for reproducibility.

---

## 6. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed by Vite.

---

# Testing

Run application tests:

```bash
npm test
```

These cover areas including:

* Forecasting
* Federated averaging
* Redistribution solver

Run Firestore security-rule tests:

```bash
npm run test:rules
```

The Firebase Emulator is required for security-rule testing.

---

# Production Build and Deployment

Build the production application:

```bash
npm run build
```

Deploy to Firebase:

```bash
firebase deploy
```

---

# Data and Privacy

Aushadhi Grid uses **synthetic operational data** for the prototype.

The generated dataset contains:

* Medicine stock
* Batch and expiry information
* Bed counts
* Staff rosters
* Aggregate daily footfall
* Medicine consumption

No patient-level data is included.

The prototype is designed around the intent of India's **Digital Personal Data Protection Act, 2023**, with an architecture focused on aggregate operational data rather than patient records.

---

# Limitations

This project is a prototype and has several limitations:

* All data is synthetic.
* Forecast accuracy represents simulation results, not real PHC performance.
* Weather variables are simulated.
* Federated learning currently runs in the browser for demonstration.
* A real deployment would require state-level infrastructure.
* Secure aggregation and differential privacy are not yet implemented.
* Redistribution uses a greedy solver rather than a full minimum-cost-flow model.
* Vehicle capacity is not currently modeled.
* There is no integration yet with systems such as e-Aushadhi or HMIS.
* The system has not yet been tested with real PHC staff.

---

# Roadmap

Future development includes:

* [ ] Pilot deployment with a district using real stock records
* [ ] Integration with existing government stock systems
* [ ] Supplier lead-time integration
* [ ] Vehicle-capacity-aware redistribution
* [ ] Secure aggregation for federated learning
* [ ] Differential privacy
* [ ] SMS/WhatsApp-based data entry for low-connectivity PHCs

---

# Expected Impact

Aushadhi Grid aims to support health authorities by enabling:

**Predict → Detect → Act → Redistribute → Monitor**

Instead of waiting for a medicine to run out, the platform provides an operational workflow for identifying projected shortages and coordinating available surplus across districts.

---

# Project Links

* **Live Prototype:** `https://aushadhi-seven.vercel.app/`


---

# Team

**Team:** `STEGOSAURUS`

| Member   | Role     |
| -------- | -------- |
| `[Dharshini S M]` | `[Lead]` |
| `[Dhivyalakshmi B]` | `[Member]` |
| `[Nivethidha R B]` | `[Member]` |
| `[Priyanka R]` | `[Member]` |

---

# License

This project is licensed under the **MIT License**.

Add a `LICENSE` file to the repository root if using the MIT License.
