//app/dashboard/users/[id]/page.tsx - หน้านี้แสดงรายละเอียดของผู้ใช้แต่ละคน
'use client';
import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { Spin, Typography, message } from 'antd';
import { UserProfile } from '../components/UserProfile';
import { ActivityStats } from '../components/ActivityStats';
import { ActivityTabs } from '../components/ActivityTabs';
import { UserDetails } from '../types/user';
import NotFoundPage from '@/app/components/NotFoundPage';

// Server Actions
import { getUserById } from '@/app/lib/actions/users/get';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notFound, setNotFound] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchUserDetails = async () => {
    if (!params.id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    
    startTransition(async () => {
      try {
        const result = await getUserById(Number(params.id));
        if (result.success && result.data) {
          setUserDetails(result.data);
        } else {
          setNotFound(true);
          message.error(result.error || 'ไม่พบข้อมูลผู้ใช้');
          console.error('Failed to fetch user details:', result.error);
          // Redirect to users list after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/users');
          }, 3000);
        }
      } catch (error) {
        setNotFound(true);
        message.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        console.error('Failed to fetch user details:', error);
        // Redirect to users list after 3 seconds
        setTimeout(() => {
          router.push('/dashboard/users');
        }, 3000);
      } finally {
        setLoading(false);
      }
    });
  };

  const fetchNotifications = async () => {
    if (!userDetails?.user.id) return;
    
    try {
      const { getNotifications } = await import('@/app/lib/actions/notifications/get');
      const result = await getNotifications(userDetails.user.id);
      if (result.success) {
        setNotifications(result.data);
      }
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
          const { markNotificationsAsRead } = await import('@/app/lib/actions/notifications/put');
          await markNotificationsAsRead(userDetails.user.id);
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

  if (notFound || !userDetails) {
    return (
      <NotFoundPage
        title="ไม่พบข้อมูลผู้ใช้"
        description="ผู้ใช้ที่คุณกำลังหาไม่มีอยู่ในระบบ หรืออาจถูกลบออกไปแล้ว"
        backUrl="/dashboard/users"
        backText="กลับสู่หน้าจัดการผู้ใช้"
        buttonColor="gray"
        isDashboard={true}
      />
    );
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


