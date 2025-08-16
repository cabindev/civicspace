// users/components/ActivityList.tsx
import { List, Card, Typography, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Activity, Policy } from '../types/user';

const { Text } = Typography;

interface Props {
 data: (Activity | Policy)[];
 type: 'tradition' | 'policy' | 'ethnic' | 'creative';
}

function getLinkPath(type: string): string {
 switch(type) {
   case 'tradition': return 'tradition';
   case 'policy': return 'public-policy';
   case 'ethnic': return 'ethnic-group';
   case 'creative': return 'creative-activity';
   default: return '';
 }
}

function isPolicy(type: string): boolean {
 return type === 'policy';
}

export function ActivityList({ data, type }: Props) {
  const handleEdit = (e: React.MouseEvent, item: Activity | Policy) => {
    e.preventDefault();
    e.stopPropagation();
    const linkPath = getLinkPath(type);
    window.open(`/dashboard/${linkPath}/edit/${item.id}`, '_blank');
  };

  const handleDelete = async (e: React.MouseEvent, item: Activity | Policy) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      try {
        const linkPath = getLinkPath(type);
        const response = await fetch(`/api/${linkPath}/${item.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <List
      dataSource={data}
      renderItem={item => (
        <Card 
          size="small" 
          className="mb-2 hover:shadow-md transition-shadow"
          key={item.id}
        >
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <Link href={`/dashboard/${getLinkPath(type)}/${item.id}`} className="flex-1">
                <Text strong className="line-clamp-1 hover:text-blue-600">
                  {item.name}
                </Text>
              </Link>
              <Space size="small" className="ml-2">
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  size="small"
                  onClick={(e) => handleEdit(e, item)}
                />
                <Button 
                  type="link" 
                  icon={<DeleteOutlined />} 
                  size="small"
                  danger
                  onClick={(e) => handleDelete(e, item)}
                />
              </Space>
            </div>
            <div className="flex justify-between text-sm">
              <Text type="secondary">
                {isPolicy(type) 
                  ? (item as Policy).level 
                  : (item as Activity).type}
              </Text>
              <Text type="secondary">
                {item.province}
              </Text>
            </div>
            <Text type="secondary" className="text-xs">
              {new Date(item.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </div>
        </Card>
      )}
    />
  );
}