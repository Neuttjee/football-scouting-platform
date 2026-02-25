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

interface Player {
  id: string
  name: string
  position: string | null
  step: string | null
  status: string | null
  statusManuallyChanged: boolean
}

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "name",
    header: "Naam",
    cell: ({ row }) => {
      return (
        <Link href={`/players/${row.original.id}/profile`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          {row.getValue("name")}
        </Link>
      )
    },
  },
  {
    accessorKey: "position",
    header: "Positie",
    cell: ({ row }) => row.getValue("position") || "-",
  },
  {
    accessorKey: "step",
    header: "Processtap",
    cell: ({ row }) => row.getValue("step") || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | null
      const manuallyChanged = row.original.statusManuallyChanged
      return (
        <div className="flex items-center gap-2">
          <span>{status || "-"}</span>
          {manuallyChanged && (
            <span className="text-xs text-orange-500" title="Handmatig aangepast">⚠️</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acties</div>,
    cell: ({ row }) => {
      const player = row.original
      return (
        <div className="text-right space-x-2">
          <Link href={`/players/${player.id}`} className="text-blue-600 hover:underline dark:text-blue-400">Bewerk</Link>
          <Link href={`/players/${player.id}/contacts`} className="text-muted-foreground hover:underline">Contacten</Link>
        </div>
      )
    },
  },
]

export function PlayersTable({ data, initialQuery = "" }: { data: Player[], initialQuery?: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState(initialQuery)

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
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Zoek in alle kolommen..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
