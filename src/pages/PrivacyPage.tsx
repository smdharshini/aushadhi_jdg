import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-line pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-ink-muted mb-1">
          <Shield className="w-3.5 h-3.5 text-teal" />
          <span>DATA PROTECTION & PRIVACY GOVERNANCE</span>
        </div>
        <h1 className="font-serif font-bold text-3xl text-ink">
          Privacy Policy
        </h1>
        <p className="text-ink-muted text-xs font-mono mt-1">
          Governed under India&apos;s Digital Personal Data Protection (DPDP) Act 2023 &bull; Last Revised: September 2026
        </p>
      </div>

      <div className="bg-bg-paper border border-line rounded p-6 space-y-5 text-xs text-ink-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            1. Fundamental Data Architecture & Zero Patient Data Guarantee
          </h2>
          <p>
            Aushadhi Grid is engineered exclusively as a logistics, facility capacity, and pharmaceutical stock tracking system.
            Under no circumstances does the platform solicit, record, transmit, or process individual patient records, personal health information (PHI),
            diagnostic history, prescription records, or demographic identifiers. All metrics recorded are facility-level aggregations
            (e.g., aggregate daily outpatient counts, bed occupancy totals, and physical stock lot tallies).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            2. Alignment with the Digital Personal Data Protection (DPDP) Act 2023
          </h2>
          <p>
            In accordance with India&apos;s DPDP Act 2023 principles of purpose limitation and data minimization:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Data Minimization:</strong> Only data strictly essential for supply chain resilience (batch numbers, expiry dates, pack counts) is gathered.</li>
            <li><strong>State Sovereignty & Federated Learning:</strong> State health data is not centralized into a single federal database. Predictive models are trained locally within sandboxed state worker contexts, and only numerical model parameter updates (weights) are aggregated.</li>
            <li><strong>Storage Limitation:</strong> Facility returns and operational logs are stored strictly for supply chain auditing and demand forecasting iterations.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            3. Synthetic Data Environment Notice
          </h2>
          <p>
            All operational records currently hosted within this demonstration deployment are generated from synthetic epidemiological simulations.
            Any resemblance to live facility inventory counts or current patient census is purely demonstrative and intended for hackathon evaluation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            4. Institutional Contact & Governance Inquiries
          </h2>
          <p>
            For privacy audits, verification requests, or operational inquiries regarding this architecture, please contact:
          </p>
          <div className="bg-bg p-3 rounded border border-line font-mono text-ink text-xs">
            Data Protection Governance Liaison<br />
            Email: resilience-grid@health.gov.in.placeholder<br />
            National Health Systems Resource Centre (NHSRC), New Delhi
          </div>
        </section>
      </div>
    </div>
  );
};
