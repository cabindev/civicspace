'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Globe,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useDashboard } from '../context/DashboardContext';

interface MenuChild {
  key: string;
  label: string;
  href: string;
  external?: boolean;
}

interface MenuItem {
  key: string;
  icon: any;
  label: string;
  href?: string;
  children?: MenuChild[];
}

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: BarChart3,
    label: 'ภาพรวม',
    href: '/dashboard'
  },
  {
    key: 'content',
    icon: FileText,
    label: 'เนื้อหา',
    children: [
      { key: '/dashboard/posts', label: 'โพสต์', href: '/dashboard/posts' },
      { key: '/dashboard/categories', label: 'ประเด็น', href: '/dashboard/categories' },
      { key: '/dashboard/tags', label: 'แท็ก', href: '/dashboard/tags' }
    ]
  },
  {
    key: 'external',
    icon: Globe,
    label: 'API ภายนอก',
    children: [
      { key: 'api-posts', label: 'API โพสต์', href: 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1/posts/', external: true },
      { key: 'api-categories', label: 'API ประเด็น', href: 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1/categories/', external: true }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['content']);
  const {
    sidebarCollapsed,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    isMobile
  } = useDashboard();

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  // Auto-open menu based on current pathname
  useEffect(() => {
    const matchingMenuItem = menuItems.find(item => 
      pathname === item.href || 
      (item.children && item.children.some(child => pathname === child.href))
    );
    if (matchingMenuItem && matchingMenuItem.children) {
      setOpenMenus(prev => {
        if (!prev.includes(matchingMenuItem.key)) {
          return [...prev, matchingMenuItem.key];
        }
        return prev;
      });
    }
  }, [pathname]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileSidebarOpen) {
        const sidebar = document.getElementById('mobile-sidebar');
        const button = document.getElementById('mobile-menu-button');
        if (sidebar && !sidebar.contains(event.target as Node) && 
            button && !button.contains(event.target as Node)) {
          setMobileSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileSidebarOpen, setMobileSidebarOpen]);

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isParentActive = (children: any[]) => {
    return children.some(child => pathname === child.href);
  };

  const SidebarContent = ({ isMobileView = false }: { isMobileView?: boolean }) => (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className={cn(
          "flex items-center",
          sidebarCollapsed && !isMobileView ? "justify-center" : "space-x-2"
        )}>
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          {(!sidebarCollapsed || isMobileView) && (
            <span className="text-xs font-bold text-gray-900">CivicSpace</span>
          )}
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.key}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.key)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors",
                    isParentActive(item.children)
                      ? 'bg-gray-50 text-gray-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    {(!sidebarCollapsed || isMobileView) && <span>{item.label}</span>}
                  </div>
                  {(!sidebarCollapsed || isMobileView) && (
                    openMenus.includes(item.key) ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )
                  )}
                </button>
                
                {(openMenus.includes(item.key) && (!sidebarCollapsed || isMobileView)) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <div key={child.key}>
                        {child.external ? (
                          <a
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => isMobileView && setMobileSidebarOpen(false)}
                            className="block px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            {child.label}
                          </a>
                        ) : (
                          <Link
                            href={child.href}
                            onClick={() => isMobileView && setMobileSidebarOpen(false)}
                            className={cn(
                              "block px-3 py-1.5 text-xs rounded-md transition-colors",
                              isActive(child.href)
                                ? 'bg-gray-100 text-gray-800 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                          >
                            {child.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : item.href ? (
              <Link
                href={item.href}
                onClick={() => isMobileView && setMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors",
                  sidebarCollapsed && !isMobileView ? "justify-center" : "",
                  isActive(item.href)
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                title={sidebarCollapsed && !isMobileView ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {(!sidebarCollapsed || isMobileView) && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            ) : (
              <div className={cn(
                "flex items-center px-3 py-2 text-xs font-medium rounded-md text-gray-700",
                sidebarCollapsed && !isMobileView ? "justify-center" : ""
              )}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {(!sidebarCollapsed || isMobileView) && (
                  <span className="ml-3">{item.label}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 overflow-y-auto z-40 hidden lg:block transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside 
            id="mobile-sidebar"
            className={cn(
              "fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto z-50 lg:hidden transition-transform duration-300",
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CS</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">CivicSpace</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <SidebarContent isMobileView={true} />
          </aside>
        </>
      )}
    </>
  );
}