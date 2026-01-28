import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

// --- MOCK DATA GENERATION ---
const BRAND_NAMES = ['TechNova', 'Glow Beauty', 'UrbanFit', 'HomeChef', 'PetParadise'];
const CREATOR_NAMES = [
  'Sarah Jenkins', 'Mike Chen', 'Jessica Blue', 'Tom Cruise (Fake)', 'Lisa Ray',
  'Alex Wong', 'Bella Swan', 'John Doe', 'Emily Rose', 'David Kim',
  'Anna Smith', 'Robert Johnson', 'Chris Lee', 'Patricia Brown', 'James Wilson'
];

const generateMockUsers = (): User[] => {
  const users: User[] = [];

  // Generate 5 Brands
  BRAND_NAMES.forEach((name, index) => {
    users.push({
      id: `brand-${index + 1}`,
      role: UserRole.BRAND,
      name: name,
      email: `contact@${name.toLowerCase().replace(' ', '')}.com`,
      avatar: `https://picsum.photos/seed/brand${index}/200`,
      companyName: name,
      walletBalance: Math.floor(Math.random() * 500000) + 50000
    });
  });

  // Generate 15 Creators
  CREATOR_NAMES.forEach((name, index) => {
    users.push({
      id: `creator-${index + 1}`,
      role: UserRole.CREATOR,
      name: name,
      email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
      avatar: `https://picsum.photos/seed/creator${index}/200`,
      shippingAddress: `${100 + index} Creator St, Content City, 10110`,
      bankInfo: {
        bankName: ['KBANK', 'SCB', 'BBL', 'KTB'][Math.floor(Math.random() * 4)],
        accountNumber: `${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 9)}-${Math.floor(Math.random() * 99999)}-${Math.floor(Math.random() * 9)}`,
        accountName: name
      },
      socialStats: {
        platform: 'TikTok',
        handle: `@${name.toLowerCase().replace(' ', '_')}`,
        followers: `${(Math.floor(Math.random() * 900) + 10)}K`,
        avgViews: `${(Math.floor(Math.random() * 50) + 5)}K`,
        engagementRate: `${(Math.random() * 5 + 1).toFixed(1)}%`,
        connected: Math.random() > 0.3 // 70% chance of being connected
      }
    });
  });

  return users;
};

interface UserContextType {
  user: User | null;
  allUsers: User[];
  login: (userId: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize mock data
    setAllUsers(generateMockUsers());
  }, []);

  const login = (userId: string) => {
    const foundUser = allUsers.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Update in the "Database" as well
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  return (
    <UserContext.Provider value={{ user, allUsers, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};