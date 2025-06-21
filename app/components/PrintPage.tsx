//components/PrintPage.tsx
'use client'

import React from 'react';
import { FaPrint } from 'react-icons/fa';

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
    
    if (printButton) (printButton as HTMLElement).style.display = 'none';
    if (navbar) (navbar as HTMLElement).style.display = 'none';
    if (backButton) (backButton as HTMLElement).style.display = 'none';
    if (editButton) (editButton as HTMLElement).style.display = 'none';

    // Add print styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body {
          margin: 0;
          padding: 20px;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
        }
        
        .no-print {
          display: none !important;
        }
        
        .print-page-break {
          page-break-before: always;
        }
        
        .print-avoid-break {
          page-break-inside: avoid;
        }
        
        h1, h2, h3 {
          color: #000 !important;
          page-break-after: avoid;
        }
        
        img {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid;
        }
        
        .grid {
          display: block !important;
        }
        
        .grid > div {
          margin-bottom: 10px !important;
        }
        
        .bg-gray-50,
        .bg-gray-100 {
          background: #f9f9f9 !important;
          border: 1px solid #e5e5e5;
        }
        
        .text-green-600,
        .text-green-700 {
          color: #000 !important;
        }
        
        .rounded-xl,
        .rounded-2xl {
          border-radius: 8px !important;
        }
        
        .shadow-lg,
        .shadow-md {
          box-shadow: none !important;
          border: 1px solid #e5e5e5 !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Print
    window.print();

    // Restore elements after print
    setTimeout(() => {
      if (printButton) (printButton as HTMLElement).style.display = '';
      if (navbar) (navbar as HTMLElement).style.display = '';
      if (backButton) (backButton as HTMLElement).style.display = '';
      if (editButton) (editButton as HTMLElement).style.display = '';
      document.head.removeChild(style);
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
        ${className}
      `}
      title="พิมพ์หน้านี้"
    >
      <FaPrint className={`${getIconSize()}`} />
      {showText && <span className="text-sm font-light">พิมพ์</span>}
    </button>
  );
};

export default PrintPage;