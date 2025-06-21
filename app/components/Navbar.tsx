'use client'
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrollingDown = prevScrollPos < currentScrollPos;
      
      setVisible(
        // Show navbar if:
        // 1. Scrolling up
        // 2. At the top of the page
        // 3. Mobile menu is open
        !isScrollingDown || 
        currentScrollPos < 10 || 
        isMobileMenuOpen
      );
      
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const navItems = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/dashboard', label: 'แดชบอร์ด' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav 
      className={`
        fixed w-full z-50 transition-all duration-300 ease-in-out
        ${visible ? 'translate-y-0' : '-translate-y-full'}
        ${prevScrollPos > 0 ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100' : 'bg-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-3">
              <Image 
                src="/power.png" 
                alt="Logo" 
                width={60} 
                height={60} 
                priority 
                className="rounded-lg"
              />

            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-light transition-all duration-200
                  ${pathname === item.href
                    ? "text-green-500 bg-orange-50" 
                    : "text-black hover:text-green-500 hover:bg-gray-50"
                  }
                `}
              >
                {item.label}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Profile and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <img
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                    src={session.user?.image || "/images/default-avatar.png"}
                    alt="Profile"
                  />
                  <span className="text-sm font-light text-black">
                    {session.user?.firstName}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-light text-gray-500">ยินดีต้อนรับ</p>
                      <p className="text-sm font-medium text-gray-900">{session.user?.firstName}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-50 hover:text-orange-500 transition-colors duration-200"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="
                  hidden md:inline-flex items-center px-4 py-2 rounded-lg text-sm font-light transition-all duration-200
                  text-black hover:text-orange-500 hover:bg-orange-50
                "
              >
                เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="
                md:hidden p-2 rounded-lg transition-all duration-200
                text-black hover:text-green-500 hover:bg-gray-100
              "
            >
              {isMobileMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenuAlt3 className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-4 py-3 rounded-lg text-base font-light transition-colors duration-200
                  ${pathname === item.href
                    ? "text-green-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Profile Section */}
            <div className="pt-4 border-t border-gray-100">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <img
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                      src={session.user?.image || "/images/default-avatar.png"}
                      alt="Profile"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.user?.firstName}</p>
                      <p className="text-sm font-light text-gray-500">ยินดีต้อนรับ</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-base font-light text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors duration-200"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-4 py-3 rounded-lg text-base font-light text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;