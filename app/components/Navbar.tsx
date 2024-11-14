'use client'
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { HiMenuAlt3 } from "react-icons/hi";

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
        fixed w-full z-50 transition-all duration-300
        ${visible ? 'translate-y-0' : '-translate-y-full'}
        ${prevScrollPos > 0 ? 'bg-white/80 ' : 'bg-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image src="/power.png" alt="Logo" width={50} height={50} priority />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "text-orange-500"
                      : prevScrollPos > 0 
                        ? "text-gray-500 hover:text-gray-900"
                        : "text-gray-500 hover:text-gray-600"
                  } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Profile and Mobile Menu Button */}
          <div className="flex items-center">
            {session ? (
              <div className="relative ml-3 hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-sm focus:outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    src={session.user?.image || "/images/default-avatar.png"}
                    alt="Profile"
                  />
                  <span className={`${
                    prevScrollPos > 0 ? "text-gray-700" : "text-white"
                  }`}>
                    {session.user?.firstName}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className={`text-sm font-medium ${
                    prevScrollPos > 0 
                      ? "text-gray-700 hover:text-orange-500"
                      : "text-gray-500 hover:text-gray-600"
                  }`}
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 rounded-md ${
                prevScrollPos > 0 
                  ? "text-gray-400 hover:text-gray-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <HiMenuAlt3 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 text-base font-medium ${
                  pathname === item.href
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Profile Section */}
            {session ? (
              <div className="border-t pt-4">
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-orange-500"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="border-t pt-4">
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-orange-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;