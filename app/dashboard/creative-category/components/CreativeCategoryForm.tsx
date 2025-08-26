// app/dashboard/creative-category/components/CreativeCategoryForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom';
import { ActionResult } from '@/app/lib/actions/shared/types';

interface CreativeCategoryFormProps {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  initialData?: {
    name: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        px-4 py-2 rounded-md text-white font-medium
        ${pending 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        }
      `}
    >
      {pending ? 'กำลังบันทึก...' : 'สร้างประเภทกิจกรรมสร้างสรรค์'}
    </button>
  );
}

export default function CreativeCategoryForm({ action, initialData }: CreativeCategoryFormProps) {
  const [state, formAction] = useFormState(action, { success: false });

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {state.message || 'บันทึกสำเร็จ'}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อประเภทกิจกรรมสร้างสรรค์ *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialData?.name || ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="กรอกชื่อประเภทกิจกรรมสร้างสรรค์"
        />
      </div>

      <div className="flex gap-2">
        <SubmitButton />
        <a
          href="/dashboard/creative-category"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          ยกเลิก
        </a>
      </div>
    </form>
  );
}