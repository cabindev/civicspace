//components/Pagination.tsx
'use client'

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // จำนวนหน้าที่แสดง
    
    if (totalPages <= showPages) {
      // แสดงทุกหน้าถ้าน้อยกว่าหรือเท่ากับ showPages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // แสดงหน้าแรก
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // แสดงหน้าปัจจุบันและหน้าข้างเคียง
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // แสดงหน้าสุดท้าย
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200
          ${currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
          }
        `}
        aria-label="หน้าก่อนหน้า"
      >
        <FaChevronLeft className="text-sm" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-10 h-10 text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg font-light transition-colors duration-200
                ${isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }
              `}
              aria-label={`หน้า ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200
          ${currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
          }
        `}
        aria-label="หน้าถัดไป"
      >
        <FaChevronRight className="text-sm" />
      </button>
    </div>
  );
};

export default Pagination;