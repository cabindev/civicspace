'use client'

import { useState, useEffect, useCallback } from 'react';
import { Spin, Card, Row, Col } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import { FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import Navbar from '../Navbar';

const { Meta } = Card;

interface PublicPolicy {
  id: string;
  name: string;
  signingDate: string;
  level: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  images?: { id: string; url: string }[];
}

export default function PublicPolicyList() {
  const [policies, setPolicies] = useState<PublicPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = useCallback(async () => {
    try {
      const response = await axios.get('/api/public-policy');
      setPolicies(response.data);
    } catch (error) {
      console.error('Failed to fetch public policies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

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
        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">PUBLIC POLICY</h1>
        <Row gutter={[16, 16]}>
          {policies.map((policy) => (
            <Col xs={24} sm={12} md={8} lg={6} key={policy.id}>
              <Link href={`/components/public-policy/${policy.id}`}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    policy.images && policy.images.length > 0 ? (
                      <div style={{ height: '200px', position: 'relative' }}>
                        <img
                          src={policy.images[0].url}
                          alt={policy.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg'; // Use a placeholder image if loading fails
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ height: '200px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p>ไม่มีรูปภาพ</p>
                      </div>
                    )
                  }
                >
                  <Meta
                    title={<span className="text-lg font-semibold text-green-600">{policy.name}</span>}
                    description={
                      <div>
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          <FaCalendar className="mr-2" />
                          {new Date(policy.signingDate).toLocaleDateString('th-TH')}
                        </p>
                        <p className="flex items-center text-sm text-gray-500 mb-1">
                          <FaMapMarkerAlt className="mr-2" />
                          {policy.province}
                        </p>
                        <p className="text-sm"><span className="font-medium">ระดับ:</span> {policy.level}</p>
                        <p className="text-sm"><span className="font-medium">ภาค:</span> {policy.type}</p>
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