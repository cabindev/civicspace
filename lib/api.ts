// CivicSpace API Library
const API_BASE = 'https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1';

export interface Survey {
  id: number;
  title: string;
  slug: string;
  description?: string;
  author?: string;
  survey_file_url: string;
  is_published: boolean;
  survey_date: string;
  response_count: number;
  view_count: number;
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    post_count?: number;
  };
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export const civicBlogsAPI = {
  // ดึงแบบสำรวจทั้งหมด
  async getSurveys(): Promise<Survey[]> {
    try {
      const response = await fetch(`${API_BASE}/surveys/`);
      if (!response.ok) {
        console.log('Surveys API endpoint not available yet');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.log('Surveys API endpoint not available yet');
      return [];
    }
  },

  // ดึงแบบสำรวจล่าสุด
  async getLatestSurveys(limit: number = 10): Promise<Survey[]> {
    try {
      const response = await fetch(`${API_BASE}/surveys/latest/?limit=${limit}`);
      if (!response.ok) {
        console.log('Surveys API endpoint not available yet');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.log('Surveys API endpoint not available yet');
      return [];
    }
  },

  // ดึงแบบสำรวจยอดนิยม
  async getPopularSurveys(limit: number = 5): Promise<Survey[]> {
    try {
      const response = await fetch(`${API_BASE}/surveys/popular/?limit=${limit}`);
      if (!response.ok) {
        console.log('Surveys API endpoint not available yet');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.log('Surveys API endpoint not available yet');
      return [];
    }
  },

  // ดึงแบบสำรวจเฉพาะ
  async getSurvey(slug: string): Promise<Survey | null> {
    try {
      const response = await fetch(`${API_BASE}/surveys/${slug}/`);
      if (!response.ok) {
        console.log('Survey API endpoint not available yet');
        return null;
      }
      return await response.json();
    } catch (error) {
      console.log('Survey API endpoint not available yet');
      return null;
    }
  },

  // ดึงแบบสำรวจตามหมวดหมู่
  async getCategorySurveys(categorySlug: string): Promise<Survey[]> {
    try {
      const response = await fetch(`${API_BASE}/categories/${categorySlug}/surveys/`);
      if (!response.ok) {
        console.log('Category surveys API endpoint not available yet');
        return [];
      }
      return await response.json();
    } catch (error) {
      console.log('Category surveys API endpoint not available yet');
      return [];
    }
  },
};
