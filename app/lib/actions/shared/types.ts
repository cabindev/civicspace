// app/lib/actions/shared/types.ts
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateActivityData {
  name: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  coordinatorName: string;
  phone?: string;
  description: string;
  summary: string;
  results?: string;
  startYear: number;
  videoLink?: string;
  categoryId: string;
  subCategoryId: string;
}

export interface CreateTraditionData {
  name: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  coordinatorName: string;
  phone?: string;
  history: string;
  alcoholFreeApproach: string;
  results?: string;
  startYear: number;
  videoLink?: string;
  categoryId: string;
  hasPolicy: boolean;
  hasAnnouncement: boolean;
  hasInspector: boolean;
  hasMonitoring: boolean;
  hasCampaign: boolean;
  hasAlcoholPromote: boolean;
}

export interface CreatePolicyData {
  name: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  coordinatorName: string;
  phone?: string;
  description: string;
  summary: string;
  results?: string;
  startYear: number;
  videoLink?: string;
}

export interface CreateEthnicGroupData {
  name: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  coordinatorName: string;
  phone?: string;
  description: string;
  summary: string;
  results?: string;
  startYear: number;
  videoLink?: string;
  categoryId: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateViewCountData {
  action: 'incrementViewCount';
}