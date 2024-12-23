// users/components/UserProfile.tsx
import { Card, Typography, Tag } from 'antd';
import { UserBasic } from '../types/user';

interface Props {
  user: UserBasic;
  isMobile: boolean;
}

export function UserProfile({ user, isMobile }: Props) {
  const { Title, Text } = Typography;
  
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-3">
        <img
          src={user.image || '/default-avatar.png'}
          alt={`${user.firstName} ${user.lastName}`}
          className={`rounded-full object-cover ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}
        />
        <div>
          <Title level={isMobile ? 4 : 3}>
            {`${user.firstName} ${user.lastName}`}
          </Title>
          <Text type="secondary" className={isMobile ? 'text-sm' : ''}>
            {user.email}
          </Text>
          <div className="mt-1">
            <Tag color={user.role === 'SUPER_ADMIN' ? 'gold' : 'blue'}>
              {user.role}
            </Tag>
          </div>
        </div>
      </div>
    </Card>
  );
}