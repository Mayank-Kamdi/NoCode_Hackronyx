import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SenderSOSView } from './pages/SenderSOSView';
import { ReceiverSecurityView } from './pages/ReceiverSecurityView';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnalyticsView } from './pages/AnalyticsView';
import { wsClient } from './services/websocket';

const MainApp: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('edge');
  const [pathname, setPathname] = useState<string>(typeof window !== 'undefined' ? window.location.pathname : '');

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    if (role === 'ADMIN') setActiveTab('admin');
    else if (role === 'SECURITY') setActiveTab('security');
    else if (role === 'AI_EDGE_DEVICE') setActiveTab('edge');
  }, [role]);

  useEffect(() => {
    wsClient.connect();
  }, []);

  // Direct standalone mobile screens for Phone A (/sender) and Phone B (/security)
  if (pathname === '/sender') {
    return <SenderSOSView />;
  }

  if (pathname === '/security-mobile') {
    return <ReceiverSecurityView />;
  }

  return (
    <div className="min-h-screen bg-[#F4EEFF] text-[#424874] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'edge' && <SenderSOSView />}
        {activeTab === 'security' && <ReceiverSecurityView />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      <footer className="border-t border-[#A6B1E1]/40 bg-[#424874] py-3 px-4 text-center text-xs text-[#F4EEFF] font-mono">
        NoCode Emergency SOS Protocol &bull; Mobile-to-Mobile Real-Time Alert System
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
