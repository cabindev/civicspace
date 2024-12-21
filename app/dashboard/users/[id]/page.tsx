'use client';
import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, List, Typography, Tag, Statistic, Spin } from 'antd';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import Link from 'next/link';

const { Text, Title } = Typography;

interface UserDetails {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
    image: string | null;
  };
  activities: {
    traditions: Array<{
      id: string;
      name: string;
      type: string;
      province: string;
      createdAt: string;
    }>;
    publicPolicies: Array<{
      id: string;
      name: string;
      level: string;
      province: string;
      createdAt: string;
    }>;
    ethnicGroups: Array<{
      id: string;
      name: string;
      type: string;
      province: string;
      createdAt: string;
    }>;
    creativeActivities: Array<{
      id: string;
      name: string;
      type: string;
      province: string;
      createdAt: string;
    }>;
  };
  statistics: {
    totalActivities: number;
    activityBreakdown: {
      traditions: number;
      publicPolicies: number;
      ethnicGroups: number;
      creativeActivities: number;
    };
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchUserDetails();
  }, []);

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

  const renderActivityLink = (id: string, type: string) => {
    const basePath = '/dashboard';
    switch (type) {
      case 'tradition':
        return `${basePath}/traditions/${id}`;
      case 'policy':
        return `${basePath}/public-policies/${id}`;
      case 'ethnic':
        return `${basePath}/ethnic-groups/${id}`;
      case 'creative':
        return `${basePath}/creative-activities/${id}`;
      default:
        return '#';
    }
  };

  const renderMobileActivityItem = (item: any, type: 'tradition' | 'policy' | 'ethnic' | 'creative') => (
    <Link href={renderActivityLink(item.id, type)} key={item.id}>
      <Card size="small" className="mb-2 hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-1">
          <Text strong className="line-clamp-1">{item.name}</Text>
          <div className="flex justify-between text-sm">
            <Text type="secondary">{item.type || item.level}</Text>
            <Text type="secondary">{item.province}</Text>
          </div>
          <Text type="secondary" className="text-xs">
            {new Date(item.createdAt).toLocaleDateString('th-TH')}
          </Text>
        </div>
      </Card>
    </Link>
  );

  const columns = {
    traditions: [
      { 
        title: 'ชื่อประเพณี', 
        dataIndex: 'name', 
        key: 'name',
        render: (text: string, record: any) => (
          <Link href={renderActivityLink(record.id, 'tradition')}>
            <Text className="hover:underline cursor-pointer">{text}</Text>
          </Link>
        ),
      },
      { title: 'ประเภท', dataIndex: 'type', key: 'type' },
      { title: 'จังหวัด', dataIndex: 'province', key: 'province' },
      { 
        title: 'วันที่บันทึก', 
        dataIndex: 'createdAt', 
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
      },
    ],
    policies: [
      { 
        title: 'ชื่อนโยบาย', 
        dataIndex: 'name', 
        key: 'name',
        render: (text: string, record: any) => (
          <Link href={renderActivityLink(record.id, 'policy')}>
            <Text className="hover:underline cursor-pointer">{text}</Text>
          </Link>
        ),
      },
      { title: 'ระดับ', dataIndex: 'level', key: 'level' },
      { title: 'จังหวัด', dataIndex: 'province', key: 'province' },
      { 
        title: 'วันที่บันทึก', 
        dataIndex: 'createdAt', 
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
      },
    ],
    ethnic: [
      { 
        title: 'ชื่อกลุ่มชาติพันธุ์', 
        dataIndex: 'name', 
        key: 'name',
        render: (text: string, record: any) => (
          <Link href={renderActivityLink(record.id, 'ethnic')}>
            <Text className="hover:underline cursor-pointer">{text}</Text>
          </Link>
        ),
      },
      { title: 'ประเภท', dataIndex: 'type', key: 'type' },
      { title: 'จังหวัด', dataIndex: 'province', key: 'province' },
      { 
        title: 'วันที่บันทึก', 
        dataIndex: 'createdAt', 
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
      },
    ],
    creative: [
      { 
        title: 'ชื่อกิจกรรม', 
        dataIndex: 'name', 
        key: 'name',
        render: (text: string, record: any) => (
          <Link href={renderActivityLink(record.id, 'creative')}>
            <Text className="hover:underline cursor-pointer">{text}</Text>
          </Link>
        ),
      },
      { title: 'ประเภท', dataIndex: 'type', key: 'type' },
      { title: 'จังหวัด', dataIndex: 'province', key: 'province' },
      { 
        title: 'วันที่บันทึก', 
        dataIndex: 'createdAt', 
        key: 'createdAt',
        render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
      },
    ],
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;
  }

  if (!userDetails) {
    return <div className="flex justify-center items-center min-h-screen"><Text>ไม่พบข้อมูลผู้ใช้</Text></div>;
  }

  return (
    <div className={isMobile ? "p-2" : "p-6"}>
      {/* User Profile Header */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <img
            src={userDetails.user.image || '/default-avatar.png'}
            alt={`${userDetails.user.firstName} ${userDetails.user.lastName}`}
            className={`rounded-full object-cover ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}
          />
          <div>
            <Title level={isMobile ? 4 : 3}>{`${userDetails.user.firstName} ${userDetails.user.lastName}`}</Title>
            <Text type="secondary" className={isMobile ? 'text-sm' : ''}>{userDetails.user.email}</Text>
            <div className="mt-1">
              <Tag color={userDetails.user.role === 'SUPER_ADMIN' ? 'gold' : 'blue'}>
                {userDetails.user.role}
              </Tag>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'} gap-2 mb-4`}>
        <Card size={isMobile ? 'small' : 'default'}>
          <Statistic 
            title={<span className={isMobile ? 'text-sm' : ''}>ผลงานทั้งหมด</span>}
            value={userDetails.statistics.totalActivities}
            className={isMobile ? 'text-sm' : ''} 
          />
        </Card>
        <Card size={isMobile ? 'small' : 'default'}>
          <Statistic 
            title={<span className={isMobile ? 'text-sm' : ''}>ประเพณี</span>}
            value={userDetails.statistics.activityBreakdown.traditions}
            className={isMobile ? 'text-sm' : ''} 
          />
        </Card>
        <Card size={isMobile ? 'small' : 'default'}>
          <Statistic 
            title={<span className={isMobile ? 'text-sm' : ''}>นโยบาย</span>}
            value={userDetails.statistics.activityBreakdown.publicPolicies}
            className={isMobile ? 'text-sm' : ''} 
          />
        </Card>
        <Card size={isMobile ? 'small' : 'default'}>
          <Statistic 
            title={<span className={isMobile ? 'text-sm' : ''}>ชาติพันธุ์</span>}
            value={userDetails.statistics.activityBreakdown.ethnicGroups}
            className={isMobile ? 'text-sm' : ''} 
          />
        </Card>
      </div>

      {/* Activities Tabs */}
      <Tabs defaultActiveKey="traditions" size={isMobile ? 'small' : 'middle'}>
        <Tabs.TabPane tab="ประเพณี" key="traditions">
          {isMobile ? (
            <List
              dataSource={userDetails.activities.traditions}
              renderItem={item => renderMobileActivityItem(item, 'tradition')}
            />
          ) : (
            <Table 
              dataSource={userDetails.activities.traditions}
              columns={columns.traditions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="นโยบาย" key="policies">
          {isMobile ? (
            <List
              dataSource={userDetails.activities.publicPolicies}
              renderItem={item => renderMobileActivityItem(item, 'policy')}
            />
          ) : (
            <Table 
              dataSource={userDetails.activities.publicPolicies}
              columns={columns.policies}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="ชาติพันธุ์" key="ethnicGroups">
          {isMobile ? (
            <List
              dataSource={userDetails.activities.ethnicGroups}
              renderItem={item => renderMobileActivityItem(item, 'ethnic')}
            />
          ) : (
            <Table 
              dataSource={userDetails.activities.ethnicGroups}
              columns={columns.ethnic}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab="กิจกรรม" key="creativeActivities">
          {isMobile ? (
            <List
              dataSource={userDetails.activities.creativeActivities}
              renderItem={item => renderMobileActivityItem(item, 'creative')}
            />
          ) : (
            <Table 
              dataSource={userDetails.activities.creativeActivities}
              columns={columns.creative}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}