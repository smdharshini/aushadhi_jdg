import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Database, Lock, Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line bg-bg-paper text-ink mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-ink-muted">
          {/* Column 1: Platform Summary */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-sm text-ink">
                Aushadhi Grid
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-muted border border-line text-ink">
                Simulated Architecture
              </span>
            </div>
            <p className="text-ink-muted text-xs leading-relaxed max-w-lg">
              National health resource tracking and federated supply chain resilience platform.
              Operates strictly on facility-level stock lots, bed census, and staff counts. Zero patient-identifiable data is collected, transmitted, or processed.
            </p>
            <p className="text-[11px] font-mono text-ink-faint">
              Governed under principles of India's Digital Personal Data Protection (DPDP) Act 2023.
            </p>
          </div>

          {/* Column 2: Legal & Data */}
          <div>
            <h4 className="font-mono uppercase font-semibold text-ink text-[11px] mb-2 tracking-wider">
              Legal & Compliance
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-teal hover:underline flex items-center space-x-1.5">
                  <Shield className="w-3 h-3 text-teal" />
                  <span>Privacy Policy (DPDP 2023)</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal hover:underline flex items-center space-x-1.5">
                  <Scale className="w-3 h-3 text-teal" />
                  <span>Operational Terms of Use</span>
                </Link>
              </li>
              <li>
                <Link to="/data" className="hover:text-teal hover:underline flex items-center space-x-1.5">
                  <Database className="w-3 h-3 text-teal" />
                  <span>Synthetic Data Disclosure</span>
                </Link>
              </li>
              <li>
                <Link to="/method" className="hover:text-teal hover:underline flex items-center space-x-1.5">
                  <Lock className="w-3 h-3 text-teal" />
                  <span>Federated Learning Protocols</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Deployment Placeholder */}
          <div>
            <h4 className="font-mono uppercase font-semibold text-ink text-[11px] mb-2 tracking-wider">
              Deployment & Inquiries
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Maintained for Google Build with AI: Code for Communities (Second Edition).
            </p>
            <div className="mt-2 text-xs font-mono text-ink">
              <span className="text-ink-muted">Inquiries: </span>
              <span className="text-teal font-medium">resilience-grid@health.gov.in.placeholder</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-faint">
              Custom domain ready: Firebase Hosting configuration available in repository README.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-faint font-mono">
          <div>
            &copy; 2026 Aushadhi Grid Architecture. Open community submission.
          </div>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <span>Client Model: Web Workers FedAvg</span>
            <span>Regression: Ridge/Poisson L2</span>
            <span>Maps: Leaflet / OSM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
