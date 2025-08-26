// app/dashboard/tradition-category/components/TraditionCategoryForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom';
import { ActionResult } from '@/app/lib/actions/shared/types';

interface TraditionCategoryFormProps {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  initialData?: {
    name: string;
  };
  mode?: 'create' | 'edit';
}

function SubmitButton({ mode }: { mode?: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        px-4 py-2 rounded-md text-white font-medium
        ${pending 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
        }
      `}
    >
      {pending ? 'กำลังบันทึก...' : (mode === 'edit' ? 'บันทึกการแก้ไข' : 'สร้างประเภทงานบุญประเพณี')}
    </button>
  );
}

export default function TraditionCategoryForm({ action, initialData, mode = 'create' }: TraditionCategoryFormProps) {
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
          ชื่อประเภทงานบุญประเพณี *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialData?.name || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="กรอกชื่อประเภทงานบุญประเพณี"
        />
      </div>

      <SubmitButton mode={mode} />
    </form>
  );
}