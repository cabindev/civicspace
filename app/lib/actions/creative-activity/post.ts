// app/lib/actions/creative-activity/post.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString, extractFormDataNumber } from '../shared/validation';
import { saveImages, saveFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function createCreativeActivity(formData: FormData): Promise<ActionResult> {
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
      'name', 'district', 'amphoe', 'province', 'type',
      'description', 'summary', 'startYear', 'categoryId', 'subCategoryId'
    ]);
    if (!validation.success) {
      return validation;
    }

    // Extract form data
    const activityData = {
      name: extractFormDataString(formData, 'name'),
      district: extractFormDataString(formData, 'district'),
      amphoe: extractFormDataString(formData, 'amphoe'),
      province: extractFormDataString(formData, 'province'),
      type: extractFormDataString(formData, 'type'),
      village: extractFormDataString(formData, 'village') || null,
      coordinatorName: extractFormDataString(formData, 'coordinatorName') || null,
      phone: extractFormDataString(formData, 'phone') || null,
      description: extractFormDataString(formData, 'description'),
      summary: extractFormDataString(formData, 'summary'),
      results: extractFormDataString(formData, 'results') || null,
      startYear: extractFormDataNumber(formData, 'startYear') || 0,
      videoLink: extractFormDataString(formData, 'videoLink') || null,
      categoryId: extractFormDataString(formData, 'categoryId'),
      subCategoryId: extractFormDataString(formData, 'subCategoryId'),
      userId: user.id
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        (activityData as any)[field] = Number(value);
      }
    });

    // Verify category and subcategory exist
    const category = await prisma.creativeCategory.findUnique({
      where: { id: activityData.categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: 'Creative category not found'
      };
    }

    const subCategory = await prisma.creativeSubCategory.findUnique({
      where: { 
        id: activityData.subCategoryId,
        categoryId: activityData.categoryId
      }
    });

    if (!subCategory) {
      return {
        success: false,
        error: 'Creative subcategory not found or does not belong to the selected category'
      };
    }

    // Create the activity
    const activity = await prisma.creativeActivity.create({
      data: activityData
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      await saveImages(images, 'creative-activity-images', activity.id, 'creativeActivityId');
    }

    // Handle report file upload
    const reportFile = formData.get('reportFile') as File;
    if (reportFile && reportFile.size > 0) {
      const fileUrl = await saveFile(reportFile, 'creative-activity-files', activity.id);
      
      await prisma.creativeActivity.update({
        where: { id: activity.id },
        data: { reportFileUrl: fileUrl }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        activityType: 'creativeActivity'
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/creative-activity');
    revalidatePath('/components/creative-activity');
    revalidatePath('/');

    return {
      success: true,
      data: activity,
      message: 'Creative activity created successfully'
    };
  } catch (error) {
    console.error('Error creating creative activity:', error);
    return {
      success: false,
      error: 'Failed to create creative activity'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function createCreativeActivityAction(prevState: ActionResult, formData: FormData) {
  const result = await createCreativeActivity(formData);
  
  if (result.success) {
    redirect('/dashboard/creative-activity');
  }
  
  return result;
}