'use client'
import { Card, Avatar, Descriptions, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Avatar size={64} icon={<UserOutlined />} />
            <h2 style={{ marginTop: 16 }}>John Doe</h2>
            <p>Software Developer</p>
          </Card>
        </Col>
        <Col span={16}>
          <Card>
            <Descriptions title="User Info" layout="vertical">
              <Descriptions.Item label="Name">John Doe</Descriptions.Item>
              <Descriptions.Item label="Email">john.doe@example.com</Descriptions.Item>
              <Descriptions.Item label="Phone">+1 234 567 8900</Descriptions.Item>
              <Descriptions.Item label="Address">
                123 Main St, Anytown, USA 12345
              </Descriptions.Item>
              <Descriptions.Item label="About" span={3}>
                Passionate software developer with 5+ years of experience in web technologies.
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}