// app/components/UserGreeting.tsx
'use client';

import { useSession } from 'next-auth/react';
import { HiOutlineUserCircle } from 'react-icons/hi';

export function UserGreeting() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center">
<HiOutlineUserCircle className="text-2xl text-gray-600 mr-2" />
      <span className="text-base font-light text-gray-600">
        {session.user?.firstName || session.user?.lastName || 'ผู้ใช้'}
      </span>
    </div>
  );
}