// app/types/types.ts

export interface TraditionCategory {
  id: string;
  name: string;
}

export interface Tradition {
  id: string;
  categoryId: string;
  category: TraditionCategory;
  name: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: number | null;
  district_code: number | null;
  amphoe_code: number | null;
  province_code: number | null;
  type: string;
  village: string | null;
  coordinatorName: string | null;
  phone: string | null;
  history: string;
  alcoholFreeApproach: string;
  results: string | null;
  startYear: number;
  images: Image[];
  videoLink: string | null;
  policyFileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  url: string;
  traditionId: string;
}

export interface RegionData {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
  district_code: number;
  amphoe_code: number;
  province_code: number;
  type: string;
}

// types/DashboardTypes.ts

export interface DashboardData {
  overview: OverviewData;
  recentActivities: RecentActivity[];
  topViewed: TopViewedItem[];
  traditionChart: TraditionChartData[];
  publicPolicyChart: PublicPolicyChartData[];
  ethnicGroupChart: EthnicGroupChartData[];
  map: MapData[];
  recentPolicies: PolicyData[];
  creativeActivityChart: CreativeActivityData[]; 
}

export interface OverviewData {
  userCount: number;
  creativeActivityCount: number;
  traditionCount: number;
  publicPolicyCount: number;
  ethnicGroupCount: number;
}

export interface RecentActivity {
  description: string;
  date: string;
}

export interface TopViewedItem {
  name: string;
  type: string;
  viewCount: number;
}

export interface TraditionChartData {
  category: string;
  count: number;
}

export interface PublicPolicyChartData {
  level: string;
  count: number;
}

export interface CreativeActivityChartData {
  category: string;
  subCategories: string[];
  subCategoryCounts: { [key: string]: number };
}

export interface CreativeActivityData {
  category: string;
  activityCount: number;
  recentActivities: { name: string; date: Date }[];
  
}
export interface EthnicGroupChartData {
  category: string;
  count: number;
}

export interface MapData {
  name: string;
  type: string;
  lat: number;
  lng: number;
}

export interface PolicyData {
  name: string;
  signingDate: string;
  level: 'NATIONAL' | 'PROVINCIAL' | 'DISTRICT' | 'SUB_DISTRICT' | 'VILLAGE';
  district: string;
  amphoe: string;
  province: string;
  type: string;
  
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  role: string;
  publicPoliciesCount: number;
  ethnicGroupsCount: number;
  traditionsCount: number;
  creativeActivitiesCount: number;
}

// app/types/types.ts


export type TraditionData = {
  id: string;
  name: string;
  category: { name: string };
  district: string;
  amphoe: string;
  province: string;
  type: string;
};

export type PublicPolicyData = {
  id: string;
  name: string;
  signingDate: string;
  level: 'NATIONAL' | 'PROVINCIAL' | 'DISTRICT' | 'SUB_DISTRICT' | 'VILLAGE';
  district: string;
  amphoe: string;
  province: string;
  type: string;
};

export type EthnicGroupData = {
  id: string;
  name: string;
  category: { name: string };
  province: string;
  amphoe: string;
  district: string;
  type: string;
};

export type HomeCreativeActivityData = {
  id: string;
  name: string;
  category: { name: string };
  subCategory: { name: string };
  district: string;
  amphoe: string;
  province: string;
  type: string;
};

// เพิ่ม type สำหรับข้อมูลที่จะใช้ในหน้าแรก
export type HomePageData = {
  traditions: TraditionData[];
  publicPolicies: PublicPolicyData[];
  ethnicGroups: EthnicGroupData[];
  creativeActivities: CreativeActivityData[];
};

// เพิ่ม type สำหรับ response ของ API
export type APIResponse<T> = {
  data: T;
  error?: string;
};

// เพิ่ม type สำหรับ search params
export type SearchParams = {
  query: string;
  page?: number;
  limit?: number;
};