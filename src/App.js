import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabase';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './styles/App.css';

function App() {
  const [session, setSession] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Parse magic link + get current session on first load
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setBootstrapping(false);
    });

    // Listen for subsequent auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  if (bootstrapping) {
    // Prevent bouncing back to landing during magic-link handshake
    return <div className="app-loading">Loading…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* If signed in, go to dashboard; else show landing */}
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

        {/* Protect dashboard */}
        <Route
          path="/dashboard"
          element={session ? <Dashboard session={session} /> : <Navigate to="/" replace />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
