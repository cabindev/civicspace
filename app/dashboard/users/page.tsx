// app/dashboard/users/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Table, Switch, message, Avatar, Card, List, Typography, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';

const { Text } = Typography;

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  image: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to load users');
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: number, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      await axios.put(`/api/users/${userId}`, { role: newRole });
      message.success('User role updated successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to update user role:', error);
      message.error('Failed to update user role');
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      message.success('User deleted successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to delete user:', error);
      message.error('Failed to delete user');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Avatar',
      key: 'avatar',
      render: (_, record) => (
        <Avatar src={record.image || '/default-avatar.png'} alt={`${record.firstName} ${record.lastName}`} />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => (
        <Switch
          checked={record.role === 'ADMIN'}
          onChange={(checked) => toggleUserRole(record.id, checked ? 'ADMIN' : 'MEMBER')}
          checkedChildren="ADMIN"
          unCheckedChildren="MEMBER"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a className='text-red-500' onClick={() => handleDelete(record.id)}>Delete</a>
        </Space>
      ),
    },
  ];

  const renderMobileCard = (user: User) => (
    <Card key={user.id} style={{ marginBottom: 16 }}>
      <Card.Meta
        avatar={<Avatar src={user.image || '/default-avatar.png'} alt={`${user.firstName} ${user.lastName}`} />}
        title={`${user.firstName} ${user.lastName}`}
        description={
          <Space direction="vertical">
            <Text>{user.email}</Text>
            <Space>
              <Text>Role:</Text>
              <Switch
                checked={user.role === 'ADMIN'}
                onChange={(checked) => toggleUserRole(user.id, checked ? 'ADMIN' : 'MEMBER')}
                checkedChildren="ADMIN"
                unCheckedChildren="MEMBER"
              />
            </Space>
            <a onClick={() => handleDelete(user.id)}>Delete</a>
          </Space>
        }
      />
    </Card>
  );

  return (
    <div>
      {isMobile ? (
        <List
          dataSource={users}
          renderItem={renderMobileCard}
          loading={loading}
        />
      ) : (
        <Table columns={columns} dataSource={users} loading={loading} rowKey="id" />
      )}
    </div>
  );
}