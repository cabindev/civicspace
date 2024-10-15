import { Timeline } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { RecentActivity } from '@/app/types/types';

interface RecentActivitiesProps {
  data: RecentActivity[];
}

export default function RecentActivities({ data }: RecentActivitiesProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Recent Activities</h2>
        <Timeline mode="left">
          {data.map((activity, index) => (
            <Timeline.Item key={index} dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}>
              <p>{activity.description}</p>
              <p className="text-sm text-gray-500">{activity.date}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </div>
  );
}