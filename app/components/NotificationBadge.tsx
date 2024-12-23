// app/components/NotificationBadge.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Badge } from 'antd';
import axios from 'axios';

interface NotificationBadgeProps {
  userId: number;
  children: React.ReactNode;
}

export default function NotificationBadge({ userId, children }: NotificationBadgeProps) {
  const [count, setCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/notifications?userId=${userId}`);
      setCount(response.data.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // อัพเดททุก 30 วินาที
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <Badge count={count} size="small">
      {children}
    </Badge>
  );
}