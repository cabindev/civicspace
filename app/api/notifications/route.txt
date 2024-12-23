// app/api/notifications/route.ts
import { NextResponse , NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';


export async function GET(request: NextRequest) {
    try {
      const userId = request.nextUrl.searchParams.get('userId');
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
      }
  
      const notifications = await prisma.notification.findMany({
        where: {
          userId: Number(userId),
          isRead: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      return NextResponse.json(notifications);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
  }
