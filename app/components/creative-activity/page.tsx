//dashboard/creative-activity/page.ts
'use client'

import { useState, useEffect } from 'react';
import { Spin, Card, Row, Col } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import { FaCalendar, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';
import Navbar from '../Navbar';

const { Meta } = Card;

interface CreativeActivity {
  id: string;
  name: string;
  province: string;
  type: string;
  startYear: number;
  images?: { id: string; url: string }[];
  category: { name: string };
  subCategory: { name: string };
  coordinatorName: string;
  phone: string;
}

export default function CreativeActivityList() {
  const [activities, setActivities] = useState<CreativeActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('/api/creative-activity');
        setActivities(response.data);
      } catch (error) {
        console.error('Failed to fetch creative activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">CREATIVE ACTIVITY</h1>
        <Row gutter={[16, 16]}>
          {activities.map((activity) => (
            <Col xs={24} sm={12} md={8} lg={6} key={activity.id}>
              <Link href={`/components/creative-activity/${activity.id}`}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    activity.images && activity.images.length > 0 ? (
                     
                        <img
                            src={activity.images[0].url}
                            alt={activity.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg';
                            }}
                          />
               
                    ) : (
                      <div style={{ height: '200px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p>ไม่มีรูปภาพ</p>
                      </div>
                    )
                  }
                >
                  <Meta
                    title={<span className="text-lg font-semibold text-green-600">{activity.name}</span>}
                    description={
                      <div>
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          <FaCalendar className="mr-2" />
                          ปีที่เริ่ม: {activity.startYear}
                        </p>
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          <FaMapMarkerAlt className="mr-2" />
                          {activity.province} | {activity.type}
                        </p>
                        <p className="text-sm"><span className="font-medium">ประเภท:</span> {activity.category.name}</p>
                        <p className="text-sm"><span className="font-medium">หมวดหมู่ย่อย:</span> {activity.subCategory.name}</p>
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          <FaUser className="mr-2" />
                          {activity.coordinatorName}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                          <FaPhone className="mr-2" />
                          {activity.phone}
                        </p>
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}