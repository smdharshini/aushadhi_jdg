import React from 'react';
import { Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-line pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-ink-muted mb-1">
          <Scale className="w-3.5 h-3.5 text-teal" />
          <span>OPERATIONAL PROTOCOLS</span>
        </div>
        <h1 className="font-serif font-bold text-3xl text-ink">
          Operational Terms of Use
        </h1>
        <p className="text-ink-muted text-xs font-mono mt-1">
          Aushadhi Grid Health Supply Resilience System &bull; Effective September 2026
        </p>
      </div>

      <div className="bg-bg-paper border border-line rounded p-6 space-y-5 text-xs text-ink-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            1. Scope of Use & Decision Support Designation
          </h2>
          <p>
            Aushadhi Grid provides automated risk forecasting, days-of-cover monitoring, and redistribution route optimization
            as an algorithmic decision support system. Algorithmic transfer recommendations and alert notifications are subject to
            human review and official authorization by designated District Health Officers, State Nodal Officers, or National Observers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            2. Role-Based Authorization & Cryptographic Audit Trails
          </h2>
          <p>
            All data entries, alert acknowledgments, and transfer approvals executed within the platform are immutably recorded
            with actor identity, authorization role, and UTC timestamp. Users must ensure that operations executed under their credentials
            reflect accurate physical checks at the facility level.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            3. Synthetic Testbed Environment
          </h2>
          <p>
            This deployment is a simulated prototype developed for the Google &quot;Build with AI: Code for Communities&quot; hackathon.
            While algorithmic calculations (regression forecasting, FedAvg aggregation, Haversine routing) are fully functional and mathematical,
            all facility data is synthetically seeded.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif font-bold text-sm text-ink">
            4. System Resilience & Offline-First Operations
          </h2>
          <p>
            The software implements local offline mutation queuing to guarantee operational availability during network interruptions.
            Users are responsible for ensuring physical device synchronization upon restoration of internet connectivity.
          </p>
        </section>
      </div>
    </div>
  );
};
