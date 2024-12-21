'use client';
import { Table, Typography, Space, Avatar, Switch, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { User } from '../types/user';

const { Text } = Typography;

interface UserListProps {
  users: User[];
  loading: boolean;
  onDeleteUser: (userId: number) => void;
  onToggleRole: (userId: number, newRole: 'ADMIN' | 'MEMBER') => void;
}

export default function UserList({ users, loading, onDeleteUser, onToggleRole }: UserListProps) {
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

  const columns: ColumnsType<User> = [
    {
      title: 'Avatar',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <Link href={`/users/${record.id}`}>
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
        </Link>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Link href={`/users/${record.id}`}>
          <Text strong={record.role === 'SUPER_ADMIN'}>
            {`${record.firstName} ${record.lastName}`}
          </Text>
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
              onClick={() => onDeleteUser(record.id)}
            >
              Delete
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={users} 
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
  );
}