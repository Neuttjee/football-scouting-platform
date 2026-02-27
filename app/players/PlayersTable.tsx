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
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { updatePlayerField, updatePlayer } from "./actions"
import { createTask } from "../tasks/actions"
import { createContact } from "./[id]/contacts/actions"

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
}

const STATUS_OPTIONS = [
  "1. Te volgen", "2. Actief", "3. Parkeren", "4. Afgevallen", "5. Gestopt", "Getekend"
];

const STEP_OPTIONS = [
  "1. Longlist", "2. Shortlist", "3. App gestuurd", "4. Telefonisch contact", 
  "5. Gesprek plannen", "6. Gesprek gepland", "7. Gesprek gehad", "8. Trainer gesproken",
  "9. Meetrainen gepland", "10. Meetrainen gedaan", "11. Overeenkomst getekend", "12. Afgehaakt",
  "13. Niet haalbaar", "14. N.v.t."
];

const ADVIES_OPTIONS = [
  "1. Nog bekijken", "2. Blijven volgen", "3. Benaderen", "4. Meetrainen", 
  "5. Tekenen", "6. Verlengen", "7. Afscheid nemen", "8. Afwijzen"
];

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

function PlayerActionsMenu({ player, clubUsers }: { player: Player, clubUsers: any[] }) {
  const router = useRouter()
  const [openEdit, setOpenEdit] = React.useState(false)
  const [openTask, setOpenTask] = React.useState(false)
  const [openContact, setOpenContact] = React.useState(false)

  const [outcome, setOutcome] = React.useState('')
  const requiresReason = outcome === 'Afgehaakt' || outcome === 'Niet haalbaar'

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await updatePlayer(player.id, formData)
    setOpenEdit(false)
    router.refresh()
  }

  const handleTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('playerId', player.id)
    await createTask(formData)
    setOpenTask(false)
    router.refresh()
  }

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createContact(player.id, formData)
    setOpenContact(false)
    router.refresh()
  }

  return (
    <div className="flex justify-end pr-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none">
          <Plus className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-bg-card border-border-dark min-w-[160px]">
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs">
            Bewerken
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenTask(true)} className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs">
            Nieuwe taak
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenContact(true)} className="cursor-pointer focus:bg-bg-hover focus:text-accent-primary text-text-primary text-xs">
            Nieuw contactmoment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader><DialogTitle>Bewerk Speler</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Naam *</label>
                <input type="text" name="name" defaultValue={player.name} required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Geboortedatum</label>
                <input type="date" name="dateOfBirth" defaultValue={player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split('T')[0] : ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Huidige Club</label>
                <input type="text" name="currentClub" defaultValue={player.currentClub || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team</label>
                <input type="text" name="team" defaultValue={player.team || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Positie</label>
                <input type="text" name="position" defaultValue={player.position || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nevenpositie</label>
                <input type="text" name="secondaryPosition" defaultValue={player.secondaryPosition || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Voorkeursbeen</label>
                <select name="preferredFoot" defaultValue={player.preferredFoot || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                  <option value="">Selecteer been...</option>
                  <option value="Rechts">Rechts</option>
                  <option value="Links">Links</option>
                  <option value="Tweebenig">Tweebenig</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Advies</label>
                <select name="advies" defaultValue={player.advies || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                  <option value="">Selecteer advies...</option>
                  {ADVIES_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Processtap</label>
                <select name="step" defaultValue={player.step || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                  <option value="">Selecteer processtap...</option>
                  {STEP_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" defaultValue={player.status || ''} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                  <option value="">Selecteer status...</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" className="btn-premium text-white">Opslaan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openTask} onOpenChange={setOpenTask}>
        <DialogContent className="max-w-xl bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader><DialogTitle>Nieuwe Taak voor {player.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleTask} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">Taak omschrijving *</label>
                <input type="text" name="title" required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">Toewijzen aan (Gebruiker)</label>
                <select name="assignedToId" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                  <option value="">Niet toegewezen</option>
                  {clubUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">Of toewijzen aan (Externe persoon)</label>
                <input type="text" name="assignedToExternalName" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">Deadline</label>
                <input type="date" name="dueDate" className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" className="btn-premium text-white">Taak Toevoegen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openContact} onOpenChange={setOpenContact}>
        <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <DialogHeader><DialogTitle>Nieuw Contactmoment</DialogTitle></DialogHeader>
          <form onSubmit={handleContact} className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Type *</label>
              <select name="type" required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                <option value="">Selecteer...</option>
                {['Intro benadering', 'Follow up', 'Gesprek', 'Meetraining', 'Aanbod', 'Overig'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Kanaal *</label>
              <select name="channel" required className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                <option value="">Selecteer...</option>
                {['Whatsapp', 'Telefoon', 'Op de club', 'Training', 'Via derde', 'E-mail', 'Overig'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Uitkomst</label>
              <select name="outcome" value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary">
                <option value="">Geen of onbekend</option>
                {['Positief', 'Neutraal', 'Twijfel', 'Negatief', 'Afgehaakt', 'Niet haalbaar'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {requiresReason && (
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">Reden (Verplicht bij Afgehaakt/Niet haalbaar) *</label>
                <input type="text" name="reason" required={requiresReason} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Notities</label>
              <textarea name="notes" rows={3} className="w-full border border-border-dark rounded p-2 bg-bg-primary text-text-primary focus-visible:ring-accent-primary"></textarea>
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" className="btn-premium text-white">Toevoegen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function getColumns(clubUsers: any[]): ColumnDef<Player>[] {
  return [
    {
      accessorKey: "name",
      header: "Naam",
      enableColumnFilter: true,
      filterFn: "includesString",
      cell: ({ row }) => {
        const player = row.original;
        const age = player.dateOfBirth ? Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / 3.15576e+10) : null;
        
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link href={`/players/${player.id}/profile`} className="font-medium text-text-primary hover:text-accent-primary transition-colors cursor-pointer">
                {player.name}
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
      header: "Team",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => <span className="text-text-secondary">{row.getValue("team") || "-"}</span>,
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
        if (!row.dateOfBirth) return null;
        return Math.floor((new Date().getTime() - new Date(row.dateOfBirth).getTime()) / 3.15576e+10);
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
      cell: ({ row }) => <PlayerActionsMenu player={row.original} clubUsers={clubUsers} />,
    },
  ]
}

// Custom filter input for columns
function Filter({
  column,
}: {
  column: any
}) {
  const columnFilterValue = column.getFilterValue()

  const isFaceted = ['currentClub', 'team', 'position', 'secondaryPosition', 'preferredFoot', 'status', 'step', 'advies', 'age'].includes(column.id)

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

export function PlayersTable({ data, clubUsers = [] }: { data: Player[], clubUsers?: any[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const columns = React.useMemo(() => getColumns(clubUsers), [clubUsers]);

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
