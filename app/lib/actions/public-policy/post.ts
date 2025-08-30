// app/lib/actions/public-policy/post.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { saveImages, saveFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

// Direct create function (for client-side calls)
export async function createPublicPolicyDirect(formData: FormData): Promise<ActionResult> {
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

    const policyData: any = {
      name,
      signingDate: signingDate,
      level,
      district,
      amphoe,
      province,
      type,
      village: extractFormDataString(formData, 'village') || null,
      content: content,
      summary,
      results: extractFormDataString(formData, 'results') || null,
      videoLink: extractFormDataString(formData, 'videoLink') || null,
      userId: user.id
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        policyData[field] = Number(value);
      }
    });

    // Validate policy level enum
    const validLevels = ['NATIONAL', 'HEALTH_REGION', 'PROVINCIAL', 'DISTRICT', 'SUB_DISTRICT', 'VILLAGE'];
    if (!validLevels.includes(policyData.level)) {
      return {
        success: false,
        error: 'Invalid policy level'
      };
    }

    // Create the policy
    const policy = await prisma.publicPolicy.create({
      data: policyData,
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

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      await saveImages(images, 'public-policy-images', policy.id, 'publicPolicyId');
    }

    // Handle policy file upload
    let policyFileUrl = null;
    const policyFile = formData.get('policyFile') as File;
    if (policyFile && policyFile.size > 0) {
      policyFileUrl = await saveFile(policyFile, 'policy-files');
    }

    // Update policy with file URL if file was uploaded
    let updatedPolicy = policy;
    if (policyFileUrl) {
      updatedPolicy = await prisma.publicPolicy.update({
        where: { id: policy.id },
        data: { policyFileUrl: policyFileUrl },
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
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        activityId: policy.id,
        activityType: 'publicPolicyId'
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/public-policy');
    revalidatePath('/components/public-policy');
    revalidatePath('/');

    return {
      success: true,
      data: updatedPolicy,
      message: 'Public policy created successfully'
    };
  } catch (error) {
    console.error('Error creating public policy:', error);
    return {
      success: false,
      error: 'Failed to create public policy'
    };
  }
}

export async function createPublicPolicy(formData: FormData): Promise<ActionResult> {
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

    const policyData = {
      name,
      signingDate: signingDate,
      level: level as any,
      healthRegion: extractFormDataString(formData, 'healthRegion') || null,
      district,
      amphoe,
      province,
      type,
      village: extractFormDataString(formData, 'village') || null,
      content: content,
      summary,
      results: extractFormDataString(formData, 'results') || null,
      videoLink: extractFormDataString(formData, 'videoLink') || null,
      userId: user.id
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        (policyData as any)[field] = Number(value);
      }
    });

    // Validate policy level enum
    const validLevels = ['NATIONAL', 'REGIONAL', 'PROVINCIAL', 'DISTRICT', 'SUBDISTRICT', 'VILLAGE', 'ORGANIZATION'];
    if (!validLevels.includes(policyData.level)) {
      return {
        success: false,
        error: 'Invalid policy level'
      };
    }

    // Create the policy
    const policy = await prisma.publicPolicy.create({
      data: policyData
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      await saveImages(images, 'public-policy-images', policy.id, 'publicPolicyId');
    }

    // Handle policy file upload
    const policyFile = formData.get('policyFile') as File;
    if (policyFile && policyFile.size > 0) {
      const fileUrl = await saveFile(policyFile, 'policy-files', policy.id);
      
      await prisma.publicPolicy.update({
        where: { id: policy.id },
        data: { policyFileUrl: fileUrl }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        activityId: policy.id,
        activityType: 'publicPolicyId'
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/public-policy');
    revalidatePath('/components/public-policy');
    revalidatePath('/');

    return {
      success: true,
      data: policy,
      message: 'Public policy created successfully'
    };
  } catch (error) {
    console.error('Error creating public policy:', error);
    return {
      success: false,
      error: 'Failed to create public policy'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function createPublicPolicyAction(prevState: ActionResult, formData: FormData) {
  const result = await createPublicPolicy(formData);
  
  if (result.success) {
    redirect('/dashboard/public-policy');
  }
  
  return result;
}