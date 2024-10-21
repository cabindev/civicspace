'use client'

import { useState, useEffect } from 'react';
import { Spin, Card, Row, Col } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '../Navbar';

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
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-500">TREADITIONS</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {traditions.map((tradition) => (
            <Link href={`/components/traditions/${tradition.id}`} key={tradition.id} className="block">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="h-48 overflow-hidden">
                  {tradition.images && tradition.images.length > 0 ? (
                    <img
                      src={tradition.images[0].url}
                      alt={tradition.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">ไม่มีรูปภาพ</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-green-600 mb-2">{tradition.name}</h2>
                  <p className="text-sm text-gray-600"><span className="font-medium">จังหวัด:</span> {tradition.province}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">ภาค:</span> {tradition.type}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}