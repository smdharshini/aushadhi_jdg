import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { JudgePage } from './pages/JudgePage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { ForecastPage } from './pages/ForecastPage';
import { FederatedLabPage } from './pages/FederatedLabPage';
import { TransfersPage } from './pages/TransfersPage';
import { AlertsPage } from './pages/AlertsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AskAushadhiPage } from './pages/AskAushadhiPage';
import { PhcEntryPage } from './pages/PhcEntryPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { DataPage } from './pages/DataPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header />
      {/* Show operations Navbar on app and info pages */}
      {!isLanding && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/judge" element={<JudgePage />} />
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/map" element={<MapPage />} />
          <Route path="/app/forecast" element={<ForecastPage />} />
          <Route path="/app/federated" element={<FederatedLabPage />} />
          <Route path="/app/transfers" element={<TransfersPage />} />
          <Route path="/app/alerts" element={<AlertsPage />} />
          <Route path="/app/simulator" element={<SimulatorPage />} />
          <Route path="/app/ask" element={<AskAushadhiPage />} />
          <Route path="/entry" element={<PhcEntryPage />} />
          <Route path="/method" element={<MethodologyPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Direct URL convenience aliases matching documentation */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/map" element={<Navigate to="/app/map" replace />} />
          <Route path="/forecast" element={<Navigate to="/app/forecast" replace />} />
          <Route path="/federated" element={<Navigate to="/app/federated" replace />} />
          <Route path="/transfers" element={<Navigate to="/app/transfers" replace />} />
          <Route path="/alerts" element={<Navigate to="/app/alerts" replace />} />
          <Route path="/simulator" element={<Navigate to="/app/simulator" replace />} />
          <Route path="/ask" element={<Navigate to="/app/ask" replace />} />
          <Route path="/phc-entry" element={<Navigate to="/entry" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
