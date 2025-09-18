'use client';

import { Menu, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '../lib/utils';

export default function TopNav() {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    toggleMobileSidebar, 
    isMobile 
  } = useDashboard();
  
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {isMobile ? (
            <button
              id="mobile-menu-button"
              onClick={toggleMobileSidebar}
              className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
              aria-label="เปิดเมนู"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            /* Desktop Collapse Button */
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-md hover:bg-gray-100 transition-all duration-200 hidden lg:flex items-center justify-center",
                sidebarCollapsed ? "ml-2" : "ml-0"
              )}
              aria-label={sidebarCollapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <h1 className="text-xs font-semibold text-gray-900">
              Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {session && (
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-900 hidden sm:inline font-medium">
                  {(session.user as any)?.firstName || (session.user as any)?.name || session.user?.email}
                </span>
              </div>
              
              {/* Sign Out Button */}
              <button 
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}