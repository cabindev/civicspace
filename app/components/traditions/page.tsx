'use client'

import { useState, useEffect } from 'react';
import { Spin, Card, Row, Col } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';

const { Meta } = Card;

interface Tradition {
  id: string;
  name: string;
  province: string;
  type: string;
  startYear: number;
  images?: { id: string; url: string }[];
  category: { name: string };
  coordinatorName: string;
  phone: string;
  createdAt: string;
}

export default function TraditionList() {
  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraditions = async () => {
      try {
        const response = await axios.get('/api/tradition');
        setTraditions(response.data);
      } catch (error) {
        console.error('Failed to fetch traditions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTraditions();
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
      <div className="container mx-auto p-4 pt-24">  {/* เพิ่ม pt-24 เพื่อให้ห่างจาก Navbar */}
        <h1 className="text-3xl font-bold mb-6 text-center text-green-500">งานบุญประเพณีทั้งหมด</h1>
        <Row gutter={[16, 16]}>
          {traditions.map((tradition) => (
            <Col xs={24} sm={12} md={8} lg={6} key={tradition.id}>
              <Link href={`/components/traditions/${tradition.id}`}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    tradition.images && tradition.images.length > 0 ? (
                      <div style={{ height: '200px', position: 'relative' }}>
                        <Image
                          src={tradition.images[0].url}
                          alt={tradition.name}
                          layout="fill"
                          objectFit="cover"
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
                    title={<span className="text-lg font-semibold text-green-600">{tradition.name}</span>}
                    description={
                      <div>
                        <p><span className="font-medium">จังหวัด:</span> {tradition.province}</p>
                        <p><span className="font-medium">ภาค:</span> {tradition.type}</p>
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