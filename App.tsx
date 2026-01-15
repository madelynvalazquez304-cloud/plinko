
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Plinko from './pages/Plinko';
import Trading from './pages/Trading';
import Crash from './pages/Crash';
import Mines from './pages/Mines';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import { UserProvider } from './context/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/plinko" element={<Plinko />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/crash" element={<Crash />} />
        <Route path="/mines" element={<Mines />} />
        <Route path="/mainadmin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  );
};

export default App;
