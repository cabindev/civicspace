'use client'
import React from 'react';
import { Table, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Edit</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    email: 'john@example.com',
    role: 'Admin',
  },
  {
    key: '2',
    name: 'Jim Green',
    email: 'jim@example.com',
    role: 'User',
  },
  {
    key: '3',
    name: 'Joe Black',
    email: 'joe@example.com',
    role: 'User',
  },
];

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <Table columns={columns} dataSource={data} />
    </div>
  );
}