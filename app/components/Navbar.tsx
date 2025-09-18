'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { BarChart3, LogIn, LogOut, Home, User } from 'lucide-react';

interface NavbarProps {
  showDashboardLink?: boolean;
  showHomeLink?: boolean;
}

function Navbar({ showDashboardLink = true, showHomeLink = false }: NavbarProps) {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/Civic-Spacelogo.png"
                  alt="CivicSpace Logo"
                  width={40}
                  height={40}
                  className="w-auto h-auto max-w-10 max-h-10"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CivicSpace</h1>
                <p className="text-xs text-gray-600">พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์</p>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Home Link (for dashboard page) */}
            {showHomeLink && (
              <Link href="/" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Home className="w-4 h-4 mr-2" />
                หน้าหลัก
              </Link>
            )}

            {/* Dashboard Link (for homepage) */}
            {showDashboardLink && (
              <Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">
                <BarChart3 className="w-4 h-4 mr-2" />
                แดชบอร์ด
              </Link>
            )}

            {/* Authentication */}
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-900 hidden sm:inline font-medium">
                    {(session.user as any)?.firstName || (session.user as any)?.name || session.user?.email}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <LogIn className="w-4 h-4 mr-2" />
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;