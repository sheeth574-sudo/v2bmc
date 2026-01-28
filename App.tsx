import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BrandDashboard } from './components/BrandDashboard';
import { CreatorDashboard } from './components/CreatorDashboard';
import { CampaignCreate } from './components/CampaignCreate';
import { CampaignBrowse } from './components/CampaignBrowse';
import { CampaignsList } from './components/CampaignsList';
import { CampaignDetail } from './components/CampaignDetail';
import { CreatorCampaignDetail } from './components/CreatorCampaignDetail';
import { MyTasks } from './components/MyTasks';
import { SubmitWork } from './components/SubmitWork';
import { Messaging } from './components/Messaging';
import { Settings } from './components/Settings';
import { LoginScreen } from './components/LoginScreen';
import { UserRole } from './types';
import { CampaignProvider } from './contexts/CampaignContext';
import { UserProvider, useUser } from './contexts/UserContext';

function AppContent() {
  const { user } = useUser();

  if (!user) {
    return <LoginScreen />;
  }

  const role = user.role;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={role === UserRole.BRAND ? <BrandDashboard /> : <CreatorDashboard />} />
        
        {/* Brand Routes */}
        <Route path="/campaigns" element={role === UserRole.BRAND ? <CampaignsList /> : <Navigate to="/" />} />
        <Route path="/campaigns/:id" element={role === UserRole.BRAND ? <CampaignDetail /> : <Navigate to="/" />} />
        <Route path="/create-campaign" element={role === UserRole.BRAND ? <CampaignCreate /> : <Navigate to="/" />} />
        
        {/* Creator Routes */}
        <Route path="/browse" element={role === UserRole.CREATOR ? <CampaignBrowse /> : <Navigate to="/" />} />
        <Route path="/browse/:id" element={role === UserRole.CREATOR ? <CreatorCampaignDetail /> : <Navigate to="/" />} />
        <Route path="/my-tasks" element={role === UserRole.CREATOR ? <MyTasks /> : <Navigate to="/" />} />
        <Route path="/submit/:id" element={role === UserRole.CREATOR ? <SubmitWork /> : <Navigate to="/" />} />

        {/* Shared Routes */}
        <Route path="/messages" element={<Messaging />} />
        <Route path="/settings" element={<Settings />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <UserProvider>
      <CampaignProvider>
        <AppContent />
      </CampaignProvider>
    </UserProvider>
  );
}

export default App;