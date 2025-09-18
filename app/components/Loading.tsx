import { Loader } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'gray' | 'white';
}

export default function Loading({ size = 'md', className = '', color = 'gray' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
    </div>
  );
}