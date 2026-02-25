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
  onChange 
}: { 
  value: string | null, 
  options: string[], 
  onChange: (val: string) => void 
}) {
  return (
    <select
      className="bg-transparent border border-transparent hover:border-border rounded p-1 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
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
      className="bg-transparent border border-transparent hover:border-border rounded p-1 text-sm focus:border-ring focus:ring-1 focus:ring-ring w-full max-w-[120px]"
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
      <Link href={`/players/${row.original.id}/profile`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "currentClub",
    header: "Club (Huidig)",
    cell: ({ row }) => row.getValue("currentClub") || "-",
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => row.getValue("team") || "-",
  },
  {
    accessorKey: "position",
    header: "Positie",
    cell: ({ row }) => row.getValue("position") || "-",
  },
  {
    accessorKey: "secondaryPosition",
    header: "Nevenpositie",
    cell: ({ row }) => row.getValue("secondaryPosition") || "-",
  },
  {
    accessorKey: "preferredFoot",
    header: "Been",
    cell: ({ row }) => row.getValue("preferredFoot") || "-",
  },
  {
    id: "age",
    header: "Leeftijd",
    accessorFn: (row) => {
      if (!row.dateOfBirth) return null;
      return Math.floor((new Date().getTime() - new Date(row.dateOfBirth).getTime()) / 3.15576e+10);
    },
    cell: ({ row }) => row.getValue("age") || "-",
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
            onChange={async (val) => {
              await updatePlayerField(player.id, 'status', val)
            }}
          />
          {player.statusManuallyChanged && (
            <span className="text-xs text-orange-500" title="Handmatig aangepast">⚠️</span>
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
    header: () => <div className="text-right">Acties</div>,
    cell: ({ row }) => {
      const player = row.original
      return (
        <div className="text-right space-x-2 whitespace-nowrap">
          <Link href={`/players/${player.id}`} className="text-blue-600 hover:underline dark:text-blue-400 text-sm">Bewerk</Link>
          <Link href={`/players/${player.id}/contacts`} className="text-muted-foreground hover:underline text-sm">Contacten</Link>
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
      className="h-8 text-xs w-full min-w-[80px]"
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
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="overflow-x-auto pb-4">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="align-top py-2 px-2">
                      <div className="flex flex-col gap-2">
                        <div 
                          className={header.column.getCanSort() ? "cursor-pointer select-none font-semibold hover:text-foreground flex items-center" : "font-semibold"}
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
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
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