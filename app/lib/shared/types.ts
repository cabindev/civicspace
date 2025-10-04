// app/lib/shared/types.ts

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}