import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import HomePage from './pages/HomePage';
import LandingPage from './pages/Try';
import SettingsPage from './pages/SettingsPage';
import SummaryPage from './pages/SummaryPage';
import HistoryPage from './pages/HistoryPage';
import SummaryView from './pages/SummaryView';
const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#F5F0EB] flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/summarize" element={<SummaryPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/summary/:id" element={<SummaryView />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/try" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
