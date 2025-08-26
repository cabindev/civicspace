// app/lib/actions/tradition/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { validateFormData, extractFormDataString, extractFormDataNumber, extractFormDataBoolean } from '../shared/validation';
import { saveImages, deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function updateTradition(id: string, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
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

    // Check if tradition exists
    const existingTradition = await prisma.tradition.findUnique({
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

    if (!existingTradition) {
      return {
        success: false,
        error: 'Tradition not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = existingTradition.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to update this tradition'
      };
    }

    // Validate required fields
    const validation = validateFormData(formData, [
      'name', 'district', 'amphoe', 'province', 'type',
      'history', 'alcoholFreeApproach', 'startYear', 'categoryId'
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
      history: extractFormDataString(formData, 'history'),
      alcoholFreeApproach: extractFormDataString(formData, 'alcoholFreeApproach'),
      results: extractFormDataString(formData, 'results') || null,
      startYear: extractFormDataNumber(formData, 'startYear'),
      videoLink: extractFormDataString(formData, 'videoLink') || null,
      categoryId: extractFormDataString(formData, 'categoryId'),
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
        updateData[field] = Number(value);
      }
    });

    // Verify category exists
    const category = await prisma.traditionCategory.findUnique({
      where: { id: updateData.categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: 'Tradition category not found'
      };
    }

    // Handle image removal if requested
    const removeImageIds = formData.getAll('removeImageIds') as string[];
    if (removeImageIds && removeImageIds.length > 0) {
      const imagesToRemove = await prisma.image.findMany({
        where: {
          id: { in: removeImageIds },
          traditionId: id
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
          traditionId: id
        }
      });
    }

    // Handle new image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      const imageUrls = await saveImages(images, 'tradition-images', id, 'traditionId');
      
      // Create new image records
      for (const imageUrl of imageUrls) {
        await prisma.image.create({
          data: {
            url: imageUrl,
            traditionId: id
          }
        });
      }
    }

    // Update the tradition
    const updatedTradition = await prisma.tradition.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/tradition');
    revalidatePath(`/dashboard/tradition/${id}`);
    revalidatePath('/components/traditions');
    revalidatePath(`/components/traditions/${id}`);

    return {
      success: true,
      data: updatedTradition,
      message: 'Tradition updated successfully'
    };
  } catch (error) {
    console.error('Error updating tradition:', error);
    return {
      success: false,
      error: 'Failed to update tradition'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updateTraditionAction(id: string, prevState: ActionResult, formData: FormData) {
  const result = await updateTradition(id, prevState, formData);
  
  if (result.success) {
    redirect('/dashboard/tradition');
  }
  
  return result;
}

// Increment view count
export async function incrementTraditionViewCount(id: string): Promise<ActionResult> {
  try {
    const tradition = await prisma.tradition.findUnique({
      where: { id },
      select: { id: true, viewCount: true }
    });

    if (!tradition) {
      return {
        success: false,
        error: 'Tradition not found'
      };
    }

    const updatedTradition = await prisma.tradition.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        viewCount: true
      }
    });

    return {
      success: true,
      data: updatedTradition
    };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return {
      success: false,
      error: 'Failed to increment view count'
    };
  }
}