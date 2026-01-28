import React, { createContext, useContext, useState } from 'react';
import { Campaign, CampaignType } from '../types';

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  getCampaign: (id: string) => Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

// Initial Mock Data
const initialCampaigns: Campaign[] = [
  { 
    id: '1', 
    title: 'Summer Beauty Collection 2024', 
    brandName: 'Acme Co.',
    brandId: 'brand-1', // Mock brandId
    type: [CampaignType.GMV, CampaignType.CONTENT_VOLUME, CampaignType.LUCKY_DRAW],
    status: 'active', 
    applicants: 45, 
    totalBudget: 50000, 
    spent: 32500, 
    startDate: '2026-01-15',
    endDate: '2026-02-28',
    description: 'Launch our new summer collection with a bang!',
    coverImage: 'https://picsum.photos/seed/camp1/400/300',
    rewardTiers: [],
    resources: [
      { id: 'r1', title: 'Brand Logo & Assets.zip', type: 'file', url: '#', size: '24 MB' },
      { id: 'r2', title: 'Content Guidelines PDF', type: 'file', url: '#', size: '2.5 MB' },
      { id: 'r3', title: 'Product Landing Page', type: 'link', url: 'https://example.com/product' }
    ],
    applicantList: [], // Populated in component for Demo ID 1
    submissionList: [], // Populated in component for Demo ID 1
    kpi: { creators: 12, submissions: 45, totalViews: '150K', engagement: '8.5%' }
  },
  { 
    id: '2', 
    title: 'Tech Gadget Review', 
    brandName: 'TechNova',
    brandId: 'brand-2', // Mock brandId
    type: [CampaignType.CONTENT_VOLUME],
    status: 'draft', 
    applicants: 0, 
    totalBudget: 25000, 
    spent: 0, 
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    description: 'Review our latest wireless earbuds.',
    coverImage: 'https://picsum.photos/seed/camp2/400/300',
    rewardTiers: [],
    resources: [
      { id: 'r1', title: 'Product Specs Sheet', type: 'file', url: '#', size: '1 MB' },
    ],
    applicantList: [],
    submissionList: []
  },
  { 
    id: '3', 
    title: 'Holiday Special', 
    brandName: 'GiftShop',
    brandId: 'brand-3', // Mock brandId
    type: [CampaignType.GMV],
    status: 'upcoming', 
    applicants: 12, 
    totalBudget: 100000, 
    spent: 0, 
    startDate: '2026-12-01',
    endDate: '2026-12-25',
    description: 'Christmas special promotion.',
    coverImage: 'https://picsum.photos/seed/camp3/400/300',
    rewardTiers: [],
    resources: [],
    applicantList: [],
    submissionList: []
  },
];

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  const addCampaign = (campaign: Campaign) => {
    // Ensure new campaigns have empty lists initialized
    const newCampaign = {
      ...campaign,
      applicantList: [],
      submissionList: [],
      leaderboardData: { gmv: [], volume: [], luckyDrawPool: [], luckyDrawWinners: [] }
    };
    setCampaigns(prev => [newCampaign, ...prev]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const getCampaign = (id: string) => {
    return campaigns.find(c => c.id === id);
  };

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign, updateCampaign, getCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};