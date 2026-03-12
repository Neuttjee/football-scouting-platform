"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "@/components/DataTable"
import { deletePlayersBulk, updatePlayerField } from "./actions"
import { targetSteps, targetStatuses, adviesOptions } from "@/lib/statusMapping"
import { calculateAgeFromDate } from "@/lib/age"
import { PlayerActionsMenu, PlayerForActions } from "@/components/PlayerActionsMenu";
import { MoreHorizontal, Settings, Star } from "lucide-react";

interface Player extends PlayerForActions {
  niveau: string | null;
}

const STATUS_OPTIONS = targetStatuses;
const STEP_OPTIONS = targetSteps;
const ADVIES_OPTIONS = adviesOptions;

function InlineSelect({ 
  value, 
  options, 
  onChange,
}: { 
  value: string | null, 
  options: string[], 
  onChange: (val: string) => void,
}) {
  const router = useRouter();
  
  return (
    <select
      className="bg-transparent text-text-primary border hover:border-border-dark border-transparent rounded px-2 py-1 text-xs font-medium focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-colors"
      value={value || ""}
      onChange={async (e) => {
        await onChange(e.target.value);
        router.refresh();
      }}
    >
      <option value="" className="bg-bg-card text-text-primary">-</option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-bg-card text-text-primary">{opt}</option>
      ))}
    </select>
  )
}

function InlineInput({ 
  value, 
  onChange 
}: { 
  value: string | null, 
  onChange: (val: string) => void 
}) {
  const router = useRouter();
  const [val, setVal] = React.useState(value || "")
  return (
    <input
      type="text"
      className="bg-transparent border border-transparent hover:border-border-dark rounded px-2 py-1 text-xs font-medium focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none w-full max-w-[120px] text-text-primary placeholder:text-text-muted transition-colors"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={async () => {
        if (val !== (value || "")) {
          await onChange(val);
          router.refresh();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur()
        }
      }}
    />
  )
}

export function getColumns(
  clubUsers: any[],
  clubName: string | null,
  canBulkDelete: boolean
): ColumnDef<Player>[] {
  const selectionColumn: ColumnDef<Player> = {
    id: "select",
    header: () => <div className="w-4" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(val) => row.toggleSelected(Boolean(val))}
          aria-label="Selecteer rij"
          className="border-border-dark data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 36,
  };

  return [
    ...(canBulkDelete ? [selectionColumn] : []),
    {
      accessorKey: "name",
      header: "Naam",
      enableColumnFilter: true,
      filterFn: "includesString",
      cell: ({ row }) => {
        const player = row.original;
        const age = player.dateOfBirth
          ? calculateAgeFromDate(new Date(player.dateOfBirth))
          : player.age;
        
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link
                href={`/players/${player.id}/profile`}
                className="font-medium text-text-primary hover:text-accent-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                {player.name}
                {player.isTopTalent && (
                  <Star className="ml-1 size-4 text-[#FFD700]" fill="#FFD700" />
                )}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-bg-card border-accent-primary shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-text-primary">{player.name}</h4>
                  <p className="text-xs text-text-secondary">
                    {player.currentClub || 'Geen club'} • {player.team || 'Geen team'}
                  </p>
                  <div className="flex items-center pt-2">
                    <span className="text-xs text-text-muted">
                      Positie: <span className="text-accent-primary font-medium">{player.position || '-'}</span>
                    </span>
                  </div>
                  <div className="flex items-center pt-1">
                    <span className="text-xs text-text-muted">
                      Leeftijd: <span className="text-accent-primary font-medium">{age ? `${age} jaar` : '-'}</span>
                    </span>
                  </div>
                  <div className="flex items-center pt-1">
                    <span className="text-xs text-text-muted">
                      Voorkeursbeen: <span className="text-text-primary font-medium">{player.preferredFoot || '-'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      },
    },
    {
      accessorKey: "currentClub",
      header: "Club (Huidig)",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => <span className="text-text-secondary">{row.getValue("currentClub") || "-"}</span>,
    },
    {
      accessorKey: "team",
      header: "Team (huidig)",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => <span className="text-text-secondary">{row.getValue("team") || "-"}</span>,
    },
    {
      accessorKey: "niveau",
      header: "Niveau (huidig)",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => <span className="text-text-secondary">{row.getValue("niveau") || "-"}</span>,
    },
    {
      accessorKey: "position",
      header: "Positie",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => <span className="text-accent-primary font-medium">{row.getValue("position") || "-"}</span>,
    },
    {
      accessorKey: "secondaryPosition",
      header: "Nevenpositie",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => <span className="text-text-secondary">{row.getValue("secondaryPosition") || "-"}</span>,
    },
    {
      accessorKey: "preferredFoot",
      header: "Been",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => <span className="text-text-secondary">{row.getValue("preferredFoot") || "-"}</span>,
    },
    {
      id: "age",
      header: "Leeftijd",
      filterFn: "arrIncludesSome",
      accessorFn: (row) => {
        if (row.dateOfBirth) {
          return calculateAgeFromDate(new Date(row.dateOfBirth))
        }
        return row.age
      },
      cell: ({ row }) => <span className="font-mono text-accent-primary">{row.getValue("age") || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex items-center gap-1">
            <InlineSelect 
              value={player.status} 
              options={STATUS_OPTIONS}
              onChange={async (val) => {
                await updatePlayerField(player.id, 'status', val)
              }}
            />
          </div>
        )
      },
    },
    {
      accessorKey: "step",
      header: "Processtap",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <InlineSelect 
            value={player.step} 
            options={STEP_OPTIONS}
            onChange={async (val) => {
              await updatePlayerField(player.id, 'step', val)
            }}
          />
        )
      },
    },
    {
      accessorKey: "advies",
      header: "Advies",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <InlineSelect 
            value={player.advies}
            options={ADVIES_OPTIONS}
            onChange={async (val) => {
              await updatePlayerField(player.id, 'advies', val)
            }}
          />
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-text-muted pr-2">Acties</div>,
      cell: ({ row }) => (
        <PlayerActionsMenu
          player={row.original}
          clubUsers={clubUsers}
          clubName={clubName}
        />
      ),
    },
  ]
}

// Custom filter input for columns
function Filter({
  column,
  table,
  canBulkDelete,
}: {
  column: any
  table?: any
  canBulkDelete?: boolean
}) {
  const columnFilterValue = column.getFilterValue()

  const isFaceted = [
    'currentClub',
    'team',
    'niveau',
    'position',
    'secondaryPosition',
    'preferredFoot',
    'status',
    'step',
    'advies',
    'age',
  ].includes(column.id)

  if (isFaceted) {
    const facetedValues = column.getFacetedUniqueValues()
    const uniqueValues = Array.from(facetedValues.keys()).filter(Boolean).sort()
    const selectedValues = new Set((columnFilterValue as string[]) || [])

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="h-8 px-2 w-full text-xs bg-bg-primary border border-border-dark text-text-primary placeholder:text-text-muted rounded focus-visible:ring-1 focus-visible:ring-accent-primary flex items-center justify-between gap-2 transition-colors hover:border-accent-primary/50">
            <span className="truncate">{selectedValues.size > 0 ? `${selectedValues.size} geselecteerd` : 'Alles'}</span>
            <span className="text-[10px] text-accent-primary">▼</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 bg-bg-card border-border-dark shadow-lg" align="start">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {uniqueValues.length === 0 && <div className="text-xs text-text-muted p-2">Geen opties</div>}
            {uniqueValues.map((val: any) => {
              const isSelected = selectedValues.has(val)
              return (
                <div key={val} className="flex items-center space-x-2 p-1 hover:bg-bg-hover rounded cursor-pointer" onClick={() => {
                  const newSet = new Set(selectedValues)
                  if (!isSelected) newSet.add(val)
                  else newSet.delete(val)
                  column.setFilterValue(newSet.size ? Array.from(newSet) : undefined)
                }}>
                  <Checkbox 
                    checked={isSelected}
                    className="border-border-dark data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
                  />
                  <span className="text-sm text-text-primary truncate">{val}</span>
                </div>
              )
            })}
            {selectedValues.size > 0 && (
              <div className="pt-2 mt-2 border-t border-border-dark">
                <button 
                  onClick={() => column.setFilterValue(undefined)}
                  className="text-xs text-accent-primary hover:text-accent-glow w-full text-left p-1"
                >
                  Wissen
                </button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Naam-kolom: alleen zoekveld
  if (column.id === "name") {
    return (
      <Input
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={e => column.setFilterValue(e.target.value)}
        placeholder={`Zoek...`}
        className="h-8 text-xs w-full min-w-[80px] bg-bg-primary border-border-dark text-text-primary placeholder:text-text-muted focus-visible:ring-accent-primary"
      />
    )
  }

  return (
    <Input
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Zoek...`}
      className="h-8 text-xs w-full min-w-[80px] bg-bg-primary border-border-dark text-text-primary placeholder:text-text-muted focus-visible:ring-accent-primary"
    />
  )
}

export function PlayersTable({
  data,
  clubUsers = [],
  clubName = null,
  canBulkDelete = false,
}: {
  data: Player[];
  clubUsers?: any[];
  clubName?: string | null;
  canBulkDelete?: boolean;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })

  const columns = React.useMemo(
    () => getColumns(clubUsers, clubName, canBulkDelete),
    [clubUsers, clubName, canBulkDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })

  const router = useRouter();
  const selectedIds = canBulkDelete
    ? table.getSelectedRowModel().rows.map((r) => (r.original as Player).id)
    : [];

  const filteredCount = table.getFilteredRowModel().rows.length;

  const exportPlayers = (players: Player[]) => {
    const headers = [
      "Naam",
      "Club (Huidig)",
      "Team (huidig)",
      "Niveau (huidig)",
      "Positie",
      "Nevenpositie",
      "Been",
      "Leeftijd",
      "Status",
      "Processtap",
      "Advies",
      "Notities",
    ];

    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      const needsQuotes = /[",\n\r]/.test(s);
      const safe = s.replace(/"/g, '""');
      return needsQuotes ? `"${safe}"` : safe;
    };

    const lines = [
      headers.join(","),
      ...players.map((p) =>
        [
          p.name,
          p.currentClub,
          p.team,
          p.niveau,
          p.position,
          p.secondaryPosition,
          p.preferredFoot,
          p.dateOfBirth
            ? calculateAgeFromDate(new Date(p.dateOfBirth))
            : p.age,
          p.status,
          p.step,
          p.advies,
          p.notes,
        ]
          .map(esc)
          .join(",")
      ),
    ];

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spelers-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <DataTable.Wrapper>
      <div className="relative">
        <div className="flex items-center justify-end gap-3 px-3 py-2 bg-bg-secondary">
          {canBulkDelete && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>
                <span className="font-semibold text-text-primary">{selectedIds.length}</span> geselecteerd
              </span>
              <button
                type="button"
                onClick={() => {
                  const selectedPlayers = table
                    .getSelectedRowModel()
                    .rows.map((r) => r.original as Player);
                  exportPlayers(selectedPlayers);
                }}
                className="px-3 py-1 rounded border border-border-dark bg-bg-secondary/70 text-text-secondary text-xs hover:bg-bg-hover transition-colors"
              >
                Spelers exporteren
              </button>

              <button
                type="button"
                onClick={async () => {
                  const ok = window.confirm(
                    `Weet je zeker dat je ${selectedIds.length} speler(s) wilt verwijderen?`
                  );
                  if (!ok) return;
                  await deletePlayersBulk(selectedIds);
                  table.resetRowSelection();
                  router.refresh();
                }}
                className="px-3 py-1 rounded border border-red-500/40 bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
              >
                Spelers verwijderen
              </button>
            </div>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <button className="h-8 w-8 rounded bg-transparent text-text-secondary hover:text-accent-primary flex items-center justify-center">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Kolommen</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-bg-card border-border-dark shadow-lg" align="end">
              <div className="space-y-1">
                {table
                  .getAllLeafColumns()
                  .filter((column) => !["actions", "name", "select"].includes(column.id))
                  .map((column) => (
                    <label key={column.id} className="flex items-center gap-2 text-sm text-text-primary">
                      <Checkbox
                        checked={column.getIsVisible()}
                        onCheckedChange={(val) => column.toggleVisibility(Boolean(val))}
                        className="border-border-dark data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
                      />
                      <span className="truncate">
                        {typeof column.columnDef.header === "string"
                          ? column.columnDef.header
                          : column.id}
                      </span>
                    </label>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Table className="min-w-max">
        <TableHeader className="bg-bg-secondary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border-dark hover:bg-transparent">
              {headerGroup.headers.map((header, headerIndex) => {
                return (
                  <TableHead key={header.id} className="align-top py-2 px-2 text-text-secondary">
                    <div className="flex flex-col gap-3">
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none font-semibold hover:text-text-primary flex items-center transition-colors uppercase tracking-wider text-xs"
                            : "font-semibold uppercase tracking-wider text-xs"
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: <span className="ml-1 text-accent-primary text-[10px]">▲</span>,
                          desc: <span className="ml-1 text-accent-primary text-[10px]">▼</span>,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>

                      <div className="h-8 flex items-end">
                        {headerIndex === 0 && canBulkDelete ? (
                          <div className="w-full flex items-center justify-center pb-0.5">
                            <Checkbox
                              checked={table.getIsAllPageRowsSelected()}
                              onCheckedChange={(val) =>
                                table.toggleAllPageRowsSelected(Boolean(val))
                              }
                              aria-label="Selecteer alle spelers op deze pagina"
                              className="border-border-dark data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
                            />
                          </div>
                        ) : header.column.getCanFilter() && header.column.id !== "actions" ? (
                          <Filter
                            column={header.column}
                            table={table}
                            canBulkDelete={canBulkDelete}
                          />
                        ) : null}
                      </div>
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-bg-hover border-border-dark transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2 px-2 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-text-muted">
                Geen spelers gevonden.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        </Table>
        <div className="flex flex-col items-center gap-3 px-3 py-2 border-t border-border-dark text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border border-border-dark bg-bg-secondary text-text-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-hover transition-colors"
            >
              Vorige
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border border-border-dark bg-bg-secondary text-text-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-hover transition-colors"
            >
              Volgende
            </button>
          </div>
          <span>
            Pagina{" "}
            <span className="font-semibold text-text-primary">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            van{" "}
            <span className="font-semibold text-text-primary">
              {table.getPageCount() || 1}
            </span>
            {" • "}
            <span className="font-semibold text-text-primary">
              {filteredCount}
            </span>{" "}
            spelers
          </span>
        </div>
      </div>
    </DataTable.Wrapper>
  )
}
