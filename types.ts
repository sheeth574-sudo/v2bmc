import React from 'react';

export enum UserRole {
  BRAND = 'BRAND',
  CREATOR = 'CREATOR',
}

export enum CampaignType {
  GMV = 'GMV',
  CONTENT_VOLUME = 'CONTENT_VOLUME',
  LUCKY_DRAW = 'LUCKY_DRAW',
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface SocialStats {
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  handle: string;
  followers: string;
  avgViews: string;
  engagementRate: string;
  connected: boolean;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string; // Mock email
  avatar: string;
  // Creator specific
  shippingAddress?: string;
  bankInfo?: BankInfo;
  socialStats?: SocialStats;
  // Brand specific
  companyName?: string;
  walletBalance?: number; // Virtual tracking only
}

export interface RewardTier {
  id: string;
  rankStart?: number;
  rankEnd?: number;
  condition: string;
  amount: number;
  description?: string;
  tierType?: CampaignType;
}

export interface Applicant {
  id: string; // User ID
  name: string;
  avatar: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  followers: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  requestSample?: boolean;
  shippingAddress?: string;
  sampleStatus?: 'pending' | 'sent' | 'received'; // Added logistics status
}

export interface Submission {
  id: string;
  creatorId: string;
  creatorName: string;
  avatar: string;
  link: string;
  sparkAdsCode?: string; // New field for Spark Ads
  views: string;
  likes: string;
  status: 'pending' | 'approved' | 'rejected';
  thumbnail: string;
  submittedAt: string;
}

export interface PayoutItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  amount: number | string;
  reason: string;
  status: 'unpaid' | 'paid';
  paidAt?: string;
  bankDetails?: string; // Snapshot of where to pay
}

export interface LeaderboardItem {
  rank: number;
  creatorId: string;
  name: string;
  avatar: string;
  score: number | string;
  subtext: string;
  reward: number | string;
  rewardTier: string;
  isEligible: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'file' | 'link' | 'image';
  url: string;
  size?: string;
}

export interface Campaign {
  id: string;
  title: string;
  brandName: string;
  brandId: string; // Link to the brand user
  type: CampaignType[];
  status: 'draft' | 'active' | 'completed' | 'upcoming';
  totalBudget: number;
  spent: number; 
  applicants: number; 
  startDate: string;
  endDate: string;
  description: string;
  coverImage: string;
  rewardTiers: RewardTier[];
  requirements?: {
    minFollowers?: number;
    category?: string;
    hashtag?: string;
    productLink?: string;
  };
  resources?: Resource[];
  // Dynamic Data Lists
  applicantList?: Applicant[];
  submissionList?: Submission[];
  leaderboardData?: {
    gmv?: LeaderboardItem[];
    volume?: LeaderboardItem[];
    luckyDrawPool?: LeaderboardItem[];
    luckyDrawWinners?: LeaderboardItem[];
  };
  payouts?: PayoutItem[]; // Track payments
  kpi?: {
    creators: number;
    submissions: number;
    totalViews: string;
    engagement: string;
  }
}

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  unread: boolean;
}