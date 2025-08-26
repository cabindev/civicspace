'use client'
import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaFileAlt, FaUsers, FaCog, FaLandmark, FaPalette } from 'react-icons/fa';
import { UserData } from '@/app/types/types';

// Server Actions
import { getProfile } from '@/app/lib/actions/profile/get';

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchUserData = useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await getProfile();
        if (result.success) {
          setUserData(result.data);
        } else {
          console.error('Failed to fetch user data:', result.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    });
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const statCards = [
    { icon: FaFileAlt, title: 'Public Policies', count: userData.publicPoliciesCount },
    { icon: FaUsers, title: 'Ethnic Groups', count: userData.ethnicGroupsCount },
    { icon: FaLandmark, title: 'Traditions', count: userData.traditionsCount },
    { icon: FaPalette, title: 'Creative Activities', count: userData.creativeActivitiesCount },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-48 h-48 relative">
              <img
                className="object-cover w-full h-full"
                src={userData.image || "/default-avatar.png"}
                alt={`${userData.firstName} ${userData.lastName}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-avatar.png";
                }}
              />
            </div>
            <div className="p-6 md:p-8 flex-grow">
              <div className="uppercase tracking-wide text-sm text-green-500 font-semibold">{userData.role}</div>
              <h1 className="mt-2 text-2xl sm:text-3xl leading-8 font-extrabold tracking-tight text-gray-900">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="mt-2 text-gray-500">{userData.email}</p>
              <div className="mt-4">
                <Link href={`/dashboard/profile/edit/${userData.id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <FaCog className="mr-2" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-gray-800">{card.count}</div>
                <card.icon className="text-3xl text-green-500" />
              </div>
              <div className="text-sm font-medium text-gray-500">{card.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}