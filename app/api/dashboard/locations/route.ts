import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
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

    return NextResponse.json({
      regions,
      provinces,
      regionProvinceMap,
      statistics: {
        totalRegions: regions.length,
        totalProvinces: provinces.length,
        dataPoints: allData.length
      }
    });

  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error 
    }, { status: 500 });
  }
}