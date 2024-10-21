'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { motion } from 'framer-motion';

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
  const [latestTraditions, setLatestTraditions] = useState<LatestItem[]>([]);
  const [latestPolicies, setLatestPolicies] = useState<LatestPublicPolicy[]>([]);
  const [latestEthnicGroups, setLatestEthnicGroups] = useState<LatestItem[]>([]);
  const [latestCreativeActivities, setLatestCreativeActivities] = useState<LatestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestData = async () => {
      setIsLoading(true);
      try {
        const [traditionsResponse, policiesResponse, ethnicGroupsResponse, creativeActivitiesResponse] = await Promise.all([
          axios.get('/api/home/tradition'),
          axios.get('/api/home/public-policy'),
          axios.get('/api/home/ethnic-group'),
          axios.get('/api/home/creative-activity')
        ]);
        setLatestTraditions(traditionsResponse.data);
        setLatestPolicies(policiesResponse.data);
        setLatestEthnicGroups(ethnicGroupsResponse.data);
        setLatestCreativeActivities(creativeActivitiesResponse.data);
      } catch (error) {
        console.error('Error fetching latest data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestData();
  }, []);

  const renderLatestItems = (items: LatestItem[], path: string) => (
    <ul>
      {items.slice(0, 2).map((item) => (
        <motion.li
          key={item.id}
          className="mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href={`/components/${path}/${item.id}`} className="hover:text-green-300">
            <span className="font-light">{item.name}</span>
            <br />
            <span className="text-xs text-green-300">{item.category.name} | {item.province}</span>
          </Link>
        </motion.li>
      ))}
    </ul>
  );

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-green-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-green-200 rounded w-1/2 mb-1"></div>
      <div className="h-3 bg-green-200 rounded w-2/3 mb-3"></div>
      <div className="h-4 bg-green-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-green-200 rounded w-1/2 mb-1"></div>
      <div className="h-3 bg-green-200 rounded w-2/3"></div>
    </div>
  );

  return (
    <motion.footer
      className="bg-green-800 text-white py-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-semibold mb-2">งานบุญประเพณีล่าสุด</h3>
          {isLoading ? <SkeletonLoader /> : renderLatestItems(latestTraditions, 'traditions')}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h3 className="text-sm font-semibold mb-2">นโยบายสาธารณะล่าสุด</h3>
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <ul>
              {latestPolicies.slice(0, 2).map((policy) => (
                <motion.li
                  key={policy.id}
                  className="mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/components/public-policy/${policy.id}`} className="hover:text-green-300">
                    <span className="font-light">{policy.name}</span>
                    <br />
                    <span className="text-xs text-green-300">{policy.level} | {policy.province}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3 className="text-sm font-semibold mb-2">กลุ่มชาติพันธุ์ล่าสุด</h3>
          {isLoading ? <SkeletonLoader /> : renderLatestItems(latestEthnicGroups, 'ethnic-group')}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h3 className="text-sm font-semibold mb-2">กิจกรรมสร้างสรรค์ล่าสุด</h3>
          {isLoading ? <SkeletonLoader /> : renderLatestItems(latestCreativeActivities, 'creative-activity')}
        </motion.div>
      </div>
      <motion.div
        className="container mx-auto px-4 mt-4 text-center text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p>© 2024 มูลนิธิเครือข่ายพลังสังคม. All rights reserved.</p>
      </motion.div>
    </motion.footer>
  );
};