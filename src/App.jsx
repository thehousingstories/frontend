import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getToken } from './api';
import { Footer, Header, ScrollManager } from './components/Layout';
import { ToastProvider } from './hooks.jsx';
import { AuthProvider } from './auth.jsx';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';
import Account from './pages/Account.jsx';
import { api } from './api';
import PropertyDetails from './pages/PropertyDetails.jsx';
import Admin, { AdminLogin } from './pages/Admin.jsx';

function AdminGate() {
  const [logged, setLogged] = useState(!!getToken());
  useEffect(() => {
    const out = () => setLogged(false);
    window.addEventListener('ths-logout', out);
    return () => window.removeEventListener('ths-logout', out);
  }, []);
  return logged ? <Admin onLogout={() => setLogged(false)} /> : <AdminLogin onLogin={setLogged} />;
}

// Counts each unique visitor once (anonymous id stored in the browser)
function useVisitorCount() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem('ths_counted')) return;
      let id = localStorage.getItem('ths_visitor_id');
      if (!id) { id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`); localStorage.setItem('ths_visitor_id', id); }
      sessionStorage.setItem('ths_counted', '1');
      api('/stats/visit', { method: 'POST', body: JSON.stringify({ visitorId: id }) }).catch(() => {});
    } catch { /* storage blocked */ }
  }, []);
}

export default function App() {
  useVisitorCount();
  return (
    <ToastProvider>
      <AuthProvider>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/account" element={<Account />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/admin" element={<AdminGate />} />
        <Route path="*" element={<><Header /><div className="not-found"><h1>That story isn’t here.</h1><Link className="button button-dark" to="/">Back to home <ArrowRight size={16} /></Link></div><Footer /></>} />
      </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
