// app/lib/actions/dashboard/dashboard.ts
'use server'

import prisma from '@/app/lib/prisma';
import { ActionResult } from '../shared/types';

// Helper function to build where clauses for filtering
function buildWhereClause(tableName: string, year?: string, region?: string, province?: string) {
  const where: any = {};

  // Filter by region/type
  if (region && region !== 'all') {
    where.type = region;
  }

  // Filter by province
  if (province && province !== 'all') {
    where.province = province;
  }

  // Filter by year based on table type
  if (year && year !== 'all') {
    const yearNumber = parseInt(year);
    
    if (tableName === 'tradition' || tableName === 'ethnicGroup' || tableName === 'creativeActivity') {
      // These tables have startYear field (Buddhist Era)
      where.startYear = yearNumber;
    } else if (tableName === 'publicPolicy') {
      // PublicPolicy uses signingDate (need to convert Buddhist Era to Gregorian)
      const adYear = yearNumber - 543;
      where.signingDate = {
        gte: new Date(`${adYear}-01-01`),
        lt: new Date(`${adYear + 1}-01-01`)
      };
    }
  }

  return where;
}

// Helper functions for chart data
async function getTraditionChartData(whereClause: any) {
  const categories = await prisma.traditionCategory.findMany({
    include: {
      traditions: {
        where: whereClause
      }
    }
  });

  return categories.map(category => ({
    category: category.name,
    count: category.traditions.length
  })).filter(item => item.count > 0);
}

async function getPublicPolicyChartData(whereClause: any) {
  const policies = await prisma.publicPolicy.groupBy({
    by: ['level'],
    where: whereClause,
    _count: { level: true }
  });

  return policies.map(policy => ({
    level: policy.level,
    count: policy._count.level
  }));
}

async function getEthnicGroupChartData(whereClause: any) {
  const categories = await prisma.ethnicCategory.findMany({
    include: {
      ethnicGroups: {
        where: whereClause
      }
    }
  });

  return categories.map(category => ({
    category: category.name,
    count: category.ethnicGroups.length
  })).filter(item => item.count > 0);
}

async function getCreativeActivityChartData(whereClause: any) {
  const categories = await prisma.creativeCategory.findMany({
    include: {
      activities: {
        where: whereClause
      }
    }
  });

  return categories.map(category => ({
    category: category.name,
    count: category.activities.length
  })).filter(item => item.count > 0);
}

function groupByRegion(data: any[]) {
  return data.reduce((acc, item) => {
    const region = item.type || 'ไม่ระบุ';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});
}

function groupByYear(data: any[]) {
  return data.reduce((acc, item) => {
    let year: number;
    
    if (item.startYear) {
      year = item.startYear;
    } else if (item.signingDate) {
      year = new Date(item.signingDate).getFullYear() + 543; // แปลงเป็น พ.ศ.
    } else if (item.createdAt) {
      year = new Date(item.createdAt).getFullYear() + 543; // แปลงเป็น พ.ศ.
    } else {
      return acc;
    }

    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
}

// Simple coordinate function for mapping (placeholder)
async function getCoordinates(district: string, amphoe: string, province: string) {
  // In a real application, this would use a geocoding service
  return { lat: 13.7563, lng: 100.5018 };
}

// Overview data
export async function getDashboardOverview(): Promise<ActionResult> {
  try {
    const [userCount, creativeActivityCount, traditionCount, publicPolicyCount, ethnicGroupCount] = await Promise.all([
      prisma.user.count(),
      prisma.creativeActivity.count(),
      prisma.tradition.count(),
      prisma.publicPolicy.count(),
      prisma.ethnicGroup.count(),
    ]);

    return {
      success: true,
      data: {
        userCount,
        creativeActivityCount,
        traditionCount,
        publicPolicyCount,
        ethnicGroupCount,
      }
    };
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard overview data'
    };
  }
}

// Locations data
export async function getDashboardLocations(): Promise<ActionResult> {
  try {
    // Get all unique regions and provinces from all tables
    const [traditionData, policyData, ethnicData, creativeData] = await Promise.all([
      prisma.tradition.findMany({
        select: { type: true, province: true },
        distinct: ['type', 'province']
      }),
      prisma.publicPolicy.findMany({
        select: { type: true, province: true },
        distinct: ['type', 'province']
      }),
      prisma.ethnicGroup.findMany({
        select: { type: true, province: true },
        distinct: ['type', 'province']
      }),
      prisma.creativeActivity.findMany({
        select: { type: true, province: true },
        distinct: ['type', 'province']
      })
    ]);

    // Combine all data
    const allData = [...traditionData, ...policyData, ...ethnicData, ...creativeData];

    // Extract unique regions
    const regionSet = new Set(allData.map(item => item.type).filter(Boolean));
    const regions = Array.from(regionSet).sort();

    // Extract unique provinces
    const provinceSet = new Set(allData.map(item => item.province).filter(Boolean));
    const provinces = Array.from(provinceSet).sort();

    // Create region-province mapping
    const regionProvinceMap: Record<string, string[]> = {};
    
    regions.forEach(region => {
      const provinceSetInRegion = new Set(
        allData
          .filter(item => item.type === region)
          .map(item => item.province)
          .filter(Boolean)
      );
      const provincesInRegion = Array.from(provinceSetInRegion).sort();
      
      regionProvinceMap[region] = provincesInRegion;
    });

    return {
      success: true,
      data: {
        regions,
        provinces,
        regionProvinceMap,
        statistics: {
          totalRegions: regions.length,
          totalProvinces: provinces.length,
          dataPoints: allData.length
        }
      }
    };
  } catch (error) {
    console.error('Error fetching locations:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard locations data'
    };
  }
}

// Regions data
export async function getDashboardRegions(): Promise<ActionResult> {
  try {
    // ดึงข้อมูล type ที่มีอยู่จริงจากทุกตาราง
    const [traditionTypes, policyTypes, ethnicTypes, activityTypes] = await Promise.all([
      prisma.tradition.findMany({
        select: { type: true },
        distinct: ['type']
      }),
      prisma.publicPolicy.findMany({
        select: { type: true },
        distinct: ['type']
      }),
      prisma.ethnicGroup.findMany({
        select: { type: true },
        distinct: ['type']
      }),
      prisma.creativeActivity.findMany({
        select: { type: true },
        distinct: ['type']
      })
    ]);

    // รวมข้อมูล type ทั้งหมดและหาค่าที่ไม่ซ้ำ
    const allTypes = [
      ...traditionTypes.map(t => t.type),
      ...policyTypes.map(t => t.type),
      ...ethnicTypes.map(t => t.type),
      ...activityTypes.map(t => t.type)
    ];

    const typeSet = new Set(allTypes);
    const uniqueTypes = Array.from(typeSet).filter(Boolean).sort();

    return {
      success: true,
      data: {
        traditionTypes: traditionTypes.map(t => t.type),
        policyTypes: policyTypes.map(t => t.type),
        ethnicTypes: ethnicTypes.map(t => t.type),
        activityTypes: activityTypes.map(t => t.type),
        allTypes: uniqueTypes
      }
    };
  } catch (error) {
    console.error('Error fetching regions:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard regions data'
    };
  }
}

// Recent activities data
export async function getDashboardRecentActivities(): Promise<ActionResult> {
  try {
    const recentActivities = await prisma.creativeActivity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        type: true,
        province: true,
        createdAt: true,
      },
    });

    const formattedActivities = recentActivities.map(activity => ({
      description: `New ${activity.type}: ${activity.name}`,
      date: activity.createdAt.toISOString(),
      type: activity.type,
      region: activity.province,
    }));

    return {
      success: true,
      data: formattedActivities
    };
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return {
      success: false,
      error: 'Failed to fetch recent activities data'
    };
  }
}

// Recent policies data
export async function getDashboardRecentPolicies(): Promise<ActionResult> {
  try {
    const recentPolicies = await prisma.publicPolicy.findMany({
      take: 5,
      orderBy: { signingDate: 'desc' },
      select: {
        name: true,
        signingDate: true,
        level: true,
        district: true,
        amphoe: true,
        province: true,
        type: true,
      },
    });

    return {
      success: true,
      data: recentPolicies
    };
  } catch (error) {
    console.error('Error fetching recent policies:', error);
    return {
      success: false,
      error: 'Failed to fetch recent policies data'
    };
  }
}

// Map data
export async function getDashboardMap(): Promise<ActionResult> {
  try {
    const [traditions, policies] = await Promise.all([
      prisma.tradition.findMany({
        select: {
          name: true,
          type: true,
          district: true,
          amphoe: true,
          province: true,
        },
      }),
      prisma.publicPolicy.findMany({
        select: {
          name: true,
          type: true,
          district: true,
          amphoe: true,
          province: true,
        },
      }),
    ]);

    const mapData = await Promise.all([
      ...traditions.map(async t => {
        const coordinates = await getCoordinates(t.district, t.amphoe, t.province);
        return {
          name: t.name,
          type: 'Tradition',
          ...coordinates,
        };
      }),
      ...policies.map(async p => {
        const coordinates = await getCoordinates(p.district, p.amphoe, p.province);
        return {
          name: p.name,
          type: 'Policy',
          ...coordinates,
        };
      }),
    ]);

    return {
      success: true,
      data: mapData
    };
  } catch (error) {
    console.error('Error fetching map data:', error);
    return {
      success: false,
      error: 'Failed to fetch map data'
    };
  }
}

// Chart data functions
export async function getDashboardCreativeActivityChart(): Promise<ActionResult> {
  try {
    const categories = await prisma.creativeCategory.findMany({
      include: {
        _count: {
          select: { activities: true },
        },
        activities: {
          select: {
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    const chartData = categories.map(category => ({
      category: category.name,
      activityCount: category._count.activities,
      recentActivities: category.activities.map(activity => ({
        name: activity.name,
        date: activity.createdAt,
      })),
    }));

    return {
      success: true,
      data: chartData
    };
  } catch (error) {
    console.error('Error fetching creative activity chart data:', error);
    return {
      success: false,
      error: 'Failed to fetch creative activity chart data'
    };
  }
}

export async function getDashboardEthnicGroupChart(): Promise<ActionResult> {
  try {
    const ethnicCategories = await prisma.ethnicCategory.findMany({
      include: {
        _count: {
          select: { ethnicGroups: true },
        },
      },
    });

    const chartData = ethnicCategories.map(category => ({
      category: category.name,
      count: category._count.ethnicGroups,
    }));

    return {
      success: true,
      data: chartData
    };
  } catch (error) {
    console.error('Error fetching ethnic group chart data:', error);
    return {
      success: false,
      error: 'Failed to fetch ethnic group chart data'
    };
  }
}

export async function getDashboardPublicPolicyChart(): Promise<ActionResult> {
  try {
    const policyLevels = await prisma.publicPolicy.groupBy({
      by: ['level'],
      _count: {
        _all: true,
      },
    });

    const chartData = policyLevels.map(level => ({
      level: level.level,
      count: level._count._all,
    }));

    return {
      success: true,
      data: chartData
    };
  } catch (error) {
    console.error('Error fetching public policy chart data:', error);
    return {
      success: false,
      error: 'Failed to fetch public policy chart data'
    };
  }
}

export async function getDashboardTraditionChart(): Promise<ActionResult> {
  try {
    const categories = await prisma.traditionCategory.findMany({
      include: {
        _count: {
          select: { traditions: true },
        },
      },
    });

    const chartData = categories.map(category => ({
      category: category.name,
      count: category._count.traditions,
    }));

    return {
      success: true,
      data: chartData
    };
  } catch (error) {
    console.error('Error fetching tradition chart data:', error);
    return {
      success: false,
      error: 'Failed to fetch tradition chart data'
    };
  }
}

// Filtered dashboard data
export async function getDashboardFiltered(year?: string, region?: string): Promise<ActionResult> {
  try {
    // ดึงข้อมูลจากทุกตาราง
    const [traditions, publicPolicies, ethnicGroups, creativeActivities] = await Promise.all([
      prisma.tradition.findMany({
        where: buildWhereClause('tradition', year, region),
        include: {
          category: true,
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.publicPolicy.findMany({
        where: buildWhereClause('publicPolicy', year, region),
        include: {
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { signingDate: 'desc' }
      }),
      prisma.ethnicGroup.findMany({
        where: buildWhereClause('ethnicGroup', year, region),
        include: {
          category: true,
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.creativeActivity.findMany({
        where: buildWhereClause('creativeActivity', year, region),
        include: {
          category: true,
          subCategory: true,
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // สร้างข้อมูลสรุป
    const overview = {
      traditionCount: traditions.length,
      publicPolicyCount: publicPolicies.length,
      ethnicGroupCount: ethnicGroups.length,
      creativeActivityCount: creativeActivities.length,
      totalCount: traditions.length + publicPolicies.length + ethnicGroups.length + creativeActivities.length
    };

    // จัดกลุ่มข้อมูลตามประเภท
    const traditionChart = await getTraditionChartData(buildWhereClause('tradition', year, region));
    const publicPolicyChart = await getPublicPolicyChartData(buildWhereClause('publicPolicy', year, region));
    const ethnicGroupChart = await getEthnicGroupChartData(buildWhereClause('ethnicGroup', year, region));
    const creativeActivityChart = await getCreativeActivityChartData(buildWhereClause('creativeActivity', year, region));

    // จัดกลุ่มข้อมูลตามภูมิภาค
    const byRegion = groupByRegion([...traditions, ...publicPolicies, ...ethnicGroups, ...creativeActivities]);

    // จัดกลุ่มข้อมูลตามปี
    const byYear = groupByYear([...traditions, ...publicPolicies, ...ethnicGroups, ...creativeActivities]);

    return {
      success: true,
      data: {
        overview,
        traditions,
        publicPolicies,
        ethnicGroups,
        creativeActivities,
        charts: {
          traditionChart,
          publicPolicyChart,
          ethnicGroupChart,
          creativeActivityChart
        },
        analytics: {
          byRegion,
          byYear
        },
        filters: { year, region }
      }
    };
  } catch (error) {
    console.error('Error fetching filtered dashboard data:', error);
    return {
      success: false,
      error: 'Failed to fetch filtered dashboard data'
    };
  }
}

// Filter data (similar to filtered but with different parameters)
export async function getDashboardFilter(year?: string, region?: string): Promise<ActionResult> {
  try {
    // สร้าง where clause สำหรับการกรอง
    const buildFilterWhereClause = (tableName: string) => {
      const where: any = {};

      // กรองตามปี
      if (year && year !== 'all') {
        const yearNumber = parseInt(year);
        if (tableName === 'tradition' || tableName === 'ethnicGroup' || tableName === 'creativeActivity') {
          // สำหรับตารางที่มี startYear
          where.startYear = yearNumber;
        } else if (tableName === 'publicPolicy') {
          // สำหรับตารางที่ใช้ signingDate (convert พ.ศ. to ค.ศ.)
          const adYear = yearNumber - 543;
          where.signingDate = {
            gte: new Date(`${adYear}-01-01`),
            lt: new Date(`${adYear + 1}-01-01`)
          };
        }
      }

      // กรองตามภูมิภาค
      if (region && region !== 'all') {
        where.type = region;
      }

      return where;
    };

    // ดึงข้อมูลจากทุกตาราง
    const [traditions, publicPolicies, ethnicGroups, creativeActivities] = await Promise.all([
      prisma.tradition.findMany({
        where: buildFilterWhereClause('tradition'),
        include: {
          category: true,
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.publicPolicy.findMany({
        where: buildFilterWhereClause('publicPolicy'),
        include: {
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { signingDate: 'desc' }
      }),
      prisma.ethnicGroup.findMany({
        where: buildFilterWhereClause('ethnicGroup'),
        include: {
          category: true,
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.creativeActivity.findMany({
        where: buildFilterWhereClause('creativeActivity'),
        include: {
          category: true,
          subCategory: true,
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // สร้างข้อมูลสรุป
    const overview = {
      traditionCount: traditions.length,
      publicPolicyCount: publicPolicies.length,
      ethnicGroupCount: ethnicGroups.length,
      creativeActivityCount: creativeActivities.length,
      totalCount: traditions.length + publicPolicies.length + ethnicGroups.length + creativeActivities.length
    };

    // จัดกลุ่มข้อมูลตามประเภท
    const traditionChart = await getTraditionChartData(buildFilterWhereClause('tradition'));
    const publicPolicyChart = await getPublicPolicyChartData(buildFilterWhereClause('publicPolicy'));
    const ethnicGroupChart = await getEthnicGroupChartData(buildFilterWhereClause('ethnicGroup'));
    const creativeActivityChart = await getCreativeActivityChartData(buildFilterWhereClause('creativeActivity'));

    // จัดกลุ่มข้อมูลตามภูมิภาค
    const byRegion = groupByRegion([...traditions, ...publicPolicies, ...ethnicGroups, ...creativeActivities]);

    // จัดกลุ่มข้อมูลตามปี
    const byYear = groupByYear([...traditions, ...publicPolicies, ...ethnicGroups, ...creativeActivities]);

    return {
      success: true,
      data: {
        overview,
        traditions,
        publicPolicies,
        ethnicGroups,
        creativeActivities,
        charts: {
          traditionChart,
          publicPolicyChart,
          ethnicGroupChart,
          creativeActivityChart
        },
        analytics: {
          byRegion,
          byYear
        },
        filters: { year, region }
      }
    };
  } catch (error) {
    console.error('Error fetching filter dashboard data:', error);
    return {
      success: false,
      error: 'Failed to fetch filter dashboard data'
    };
  }
}

// Filtered data (with more parameters)
export async function getDashboardFilteredData(dataType?: string, year?: string, region?: string, province?: string): Promise<ActionResult> {
  try {
    // Initialize result object
    const result: any = {
      overview: {
        traditionCount: 0,
        publicPolicyCount: 0,
        ethnicGroupCount: 0,
        creativeActivityCount: 0,
        userCount: 0,
        totalCount: 0
      },
      recentActivities: [],
      recentPolicies: [],
      traditionChart: [],
      publicPolicyChart: [],
      creativeActivityChart: [],
      ethnicGroupChart: []
    };

    // Fetch data based on dataType filter
    if (!dataType || dataType === 'all' || dataType === 'tradition') {
      const traditions = await prisma.tradition.findMany({
        where: buildWhereClause('tradition', year, region, province),
        include: {
          category: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      result.overview.traditionCount = traditions.length;

      // Build tradition chart data
      const traditionCategories = await prisma.traditionCategory.findMany({
        include: {
          traditions: {
            where: buildWhereClause('tradition', year, region, province)
          }
        }
      });

      result.traditionChart = traditionCategories
        .map(category => ({
          category: category.name,
          count: category.traditions.length
        }))
        .filter(item => item.count > 0);

      // Add to recent activities
      traditions.slice(0, 3).forEach(tradition => {
        result.recentActivities.push({
          description: `เพิ่มประเพณี: ${tradition.name}`,
          date: tradition.createdAt,
          type: tradition.type,
          region: tradition.province
        });
      });
    }

    if (!dataType || dataType === 'all' || dataType === 'publicPolicy') {
      const publicPolicies = await prisma.publicPolicy.findMany({
        where: buildWhereClause('publicPolicy', year, region, province),
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { signingDate: 'desc' }
      });

      result.overview.publicPolicyCount = publicPolicies.length;

      // Build public policy chart data
      const policyLevels = await prisma.publicPolicy.groupBy({
        by: ['level'],
        where: buildWhereClause('publicPolicy', year, region, province),
        _count: { level: true }
      });

      result.publicPolicyChart = policyLevels.map(level => ({
        level: level.level,
        count: level._count.level
      }));

      // Set recent policies
      result.recentPolicies = publicPolicies.slice(0, 5).map(policy => ({
        name: policy.name,
        signingDate: policy.signingDate,
        level: policy.level,
        district: policy.district,
        amphoe: policy.amphoe,
        province: policy.province,
        type: policy.type
      }));
    }

    if (!dataType || dataType === 'all' || dataType === 'ethnicGroup') {
      const ethnicGroups = await prisma.ethnicGroup.findMany({
        where: buildWhereClause('ethnicGroup', year, region, province),
        include: {
          category: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      result.overview.ethnicGroupCount = ethnicGroups.length;

      // Build ethnic group chart data
      const ethnicCategories = await prisma.ethnicCategory.findMany({
        include: {
          ethnicGroups: {
            where: buildWhereClause('ethnicGroup', year, region, province)
          }
        }
      });

      result.ethnicGroupChart = ethnicCategories
        .map(category => ({
          category: category.name,
          count: category.ethnicGroups.length
        }))
        .filter(item => item.count > 0);

      // Add to recent activities
      ethnicGroups.slice(0, 1).forEach(group => {
        result.recentActivities.push({
          description: `เพิ่มกลุ่มชาติพันธุ์: ${group.name}`,
          date: group.createdAt,
          type: group.type,
          region: group.province
        });
      });
    }

    if (!dataType || dataType === 'all' || dataType === 'creativeActivity') {
      const creativeActivities = await prisma.creativeActivity.findMany({
        where: buildWhereClause('creativeActivity', year, region, province),
        include: {
          category: true,
          subCategory: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      result.overview.creativeActivityCount = creativeActivities.length;

      // Build creative activity chart data
      const creativeCategories = await prisma.creativeCategory.findMany({
        include: {
          activities: {
            where: buildWhereClause('creativeActivity', year, region, province)
          }
        }
      });

      result.creativeActivityChart = creativeCategories
        .map(category => ({
          category: category.name,
          activityCount: category.activities.length,
          recentActivities: category.activities.slice(0, 5).map(activity => ({
            name: activity.name,
            date: activity.createdAt
          }))
        }))
        .filter(item => item.activityCount > 0);

      // Add to recent activities
      creativeActivities.slice(0, 2).forEach(activity => {
        result.recentActivities.push({
          description: `เพิ่มกิจกรรมสร้างสรรค์: ${activity.name}`,
          date: activity.createdAt,
          type: activity.type,
          region: activity.province
        });
      });
    }

    // Sort recent activities by date and limit to 5
    result.recentActivities = result.recentActivities
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Calculate total count
    result.overview.totalCount = 
      (result.overview.traditionCount || 0) +
      (result.overview.publicPolicyCount || 0) +
      (result.overview.ethnicGroupCount || 0) +
      (result.overview.creativeActivityCount || 0);

    // Get user count (not filtered)
    const userCount = await prisma.user.count();
    result.overview.userCount = userCount;

    // Add filter information
    result.filters = { dataType, year, region, province };

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching filtered dashboard data:', error);
    return {
      success: false,
      error: 'Failed to fetch filtered dashboard data'
    };
  }
}