import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import HomePage from './pages/HomePage';
import LandingPage from './pages/Try';
import SettingsPage from './pages/SettingsPage';
import SummaryPage from './pages/SummaryPage';
import HistoryPage from './pages/HistoryPage';
import Register from './pages/Register';
import Login from './pages/Login';
import ChatInterface from './pages/ChatInterface';
import DocumentDrafter from './pages/doc'

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') ? true : false
  );

  const setAuth = (boolean: boolean) => {
    setIsAuthenticated(boolean);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F0EB] flex">
        <Sidebar isAuthenticated={isAuthenticated} setAuth={setAuth} />
        <main className="ml-64 flex-1 p-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/summarize" 
              element={
                isAuthenticated ? 
                  <SummaryPage /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/chat" 
              element={
                isAuthenticated ? 
                  <ChatInterface /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/draft" 
              element={
                isAuthenticated ? 
                  <DocumentDrafter /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/history" 
              element={
                isAuthenticated ? 
                  <HistoryPage /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/settings" 
              element={
                isAuthenticated ? 
                  <SettingsPage /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? 
                  <Register setAuth={setAuth} /> : 
                  <Navigate to="/" />
              } 
            />
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? 
                  <Login setAuth={setAuth} /> : 
                  <Navigate to="/" />
              } 
            />
            <Route path="/try" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;