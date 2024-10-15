'use client'
import React from 'react';
import { Form, Input, Button, Switch, Select } from 'antd';

const { Option } = Select;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Form
        form={form}
        name="settings"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item name="siteName" label="Site Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="language" label="Default Language" rules={[{ required: true }]}>
          <Select>
            <Option value="en">English</Option>
            <Option value="th">Thai</Option>
          </Select>
        </Form.Item>

        <Form.Item name="maintenance" label="Maintenance Mode" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}