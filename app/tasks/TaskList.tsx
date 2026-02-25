"use client"

import * as React from "react"
import { toggleTask } from './actions'
import { useTransition } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Task = {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  assignedTo: { name: string } | null;
  assignedToExternalName: string | null;
  createdBy: { name: string } | null;
  createdAt: Date;
  dueDate: Date | null;
  player?: { id: string, name: string } | null;
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition()
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    startTransition(() => {
      toggleTask(taskId, isCompleted)
    })
  }

  return (
    <>
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="p-3 font-medium w-10"></th>
                <th className="p-3 font-medium">Taak</th>
                <th className="p-3 font-medium">Speler</th>
                <th className="p-3 font-medium">Toegewezen aan</th>
                <th className="p-3 font-medium">Deadline</th>
                <th className="p-3 font-medium">Aangemaakt door</th>
                <th className="p-3 font-medium">Datum</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground italic">
                    Geen taken gevonden.
                  </td>
                </tr>
              )}
              {tasks.map(t => {
                const assignedName = t.assignedTo?.name || t.assignedToExternalName || '-';
                return (
                  <tr 
                    key={t.id} 
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTask(t)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={t.isCompleted} 
                        onChange={(e) => handleToggle(t.id, e.target.checked)}
                        disabled={isPending}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                      />
                    </td>
                    <td className={`p-3 font-medium ${t.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {t.title}
                    </td>
                    <td className="p-3">
                      {t.player ? (
                        <Link 
                          href={`/players/${t.player.id}/profile`} 
                          className="text-blue-600 hover:underline dark:text-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.player.name}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-muted-foreground">{assignedName}</td>
                    <td className="p-3 text-muted-foreground">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('nl-NL') : '-'}
                    </td>
                    <td className="p-3 text-muted-foreground">{t.createdBy?.name || 'Onbekend'}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString('nl-NL')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Taak Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${selectedTask.isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                    {selectedTask.isCompleted ? 'Voltooid' : 'Openstaand'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Toegewezen aan</div>
                  <div className="font-medium">{selectedTask.assignedTo?.name || selectedTask.assignedToExternalName || 'Niet toegewezen'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Deadline</div>
                  <div className="font-medium">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('nl-NL') : '-'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Gekoppelde Speler</div>
                  <div className="font-medium">
                    {selectedTask.player ? (
                      <Link href={`/players/${selectedTask.player.id}/profile`} className="text-blue-600 hover:underline dark:text-blue-400">
                        {selectedTask.player.name}
                      </Link>
                    ) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Aangemaakt door</div>
                  <div className="font-medium">{selectedTask.createdBy?.name || 'Onbekend'}</div>
                  <div className="text-xs text-muted-foreground mt-1">Op {new Date(selectedTask.createdAt).toLocaleDateString('nl-NL')}</div>
                </div>
              </div>

              {selectedTask.description && (
                <div className="pt-2 border-t">
                  <div className="text-muted-foreground mb-1 text-sm">Beschrijving</div>
                  <div className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                    {selectedTask.description}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}