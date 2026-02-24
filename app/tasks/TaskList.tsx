'use client';

import { toggleTask } from './actions';
import { useTransition } from 'react';

type Task = {
  id: string;
  title: string;
  isCompleted: boolean;
  assignedTo: { name: string } | null;
  createdBy: { name: string } | null;
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    startTransition(() => {
      toggleTask(taskId, isCompleted);
    });
  };

  return (
    <div className="space-y-2">
      {tasks.length === 0 && <p className="text-gray-500 italic">Geen taken gevonden.</p>}
      {tasks.map(t => (
        <div key={t.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded hover:bg-gray-50 bg-white">
          <div className="flex items-center space-x-3 mb-2 md:mb-0">
            <input 
              type="checkbox" 
              checked={t.isCompleted} 
              onChange={(e) => handleToggle(t.id, e.target.checked)}
              disabled={isPending}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className={`${t.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'} font-medium`}>
              {t.title}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex flex-col md:flex-row md:space-x-4 space-y-1 md:space-y-0 ml-8 md:ml-0">
            {t.assignedTo && <span>Aan: {t.assignedTo.name}</span>}
            <span>Van: {t.createdBy?.name || 'Onbekend'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
