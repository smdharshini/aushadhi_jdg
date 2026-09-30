import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  Cpu,
  Database,
  FileEdit,
  Flame,
  LayoutDashboard,
  LineChart,
  MapPin,
  MessageSquareCode,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, alerts, transfers } = useApp();

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;
  const pendingTransfersCount = transfers.filter((t) => t.status === 'pending').length;

  const navItems = [
    { to: '/app/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/app/map', label: t('navMap'), icon: MapPin },
    { to: '/entry', label: t('navEntry'), icon: FileEdit },
    { to: '/app/forecast', label: t('navForecast'), icon: LineChart },
    { to: '/app/federated', label: t('navFederated'), icon: Cpu },
    {
      to: '/app/alerts',
      label: t('navAlerts'),
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-critical text-bg-paper',
    },
    {
      to: '/app/transfers',
      label: t('navTransfers'),
      icon: ArrowRightLeft,
      badge: pendingTransfersCount > 0 ? pendingTransfersCount : undefined,
      badgeColor: 'bg-teal text-bg-paper',
    },
    { to: '/app/simulator', label: t('navSimulator'), icon: Flame },
    { to: '/app/ask', label: t('navAsk'), icon: MessageSquareCode },
    { to: '/method', label: t('navMethod'), icon: BookOpen },
    { to: '/data', label: t('navData'), icon: Database },
  ];

  return (
    <nav className="bg-bg-subtle border-b border-line overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal text-bg-paper font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-bg-muted'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
