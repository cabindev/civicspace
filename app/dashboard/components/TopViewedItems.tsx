import { Table } from 'antd';
import { TopViewedItem } from '@/app/types/types';

interface TopViewedItemsProps {
  data: TopViewedItem[];
}

export default function TopViewedItems({ data }: TopViewedItemsProps) {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Views', dataIndex: 'viewCount', key: 'viewCount', sorter: (a, b) => a.viewCount - b.viewCount },
  ];

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Top Viewed Items</h2>
        <Table dataSource={data} columns={columns} pagination={false} />
      </div>
    </div>
  );
}