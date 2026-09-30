import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Boxes,
  Cpu,
  LineChart,
  ShieldCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <section className="bg-bg-paper border border-line rounded-lg p-8 sm:p-12 shadow-xs text-center sm:text-left relative overflow-hidden">
        {/* Subtle background crest accent */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-subtle/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-5 relative z-10">
          {/* Platform Emblem Tag */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-teal-subtle text-teal border border-teal-border text-xs font-mono font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-semibold">Aushadhi Grid</span>
            <span className="text-ink-faint">&bull;</span>
            <span>National PHC Supply Chain Resilience</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ink tracking-tight leading-tight">
            Resilient Medicine Supply Chains for Public Health
          </h1>

          {/* 1–2 line explanation of the platform */}
          <p className="text-ink-muted text-base sm:text-lg leading-relaxed">
            Aushadhi Grid connects peripheral Primary Health Centres with real-time inventory visibility,
            transparent demand projections, automated inter-district redistribution, and privacy-preserving federated intelligence without centralized data pooling.
          </p>

          {/* One Prominent Button */}
          <div className="pt-3 flex flex-col sm:flex-row items-center sm:items-center gap-4">
            <Link
              to="/judge"
              className="inline-flex items-center justify-center space-x-2.5 bg-teal hover:bg-teal-hover text-bg-paper px-6 py-3.5 rounded text-sm font-semibold transition-all shadow-xs hover:shadow group w-full sm:w-auto"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Try as Judge</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <span className="text-xs text-ink-muted font-mono">
              Role-based evaluation walkthrough across 4 health administrative tiers
            </span>
          </div>
        </div>
      </section>

      {/* Feature Highlights: Inventory, Forecasting, Early Warnings, Redistribution, Federated Intelligence */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-serif font-bold text-xl text-ink">
            Core Architecture Highlights
          </h2>
          <span className="text-xs font-mono text-ink-muted">5 MODULES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Inventory */}
          <div className="bg-bg-paper border border-line rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-teal/50 transition-colors shadow-xs">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded bg-bg-muted border border-line flex items-center justify-center text-teal">
                <Boxes className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">
                Inventory
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Real-time visibility into medicine counts, days of cover, and consumption velocity across rural dispensaries.
              </p>
            </div>
            <div className="pt-2 border-t border-line/60">
              <span className="text-[11px] font-mono text-teal font-medium">PHC Level Stock</span>
            </div>
          </div>

          {/* 2. Forecasting */}
          <div className="bg-bg-paper border border-line rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-teal/50 transition-colors shadow-xs">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded bg-bg-muted border border-line flex items-center justify-center text-teal">
                <LineChart className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">
                Forecasting
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Interpretable regression modeling with cyclic seasonal harmonics and rainfall indices projecting 4–8 weeks ahead.
              </p>
            </div>
            <div className="pt-2 border-t border-line/60">
              <span className="text-[11px] font-mono text-teal font-medium">4–8 Wk Forward Look</span>
            </div>
          </div>

          {/* 3. Early Warnings */}
          <div className="bg-bg-paper border border-line rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-teal/50 transition-colors shadow-xs">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded bg-bg-muted border border-line flex items-center justify-center text-critical">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">
                Early Warnings
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Proactive anomaly signals detecting stock-out vulnerabilities before essential supplies fall below 7 days cover.
              </p>
            </div>
            <div className="pt-2 border-t border-line/60">
              <span className="text-[11px] font-mono text-critical font-medium">Outbreak Shock Alert</span>
            </div>
          </div>

          {/* 4. Redistribution */}
          <div className="bg-bg-paper border border-line rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-teal/50 transition-colors shadow-xs">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded bg-bg-muted border border-line flex items-center justify-center text-teal">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">
                Redistribution
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Automated algorithmic stock rebalancing matching surplus donor centers with deficit PHCs without central pooling.
              </p>
            </div>
            <div className="pt-2 border-t border-line/60">
              <span className="text-[11px] font-mono text-teal font-medium">Optimal Rebalancing</span>
            </div>
          </div>

          {/* 5. Federated Intelligence */}
          <div className="bg-bg-paper border border-line rounded-lg p-5 space-y-3 flex flex-col justify-between hover:border-teal/50 transition-colors shadow-xs">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded bg-bg-muted border border-line flex items-center justify-center text-teal">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-ink">
                Federated Intelligence
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Collaborative model training across sovereign state nodes under India's DPDP Act 2023 without moving patient records.
              </p>
            </div>
            <div className="pt-2 border-t border-line/60">
              <span className="text-[11px] font-mono text-teal font-medium">DPDP Act Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Strip */}
      <section className="bg-bg-subtle border border-line rounded p-4 text-xs text-ink-muted flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>NATIONAL HEALTH GRID DEPLOYMENT PROTOTYPE</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <span>OFFLINE-FIRST SYNC</span>
          <span>&bull;</span>
          <span>EDGE COMPLIANT</span>
          <span>&bull;</span>
          <span>AYUSHMAN BHARAT ALIGNED</span>
        </div>
      </section>
    </div>
  );
};
