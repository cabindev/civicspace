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
    // Test database connection first (production)
    try {
      await prisma.$connect();
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

    // Production validation passed

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
      history: history || '',
      alcoholFreeApproach: alcoholFreeApproach || '',
      results: extractFormDataString(formData, 'results') || '',
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
    const tradition = await prisma.tradition.create({
      data: traditionData
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    
    if (images && images.length > 0 && images[0].size > 0) {
      try {
        await saveImages(images, 'tradition-images', tradition.id, 'traditionId');
      } catch (imageError) {
        console.error('Error saving images:', imageError);
        // Don't fail the entire operation for image upload errors
      }
    }

    // Create notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          activityId: tradition.id,
          activityType: 'tradition'
        }
      });
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
    
    // Production error logging
    if (error instanceof Error) {
      console.error('Tradition creation error:', error.message);
    }
    
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