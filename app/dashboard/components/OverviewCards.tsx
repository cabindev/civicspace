// app/dashboard/components/OverviewCards.tsx
'use client'
import { OverviewData } from '@/app/types/types';
import { useState, useEffect } from 'react';
import { Badge, Popover, List, Avatar, Typography } from 'antd';
import Link from 'next/link';

interface OverviewCardsProps {
  data: OverviewData;
  showNotifications?: boolean;
}

interface CardProps {
  title: string;
  value: number;
}

interface UserNotification {
  id: string;
  userId: number;
  userName: string;
  userImage?: string;
  activityType: string;
  activityTitle: string;
  createdAt: string;
}

const { Text } = Typography;

const Card = ({ title, value }: CardProps) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body p-4">
      <div className="text-center">
        <h2 className="card-title text-xs font-light text-gray-600 mb-1">{title}</h2>
        <p className="text-2xl font-bold text-green-800">{value.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

export default function OverviewCards({ data, showNotifications = true }: OverviewCardsProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // Fetch all notifications from database for dashboard overview
  const fetchNotifications = async () => {
    try {
      // Import the global notifications action
      const { getGlobalNotifications } = await import('@/app/lib/actions/notifications/get-global');
      
      const result = await getGlobalNotifications(10);
      
      console.log('Notifications fetch result:', result);
      
      if (result.success && result.data) {
        console.log('Setting notifications:', result.data);
        setNotifications(result.data as UserNotification[]);
      } else {
        console.log('No notifications or error:', result.error);
        // Fallback to empty array if no permissions or error
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // อัปเดตทุก 30 วินาที
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notificationId: string) => {
    // Optimistic update - remove from UI immediately for better UX
    const originalNotifications = notifications;
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    try {
      // Mark notification as read in backend
      const { markNotificationAsRead } = await import('@/app/lib/actions/notifications/create');
      const result = await markNotificationAsRead(notificationId);
      
      if (!result.success) {
        // If backend fails, restore the original state
        console.error('Failed to mark notification as read:', result.error);
        setNotifications(originalNotifications);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // If error occurs, restore the original state
      setNotifications(originalNotifications);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    
    // Optimistic update - clear all from UI immediately
    const originalNotifications = notifications;
    setNotifications([]);
    
    try {
      // Mark all notifications as read
      const { markNotificationAsRead } = await import('@/app/lib/actions/notifications/create');
      
      // Mark all notifications as read in parallel
      const markPromises = originalNotifications.map(notification => 
        markNotificationAsRead(notification.id)
      );
      
      const results = await Promise.allSettled(markPromises);
      
      // Check if any failed
      const failures = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      );
      
      if (failures.length > 0) {
        console.error('Failed to mark some notifications as read');
        // Restore original state if any failed
        setNotifications(originalNotifications);
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Restore original state on error
      setNotifications(originalNotifications);
    }
  };

  const getActivityTypeText = (type: string) => {
    switch (type) {
      case 'tradition': return 'งานบุญประเพณี';
      case 'publicPolicy': return 'นโยบายสาธารณะ';
      case 'creativeActivity': return 'กิจกรรมสร้างสรรค์';
      case 'ethnicGroup': return 'กลุ่มชาติพันธุ์';
      default: return type;
    }
  };

  const NotificationContent = () => (
    <div className="w-80">
      <div className="p-2 border-b border-gray-100 flex justify-between items-center">
        <Text strong className="text-gray-700">การแจ้งเตือนใหม่</Text>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>
      {notifications.length > 0 ? (
        <List
          size="small"
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item 
              className="cursor-pointer hover:bg-gray-50 px-3 py-2"
              onClick={() => handleNotificationClick(notification.id)}
            >
              <List.Item.Meta
                avatar={
                  <Link href={`/dashboard/users/${notification.userId}`}>
                    <Avatar 
                      src={notification.userImage}
                      size="small"
                    >
                      {notification.userName.charAt(0)}
                    </Avatar>
                  </Link>
                }
                title={
                  <div className="flex justify-between items-start">
                    <Text className="text-xs font-medium text-gray-900">
                      {notification.userName}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </div>
                }
                description={
                  <Text className="text-xs text-gray-600">
                    {getActivityTypeText(notification.activityType)}: {notification.activityTitle}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div className="p-4 text-center text-gray-500">
          <Text className="text-sm">ไม่มีการแจ้งเตือนใหม่</Text>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card title="Users" value={data.userCount} />
      <Card title="Creative Activities" value={data.creativeActivityCount} />
      <Card title="Traditions" value={data.traditionCount} />
      <Card title="Public Policies" value={data.publicPolicyCount} />
      <Card title="Ethnic Groups" value={data.ethnicGroupCount} />
      
      {/* Notifications Card - Only show when showNotifications is true */}
      {showNotifications && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <div className="text-center">
              <Popover 
                content={<NotificationContent />}
                title={false}
                trigger="click"
                placement="bottomRight"
              >
                <div className="cursor-pointer">
                  <h2 className="card-title text-xs font-light text-gray-600 mb-1">Notifications</h2>
                  <Badge count={notifications.length} size="small">
                    <p className="text-2xl font-bold text-green-800">{notifications.length}</p>
                  </Badge>
                </div>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </>
  );
}