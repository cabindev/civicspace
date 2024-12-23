export interface UserBasic {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  image: string | null;
}
export interface UserStatistics {
  totalActivities: number;
  activityBreakdown: ActivityBreakdown;
  monthlyActivities: {
    month: string;
    count: number;
  }[];
}
export interface Activity {
  id: string;
  name: string;
  type: string;
  province: string;
  createdAt: string;
}

export interface Policy extends Omit<Activity, 'type'> {
  level: string;
}

export interface UserActivities {
  traditions: Activity[];
  publicPolicies: Policy[];
  ethnicGroups: Activity[];
  creativeActivities: Activity[];
}

export interface ActivityBreakdown {
  traditions: number;
  publicPolicies: number;
  ethnicGroups: number;
  creativeActivities: number;
}

export interface UserStatistics {
  totalActivities: number;
  activityBreakdown: ActivityBreakdown;
  monthlyActivities: {
    month: string;
    count: number;
  }[];
}

export interface UserDetails {
  user: UserBasic;
  activities: UserActivities;
  statistics: UserStatistics;
}