'use client'

import React, { useState, useEffect } from 'react';
import { Spin, Card, Row, Col } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import Navbar from '../Navbar';

const { Meta } = Card;

interface EthnicGroup {
  id: string;
  name: string;
  category: { name: string };
  province: string;
  startYear: number;
  images?: { id: string; url: string }[];
}

export default function EthnicGroupList() {
  const [ethnicGroups, setEthnicGroups] = useState<EthnicGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEthnicGroups = async () => {
      try {
        const response = await axios.get('/api/ethnic-group');
        setEthnicGroups(response.data);
      } catch (error) {
        console.error('Failed to fetch ethnic groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEthnicGroups();

    const intervalId = setInterval(fetchEthnicGroups, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">ETHNIC-GROUP</h1>
        <Row gutter={[16, 16]}>
          {ethnicGroups.map((group) => (
            <Col xs={24} sm={12} md={8} lg={6} key={group.id}>
              <Link href={`/components/ethnic-group/${group.id}`}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    group.images && group.images.length > 0 ? (
                      <div className="h-48 relative">
                        <img
                          src={group.images[0].url}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <p>ไม่มีรูปภาพ</p>
                      </div>
                    )
                  }
                >
                  <Meta
                    title={<span className="text-lg font-semibold text-green-600">{group.name}</span>}
                    description={
                      <div>
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          <FaCalendar className="mr-2" />
                          ปีที่เริ่ม: {group.startYear}
                        </p>
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          <FaMapMarkerAlt className="mr-2" />
                          {group.province}
                        </p>
                        <p className="text-sm"><span className="font-medium">ประเภท:</span> {group.category.name}</p>
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