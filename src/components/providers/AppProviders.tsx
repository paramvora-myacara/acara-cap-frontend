// src/components/providers/AppProviders.tsx (optional, you can remove this file)
'use client';

import React from 'react';
import { ClientAppProviders } from './ClientAppProviders';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ClientAppProviders>{children}</ClientAppProviders>;
};