'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const headerCellLabelClass = 'font-semibold uppercase tracking-wider text-xs';

/** Wrapper only (card + overflow). Use when rendering table yourself (e.g. TanStack Table). */
function DataTableWrapper({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl card-premium overflow-hidden shadow-lg', className)} {...props}>
      <div className="overflow-x-auto pb-4">{children}</div>
    </div>
  );
}

function DataTableRoot({ className, children, ...props }: React.ComponentProps<typeof Table>) {
  return (
    <DataTableWrapper>
      <Table className={cn('min-w-max', className)} {...props}>
        {children}
      </Table>
    </DataTableWrapper>
  );
}

function DataTableHeader({ className, ...props }: React.ComponentProps<typeof TableHeader>) {
  return <TableHeader className={cn('bg-bg-secondary', className)} {...props} />;
}

function DataTableHeaderRow({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow className={cn('border-border-dark hover:bg-transparent', className)} {...props} />
  );
}

function DataTableHeaderCell({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TableHead>) {
  return (
    <TableHead className={cn('align-top py-2 px-2 text-text-secondary', className)} {...props}>
      <div className={headerCellLabelClass}>{children}</div>
    </TableHead>
  );
}

function DataTableBody(props: React.ComponentProps<typeof TableBody>) {
  return <TableBody {...props} />;
}

function DataTableRow({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      className={cn('hover:bg-bg-hover border-border-dark transition-colors', className)}
      {...props}
    />
  );
}

function DataTableCell({ className, ...props }: React.ComponentProps<typeof TableCell>) {
  return <TableCell className={cn('py-2 px-2 text-sm', className)} {...props} />;
}

function DataTableEmpty({
  colSpan,
  children,
}: { colSpan: number; children?: React.ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-text-muted">
        {children ?? 'Geen gegevens gevonden.'}
      </TableCell>
    </TableRow>
  );
}

export const DataTable = {
  Wrapper: DataTableWrapper,
  Root: DataTableRoot,
  Header: DataTableHeader,
  HeaderRow: DataTableHeaderRow,
  HeaderCell: DataTableHeaderCell,
  Body: DataTableBody,
  Row: DataTableRow,
  Cell: DataTableCell,
  Empty: DataTableEmpty,
};

export { headerCellLabelClass };
