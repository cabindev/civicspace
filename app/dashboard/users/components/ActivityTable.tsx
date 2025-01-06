// users/components/ActivityTable.tsx
import { Table, Typography } from 'antd';
import Link from 'next/link';
import { Activity, Policy } from '../types/user';

const { Text } = Typography;

interface Props {
  data: (Activity | Policy)[];
  type: 'tradition' | 'policy' | 'ethnic' | 'creative';
}

export function ActivityTable({ data, type }: Props) {
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
    case 'tradition': return 'traditions';
    case 'policy': return 'public-policies';
    case 'ethnic': return 'ethnic-groups';
    case 'creative': return 'creative-activities';
    default: return '';
  }
}

function isPolicy(type: string): boolean {
  return type === 'policy';
}