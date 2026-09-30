import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Language } from '../i18n/translations';

export const Header: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    t,
    isOnline,
    pendingSyncCount,
    syncOfflineQueue,
    activeScenario,
  } = useApp();
  const navigate = useNavigate();

  return (
    <header className="border-b border-line bg-bg-paper text-ink sticky top-0 z-30 shadow-xs">
      {/* Emergency Scenario Banner if active */}
      {activeScenario && (
        <div className="bg-warning-subtle border-b border-warning-border px-4 py-1.5 text-xs text-ink flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="font-semibold text-warning">
              {t('emergencySimulatorActive')}:
            </span>
            <span>
              {activeScenario.name} in {activeScenario.districtId} ({activeScenario.demandMultiplier}x multiplier)
            </span>
          </div>
          <Link
            to="/app/simulator"
            className="text-ink hover:underline font-medium text-xs ml-4"
          >
            Adjust in Simulator &rarr;
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Product Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded bg-teal flex items-center justify-center text-bg-paper shadow-xs">
                <Activity className="w-5 h-5 text-bg" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-lg text-ink tracking-tight group-hover:text-teal transition-colors">
                    {t('appTitle')}
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted leading-tight hidden sm:block">
                  National PHC Supply Chain Resilience
                </p>
              </div>
            </Link>

            <Link
              to="/data"
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-bg-muted text-ink-muted border border-line hover:border-ink-muted transition-colors"
              title="Click to view data disclosure"
            >
              {t('simulatedData')}
            </Link>
          </div>
        </div>

        {/* Right Section: Sync, Role Badge, Language Switcher, Demo Judge Link */}
        <div className="flex items-center space-x-3">
          {/* Offline & Sync Status */}
          <div className="flex items-center space-x-1.5 text-xs font-mono px-2 py-1 rounded bg-bg border border-line">
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-success" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-critical" />
            )}
            <span className="text-[11px]">
              {pendingSyncCount > 0 ? (
                <button
                  onClick={syncOfflineQueue}
                  className="flex items-center space-x-1 text-warning hover:underline font-semibold"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{pendingSyncCount} pending (sync)</span>
                </button>
              ) : (
                <span className="text-ink-muted hidden md:inline">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              )}
            </span>
          </div>

          {/* Current Role Indicator */}
          <div
            onClick={() => navigate('/judge')}
            className="cursor-pointer border border-line hover:border-teal rounded px-2.5 py-1 bg-bg-subtle text-left hidden lg:block transition-colors"
            title="Click to switch role or view judge presets"
          >
            <div className="flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal" />
              <span className="text-xs font-medium text-ink">{user.name}</span>
            </div>
            <p className="text-[10px] text-ink-muted font-mono truncate max-w-[190px]">
              {user.title}
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center border border-line rounded overflow-hidden text-xs font-mono">
            {(['en', 'hi', 'ta'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 transition-colors ${
                  language === lang
                    ? 'bg-teal text-bg-paper font-semibold'
                    : 'bg-bg hover:bg-bg-muted text-ink'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
