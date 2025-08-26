// app/lib/actions/ethnic-group/post.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString, extractFormDataNumber } from '../shared/validation';
import { saveImages, saveFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function createEthnicGroup(formData: FormData): Promise<ActionResult> {
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
      'name', 'history', 'activityName', 'activityOrigin', 'province', 
      'amphoe', 'district', 'type', 'activityDetails', 'alcoholFreeApproach', 
      'startYear', 'categoryId'
    ]);
    if (!validation.success) {
      return validation;
    }

    // Extract form data
    const ethnicGroupData = {
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
      startYear: extractFormDataNumber(formData, 'startYear') || 0,
      results: extractFormDataString(formData, 'results') || null,
      videoLink: extractFormDataString(formData, 'videoLink') || null,
      categoryId: extractFormDataString(formData, 'categoryId'),
      userId: user.id
    };

    // Handle optional numeric fields
    ['zipcode', 'district_code', 'amphoe_code', 'province_code'].forEach(field => {
      const value = formData.get(field);
      if (value && !isNaN(Number(value))) {
        (ethnicGroupData as any)[field] = Number(value);
      }
    });

    // Verify category exists
    const category = await prisma.ethnicCategory.findUnique({
      where: { id: ethnicGroupData.categoryId }
    });

    if (!category) {
      return {
        success: false,
        error: 'Ethnic category not found'
      };
    }

    // Create the ethnic group
    const ethnicGroup = await prisma.ethnicGroup.create({
      data: ethnicGroupData
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    if (images && images.length > 0 && images[0].size > 0) {
      await saveImages(images, 'ethnic-group-images', ethnicGroup.id, 'ethnicGroupId');
    }

    // Handle report file upload
    const reportFile = formData.get('reportFile') as File;
    if (reportFile && reportFile.size > 0) {
      const fileUrl = await saveFile(reportFile, 'ethnic-group-files', ethnicGroup.id);
      
      await prisma.ethnicGroup.update({
        where: { id: ethnicGroup.id },
        data: { fileUrl: fileUrl }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        activityId: ethnicGroup.id,
        activityType: 'ethnicGroup'
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/ethnic-group');
    revalidatePath('/components/ethnic-group');
    revalidatePath('/');

    return {
      success: true,
      data: ethnicGroup,
      message: 'Ethnic group created successfully'
    };
  } catch (error) {
    console.error('Error creating ethnic group:', error);
    return {
      success: false,
      error: 'Failed to create ethnic group'
    };
  }
}

// Server Action with redirect (for form submissions)
export async function createEthnicGroupAction(prevState: ActionResult, formData: FormData) {
  const result = await createEthnicGroup(formData);
  
  if (result.success) {
    redirect('/dashboard/ethnic-group');
  }
  
  return result;
}