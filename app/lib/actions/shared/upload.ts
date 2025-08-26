// app/lib/actions/shared/upload.ts
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/app/lib/prisma';

export async function saveImages(
  files: File[], 
  folder: string,
  entityId: string,
  entityType: 'creativeActivityId' | 'traditionId' | 'ethnicGroupId' | 'publicPolicyId'
): Promise<string[]> {
  const savedImages: string[] = [];
  
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + '-' + file.name.replace(/\s+/g, '-');
    const filepath = path.join(process.cwd(), `public/uploads/${folder}`, filename);
    
    await writeFile(filepath, buffer);
    
    const imageUrl = `/uploads/${folder}/${filename}`;
    
    // Save to database
    await prisma.image.create({
      data: {
        url: imageUrl,
        [entityType]: entityId,
      },
    });
    
    savedImages.push(imageUrl);
  }
  
  return savedImages;
}

export async function saveFile(
  file: File,
  folder: string,
  filename?: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const finalFilename = filename || (Date.now() + '-' + file.name.replace(/\s+/g, '-'));
  const filepath = path.join(process.cwd(), `public/uploads/${folder}`, finalFilename);
  
  await writeFile(filepath, buffer);
  
  return `/uploads/${folder}/${finalFilename}`;
}

export async function deleteFile(filepath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filepath);
    await unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', filepath, error);
    // Don't throw error - file might not exist
  }
}

export async function deleteImages(entityId: string, entityType: 'creativeActivityId' | 'traditionId' | 'ethnicGroupId' | 'publicPolicyId'): Promise<void> {
  try {
    // Get all images for this entity
    const images = await prisma.image.findMany({
      where: {
        [entityType]: entityId
      }
    });
    
    // Delete files from filesystem
    for (const image of images) {
      await deleteFile(image.url);
    }
    
    // Delete records from database
    await prisma.image.deleteMany({
      where: {
        [entityType]: entityId
      }
    });
  } catch (error) {
    console.error('Error deleting images:', error);
  }
}

export function extractFormDataImages(formData: FormData, fieldName: string = 'images'): File[] {
  const files = formData.getAll(fieldName) as File[];
  return files.filter(file => file instanceof File && file.size > 0);
}

export function extractFormDataFile(formData: FormData, fieldName: string): File | null {
  const file = formData.get(fieldName) as File;
  return file instanceof File && file.size > 0 ? file : null;
}

export async function saveProfileImage(file: File, filename: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create filename with extension
  const fileExtension = path.extname(file.name) || '.jpg';
  const finalFilename = `${filename}${fileExtension}`;
  
  // Define path for profiles directory
  const profilesDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
  const filepath = path.join(profilesDir, finalFilename);
  
  // Create profiles directory if it doesn't exist
  try {
    await mkdir(profilesDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  // Save the file
  await writeFile(filepath, buffer);
  
  return `/uploads/profiles/${finalFilename}`;
}