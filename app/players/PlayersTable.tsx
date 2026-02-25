"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { updatePlayerField } from "./actions"

interface Player {
  id: string
  name: string
  position: string | null
  currentClub: string | null
  team: string | null
  secondaryPosition: string | null
  preferredFoot: string | null
  dateOfBirth: Date | null
  step: string | null
  status: string | null
  advies: string | null
  statusManuallyChanged: boolean
}

// Custom select component for inline editing
function InlineSelect({ 
  value, 
  options, 
  onChange,
  isStatus = false
}: { 
  value: string | null, 
  options: string[], 
  onChange: (val: string) => void,
  isStatus?: boolean
}) {
  let badgeClass = "bg-transparent text-text-primary border-transparent";
  
  if (isStatus && value) {
    if (value === "Actief" || value === "Getekend") badgeClass = "bg-green-500/10 text-green-500 border-green-500/20";
    else if (value === "Te volgen" || value === "Longlist") badgeClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
    else if (value === "Sluimerend" || value === "On hold") badgeClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    else if (value === "Afgerond" || value === "Afgewezen") badgeClass = "bg-red-500/10 text-red-500 border-red-500/20";
    else badgeClass = "bg-accent-primary/10 text-accent-primary border-accent-primary/20";
  }

  return (
    <select
      className={`border hover:border-border-dark rounded px-2 py-1 text-xs font-medium focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-colors ${badgeClass}`}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
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
  const [val, setVal] = React.useState(value || "")
  return (
    <input
      type="text"
      className="bg-transparent border border-transparent hover:border-border-dark rounded px-2 py-1 text-xs font-medium focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none w-full max-w-[120px] text-text-primary placeholder:text-text-muted transition-colors"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        if (val !== (value || "")) {
          onChange(val)
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

const STEP_OPTIONS = [
  "Longlist", "Videobeoordeling", "Live scouting", "Navraag doen", 
  "Gesprek", "Aangeboden", "Getekend", "Afgewezen"
];

const STATUS_OPTIONS = [
  "Te volgen", "Actief", "Sluimerend", "On hold", "Afgerond"
];

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "name",
    header: "Naam",
    cell: ({ row }) => (
      <Link href={`/players/${row.original.id}/profile`} className="font-medium text-accent-primary hover:text-accent-glow transition-colors">
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "currentClub",
    header: "Club (Huidig)",
    cell: ({ row }) => <span className="text-text-secondary">{row.getValue("currentClub") || "-"}</span>,
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => <span className="text-text-secondary">{row.getValue("team") || "-"}</span>,
  },
  {
    accessorKey: "position",
    header: "Positie",
    cell: ({ row }) => <span className="text-text-secondary">{row.getValue("position") || "-"}</span>,
  },
  {
    accessorKey: "secondaryPosition",
    header: "Nevenpositie",
    cell: ({ row }) => <span className="text-text-secondary">{row.getValue("secondaryPosition") || "-"}</span>,
  },
  {
    accessorKey: "preferredFoot",
    header: "Been",
    cell: ({ row }) => <span className="text-text-secondary">{row.getValue("preferredFoot") || "-"}</span>,
  },
  {
    id: "age",
    header: "Leeftijd",
    accessorFn: (row) => {
      if (!row.dateOfBirth) return null;
      return Math.floor((new Date().getTime() - new Date(row.dateOfBirth).getTime()) / 3.15576e+10);
    },
    cell: ({ row }) => <span className="font-mono text-text-primary">{row.getValue("age") || "-"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <div className="flex items-center gap-1">
          <InlineSelect 
            value={player.status} 
            options={STATUS_OPTIONS}
            isStatus={true}
            onChange={async (val) => {
              await updatePlayerField(player.id, 'status', val)
            }}
          />
          {player.statusManuallyChanged && (
            <span className="text-xs text-accent-secondary" title="Handmatig aangepast">⚠️</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "step",
    header: "Processtap",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <InlineSelect 
          value={player.step} 
          options={STEP_OPTIONS}
          isStatus={true}
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
    cell: ({ row }) => {
      const player = row.original;
      return (
        <InlineInput 
          value={player.advies}
          onChange={async (val) => {
            await updatePlayerField(player.id, 'advies', val)
          }}
        />
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right text-text-muted">Acties</div>,
    cell: ({ row }) => {
      const player = row.original
      return (
        <div className="text-right space-x-3 whitespace-nowrap">
          <Link href={`/players/${player.id}`} className="text-accent-primary hover:text-accent-glow text-xs font-medium uppercase tracking-wider">BEWERK</Link>
          <Link href={`/players/${player.id}/contacts`} className="text-text-muted hover:text-text-primary text-xs font-medium uppercase tracking-wider transition-colors">CONTACTEN</Link>
        </div>
      )
    },
  },
]

// Custom filter input for columns
function Filter({
  column,
}: {
  column: any
}) {
  const columnFilterValue = column.getFilterValue()

  return (
    <Input
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Filter...`}
      className="h-8 text-xs w-full min-w-[80px] bg-bg-primary border-border-dark text-text-primary placeholder:text-text-muted focus-visible:ring-accent-primary"
    />
  )
}

export function PlayersTable({ data }: { data: Player[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="rounded-xl border border-border-dark bg-bg-card overflow-hidden shadow-lg">
      <div className="overflow-x-auto pb-4">
        <Table className="min-w-max">
          <TableHeader className="bg-bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border-dark hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="align-top py-4 px-3 text-text-secondary">
                      <div className="flex flex-col gap-3">
                        <div 
                          className={header.column.getCanSort() ? "cursor-pointer select-none font-semibold hover:text-text-primary flex items-center transition-colors uppercase tracking-wider text-xs" : "font-semibold uppercase tracking-wider text-xs"}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {header.column.getCanFilter() && header.column.id !== 'actions' ? (
                          <div>
                            <Filter column={header.column} />
                          </div>
                        ) : <div className="h-8"></div>}
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
                    <TableCell key={cell.id} className="py-3 px-3">
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
      </div>
    </div>
  )
}