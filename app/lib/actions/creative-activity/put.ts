// app/lib/actions/creative-activity/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { validateFormData, extractFormDataString, extractFormDataNumber } from '../shared/validation';
import { saveImages, saveFile, deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function updateCreativeActivity(id: string, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
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

    // Check if activity exists
    const existingActivity = await prisma.creativeActivity.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!existingActivity) {
      return {
        success: false,
        error: 'Creative activity not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = existingActivity.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to update this activity'
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
    const updateData: any = {
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
      startYear: extractFormDataNumber(formData, 'startYear'),
      videoLink: extractFormDataString(formData, 'videoLink') || null,
      categoryId: extractFormDataString(formData, 'categoryId'),
      subCategoryId: extractFormDataString(formData, 'subCategoryId')
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        updateData[field] = Number(value);
      }
    });

    // Verify category and subcategory exist
    const category = await prisma.creativeCategory.findUnique({
      where: { id: updateData.categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: 'Creative category not found'
      };
    }

    const subCategory = await prisma.creativeSubCategory.findUnique({
      where: { 
        id: updateData.subCategoryId,
        categoryId: updateData.categoryId
      }
    });

    if (!subCategory) {
      return {
        success: false,
        error: 'Creative subcategory not found or does not belong to the selected category'
      };
    }

    // Handle image removal if requested
    const removeImageIds = formData.getAll('removeImageIds') as string[];
    if (removeImageIds && removeImageIds.length > 0) {
      const imagesToRemove = await prisma.image.findMany({
        where: {
          id: { in: removeImageIds },
          creativeActivityId: id
        }
      });

      // Delete image files
      for (const image of imagesToRemove) {
        await deleteFile(image.url);
      }

      // Delete image records
      await prisma.image.deleteMany({
        where: {
          id: { in: removeImageIds },
          creativeActivityId: id
        }
      });
    }

    // Handle new image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      await saveImages(images, 'creative-activity-images', id, 'creativeActivityId');
    }

    // Handle report file upload/replacement
    const reportFile = formData.get('reportFile') as File;
    const removeReportFile = formData.get('removeReportFile') === 'true';
    
    if (removeReportFile && existingActivity.reportFileUrl) {
      await deleteFile(existingActivity.reportFileUrl);
      updateData.reportFileUrl = null;
    } else if (reportFile && reportFile.size > 0) {
      // Remove old file if exists
      if (existingActivity.reportFileUrl) {
        await deleteFile(existingActivity.reportFileUrl);
      }
      
      const fileUrl = await saveFile(reportFile, 'creative-activity-files', id);
      updateData.reportFileUrl = fileUrl;
    }

    // Update the activity
    const updatedActivity = await prisma.creativeActivity.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/creative-activity');
    revalidatePath(`/dashboard/creative-activity/${id}`);
    revalidatePath('/components/creative-activity');
    revalidatePath(`/components/creative-activity/${id}`);

    return {
      success: true,
      data: updatedActivity,
      message: 'Creative activity updated successfully'
    };
  } catch (error) {
    console.error('Error updating creative activity:', error);
    return {
      success: false,
      error: 'Failed to update creative activity'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updateCreativeActivityAction(id: string, prevState: ActionResult, formData: FormData) {
  const result = await updateCreativeActivity(id, prevState, formData);
  
  if (result.success) {
    redirect('/dashboard/creative-activity');
  }
  
  return result;
}

export async function incrementCreativeActivityViewCount(id: string): Promise<void> {
  try {
    await prisma.creativeActivity.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error incrementing creative activity view count:', error);
  }
}