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
    const traditionData = {
      name: extractFormDataString(formData, 'name'),
      district: extractFormDataString(formData, 'district'),
      amphoe: extractFormDataString(formData, 'amphoe'),
      province: extractFormDataString(formData, 'province'),
      type: extractFormDataString(formData, 'type'),
      village: extractFormDataString(formData, 'village'),
      coordinatorName: extractFormDataString(formData, 'coordinatorName'),
      phone: extractFormDataString(formData, 'phone'),
      history: extractFormDataString(formData, 'history'),
      alcoholFreeApproach: extractFormDataString(formData, 'alcoholFreeApproach'),
      results: extractFormDataString(formData, 'results'),
      startYear: extractFormDataNumber(formData, 'startYear') ?? null,
      videoLink: extractFormDataString(formData, 'videoLink'),
      categoryId: extractFormDataString(formData, 'categoryId'),
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
      await saveImages(images, 'tradition-images', tradition.id, 'traditionId');
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        activityId: tradition.id,
        activityType: 'tradition'
      }
    });

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
    return {
      success: false,
      error: 'Failed to create tradition'
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