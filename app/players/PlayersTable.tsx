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
  const router = useRouter();
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
    cell: ({ row }) => {
      const player = row.original;
      const age = player.dateOfBirth ? Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / 3.15576e+10) : null;
      
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link href={`/players/${player.id}/profile`} className="font-medium text-accent-primary hover:text-accent-glow transition-colors cursor-pointer">
              {player.name}
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 bg-bg-card border-border-dark shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-text-primary">{player.name}</h4>
                <p className="text-xs text-text-secondary">
                  {player.currentClub || 'Geen club'} • {player.team || 'Geen team'}
                </p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-text-muted">
                    Positie: <span className="text-text-primary font-medium">{player.position || '-'}</span>
                  </span>
                </div>
                <div className="flex items-center pt-1">
                  <span className="text-xs text-text-muted">
                    Leeftijd: <span className="text-text-primary font-medium">{age ? `${age} jaar` : '-'}</span>
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
    header: "Team",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => <span className="text-text-secondary">{row.getValue("team") || "-"}</span>,
  },
  {
    accessorKey: "position",
    header: "Positie",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => <span className="text-text-secondary">{row.getValue("position") || "-"}</span>,
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
    accessorFn: (row) => {
      if (!row.dateOfBirth) return null;
      return Math.floor((new Date().getTime() - new Date(row.dateOfBirth).getTime()) / 3.15576e+10);
    },
    cell: ({ row }) => <span className="font-mono text-text-primary">{row.getValue("age") || "-"}</span>,
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
    filterFn: "arrIncludesSome",
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
    filterFn: "arrIncludesSome",
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
        <div className="text-right whitespace-nowrap">
          <Link href={`/players/${player.id}/profile`} className="text-accent-primary hover:text-accent-glow text-[10px] font-bold uppercase tracking-wider">BEWERK</Link>
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

  const isFaceted = ['currentClub', 'team', 'position', 'secondaryPosition', 'preferredFoot', 'status', 'step', 'advies'].includes(column.id)

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
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="rounded-xl card-premium overflow-hidden shadow-lg">
      <div className="overflow-x-auto pb-4">
        <Table className="min-w-max">
          <TableHeader className="bg-bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border-dark hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="align-top py-2 px-2 text-text-secondary">
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
                            asc: <span className="ml-1 text-accent-primary text-[10px]">▲</span>,
                            desc: <span className="ml-1 text-accent-primary text-[10px]">▼</span>,
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
      </div>
    </div>
  )
}