//components/PrintPage.tsx
'use client'

import React from 'react';
// เลือกไอคอนปริ้นเตอร์ที่ชอบจากตัวเลือกเหล่านี้:
import { HiPrinter } from 'react-icons/hi';           // HeroIcons
// import { BsPrinter } from 'react-icons/bs';        // Bootstrap Icons  
// import { AiOutlinePrinter } from 'react-icons/ai'; // Ant Design Icons
// import { FiPrinter } from 'react-icons/fi';        // Feather Icons
// import { IoMdPrint } from 'react-icons/io';        // Ionicons
// import { MdPrint } from 'react-icons/md';          // Material Design Icons

interface PrintPageProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const PrintPage: React.FC<PrintPageProps> = ({ 
  className = '', 
  iconSize = 'sm',
  showText = false 
}) => {
  const handlePrint = () => {
    // Hide print button and other non-printable elements
    const printButton = document.querySelector('[data-print-button]');
    const navbar = document.querySelector('nav');
    const backButton = document.querySelector('[data-back-button]');
    const editButton = document.querySelector('[data-edit-button]');
    
    if (printButton) (printButton as HTMLElement).classList.add('print:hidden');
    if (navbar) (navbar as HTMLElement).classList.add('print:hidden');
    if (backButton) (backButton as HTMLElement).classList.add('print:hidden');
    if (editButton) (editButton as HTMLElement).classList.add('print:hidden');

    // Print
    window.print();

    // Restore elements after print
    setTimeout(() => {
      if (printButton) (printButton as HTMLElement).classList.remove('print:hidden');
      if (navbar) (navbar as HTMLElement).classList.remove('print:hidden');
      if (backButton) (backButton as HTMLElement).classList.remove('print:hidden');
      if (editButton) (editButton as HTMLElement).classList.remove('print:hidden');
    }, 100);
  };

  const getIconSize = () => {
    switch (iconSize) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      default: return 'text-sm';
    }
  };

  return (
    <button
      onClick={handlePrint}
      data-print-button
      className={`
        inline-flex items-center gap-2 
        text-gray-600 hover:text-green-600 
        transition-colors duration-200 
        p-2 rounded-lg hover:bg-gray-50
        print:hidden
        ${className}
      `}
      title="พิมพ์หน้านี้"
    >
      <HiPrinter className={`${getIconSize()}`} />
      {showText && <span className="text-sm font-light">พิมพ์</span>}
    </button>
  );
};

export default PrintPage;