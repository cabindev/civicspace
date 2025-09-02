// app/lib/actions/tradition/post.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString, extractFormDataNumber, extractFormDataBoolean } from '../shared/validation';
import { saveImages } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function createTradition(formData: FormData): Promise<ActionResult> {
  try {
    // Test database connection first
    console.log('Testing database connection...');
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return {
        success: false,
        error: 'Database connection failed'
      };
    }

    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const user = authResult.data?.user;
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Validate required fields
    const validation = validateFormData(formData, [
      'name', 'district', 'amphoe', 'province', 'type', 'categoryId', 'coordinatorName'
    ]);
    if (!validation.success) {
      return validation;
    }

    // Extract form data
    const name = extractFormDataString(formData, 'name');
    const district = extractFormDataString(formData, 'district');
    const amphoe = extractFormDataString(formData, 'amphoe');
    const province = extractFormDataString(formData, 'province');
    const type = extractFormDataString(formData, 'type');
    const history = extractFormDataString(formData, 'history');
    const alcoholFreeApproach = extractFormDataString(formData, 'alcoholFreeApproach');
    const categoryId = extractFormDataString(formData, 'categoryId');

    console.log('DEBUG - Extracted fields:', {
      name, district, amphoe, province, type, categoryId,
      history, alcoholFreeApproach,
      historyValue: formData.get('history'),
      alcoholFreeApproachValue: formData.get('alcoholFreeApproach')
    });

    // Check for required string fields  
    if (!name || !district || !amphoe || !province || !type || !categoryId || !extractFormDataString(formData, 'coordinatorName')) {
      return {
        success: false,
        error: 'Required fields are missing or empty'
      };
    }

    const traditionData = {
      name,
      district,
      amphoe,
      province,
      type,
      village: extractFormDataString(formData, 'village'),
      coordinatorName: extractFormDataString(formData, 'coordinatorName'),
      phone: extractFormDataString(formData, 'phone') || null,
      history: history || null,
      alcoholFreeApproach: alcoholFreeApproach || null,
      results: extractFormDataString(formData, 'results') || null,
      startYear: extractFormDataNumber(formData, 'startYear') ?? null,
      videoLink: extractFormDataString(formData, 'videoLink'),
      categoryId,
      userId: user.id,
      // Boolean fields for tradition-specific features
      hasPolicy: extractFormDataBoolean(formData, 'hasPolicy'),
      hasAnnouncement: extractFormDataBoolean(formData, 'hasAnnouncement'),
      hasInspector: extractFormDataBoolean(formData, 'hasInspector'),
      hasMonitoring: extractFormDataBoolean(formData, 'hasMonitoring'),
      hasCampaign: extractFormDataBoolean(formData, 'hasCampaign'),
      hasAlcoholPromote: extractFormDataBoolean(formData, 'hasAlcoholPromote')
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        (traditionData as any)[field] = Number(value);
      }
    });

    // Verify category exists
    const category = await prisma.traditionCategory.findUnique({
      where: { id: traditionData.categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: 'Tradition category not found'
      };
    }

    // Create the tradition
    console.log('Creating tradition with data:', JSON.stringify(traditionData, null, 2));
    
    const tradition = await prisma.tradition.create({
      data: traditionData
    });
    
    console.log('Tradition created successfully:', tradition.id);

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    console.log('Images found:', images.length, 'files');
    
    if (images && images.length > 0 && images[0].size > 0) {
      console.log('Processing image uploads...');
      try {
        await saveImages(images, 'tradition-images', tradition.id, 'traditionId');
        console.log('Images saved successfully');
      } catch (imageError) {
        console.error('Error saving images:', imageError);
        // Don't fail the entire operation for image upload errors
      }
    }

    // Create notification
    console.log('Creating notification for user:', user.id, 'tradition:', tradition.id);
    
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          activityId: tradition.id,
          activityType: 'tradition'
        }
      });
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the entire operation for notification errors
    }

    // Revalidate pages
    revalidatePath('/dashboard/tradition');
    revalidatePath('/components/traditions');
    revalidatePath('/');

    return {
      success: true,
      data: tradition,
      message: 'Tradition created successfully'
    };
  } catch (error) {
    console.error('Error creating tradition:', error);
    
    // Detailed error logging for production debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Log additional context
    console.error('FormData keys:', Array.from(formData.keys()));
    console.error('Environment:', process.env.NODE_ENV);
    console.error('Database URL exists:', !!process.env.DATABASE_URL);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tradition'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function createTraditionAction(prevState: ActionResult, formData: FormData) {
  const result = await createTradition(formData);
  
  if (result.success) {
    redirect('/dashboard/tradition');
  }
  
  return result;
}