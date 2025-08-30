// app/components/public-policy/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getPublicPolicyById, incrementViewCount } from '@/app/lib/actions/public-policy/get';
import { Spin } from 'antd';
import PublicPolicyDetailClient from '../components/PublicPolicyDetailClient';
import NotFoundPage from '../../NotFoundPage';

interface PublicPolicy {
  id: string;
  name: string;
  signingDate: string;
  level: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  content: string[] | string | Record<string, any>;
  summary: string;
  results?: string;
  images: { id: string; url: string }[];
  videoLink?: string;
  policyFileUrl?: string;
  viewCount: number;
  user: {
    firstName: string;
    lastName: string;
    image: string | null;
    email: string;
  };
}

export default function PublicPolicyDetails() {
  const { id } = useParams();
  const [policy, setPolicy] = useState<PublicPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicyDetails = useCallback(async () => {
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      
      // Get policy data
      const result = await getPublicPolicyById(id);
      if (result.success) {
        setPolicy(result.data);
        
        // Increment view count
        await incrementViewCount(id);
      } else {
        console.error('Failed to fetch policy details:', result.error);
      }
    } catch (error) {
      console.error('Failed to fetch policy details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPolicyDetails();
  }, [fetchPolicyDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" />
      </div>
    );
  }

  if (!policy) {
    return (
      <NotFoundPage
        title="ไม่พบข้อมูลนโยบายสาธารณะ"
        description="ไม่สามารถค้นหาข้อมูลนโยบายสาธารณะที่ต้องการได้ อาจเป็นเพราะข้อมูลถูกลบไปแล้วหรือลิงก์ไม่ถูกต้อง"
        backUrl="/components/public-policy"
        backText="กลับสู่หน้ารวมนโยบายสาธารณะ"
        buttonColor="green"
        autoRedirect={true}
        redirectDelay={3000}
        isDashboard={false}
        showDashboardLink={false}
      />
    );
  }

  return <PublicPolicyDetailClient policy={policy} />;
}