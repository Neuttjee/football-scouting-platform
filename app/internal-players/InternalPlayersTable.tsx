// app/internal-players/InternalPlayersTable.tsx
"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Star, Plus } from "lucide-react";

type InternalPlayer = {
  id: string;
  name: string;
  teamLabel: string | null;
  originTeamLabel: string | null;
  position: string | null;
  secondaryPosition: string | null;
  preferredFoot: string | null;
  age: number | null;
  joinedAt: Date | null;
  contractEndDate: Date | null;
  isTopTalent: boolean;
};

type Props = {
  players: InternalPlayer[];
  agingThreshold: number;
  seasonYear: number;
};

const INTERNAL_COLUMNS: ColumnDef<InternalPlayer>[] = [
  {
    accessorKey: "name",
    header: "Naam",
    enableColumnFilter: true,
    filterFn: "includesString",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-1">
          <Link
            href={`/players/${p.id}/profile`}
            className="font-medium text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
          >
            {p.name}
          </Link>
          {p.isTopTalent && (
            <Star
              className="ml-1 size-4 text-accent-primary"
              fill="var(--primary-color, #FF6A00)"
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "teamLabel",
    header: "Team",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <span className="text-text-secondary">{row.getValue("teamLabel") || "-"}</span>
    ),
  },
  {
    accessorKey: "position",
    header: "Beste positie",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <span className="text-accent-primary font-medium">{row.getValue("position") || "-"}</span>
    ),
  },
  {
    accessorKey: "secondaryPosition",
    header: "Nevenposities",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <span className="text-text-secondary">
        {row.getValue("secondaryPosition") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "preferredFoot",
    header: "Voorkeursbeen",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => (
      <span className="text-text-secondary">
        {row.getValue("preferredFoot") || "-"}
      </span>
    ),
  },
  {
    id: "age",
    header: "Leeftijd",
    filterFn: "arrIncludesSome",
    accessorFn: (row) => row.age,
    cell: ({ row }) => (
      <span className="font-mono text-accent-primary">
        {row.getValue("age") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "joinedAt",
    header: "Bij club sinds",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      const value = row.original.joinedAt;
      return (
        <span className="text-text-secondary">
          {value ? new Date(value).toLocaleDateString("nl-NL") : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "contractEndDate",
    header: "Contract tot",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      const value = row.original.contractEndDate;
      return (
        <span className="text-text-secondary">
          {value ? new Date(value).toLocaleDateString("nl-NL") : "-"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right text-text-muted pr-2">Acties</div>,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex justify-end pr-2">
          <Link
            href={`/players/${p.id}/profile`}
            className="p-1.5 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 rounded-md transition-colors outline-none"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      );
    },
  },
];

function Filter({ column }: { column: any }) {
  const columnFilterValue = column.getFilterValue();

  const isFaceted = [
    "teamLabel",
    "position",
    "secondaryPosition",
    "preferredFoot",
    "age",
  ].includes(column.id);

  if (isFaceted) {
    const facetedValues = column.getFacetedUniqueValues();
    const uniqueValues = Array.from(facetedValues.keys()).filter(Boolean).sort();
    const selectedValues = new Set((columnFilterValue as string[]) || []);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="h-8 px-2 w-full text-xs bg-bg-primary border border-border-dark text-text-primary placeholder:text-text-muted rounded focus-visible:ring-1 focus-visible:ring-accent-primary flex items-center justify-between gap-2 transition-colors hover:border-accent-primary/50">
            <span className="truncate">
              {selectedValues.size > 0
                ? `${selectedValues.size} geselecteerd`
                : "Alles"}
            </span>
            <span className="text-[10px] text-accent-primary">▼</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 p-2 bg-bg-card border-border-dark shadow-lg"
          align="start"
        >
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {uniqueValues.length === 0 && (
              <div className="text-xs text-text-muted p-2">Geen opties</div>
            )}
            {uniqueValues.map((val: any) => {
              const isSelected = selectedValues.has(val);
              return (
                <div
                  key={val}
                  className="flex items-center space-x-2 p-1 hover:bg-bg-hover rounded cursor-pointer"
                  onClick={() => {
                    const newSet = new Set(selectedValues);
                    if (!isSelected) newSet.add(val);
                    else newSet.delete(val);
                    column.setFilterValue(
                      newSet.size ? Array.from(newSet) : undefined
                    );
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    className="border-border-dark data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
                  />
                  <span className="text-sm text-text-primary truncate">
                    {val}
                  </span>
                </div>
              );
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
    );
  }

  return (
    <Input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Zoek...`}
      className="h-8 text-xs w-full min-w-[80px] bg-bg-primary border-border-dark text-text-primary placeholder:text-text-muted focus-visible:ring-accent-primary"
    />
  );
}

export function InternalPlayersTable({
  players,
  agingThreshold,
  seasonYear,
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const columns = React.useMemo(() => INTERNAL_COLUMNS, []);
  const table = useReactTable({
    data: players,
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
  });

  return (
    <div className="rounded-xl card-premium overflow-hidden shadow-lg">
      <div className="overflow-x-auto pb-4">
        <Table className="min-w-max">
          <TableHeader className="bg-bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border-dark hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="align-top py-2 px-2 text-text-secondary"
                  >
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
                          asc: (
                            <span className="ml-1 text-accent-primary text-[10px]">
                              ▲
                            </span>
                          ),
                          desc: (
                            <span className="ml-1 text-accent-primary text-[10px]">
                              ▼
                            </span>
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() &&
                      header.column.id !== "actions" ? (
                        <div>
                          <Filter column={header.column} />
                        </div>
                      ) : (
                        <div className="h-8" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-bg-hover border-border-dark transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-2 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-text-muted"
                >
                  Geen interne spelers voor dit team.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}