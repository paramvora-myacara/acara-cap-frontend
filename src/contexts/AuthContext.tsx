// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StorageService } from '../services/storage/StorageService';

// Define user interface
export interface User {
  email: string;
  name?: string;
  profileId?: string;
  lastLogin: Date;
}

// Define context interface
interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await storageService.getItem<User>('user');
        if (userData) {
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

  // Login function
  const login = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      const newUser: User = {
        email,
        lastLogin: new Date(),
      };
      
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
  const updateUser = useCallback(async (userData: Partial<User>) => {
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