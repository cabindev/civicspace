'use client';

import { Empty, Card, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showReset?: boolean;
  onReset?: () => void;
  icon?: React.ReactNode;
}

const EmptyState = ({ 
  title = "ไม่พบข้อมูล", 
  description = "ไม่มีข้อมูลในเงื่อนไขการกรองที่เลือก",
  showReset = true,
  onReset,
  icon
}: EmptyStateProps) => {
  return (
    <Card className="text-center py-12">
      <Empty
        image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 100,
        }}
        description={
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <p className="text-gray-500">{description}</p>
            {showReset && (
              <div className="mt-4">
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={onReset}
                >
                  รีเซ็ตตัวกรอง
                </Button>
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default EmptyState;