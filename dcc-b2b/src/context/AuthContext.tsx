import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/** Mock user roles available in the B2B portal */
export type UserRole = 'customer' | 'sales_officer';

/** Mock user shape */
export interface B2BUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  sapCode: string;
  phone: string;
}

/** Mock users for login */
const MOCK_USERS: Record<string, B2BUser & { password: string }> = {
  customer: {
    id: 1,
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@stockist.co.tz',
    password: 'password',
    role: 'customer',
    company: 'Al-Rashid Distributors Ltd',
    sapCode: 'SAP-001234',
    phone: '+255 712 345 678',
  },
  sales_officer: {
    id: 2,
    name: 'Grace Mwangi',
    email: 'grace@bonite.co.tz',
    password: 'password',
    role: 'sales_officer',
    company: 'Bonite Bottlers Limited',
    sapCode: 'SO-00045',
    phone: '+255 754 987 654',
  },
};

interface AuthContextType {
  user: B2BUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Auth provider that uses localStorage to persist the mock session */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<B2BUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('b2b_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored) as B2BUser);
      } catch {
        localStorage.removeItem('b2b_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const found = Object.values(MOCK_USERS).find(u => u.email === email);
    if (!found) return false;
    const { password: _pw, ...safeUser } = found;
    void _pw;
    setUser(safeUser);
    localStorage.setItem('b2b_user', JSON.stringify(safeUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('b2b_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook to access auth context */
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
