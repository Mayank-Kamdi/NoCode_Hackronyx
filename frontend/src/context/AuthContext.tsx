import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: 'ADMIN' | 'SECURITY' | 'AI_EDGE_DEVICE';
  setRole: (role: 'ADMIN' | 'SECURITY' | 'AI_EDGE_DEVICE') => void;
  loginAs: (role: 'ADMIN' | 'SECURITY' | 'AI_EDGE_DEVICE') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, User> = {
  ADMIN: {
    id: 1,
    username: 'admin',
    email: 'admin@abhaya.gov.in',
    role: 'ADMIN',
    full_name: 'Command Chief R. Sharma',
    badge_id: 'ADM-8801',
    assigned_zone: 'HQ Surveillance Command Desk',
  },
  SECURITY: {
    id: 2,
    username: 'security',
    email: 'security@abhaya.gov.in',
    role: 'SECURITY',
    full_name: 'Inspector Vikram Singh',
    badge_id: 'SEC-4092',
    assigned_zone: 'Sector 4 - Tech Park Patrol',
  },
  AI_EDGE_DEVICE: {
    id: 3,
    username: 'edge_node_01',
    email: 'edge01@abhaya.gov.in',
    role: 'AI_EDGE_DEVICE',
    full_name: 'NVIDIA Jetson Orin Edge Node #01',
    badge_id: 'EDGE-001',
    assigned_zone: 'North Gate Perimeter',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<'ADMIN' | 'SECURITY' | 'AI_EDGE_DEVICE'>('ADMIN');
  const [user, setUser] = useState<User | null>(DEMO_USERS.ADMIN);

  const loginAs = (newRole: 'ADMIN' | 'SECURITY' | 'AI_EDGE_DEVICE') => {
    setRoleState(newRole);
    setUser(DEMO_USERS[newRole]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole: setRoleState, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
