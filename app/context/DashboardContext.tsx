'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface DashboardContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setSidebarCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const setMobileSidebarOpen = (open: boolean) => {
    setIsMobileSidebarOpen(open);
  };

  const value = {
    sidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    setMobileSidebarOpen,
    isMobile
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}