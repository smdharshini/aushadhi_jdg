import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROLE_PROFILES } from '../data/masterData';
import { Role } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileEdit,
  MapPin,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const JudgePage: React.FC = () => {
  const { role, setRole, applyScenario, resetAllData } = useApp();
  const navigate = useNavigate();

  const handleSelectRole = (newRole: Role, redirectPath: string) => {
    setRole(newRole);
    navigate(redirectPath);
  };

  const handleLaunchOutbreakDemo = () => {
    // Activate Madurai Dengue scenario and switch to District Officer
    setRole('district_officer');
    applyScenario({
      id: 'SCENARIO_MDU_DENGUE',
      name: 'Madurai Post-Monsoon Dengue & Fever Outbreak',
      description: 'Acute 2.5x surge in Paracetamol and ORS consumption across Madurai district PHCs.',
      stateId: 'TN',
      districtId: 'TN_MDU',
      medicineId: 'med-01',
      demandMultiplier: 2.5,
      durationWeeks: 4,
    });
    navigate('/app/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-5">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-bg-muted border border-line text-xs font-mono mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal" />
          <span>EVALUATION PORTAL</span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink">
          Try as a Judge: One-Click Role Authentication
        </h1>
        <p className="text-ink-muted text-sm mt-1 max-w-3xl leading-relaxed">
          Select any healthcare role below to switch system perspectives instantly. Each persona is pre-configured with authentic geographical scopes, authorization tiers, and contextual actions.
        </p>
      </div>

      {/* Recommended 2-Minute Demo Scenario Card */}
      <div className="bg-warning-subtle border border-warning-border rounded p-5 space-y-3">
        <div className="flex items-center space-x-2 text-warning font-semibold text-xs tracking-wider uppercase font-mono">
          <AlertTriangle className="w-4 h-4" />
          <span>Recommended 2-Minute Judge Walkthrough Scenario</span>
        </div>
        <h2 className="font-serif font-bold text-lg text-ink">
          Dengue Outbreak Surge in Madurai & Automated Coimbatore Rebalancing
        </h2>
        <p className="text-xs text-ink-muted leading-relaxed max-w-3xl">
          Launches the complete operational lifecycle: A 2.5x demand surge triggers critical stock-out alerts in Madurai.
          The transparent regression engine updates days of cover to under 4 days, while the redistribution solver automatically
          identifies donor surplus from Coimbatore and generates an optimal transfer order ready for officer approval.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={handleLaunchOutbreakDemo}
            className="inline-flex items-center space-x-2 bg-teal hover:bg-teal-hover text-bg-paper px-4 py-2 rounded text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Launch Outbreak Demo Flow</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={resetAllData}
            className="inline-flex items-center space-x-1.5 bg-bg hover:bg-bg-muted border border-line text-ink px-3 py-2 rounded text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-ink-muted" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 4 Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Role 1: PHC Staff */}
        <div
          className={`border rounded p-5 space-y-3 transition-all ${
            role === 'phc_staff'
              ? 'border-teal bg-teal-subtle/30 shadow-xs'
              : 'border-line bg-bg-paper hover:border-ink-muted'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-bg-muted border border-line">
              TIER 1: FRONTLINE
            </span>
            {role === 'phc_staff' && (
              <span className="flex items-center space-x-1 text-xs text-teal font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Role</span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-ink">
              PHC Staff (Frontline Data Entry)
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {ROLE_PROFILES.phc_staff.name} &bull; {ROLE_PROFILES.phc_staff.title}
            </p>
            <p className="text-[11px] font-mono text-ink-faint">
              {ROLE_PROFILES.phc_staff.location}
            </p>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Performs daily stock counts, bed census, and staff attendance in under 30 seconds.
            Works completely offline with automatic background sync.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleSelectRole('phc_staff', '/entry')}
              className="inline-flex items-center space-x-1.5 w-full justify-center bg-teal hover:bg-teal-hover text-bg-paper px-3 py-2 rounded text-xs font-medium transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Login as PHC Staff (Open Entry)</span>
            </button>
          </div>
        </div>

        {/* Role 2: District Health Officer */}
        <div
          className={`border rounded p-5 space-y-3 transition-all ${
            role === 'district_officer'
              ? 'border-teal bg-teal-subtle/30 shadow-xs'
              : 'border-line bg-bg-paper hover:border-ink-muted'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-bg-muted border border-line">
              TIER 2: DISTRICT
            </span>
            {role === 'district_officer' && (
              <span className="flex items-center space-x-1 text-xs text-teal font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Role</span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-ink">
              District Health Officer (DDHS)
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {ROLE_PROFILES.district_officer.name} &bull; {ROLE_PROFILES.district_officer.title}
            </p>
            <p className="text-[11px] font-mono text-ink-faint">
              {ROLE_PROFILES.district_officer.location}
            </p>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Monitors 5 peripheral PHCs across Madurai, tracks critical stock-outs, acknowledges early warnings,
            and approves intra-district medicine dispatches.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleSelectRole('district_officer', '/app/dashboard')}
              className="inline-flex items-center space-x-1.5 w-full justify-center bg-teal hover:bg-teal-hover text-bg-paper px-3 py-2 rounded text-xs font-medium transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Login as District Officer (Dashboard)</span>
            </button>
          </div>
        </div>

        {/* Role 3: State Nodal Officer */}
        <div
          className={`border rounded p-5 space-y-3 transition-all ${
            role === 'state_officer'
              ? 'border-teal bg-teal-subtle/30 shadow-xs'
              : 'border-line bg-bg-paper hover:border-ink-muted'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-bg-muted border border-line">
              TIER 3: STATE
            </span>
            {role === 'state_officer' && (
              <span className="flex items-center space-x-1 text-xs text-teal font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Role</span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-ink">
              State Nodal Officer (Supply Chain)
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {ROLE_PROFILES.state_officer.name} &bull; {ROLE_PROFILES.state_officer.title}
            </p>
            <p className="text-[11px] font-mono text-ink-faint">
              {ROLE_PROFILES.state_officer.location}
            </p>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Maintains state-wide inventory visibility across all 6 Tamil Nadu districts.
            Approves inter-district transfers and initiates local federated training passes.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleSelectRole('state_officer', '/app/transfers')}
              className="inline-flex items-center space-x-1.5 w-full justify-center bg-teal hover:bg-teal-hover text-bg-paper px-3 py-2 rounded text-xs font-medium transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Login as State Officer (Transfers)</span>
            </button>
          </div>
        </div>

        {/* Role 4: National Observer */}
        <div
          className={`border rounded p-5 space-y-3 transition-all ${
            role === 'national_observer'
              ? 'border-teal bg-teal-subtle/30 shadow-xs'
              : 'border-line bg-bg-paper hover:border-ink-muted'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-bg-muted border border-line">
              TIER 4: NATIONAL
            </span>
            {role === 'national_observer' && (
              <span className="flex items-center space-x-1 text-xs text-teal font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Role</span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-ink">
              National Observer (NHSRC)
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {ROLE_PROFILES.national_observer.name} &bull; {ROLE_PROFILES.national_observer.title}
            </p>
            <p className="text-[11px] font-mono text-ink-faint">
              {ROLE_PROFILES.national_observer.location}
            </p>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Read-only overview across all 4 states (TN, MH, BR, KL). Authorizes cross-state emergency transfers
            and oversees the Federated Learning aggregation protocol.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleSelectRole('national_observer', '/app/federated')}
              className="inline-flex items-center space-x-1.5 w-full justify-center bg-teal hover:bg-teal-hover text-bg-paper px-3 py-2 rounded text-xs font-medium transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Login as National Observer (Fed Lab)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
