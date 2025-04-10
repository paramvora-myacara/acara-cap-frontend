// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StorageService } from '../services/storage/StorageService';
import { EnhancedUser } from '../types/enhanced-types';

// Define context interface with enhanced user type
interface AuthContextProps {
  user: EnhancedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: 'borrower' | 'advisor' | 'admin') => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<EnhancedUser>) => void;
}

// Create context with default values
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  storageService: StorageService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  storageService 
}) => {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await storageService.getItem<EnhancedUser>('user');
        if (userData) {
          // Ensure role exists for backward compatibility
          if (!userData.role) {
            userData.role = 'borrower';
          }
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [storageService]);

  // Login function with role support
  const login = useCallback(async (email: string, role: 'borrower' | 'advisor' | 'admin' = 'borrower') => {
    try {
      setIsLoading(true);
      // Detect if this is an advisor email (simple rule for mock implementation)
      const detectedRole = email.includes('advisor') ? 'advisor' : 
                           email.includes('admin') ? 'admin' : role;
      
      // In a real app, this would be an API call
      const newUser: EnhancedUser = {
        email,
        lastLogin: new Date(),
        role: detectedRole,
      };
      
      if (detectedRole === 'advisor') {
        // Add sample advisor name based on email
        const nameMatch = email.match(/([^@]+)@/);
        if (nameMatch) {
          const name = nameMatch[1]
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
          newUser.name = name;
        }
      }
      
      await storageService.setItem('user', newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storageService]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await storageService.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageService]);

  // Update user data
  const updateUser = useCallback(async (userData: Partial<EnhancedUser>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...userData };
      await storageService.setItem('user', updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [user, storageService]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};