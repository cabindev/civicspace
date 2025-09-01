// app/components/NotificationBadge.tsx
'use client';
import React, { useState, useEffect, useTransition } from 'react';
import { Badge } from 'antd';

// Server Actions
import { getNotifications } from '@/app/lib/actions/notifications/get';

interface NotificationBadgeProps {
  userId: number;
  children: React.ReactNode;
  forceRefresh?: number;
}

export default function NotificationBadge({ userId, children, forceRefresh }: NotificationBadgeProps) {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const fetchNotifications = async () => {
    startTransition(async () => {
      try {
        const result = await getNotifications(userId);
        if (result.success) {
          setCount(result.data.length);
        } else {
          console.error('Failed to fetch notifications:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    });
  };

  useEffect(() => {
    fetchNotifications();
    // อัพเดททุก 30 วินาที
    const interval = setInterval(fetchNotifications, 30000);
    
    // Refresh when window gains focus
    const handleFocus = () => {
      fetchNotifications();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  // Force refresh when forceRefresh prop changes
  useEffect(() => {
    if (forceRefresh) {
      fetchNotifications();
    }
  }, [forceRefresh]);

  return (
    <Badge count={count} size="small">
      {children}
    </Badge>
  );
}