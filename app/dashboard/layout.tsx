'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';
import { Footer } from '../components/Footer';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import { cn } from '../lib/utils';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, isMobile } = useDashboard();
  
  return (
    <div className="min-h-screen bg-gray-50">      
      <div className="flex">
        <Sidebar />
        <div className={cn(
          "flex-1 transition-all duration-300",
          isMobile ? "ml-0" : sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}>
          <TopNav />
          <main className="p-4">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <DashboardProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  );
}