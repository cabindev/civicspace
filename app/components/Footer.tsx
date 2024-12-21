'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { seppuri } from '../fonts';

interface LatestItem {
  id: string;
  name: string;
  category: { name: string };
  province: string;
}

interface LatestPublicPolicy {
  id: string;
  name: string;
  level: string;
  province: string;
}

export const Footer: React.FC = () => {
  const [data, setData] = useState<{
    traditions: LatestItem[];
    policies: LatestPublicPolicy[];
    ethnicGroups: LatestItem[];
    creativeActivities: LatestItem[];
  }>({
    traditions: [],
    policies: [],
    ethnicGroups: [],
    creativeActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestData = async () => {
      try {
        const [traditions, policies, ethnicGroups, activities] = await Promise.all([
          axios.get('/api/home/tradition'),
          axios.get('/api/home/public-policy'),
          axios.get('/api/home/ethnic-group'),
          axios.get('/api/home/creative-activity')
        ]);

        if (isMounted) {
          setData({
            traditions: traditions.data,
            policies: policies.data,
            ethnicGroups: ethnicGroups.data,
            creativeActivities: activities.data
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchLatestData();
    return () => { isMounted = false };
  }, []);

  const renderLatestItems = (items: LatestItem[], path: string) => (
    <ul className="space-y-2">
      {items.slice(0, 2).map((item) => (
        <li key={item.id} className="transition-colors duration-200">
          <Link href={`/components/${path}/${item.id}`} className="hover:text-green-300 block">
            <span className="font-light">{item.name}</span>
            <span className="text-xs text-green-300 block">
              {item.category.name} | {item.province}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  const renderPolicyItems = (policies: LatestPublicPolicy[]) => (
    <ul className="space-y-2">
      {policies.slice(0, 2).map((policy) => (
        <li key={policy.id} className="transition-colors duration-200">
          <Link href={`/components/public-policy/${policy.id}`} className="hover:text-green-300 block">
            <span className="font-light">{policy.name}</span>
            <span className="text-xs text-green-300 block">
              {policy.level} | {policy.province}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  if (isLoading) {
    return (
      <footer className={`bg-green-800 text-white py-4 ${seppuri.variable}`}>
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-green-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-green-700 rounded w-1/2 mb-1" />
              <div className="h-3 bg-green-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-green-800 text-white py-4 ${seppuri.variable}`}>
      <div className="font-seppuri container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <h3 className="text-l font-semibold mb-2">งานบุญประเพณีล่าสุด</h3>
          {renderLatestItems(data.traditions, 'traditions')}
        </div>
        <div>
          <h3 className="text-l font-semibold mb-2">นโยบายสาธารณะล่าสุด</h3>
          {renderPolicyItems(data.policies)}
        </div>
        <div>
          <h3 className="text-l font-semibold mb-2">กลุ่มชาติพันธุ์ล่าสุด</h3>
          {renderLatestItems(data.ethnicGroups, 'ethnic-group')}
        </div>
        <div>
          <h3 className="text-l font-semibold mb-2">กิจกรรมสร้างสรรค์ล่าสุด</h3>
          {renderLatestItems(data.creativeActivities, 'creative-activity')}
        </div>
      </div>
      <div className="font-seppuri container mx-auto px-4 mt-4 text-center text-sm">
        <p>© 2024 มูลนิธิเครือข่ายพลังสังคม. All rights reserved.</p>
      </div>
    </footer>
  );
};