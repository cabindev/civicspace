'use client';

import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Image
              src="/Civic-Spacelogo.png"
              alt="CivicSpace Logo"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-900">CivicSpace</span>
          </div>
          <p className="text-xs text-gray-600">
            พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์ © 2025
          </p>
        </div>
      </div>
    </footer>
  );
}