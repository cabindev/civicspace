'use client';
import React from 'react';
import { Card, Typography, Space, Avatar, Switch, Tag } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const { Text } = Typography;

interface User {
 id: number;
 firstName: string;
 lastName: string;
 email: string;
 role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
 image: string | null;
}

interface UserCardProps {
 user: User;
 onDeleteUser: (userId: number) => void;
 onToggleRole: (userId: number, newRole: 'ADMIN' | 'MEMBER') => void;
}

export default function UserCard({ user, onDeleteUser, onToggleRole }: UserCardProps) {
 const { data: session } = useSession();

 const getAvatarStyles = (role: string) => {
   if (role === 'SUPER_ADMIN') {
     return {
       border: '2px solid gold',
       boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
     };
   }
   return {};
 };

 const getRoleDisplay = (role: string, userId: number) => {
   if (role === 'SUPER_ADMIN') {
     return (
       <Tag color="gold" style={{
         padding: '0 15px',
         height: '24px',
         lineHeight: '24px',
         background: 'linear-gradient(45deg, #FFD700, #FFA500)',
         border: 'none',
         fontWeight: 'bold',
         display: 'flex',
         alignItems: 'center',
         gap: '4px'
       }}>
         <span style={{ fontSize: '14px' }}>👑</span>
         SUPER ADMIN
       </Tag>
     );
   }
   return (
     <Switch
       checked={role === 'ADMIN'}
       onChange={(checked) => onToggleRole(userId, checked ? 'ADMIN' : 'MEMBER')}
       checkedChildren="ADMIN"
       unCheckedChildren="MEMBER"
       disabled={role === 'SUPER_ADMIN'}
     />
   );
 };

 const cardStyle = user.role === 'SUPER_ADMIN' ? {
   marginBottom: 16,
   transition: 'all 0.3s ease',
   background: 'linear-gradient(to right, rgba(255,215,0,0.1), transparent)',
   border: '1px solid gold',
   boxShadow: '0 2px 8px rgba(255,215,0,0.2)'
 } : {
   marginBottom: 16,
   transition: 'all 0.3s ease'
 };

 return (
   <div onClick={() => window.location.href = `/users/${user.id}`}>
     <Card style={cardStyle} hoverable>
       <Card.Meta
         avatar={
           <div style={{ display: 'flex', alignItems: 'center' }}>
             <Avatar 
               src={user.image || '/default-avatar.png'} 
               alt={`${user.firstName} ${user.lastName}`}
               style={getAvatarStyles(user.role)}
               size={50}
             />
             {user.role === 'SUPER_ADMIN' && (
               <span style={{ marginLeft: '5px', fontSize: '20px' }}>👑</span>
             )}
           </div>
         }
         title={
           <Text strong={user.role === 'SUPER_ADMIN'}>
             {`${user.firstName} ${user.lastName}`}
           </Text>
         }
         description={
           <Space direction="vertical" size="small">
             <Text type="secondary">{user.email}</Text>
             <Space>
               <Text type="secondary">Role:</Text>
               {getRoleDisplay(user.role, user.id)}
             </Space>
             {session?.user?.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN' && (
               <a 
                 className="text-red-500 hover:text-red-700 transition-colors"
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   onDeleteUser(user.id);
                 }}
               >
                 Delete
               </a>
             )}
           </Space>
         }
       />
     </Card>
   </div>
 );
}