import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import EntriesPage from './components/EntriesPage';
import RoutinesPage from './components/RoutinesPage';
import StartPage from './components/StartPage';
import OverviewPage from './components/OverviewPage';
import { ErrorProvider, useError } from './ErrorContext';
import './global.css';
import './App.css';

const ErrorNotification = () => {
  const { error, notification } = useError();

  if (!error && !notification) return null;

  return (
    <div className={`notification ${error ? 'error' : 'success'}`}>
      {error || notification}
    </div>
  );
};

function AppContent() {
  const location = useLocation();

  return (
    <div className="App">
      <ErrorNotification />
      <header>
        <nav>
          <ul>
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Start</Link></li>
            <li><Link to="/entries" className={location.pathname === '/entries' ? 'active' : ''}>Entries</Link></li>
            <li><Link to="/routines" className={location.pathname === '/routines' ? 'active' : ''}>Routines</Link></li>
            <li><Link to="/overview" className={location.pathname === '/overview' ? 'active' : ''}>Overview</Link></li>
          </ul>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/overview" element={<OverviewPage />} />
        </Routes>
      </main>

      <footer>
        <p>&copy; 2023 Practice Tool. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ErrorProvider>
      <AppContent />
    </ErrorProvider>
  );
}

export default App;