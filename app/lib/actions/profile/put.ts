// app/lib/actions/profile/put.ts
'use server'

import prisma from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '../shared/auth';
import { validateFormData, extractFormDataString } from '../shared/validation';
import { saveProfileImage, deleteFile } from '../shared/upload';
import { ActionResult } from '../shared/types';

export async function updateProfile(userId: number, formData: FormData): Promise<ActionResult> {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult;
    }

    const currentUser = authResult.data?.user;
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Validate required fields
    const validation = validateFormData(formData, ['firstName', 'lastName']);
    if (!validation.success) {
      return validation;
    }

    // Get existing user data
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.email !== currentUser.email) {
      return {
        success: false,
        error: 'Unauthorized to update this profile'
      };
    }

    // Extract form data
    const firstName = extractFormDataString(formData, 'firstName');
    const lastName = extractFormDataString(formData, 'lastName');
    const imageFile = formData.get('image') as File | null;

    let imageUrl: string | undefined;

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      try {
        // Save new image
        const timestamp = Date.now();
        const filename = `profile-${timestamp}-${existingUser.id}`;
        imageUrl = await saveProfileImage(imageFile, filename);

        // Delete old image if exists
        if (existingUser.image) {
          await deleteFile(existingUser.image);
        }
      } catch (error) {
        console.error('Error handling profile image:', error);
        return {
          success: false,
          error: 'Failed to upload profile image'
        };
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        ...(imageUrl && { image: imageUrl }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
      }
    });

    // Revalidate pages
    revalidatePath('/dashboard/profile');
    revalidatePath(`/dashboard/profile/edit/${userId}`);

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: 'Failed to update profile'
    };
  }
}