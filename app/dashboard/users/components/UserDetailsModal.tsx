'use client';
import { Modal, Tabs, Timeline, Statistic, Card, Typography, Tag } from 'antd';
import { User } from '../types/user';

const { Text } = Typography;

interface UserDetailsModalProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
  loading?: boolean;
  userDetails?: {
    tasks: Array<{
      id: number;
      title: string;
      status: string;
      dueDate: string;
    }>;
    activities: Array<{
      id: number;
      type: string;
      description: string;
      timestamp: string;
    }>;
    statistics: {
      totalTasks: number;
      completedTasks: number;
      pendingTasks: number;
      performanceScore: number;
    };
  };
}

export default function UserDetailsModal({ 
  user, 
  visible, 
  onClose, 
  loading = false,
  userDetails
}: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Modal
      title={`${user.firstName} ${user.lastName}'s Details`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={user.image || '/default-avatar.png'}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <Text strong className="text-lg">{user.email}</Text>
            <div>
              <Tag color={user.role === 'SUPER_ADMIN' ? 'gold' : 'blue'}>
                {user.role}
              </Tag>
            </div>
          </div>
        </div>

        {userDetails && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <Statistic title="Total Tasks" value={userDetails.statistics.totalTasks} />
              </Card>
              <Card>
                <Statistic title="Completed" value={userDetails.statistics.completedTasks} />
              </Card>
              <Card>
                <Statistic title="Pending" value={userDetails.statistics.pendingTasks} />
              </Card>
              <Card>
                <Statistic 
                  title="Performance" 
                  value={userDetails.statistics.performanceScore} 
                  suffix="%" 
                />
              </Card>
            </div>

            <Tabs defaultActiveKey="tasks">
              <Tabs.TabPane tab="Recent Tasks" key="tasks">
                <Timeline>
                  {userDetails.tasks.map(task => (
                    <Timeline.Item 
                      key={task.id}
                      color={task.status === 'completed' ? 'green' : 'blue'}
                    >
                      <Text strong>{task.title}</Text>
                      <br />
                      <Text type="secondary">Due: {task.dueDate}</Text>
                      <Tag 
                        color={task.status === 'completed' ? 'green' : 'orange'}
                        className="ml-2"
                      >
                        {task.status}
                      </Tag>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Activity History" key="activity">
                <Timeline>
                  {userDetails.activities.map(activity => (
                    <Timeline.Item key={activity.id}>
                      <Text strong>{activity.type}</Text>
                      <br />
                      <Text>{activity.description}</Text>
                      <br />
                      <Text type="secondary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Tabs.TabPane>
            </Tabs>
          </>
        )}
      </div>
    </Modal>
  );
}