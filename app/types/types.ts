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
  creativeActivityChart: CreativeActivityChartData[];
  ethnicGroupChart: EthnicGroupChartData[];
  map: MapData[];
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