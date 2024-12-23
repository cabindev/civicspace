// users/components/ActivityTabs.tsx
import { Tabs } from 'antd';
import { UserActivities } from '../types/user';
import { ActivityTable } from './ActivityTable';
import { ActivityList } from './ActivityList';

interface Props {
  activities: UserActivities;
  isMobile: boolean;
}

export function ActivityTabs({ activities, isMobile }: Props) {
  return (
    <Tabs defaultActiveKey="traditions" size={isMobile ? 'small' : 'middle'}>
      <Tabs.TabPane tab="ประเพณี" key="traditions">
        {isMobile ? (
          <ActivityList data={activities.traditions} type="tradition" />
        ) : (
          <ActivityTable data={activities.traditions} type="tradition" />
        )}
      </Tabs.TabPane>

      <Tabs.TabPane tab="นโยบาย" key="policies">
        {isMobile ? (
          <ActivityList data={activities.publicPolicies} type="policy" />
        ) : (
          <ActivityTable data={activities.publicPolicies} type="policy" />
        )}
      </Tabs.TabPane>

      <Tabs.TabPane tab="ชาติพันธุ์" key="ethnicGroups">
        {isMobile ? (
          <ActivityList data={activities.ethnicGroups} type="ethnic" />
        ) : (
          <ActivityTable data={activities.ethnicGroups} type="ethnic" />
        )}
      </Tabs.TabPane>

      <Tabs.TabPane tab="กิจกรรม" key="creativeActivities">
        {isMobile ? (
          <ActivityList data={activities.creativeActivities} type="creative" />
        ) : (
          <ActivityTable data={activities.creativeActivities} type="creative" />
        )}
      </Tabs.TabPane>
    </Tabs>
  );
}