'use client'
import React, { useState, useEffect, useTransition } from 'react';
import { Table, Switch, message, Avatar, Card, List, Typography, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMediaQuery } from 'react-responsive';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NotificationBadge from '@/app/components/NotificationBadge';

// Server Actions
import { getUsers } from '@/app/lib/actions/users/get';
import { updateUserRole } from '@/app/lib/actions/users/put';
import { deleteUser } from '@/app/lib/actions/users/delete';

const { Text } = Typography;

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  image: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { data: session } = useSession();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    startTransition(async () => {
      try {
        const result = await getUsers();
        if (result.success) {
          setUsers(result.data);
        } else {
          console.error('Failed to fetch users:', result.error);
          message.error('Failed to load users');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        message.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    });
  };

  const toggleUserRole = async (userId: number, newRole: 'ADMIN' | 'MEMBER') => {
    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
          message.success('User role updated successfully');
          await fetchUsers();
        } else {
          message.error(result.error || 'Failed to update user role');
        }
      } catch (error) {
        console.error('Failed to update user role:', error);
        message.error('Failed to update user role');
      }
    });
  };

  const handleDelete = async (userId: number) => {
    startTransition(async () => {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          message.success('User deleted successfully');
          await fetchUsers();
        } else {
          message.error(result.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        message.error('Failed to delete user');
      }
    });
  };

  // Sort users with SUPER_ADMIN first
  const sortedUsers = users.sort((a, b) => {
    if (a.role === 'SUPER_ADMIN') return -1;
    if (b.role === 'SUPER_ADMIN') return 1;
    return 0;
  });

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
        onChange={(checked) => toggleUserRole(userId, checked ? 'ADMIN' : 'MEMBER')}
        checkedChildren="ADMIN"
        unCheckedChildren="MEMBER"
        disabled={role === 'SUPER_ADMIN'}
      />
    );
  };

  const getAvatarStyles = (role: string) => {
    if (role === 'SUPER_ADMIN') {
      return {
        border: '2px solid gold',
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
      };
    }
    return {};
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Avatar',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.image || '/default-avatar.png'} 
            alt={`${record.firstName} ${record.lastName}`}
            style={getAvatarStyles(record.role)}
            size={40}
          />
          {record.role === 'SUPER_ADMIN' && (
            <span style={{ marginLeft: '5px', fontSize: '20px' }}>👑</span>
          )}
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => (
        <Link href={`/dashboard/users/${record.id}`}>
          <NotificationBadge userId={record.id}>
            <Text strong={record.role === 'SUPER_ADMIN'} className="cursor-pointer hover:underline">
              {`${record.firstName} ${record.lastName}`}
            </Text>
          </NotificationBadge>
        </Link>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email, record) => (
        <Text strong={record.role === 'SUPER_ADMIN'}>{email}</Text>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => getRoleDisplay(record.role, record.id),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {session?.user?.role === 'SUPER_ADMIN' && record.role !== 'SUPER_ADMIN' && (
            <a 
              className='text-red-500 hover:text-red-700 transition-colors' 
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </a>
          )}
        </Space>
      ),
    },
  ];

  const renderMobileCard = (user: User) => (
    <Card 
      key={user.id} 
      style={{ 
        marginBottom: 16,
        transition: 'all 0.3s ease',
        ...(user.role === 'SUPER_ADMIN' ? {
          background: 'linear-gradient(to right, rgba(255,215,0,0.1), transparent)',
          border: '1px solid gold',
          boxShadow: '0 2px 8px rgba(255,215,0,0.2)'
        } : {})
      }}
      hoverable
    >
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
                onClick={() => handleDelete(user.id)}
              >
                Delete
              </a>
            )}
          </Space>
        }
      />
    </Card>
  );

  return (
    <div className="p-4">
      <Typography.Title level={2} className="mb-6">
        User Management
      </Typography.Title>
      
      {isMobile ? (
        <List
          dataSource={sortedUsers}
          renderItem={renderMobileCard}
          loading={loading}
        />
      ) : (
        <Table 
          columns={columns} 
          dataSource={sortedUsers} 
          loading={loading} 
          rowKey="id"
          rowClassName={(record) => 
            record.role === 'SUPER_ADMIN' 
              ? 'bg-gradient-to-r from-yellow-50 to-transparent hover:from-yellow-100' 
              : ''
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      )}
    </div>
  );
}