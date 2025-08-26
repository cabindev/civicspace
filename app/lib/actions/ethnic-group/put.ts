// app/lib/actions/ethnic-group/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { validateFormData, extractFormDataString, extractFormDataNumber } from '../shared/validation';
import { saveImages, saveFile, deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

// Direct update function (for client-side calls)
export async function updateEthnicGroupDirect(id: string, formData: FormData): Promise<ActionResult> {
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

    // Check if ethnic group exists
    const existingEthnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id },
      select: {
        id: true,
        fileUrl: true,
        userId: true,
        images: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!existingEthnicGroup) {
      return {
        success: false,
        error: 'Ethnic group not found'
      };
    }

    // Check permissions
    const hasPermission = await checkPermissions(user.id, existingEthnicGroup.userId);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    // Validate required fields
    const requiredFields = [
      'categoryId',
      'name',
      'district',
      'amphoe',
      'province',
      'type',
      'history',
      'activityName',
      'activityOrigin',
      'activityDetails',
      'alcoholFreeApproach',
      'startYear'
    ];

    const validationResult = validateFormData(formData, requiredFields);
    if (!validationResult.success) {
      return validationResult;
    }

    // Extract form data
    const categoryId = extractFormDataString(formData, 'categoryId')!;
    const name = extractFormDataString(formData, 'name')!;
    const district = extractFormDataString(formData, 'district')!;
    const amphoe = extractFormDataString(formData, 'amphoe')!;
    const province = extractFormDataString(formData, 'province')!;
    const type = extractFormDataString(formData, 'type')!;
    const village = extractFormDataString(formData, 'village');
    const history = extractFormDataString(formData, 'history')!;
    const activityName = extractFormDataString(formData, 'activityName')!;
    const activityOrigin = extractFormDataString(formData, 'activityOrigin')!;
    const activityDetails = extractFormDataString(formData, 'activityDetails')!;
    const alcoholFreeApproach = extractFormDataString(formData, 'alcoholFreeApproach')!;
    const startYear = extractFormDataNumber(formData, 'startYear')!;
    const results = extractFormDataString(formData, 'results');
    const videoLink = extractFormDataString(formData, 'videoLink');
    const zipcode = extractFormDataNumber(formData, 'zipcode');
    const district_code = extractFormDataNumber(formData, 'district_code');
    const amphoe_code = extractFormDataNumber(formData, 'amphoe_code');
    const province_code = extractFormDataNumber(formData, 'province_code');

    // Handle images
    let imageUrls: string[] = [];
    if (formData.has('newImages')) {
      const newImages = formData.getAll('newImages') as File[];
      imageUrls = await saveImages(newImages, 'ethnic-group-images', id, 'ethnicGroupId');
    }

    // Handle existing images
    const existingImagesStr = formData.get('existingImages') as string;
    const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : [];
    
    // Combine existing and new images
    const allImageUrls = [...existingImages, ...imageUrls];

    // Handle file upload
    let fileUrl = existingEthnicGroup.fileUrl; // Keep existing file by default
    
    if (formData.has('removeFile') && formData.get('removeFile') === 'true') {
      // Remove existing file
      if (existingEthnicGroup.fileUrl) {
        await deleteFile(existingEthnicGroup.fileUrl);
      }
      fileUrl = null;
    } else if (formData.has('fileUrl')) {
      // New file uploaded
      const file = formData.get('fileUrl') as File;
      if (file.size > 0) {
        // Delete old file if exists
        if (existingEthnicGroup.fileUrl) {
          await deleteFile(existingEthnicGroup.fileUrl);
        }
        fileUrl = await saveFile(file, 'ethnic-group-files');
      }
    } else if (formData.has('existingFile')) {
      // Keep existing file (already set above)
      fileUrl = formData.get('existingFile') as string;
    }

    // Delete removed images
    const imagesToDelete = existingEthnicGroup.images
      .filter(img => !allImageUrls.includes(img.url))
      .map(img => img.url);

    for (const imageUrl of imagesToDelete) {
      await deleteFile(imageUrl);
    }

    // Update ethnic group
    const updatedEthnicGroup = await prisma.ethnicGroup.update({
      where: { id },
      data: {
        categoryId,
        name,
        district,
        amphoe,
        province,
        type,
        village,
        history,
        activityName,
        activityOrigin,
        activityDetails,
        alcoholFreeApproach,
        startYear,
        results,
        videoLink,
        fileUrl,
        zipcode,
        district_code,
        amphoe_code,
        province_code,
        images: {
          deleteMany: {}, // Delete all existing images first
          create: allImageUrls.map(url => ({ url })) // Create new ones
        }
      },
      include: {
        category: true,
        images: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    revalidatePath(`/components/ethnic-group/${id}`);

    return {
      success: true,
      data: updatedEthnicGroup,
      message: 'Ethnic group updated successfully'
    };
  } catch (error) {
    console.error('Error updating ethnic group:', error);
    return {
      success: false,
      error: 'Failed to update ethnic group'
    };
  }
}

export async function updateEthnicGroup(id: string, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
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

    // Check if ethnic group exists
    const existingEthnicGroup = await prisma.ethnicGroup.findUnique({
      where: { id },
      select: {
        id: true,
        fileUrl: true,
        userId: true,
        images: true,
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!existingEthnicGroup) {
      return {
        success: false,
        error: 'Ethnic group not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = existingEthnicGroup.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to update this ethnic group'
      };
    }

    // Validate required fields
    const validation = validateFormData(formData, [
      'name', 'history', 'activityName', 'activityOrigin', 'province', 
      'amphoe', 'district', 'type', 'activityDetails', 'alcoholFreeApproach', 
      'startYear', 'categoryId'
    ]);
    if (!validation.success) {
      return validation;
    }

    // Extract form data
    const updateData: any = {
      name: extractFormDataString(formData, 'name'),
      history: extractFormDataString(formData, 'history'),
      activityName: extractFormDataString(formData, 'activityName'),
      activityOrigin: extractFormDataString(formData, 'activityOrigin'),
      province: extractFormDataString(formData, 'province'),
      amphoe: extractFormDataString(formData, 'amphoe'),
      district: extractFormDataString(formData, 'district'),
      village: extractFormDataString(formData, 'village') || null,
      type: extractFormDataString(formData, 'type'),
      activityDetails: extractFormDataString(formData, 'activityDetails'),
      alcoholFreeApproach: extractFormDataString(formData, 'alcoholFreeApproach'),
      startYear: extractFormDataNumber(formData, 'startYear'),
      results: extractFormDataString(formData, 'results') || null,
      videoLink: extractFormDataString(formData, 'videoLink') || null,
      coordinatorName: extractFormDataString(formData, 'coordinatorName') || null,
      phone: extractFormDataString(formData, 'phone') || null,
      categoryId: extractFormDataString(formData, 'categoryId')
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        updateData[field] = Number(value);
      }
    });

    // Verify category exists
    const category = await prisma.ethnicCategory.findUnique({
      where: { id: updateData.categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: 'Ethnic category not found'
      };
    }

    // Handle image removal if requested
    const removeImageIds = formData.getAll('removeImageIds') as string[];
    if (removeImageIds && removeImageIds.length > 0) {
      const imagesToRemove = await prisma.image.findMany({
        where: {
          id: { in: removeImageIds },
          ethnicGroupId: id
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
          ethnicGroupId: id
        }
      });
    }

    // Handle new image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      await saveImages(images, 'ethnic-group-images', id, 'ethnicGroupId');
    }

    // Handle report file upload/replacement
    const reportFile = formData.get('reportFile') as File;
    const removeReportFile = formData.get('removeReportFile') === 'true';
    
    if (removeReportFile && existingEthnicGroup.fileUrl) {
      await deleteFile(existingEthnicGroup.fileUrl);
      updateData.fileUrl = null;
    } else if (reportFile && reportFile.size > 0) {
      // Remove old file if exists
      if (existingEthnicGroup.fileUrl) {
        await deleteFile(existingEthnicGroup.fileUrl);
      }
      
      const fileUrl = await saveFile(reportFile, 'ethnic-group-files', id);
      updateData.fileUrl = fileUrl;
    }

    // Update the ethnic group
    const updatedEthnicGroup = await prisma.ethnicGroup.update({
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
    revalidatePath('/dashboard/ethnic-group');
    revalidatePath(`/dashboard/ethnic-group/${id}`);
    revalidatePath('/components/ethnic-group');
    revalidatePath(`/components/ethnic-group/${id}`);

    return {
      success: true,
      data: updatedEthnicGroup,
      message: 'Ethnic group updated successfully'
    };
  } catch (error) {
    console.error('Error updating ethnic group:', error);
    return {
      success: false,
      error: 'Failed to update ethnic group'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updateEthnicGroupAction(id: string, prevState: ActionResult, formData: FormData) {
  const result = await updateEthnicGroup(id, prevState, formData);
  
  if (result.success) {
    redirect('/dashboard/ethnic-group');
  }
  
  return result;
}

export async function incrementEthnicGroupViewCount(id: string): Promise<void> {
  try {
    await prisma.ethnicGroup.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error incrementing ethnic group view count:', error);
  }
}