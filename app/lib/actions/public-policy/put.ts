// app/lib/actions/public-policy/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth, checkPermissions } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { saveImages, saveFile, deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

// Direct update function (for client-side calls)
export async function updatePublicPolicyDirect(id: string, formData: FormData): Promise<ActionResult> {
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

    // Check if policy exists
    const existingPolicy = await prisma.publicPolicy.findUnique({
      where: { id },
      select: {
        id: true,
        policyFileUrl: true,
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

    if (!existingPolicy) {
      return {
        success: false,
        error: 'Public policy not found'
      };
    }

    // Check permissions
    const hasPermission = await checkPermissions(user.id, existingPolicy.userId);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    // Validate required fields
    const requiredFields = [
      'name',
      'signingDate',
      'level',
      'district',
      'amphoe',
      'province',
      'type',
      'content',
      'summary'
    ];

    const validationResult = validateFormData(formData, requiredFields);
    if (!validationResult.success) {
      return validationResult;
    }

    // Extract and process form data
    const name = extractFormDataString(formData, 'name');

    if (!name) {
      return {
        success: false,
        error: 'Name is required'
      };
    }
    const signingDateStr = extractFormDataString(formData, 'signingDate');
    
    if (!signingDateStr) {
      return {
        success: false,
        error: 'Signing date is required'
      };
    }
    
    const signingDate = new Date(signingDateStr);
    const level = extractFormDataString(formData, 'level');
    const district = extractFormDataString(formData, 'district');
    const amphoe = extractFormDataString(formData, 'amphoe');
    const province = extractFormDataString(formData, 'province');
    const type = extractFormDataString(formData, 'type');
    const village = extractFormDataString(formData, 'village');
    const contentStr = extractFormDataString(formData, 'content');
    const content = contentStr ? JSON.parse(contentStr) : [];
    const summary = extractFormDataString(formData, 'summary');
    const results = extractFormDataString(formData, 'results');
    const videoLink = extractFormDataString(formData, 'videoLink');

    // Prepare update data
    const updateData: any = {
      name,
      signingDate,
      level,
      district,
      amphoe,
      province,
      type,
      village,
      content,
      summary,
      results,
      videoLink
    };

    // Handle image removal
    const removeImages = formData.get('removeImages') === 'true';
    if (removeImages) {
      // Delete image files from storage
      for (const image of existingPolicy.images) {
        await deleteFile(image.url);
      }
      
      // Remove image records from database
      await prisma.image.deleteMany({
        where: {
          publicPolicyId: id
        }
      });
    }

    // Handle images
    let imageUrls: string[] = [];
    if (formData.has('newImages')) {
      const newImages = formData.getAll('newImages') as File[];
      imageUrls = await saveImages(newImages, 'public-policy-images', id, 'publicPolicyId');
    }

    // Handle existing images
    const existingImagesStr = formData.get('existingImages') as string;
    const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : [];
    
    // Combine existing and new images
    const allImageUrls = [...existingImages, ...imageUrls];

    // Delete removed images
    const imagesToDelete = existingPolicy.images
      .filter(img => !allImageUrls.includes(img.url))
      .map(img => img.url);

    for (const imageUrl of imagesToDelete) {
      await deleteFile(imageUrl);
    }

    // Handle file upload
    let policyFileUrl = existingPolicy.policyFileUrl; // Keep existing file by default
    
    if (formData.has('removePolicyFile') && formData.get('removePolicyFile') === 'true') {
      // Remove existing file
      if (existingPolicy.policyFileUrl) {
        await deleteFile(existingPolicy.policyFileUrl);
      }
      policyFileUrl = null;
    } else if (formData.has('policyFile')) {
      // New file uploaded
      const file = formData.get('policyFile') as File;
      if (file.size > 0) {
        // Delete old file if exists
        if (existingPolicy.policyFileUrl) {
          await deleteFile(existingPolicy.policyFileUrl);
        }
        policyFileUrl = await saveFile(file, 'policy-files');
      }
    } else if (formData.has('existingFile')) {
      // Keep existing file (already set above)
      policyFileUrl = formData.get('existingFile') as string;
    }

    updateData.policyFileUrl = policyFileUrl;

    // Update policy
    const updatedPolicy = await prisma.publicPolicy.update({
      where: { id },
      data: {
        ...updateData,
        images: {
          deleteMany: {}, // Delete all existing images first
          create: allImageUrls.map(url => ({ url })) // Create new ones
        }
      },
      include: {
        images: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    revalidatePath(`/dashboard/public-policy/${id}`);

    return {
      success: true,
      data: updatedPolicy,
      message: 'Public policy updated successfully'
    };
  } catch (error) {
    console.error('Error updating public policy:', error);
    return {
      success: false,
      error: 'Failed to update public policy'
    };
  }
}

export async function updatePublicPolicy(id: string, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
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

    // Check if policy exists
    const existingPolicy = await prisma.publicPolicy.findUnique({
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

    if (!existingPolicy) {
      return {
        success: false,
        error: 'Public policy not found'
      };
    }

    // Check permissions (owner or super admin)
    const isOwner = existingPolicy.userId === user.id;
    const isSuperAdmin = await checkPermissions(user.id);
    
    if (!isOwner && !isSuperAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions to update this policy'
      };
    }

    // Validate required fields
    const validation = validateFormData(formData, [
      'name', 'signingDate', 'level', 'district', 'amphoe', 
      'province', 'type', 'summary'
    ]);
    if (!validation.success) {
      return validation;
    }

    // Extract and parse form data
    const signingDateStr = extractFormDataString(formData, 'signingDate');
    const contentStr = extractFormDataString(formData, 'content');
    
    if (!signingDateStr) {
      return {
        success: false,
        error: 'Signing date is required'
      };
    }
    
    let signingDate: Date;
    try {
      signingDate = new Date(signingDateStr);
      if (isNaN(signingDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid signing date format'
      };
    }

    let content: any = [];
    try {
      if (contentStr) {
        content = JSON.parse(contentStr);
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid content JSON format'
      };
    }

    // Extract required fields
    const name = extractFormDataString(formData, 'name');
    const level = extractFormDataString(formData, 'level');
    const district = extractFormDataString(formData, 'district');
    const amphoe = extractFormDataString(formData, 'amphoe');
    const province = extractFormDataString(formData, 'province');
    const type = extractFormDataString(formData, 'type');
    const summary = extractFormDataString(formData, 'summary');

    // Check for required fields
    if (!name || !level || !district || !amphoe || !province || !type || !summary) {
      return {
        success: false,
        error: 'Required fields are missing or empty'
      };
    }

    const updateData: any = {
      name,
      signingDate: signingDate,
      level,
      healthRegion: extractFormDataString(formData, 'healthRegion') || null,
      district,
      amphoe,
      province,
      type,
      village: extractFormDataString(formData, 'village') || null,
      content: content,
      summary,
      results: extractFormDataString(formData, 'results') || null,
      videoLink: extractFormDataString(formData, 'videoLink') || null
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        updateData[field] = Number(value);
      }
    });

    // Validate policy level enum
    const validLevels = ['NATIONAL', 'REGIONAL', 'PROVINCIAL', 'DISTRICT', 'SUBDISTRICT', 'VILLAGE', 'ORGANIZATION'];
    if (!validLevels.includes(updateData.level)) {
      return {
        success: false,
        error: 'Invalid policy level'
      };
    }

    // Handle image removal if requested
    const removeImageIds = formData.getAll('removeImageIds') as string[];
    if (removeImageIds && removeImageIds.length > 0) {
      const imagesToRemove = await prisma.image.findMany({
        where: {
          id: { in: removeImageIds },
          publicPolicyId: id
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
          publicPolicyId: id
        }
      });
    }

    // Handle new image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      const imageUrls = await saveImages(images, 'public-policy-images', id, 'publicPolicyId');
      
      // Create new image records
      for (const imageUrl of imageUrls) {
        await prisma.image.create({
          data: {
            url: imageUrl,
            publicPolicyId: id
          }
        });
      }
    }

    // Handle policy file upload/replacement
    const policyFile = formData.get('policyFile') as File;
    const removePolicyFile = formData.get('removePolicyFile') === 'true';
    
    if (removePolicyFile && existingPolicy.policyFileUrl) {
      await deleteFile(existingPolicy.policyFileUrl);
      updateData.policyFileUrl = null;
    } else if (policyFile && policyFile.size > 0) {
      // Remove old file if exists
      if (existingPolicy.policyFileUrl) {
        await deleteFile(existingPolicy.policyFileUrl);
      }
      
      const fileUrl = await saveFile(policyFile, 'policy-files', id);
      updateData.policyFileUrl = fileUrl;
    }

    // Update the policy
    const updatedPolicy = await prisma.publicPolicy.update({
      where: { id },
      data: updateData,
      include: {
        images: true
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/public-policy');
    revalidatePath(`/dashboard/public-policy/${id}`);
    revalidatePath('/components/public-policy');
    revalidatePath(`/components/public-policy/${id}`);

    return {
      success: true,
      data: updatedPolicy,
      message: 'Public policy updated successfully'
    };
  } catch (error) {
    console.error('Error updating public policy:', error);
    return {
      success: false,
      error: 'Failed to update public policy'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function updatePublicPolicyAction(id: string, prevState: ActionResult, formData: FormData) {
  const result = await updatePublicPolicy(id, prevState, formData);
  
  if (result.success) {
    redirect('/dashboard/public-policy');
  }
  
  return result;
}