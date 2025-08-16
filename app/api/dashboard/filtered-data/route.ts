import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('dataType') || 'all';
    const year = searchParams.get('year');
    const region = searchParams.get('region');
    const province = searchParams.get('province');

    console.log('Filtered data params:', { dataType, year, region, province });

    // Helper function to build where clauses
    const buildWhereClause = (tableName: string) => {
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
    };

    // Initialize result object
    const result: any = {
      overview: {},
      recentActivities: [],
      recentPolicies: [],
      traditionChart: [],
      publicPolicyChart: [],
      creativeActivityChart: [],
      ethnicGroupChart: []
    };

    // Fetch data based on dataType filter
    if (dataType === 'all' || dataType === 'tradition') {
      const traditions = await prisma.tradition.findMany({
        where: buildWhereClause('tradition'),
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
            where: buildWhereClause('tradition')
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
          date: tradition.createdAt
        });
      });
    }

    if (dataType === 'all' || dataType === 'publicPolicy') {
      const publicPolicies = await prisma.publicPolicy.findMany({
        where: buildWhereClause('publicPolicy'),
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
        where: buildWhereClause('publicPolicy'),
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
        province: policy.province
      }));
    }

    if (dataType === 'all' || dataType === 'ethnicGroup') {
      const ethnicGroups = await prisma.ethnicGroup.findMany({
        where: buildWhereClause('ethnicGroup'),
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
            where: buildWhereClause('ethnicGroup')
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
          date: group.createdAt
        });
      });
    }

    if (dataType === 'all' || dataType === 'creativeActivity') {
      const creativeActivities = await prisma.creativeActivity.findMany({
        where: buildWhereClause('creativeActivity'),
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
            where: buildWhereClause('creativeActivity')
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
          date: activity.createdAt
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

    console.log('Filtered data result overview:', result.overview);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching filtered dashboard data:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error 
    }, { status: 500 });
  }
}