'use client'
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import { HiMenuAlt3 } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  const navItems = [
    { href: '/', label: 'หน้าหลัก' },
    { 
      href: '/about', 
      label: 'องค์กร',
      subItems: [
        { href: '/about/mission', label: 'ปณิธาน' },
        { href: '/about/principle', label: 'หลักการ' },
        { href: '/about/chart', label: 'โครงสร้างองค์กร' },
        { href: '/about/project2567', label: 'โครงการปี 2567' },
      ]
    },
    { href: '/about/contact', label: 'ติดต่อเรา' },
    ...(isAdmin ? [{ href: '/dashboard', label: 'จัดการระบบ' }] : []),
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

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-white/80 shadow-sm fixed w-full z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="Logo" width={50} height={50} priority />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <div key={item.href} className="relative">
                  {item.subItems ? (
                    // Menu with submenu
                    <div className="relative">
                      <button
                        onClick={() => toggleSubmenu(item.href)}
                        className={`${
                          pathname.startsWith(item.href)
                            ? "text-orange-500"
                            : "text-gray-500 hover:text-gray-900"
                        } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200`}
                      >
                        {item.label}
                        <IoIosArrowDown className="ml-1 w-4 h-4" />
                      </button>
                      
                      {openSubmenu === item.href && (
                        <div className="absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm ${
                                pathname === subItem.href
                                  ? "text-orange-500 bg-gray-50"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-orange-500"
                              }`}
                              onClick={() => setOpenSubmenu(null)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Menu without submenu
                    <Link
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? "text-orange-500"
                          : "text-gray-500 hover:text-gray-900"
                      } inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
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
                  <span className="text-gray-700">{session.user?.firstName}</span>
                  <IoIosArrowDown className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      โปรไฟล์
                    </Link>
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
                  className="text-sm font-medium text-gray-700 hover:text-orange-500"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <HiMenuAlt3 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={`${
                        pathname.startsWith(item.href)
                          ? "text-orange-500"
                          : "text-gray-500 hover:text-gray-900"
                      } w-full flex items-center justify-between px-4 py-2 text-base font-medium`}
                    >
                      {item.label}
                      <IoIosArrowDown className={`w-4 h-4 ${
                        openSubmenu === item.href ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {openSubmenu === item.href && (
                      <div className="bg-gray-50">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block pl-8 pr-4 py-2 text-sm ${
                              pathname === subItem.href
                                ? "text-orange-500"
                                : "text-gray-500 hover:text-orange-500"
                            }`}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenSubmenu(null);
                            }}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
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
                )}
              </div>
            ))}

            {/* Mobile Profile Section */}
            {session ? (
              <div className="border-t pt-4">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-orange-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  โปรไฟล์
                </Link>
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