//app/dashboard/users/[id]/page.tsx - หน้านี้แสดงรายละเอียดของผู้ใช้แต่ละคน
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { Spin, Typography } from 'antd';
import axios from 'axios';
import { UserProfile } from '../components/UserProfile';
import { ActivityStats } from '../components/ActivityStats';
import { ActivityTabs } from '../components/ActivityTabs';
import { UserDetails } from '../types/user';

export default function UserDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`/api/users/${params.id}`);
      setUserDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!userDetails?.user.id) return;
    
    try {
      const response = await axios.get(`/api/notifications?userId=${userDetails.user.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userDetails?.user.id) {
      fetchNotifications();
      const markNotificationsAsRead = async () => {
        try {
          await axios.patch(`/api/notifications/${userDetails.user.id}`);
          fetchNotifications();
        } catch (error) {
          console.error('Failed to mark notifications as read:', error);
        }
      };
      markNotificationsAsRead();
    }
  }, [userDetails]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;
  }

  if (!userDetails) {
    return <div className="flex justify-center items-center min-h-screen">
      <Typography.Text>ไม่พบข้อมูลผู้ใช้</Typography.Text>
    </div>;
  }

  return (
    <div className={isMobile ? "p-2" : "p-6"}>
      <UserProfile user={userDetails.user} isMobile={isMobile} />
      <ActivityStats 
        totalActivities={userDetails.statistics.totalActivities}
        breakdown={userDetails.statistics.activityBreakdown}
        monthlyData={userDetails.statistics.monthlyActivities}
        isMobile={isMobile}
      />
      <ActivityTabs activities={userDetails.activities} isMobile={isMobile} />
    </div>
  );
}


