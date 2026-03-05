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
import { DataTable } from "@/components/DataTable"

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
      <DataTable.Root>
        <DataTable.Header>
          <DataTable.HeaderRow>
            <DataTable.HeaderCell className="w-10">{'\u00A0'}</DataTable.HeaderCell>
            <DataTable.HeaderCell>Taak</DataTable.HeaderCell>
            <DataTable.HeaderCell>Speler</DataTable.HeaderCell>
            <DataTable.HeaderCell>Toegewezen aan</DataTable.HeaderCell>
            <DataTable.HeaderCell>Deadline</DataTable.HeaderCell>
            <DataTable.HeaderCell>Aangemaakt door</DataTable.HeaderCell>
            <DataTable.HeaderCell>Datum</DataTable.HeaderCell>
          </DataTable.HeaderRow>
        </DataTable.Header>
        <DataTable.Body>
          {tasks.length === 0 ? (
            <DataTable.Empty colSpan={7}>Geen taken gevonden.</DataTable.Empty>
          ) : (
            tasks.map((t) => {
              const assignedName = t.assignedTo?.name || t.assignedToExternalName || '-';
              return (
                <DataTable.Row
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedTask(t)}
                >
                  <DataTable.Cell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={t.isCompleted}
                      onChange={(e) => handleToggle(t.id, e.target.checked)}
                      disabled={isPending}
                      className="h-4 w-4 rounded border-border-dark text-accent-primary focus:ring-accent-primary disabled:opacity-50 cursor-pointer"
                    />
                  </DataTable.Cell>
                  <DataTable.Cell className={t.isCompleted ? 'line-through text-muted-foreground' : 'font-medium'}>
                    {t.title}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    {t.player ? (
                      <Link
                        href={`/players/${t.player.id}/profile`}
                        className="text-accent-primary hover:text-accent-glow underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t.player.name}
                      </Link>
                    ) : '-'}
                    </DataTable.Cell>
                  <DataTable.Cell className="text-muted-foreground">{assignedName}</DataTable.Cell>
                  <DataTable.Cell className="text-muted-foreground">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString('nl-NL') : '-'}
                  </DataTable.Cell>
                  <DataTable.Cell className="text-muted-foreground">{t.createdBy?.name || 'Onbekend'}</DataTable.Cell>
                  <DataTable.Cell className="text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString('nl-NL')}
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })
          )}
        </DataTable.Body>
      </DataTable.Root>

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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${selectedTask.isCompleted ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'}`}>
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
                      <Link href={`/players/${selectedTask.player.id}/profile`} className="text-accent-primary hover:text-accent-glow underline-offset-2 hover:underline">
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