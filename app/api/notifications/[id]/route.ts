// app/api/notifications/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/app/lib/prisma';

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await prisma.notification.updateMany({
//       where: {
//         userId: Number(params.id),
//         isRead: false
//       },
//       data: {
//         isRead: true
//       }
//     });
    
//     return NextResponse.json({ message: 'Notifications marked as read' });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to mark notifications as read' },
//       { status: 500 }
//     );
//   }
// }