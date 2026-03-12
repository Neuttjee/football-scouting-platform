"use client"

import * as React from "react";
import Link from "next/link";
import { useTransition } from "react";
import { toggleTask, updateTask, deleteTask } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { TaskForm } from "./TaskForm";
import { Button } from "@/components/ui/button";

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

type ClubUser = { id: string; name: string };

export function TaskList({ tasks, clubUsers }: { tasks: Task[]; clubUsers: ClubUser[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleToggle = (taskId: string, isCompleted: boolean) => {
    startTransition(() => {
      toggleTask(taskId, isCompleted);
    });
  };

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
                  onClick={() => {
                    setSelectedTask(t);
                    setIsEditing(false);
                  }}
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

      <Dialog
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              {isEditing ? "Taak bewerken" : "Taak details"}
            </DialogTitle>
          </DialogHeader>
          {selectedTask && !isEditing && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-text-primary">
                  {selectedTask.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                      selectedTask.isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
                        : "bg-accent-primary/15 text-accent-primary border border-accent-primary/40"
                    }`}
                  >
                    {selectedTask.isCompleted ? "VOLTOOID" : "OPENSTAAND"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    TOEGWEZEN AAN
                  </div>
                  <div className="font-medium text-text-primary">
                    {selectedTask.assignedTo?.name ||
                      selectedTask.assignedToExternalName ||
                      "Niet toegewezen"}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    DEADLINE
                  </div>
                  <div className="font-medium text-text-primary">
                    {selectedTask.dueDate
                      ? new Date(selectedTask.dueDate).toLocaleDateString(
                          "nl-NL",
                        )
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    GEKOPPELDE SPELER
                  </div>
                  <div className="font-medium text-text-primary">
                    {selectedTask.player ? (
                      <Link
                        href={`/players/${selectedTask.player.id}/profile`}
                        className="text-accent-primary hover:text-accent-glow underline-offset-2 hover:underline"
                      >
                        {selectedTask.player.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-1">
                    AANGEMAAKT DOOR
                  </div>
                  <div className="font-medium text-text-primary">
                    {selectedTask.createdBy?.name || "Onbekend"}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Op{" "}
                    {new Date(
                      selectedTask.createdAt,
                    ).toLocaleDateString("nl-NL")}
                  </div>
                </div>
              </div>

              {selectedTask.description && (
                <div className="pt-4 border-t border-border-dark">
                  <div className="text-text-muted uppercase tracking-wider text-[11px] mb-2">
                    BESCHRIJVING
                  </div>
                  <div className="text-sm bg-bg-secondary/60 border border-border-dark rounded-md p-3 whitespace-pre-wrap text-text-primary">
                    {selectedTask.description}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border-dark text-text-secondary hover:text-text-primary"
                  onClick={() => setSelectedTask(null)}
                >
                  Sluiten
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border-dark text-text-primary hover:border-accent-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Taak bewerken
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-red-600/90 hover:bg-red-600 text-white"
                    onClick={() => {
                      if (
                        !window.confirm(
                          "Weet je zeker dat je deze taak wilt verwijderen?",
                        )
                      ) {
                        return;
                      }
                      if (!selectedTask) return;
                      startTransition(async () => {
                        await deleteTask(selectedTask.id);
                        setSelectedTask(null);
                      });
                    }}
                  >
                    Verwijderen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {selectedTask && isEditing && (
            <TaskForm
              clubUsers={clubUsers}
              initialPlayer={
                selectedTask.player
                  ? {
                      id: selectedTask.player.id,
                      name: selectedTask.player.name,
                    }
                  : null
              }
              onSubmit={async (fd) => {
                await updateTask(selectedTask.id, fd);
                setSelectedTask(null);
                setIsEditing(false);
              }}
              submitLabel="Wijzigingen opslaan"
              initialValues={{
                title: selectedTask.title,
                dueDate: selectedTask.dueDate
                  ? selectedTask.dueDate.toISOString()
                  : null,
                assignedToId: null,
                assignedToExternalName: selectedTask.assignedToExternalName,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}