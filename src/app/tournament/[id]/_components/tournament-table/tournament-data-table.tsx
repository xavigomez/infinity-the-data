import { api } from "~/trpc/react";

import { notFound } from "next/navigation";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import type { PlayerTournamentData } from "~/types/players";
import Link from "next/link";
import { TournamentTableSkeleton } from "./tournament-table-skeleton";

interface Props {
  tournamentId: string;
}

export function TournamentDataTable({ tournamentId }: Props) {
  // Fetch the tournament data
  const { data: tournament, isLoading } =
    api.tournaments.getTournamentPlayerData.useQuery({
      tournamentId: tournamentId,
    });

  const columns: ColumnDef<PlayerTournamentData>[] = tournament
    ? [
        {
          id: "rank",
          header: "Rank",
          size: 50,
          cell: ({ row }) => {
            const rank = row.index + 1;
            const isLast = row.index === tournament.length - 1;
            return (
              <span>
                {rank === 1
                  ? "🥇"
                  : rank === 2
                    ? "🥈"
                    : rank === 3
                      ? "🥉"
                      : isLast
                        ? "🥄"
                        : rank}
              </span>
            );
          },
        },
        {
          header: "Nickname",
          accessorKey: "nickname",
        },
        {
          id: "totalTp",
          header: "TP",
          cell: ({ row }) => {
            const totalTp = row.original.totals.tournament;
            return <span>{totalTp}</span>;
          },
        },
        {
          id: "totalOp",
          header: "OP",
          cell: ({ row }) => {
            const totalOp = row.original.totals.objective;
            return <span>{totalOp}</span>;
          },
        },
        {
          id: "totalVp",
          header: "VP",
          cell: ({ row }) => {
            const totalVp = row.original.totals.victory;
            return <span>{totalVp}</span>;
          },
        },
        {
          id: "lists",
          header: "Lists",
          cell: ({ row }) => {
            const lists = row.original.lists;
            if (!lists || lists.length === 0)
              return <span className="italic">No lists</span>;
            return (
              <div className="space-x-4">
                {lists.map((list, index) => (
                  <Link
                    className="hover:text-blue-500 hover:underline"
                    key={list}
                    href={`https://infinitytheuniverse.com/army/list/${list}`}
                  >
                    List {index + 1}
                  </Link>
                ))}
              </div>
            );
          },
        },
      ]
    : [];

  const table = useReactTable({
    data: tournament ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <TournamentTableSkeleton />;
  // TODO: change return not found for try again
  if (!tournament) return notFound();

  return (
    <div>
      <Table className="w-full rounded border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* <pre>{JSON.stringify(tournament, null, 2)}</pre> */}
    </div>
  );
}
