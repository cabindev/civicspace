import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const region = searchParams.get('region');

    // สร้าง where clause สำหรับการกรอง
    const buildWhereClause = (tableName: string) => {
      const where: any = {};

      // กรองตามปี (ใช้ createdAt หรือ startYear)
      if (year && year !== 'all') {
        const yearNumber = parseInt(year);
        if (tableName === 'tradition' || tableName === 'ethnicGroup' || tableName === 'creativeActivity') {
          // สำหรับตารางที่มี startYear
          where.startYear = yearNumber;
        } else {
          // สำหรับตารางที่ใช้ createdAt
          where.createdAt = {
            gte: new Date(`${yearNumber - 543}-01-01`), // แปลงจาก พ.ศ. เป็น ค.ศ.
            lt: new Date(`${yearNumber - 543 + 1}-01-01`)
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
        where: buildWhereClause('tradition'),
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
        where: buildWhereClause('publicPolicy'),
        include: {
          images: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ethnicGroup.findMany({
        where: buildWhereClause('ethnicGroup'),
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
        where: buildWhereClause('creativeActivity'),
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
    const traditionChart = await getTraditionChartData(buildWhereClause('tradition'));
    const publicPolicyChart = await getPublicPolicyChartData(buildWhereClause('publicPolicy'));
    const ethnicGroupChart = await getEthnicGroupChartData(buildWhereClause('ethnicGroup'));
    const creativeActivityChart = await getCreativeActivityChartData(buildWhereClause('creativeActivity'));

    // จัดกลุ่มข้อมูลตามภูมิภาค
    const byRegion = groupByRegion([...traditions, ...publicPolicies, ...ethnicGroups, ...creativeActivities]);

    // จัดกลุ่มข้อมูลตามปี
    const byYear = groupByYear([...traditions, ...publicPolicies, ...ethnicGroups, ...creativeActivities]);

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error('Error fetching filtered dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper functions
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
    } else if (item.createdAt) {
      year = new Date(item.createdAt).getFullYear() + 543; // แปลงเป็น พ.ศ.
    } else {
      return acc;
    }

    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
}