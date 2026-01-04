'use client';

import { useFormStatus } from 'react-dom';
import { Plus, Loader2 } from 'lucide-react';

export function SubmitButton({ colorClass }: { colorClass: string }) {
  // 'pending' is true while the server action is running
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`p-3 rounded-xl text-white shadow-lg transition-all 
        ${colorClass} 
        ${pending ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 hover:brightness-110'}
      `}
    >
      {pending ? (
        // Show a spinning loader when adding
        <Loader2 size={24} className="animate-spin" />
      ) : (
        // Show the Plus icon normally
        <Plus size={24} strokeWidth={3} />
      )}
    </button>
  );
}