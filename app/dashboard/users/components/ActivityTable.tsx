// users/components/ActivityTable.tsx
import { Table, Typography, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Activity, Policy } from '../types/user';

const { Text } = Typography;

interface Props {
  data: (Activity | Policy)[];
  type: 'tradition' | 'policy' | 'ethnic' | 'creative';
  currentUserId?: number;
}

export function ActivityTable({ data, type, currentUserId }: Props) {
  const handleEdit = (record: Activity | Policy) => {
    const linkPath = getLinkPath(type);
    window.open(`/dashboard/${linkPath}/edit/${record.id}`, '_blank');
  };

  const handleDelete = async (record: Activity | Policy) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      try {
        const linkPath = getLinkPath(type);
        const response = await fetch(`/api/${linkPath}/${record.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Refresh the page to update the data
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const columns = [
    {
      title: getTitleByType(type),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Text>{text}</Text>
      ),
    },
    { 
      title: isPolicy(type) ? 'ระดับ' : 'ประเภท', 
      dataIndex: isPolicy(type) ? 'level' : 'type', 
      key: 'typeOrLevel' 
    },
    { title: 'จังหวัด', dataIndex: 'province', key: 'province' },
    { 
      title: 'วันที่บันทึก', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('th-TH'),
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_: any, record: Activity | Policy) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="link" 
            icon={<DeleteOutlined />} 
            size="small"
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table 
      dataSource={data}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
}

function getTitleByType(type: string): string {
  switch(type) {
    case 'tradition': return 'ชื่อประเพณี';
    case 'policy': return 'ชื่อนโยบาย';
    case 'ethnic': return 'ชื่อกลุ่มชาติพันธุ์';
    case 'creative': return 'ชื่อกิจกรรม';
    default: return 'ชื่อ';
  }
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