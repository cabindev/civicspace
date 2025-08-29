// app/components/NotFoundPage.tsx
import Link from 'next/link';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';

interface NotFoundPageProps {
  title: string;
  description: string;
  backUrl: string;
  backText: string;
  buttonColor?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
  autoRedirect?: boolean;
  redirectDelay?: number;
  isDashboard?: boolean;
  showDashboardLink?: boolean;
}

const colorClasses = {
  green: 'bg-green-600 hover:bg-green-700',
  blue: 'bg-blue-600 hover:bg-blue-700', 
  purple: 'bg-purple-600 hover:bg-purple-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  red: 'bg-red-600 hover:bg-red-700',
  gray: 'bg-gray-600 hover:bg-gray-700',
};

export default function NotFoundPage({
  title,
  description,
  backUrl,
  backText,
  buttonColor = 'green',
  autoRedirect = true,
  redirectDelay = 3000,
  isDashboard = false,
  showDashboardLink = true
}: NotFoundPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        router.push(backUrl);
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [autoRedirect, backUrl, redirectDelay, router]);

  return (
    <div className={`min-h-screen ${isDashboard ? 'bg-gray-50' : 'bg-white'}`}>
      {!isDashboard && <Navbar />}
      <div className={`max-w-5xl mx-auto px-6 lg:px-8 ${isDashboard ? 'pt-20' : 'pt-24'} pb-16`}>
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className={`text-2xl ${isDashboard ? 'font-semibold' : 'font-normal'} text-gray-900 mb-4`}>
              {title}
            </h1>
            <p className={`text-gray-600 mb-8 ${isDashboard ? 'max-w-lg mx-auto' : ''}`}>
              {description}
            </p>
            {autoRedirect && (
              <div className="text-sm text-gray-500 mb-8">
                กำลังเปลี่ยนเส้นทางใน {Math.ceil(redirectDelay / 1000)} วินาที...
              </div>
            )}
          </div>
          
          <div className={isDashboard ? "flex flex-col sm:flex-row gap-3 justify-center items-center" : ""}>
            <Link
              href={backUrl}
              className={`inline-flex items-center gap-2 ${colorClasses[buttonColor]} text-white px-6 py-3 ${isDashboard ? 'rounded-lg font-medium' : 'rounded-xl font-light'} transition-colors duration-200`}
            >
              {isDashboard ? <FaArrowLeft className="text-sm" /> : <FaHome />}
              {backText}
            </Link>
            
            {isDashboard && showDashboardLink && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                <FaHome className="text-sm" />
                กลับสู่แดชบอร์ด
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}