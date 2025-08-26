// app/lib/actions/shared/validation.ts
import { ActionResult } from './types';

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

export function validateYear(year: any): string | null {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 10) {
    return `Year must be between 1900 and ${currentYear + 10}`;
  }
  return null;
}

export function validateFormData(formData: FormData, requiredFields: string[]): ActionResult<null> {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    const value = formData.get(field);
    const error = validateRequired(value, field);
    if (error) {
      errors.push(error);
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join(', ')
    };
  }
  
  return { success: true };
}

export function extractFormDataString(formData: FormData, field: string): string {
  return (formData.get(field) as string) || '';
}

export function extractFormDataNumber(formData: FormData, field: string): number | undefined {
  const value = formData.get(field);
  if (!value) return undefined;
  const num = parseInt(value.toString());
  return isNaN(num) ? undefined : num;
}

export function extractFormDataBoolean(formData: FormData, field: string): boolean {
  return formData.get(field) === 'true';
}

export function parseNumericFields(formData: FormData, fields: string[]): Record<string, number | undefined> {
  const result: Record<string, number | undefined> = {};
  
  for (const field of fields) {
    const value = formData.get(field);
    if (value && !isNaN(Number(value))) {
      result[field] = Number(value);
    }
  }
  
  return result;
}