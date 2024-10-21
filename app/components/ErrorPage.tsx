import React from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  message: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">ขออภัย</h1>
        <p className="text-xl mb-8">{message}</p>
        <Link href="/" className="bg-white text-green-600 px-6 py-3 rounded-full font-bold hover:bg-green-100 transition duration-300">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;