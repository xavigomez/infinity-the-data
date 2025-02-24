import { api } from "~/trpc/react";

import { notFound } from "next/navigation";

import { toast } from "sonner";

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
import { Fragment } from "react";
import { Button } from "~/components/ui/button";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";

interface Props {
  tournamentId: string;
}

export function TournamentDataTable({ tournamentId }: Props) {
  // Fetch the tournament data
  const { data: tournament, isLoading } =
    api.tournaments.getTournamentPlayerData.useQuery({
      tournamentId: tournamentId,
    });

  const { copyToClipboard, isClipboardSupported } = useCopyToClipboard();

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

            const handleCopyList = async (
              listId: string,
              listNumber: number,
            ) => {
              if (!isClipboardSupported) {
                toast.message(
                  <h4 className="text-sm font-extrabold">List not copied</h4>,
                  {
                    description: (
                      <div className="space-y-4">
                        <p>
                          Your browser does not support clipboard operations.
                          Please use a modern browser that supports newer
                          features.
                        </p>
                        <p>
                          You can manually copy it here: <span>{listId}</span>
                        </p>
                      </div>
                    ),
                  },
                );
                return;
              }
              await copyToClipboard(listId);
              const playerNickname = row.original.nickname;
              toast.message(
                <h4 className="text-sm font-extrabold">List code copied</h4>,
                {
                  description: (
                    <div className="space-y-4">
                      <p>
                        Copied List {listNumber} from {playerNickname}
                      </p>
                      <p className="text-xs italic text-foreground/50">
                        For small devices, army links are not working.
                        Furthermore the code you copied will not work on the
                        mobile app. Please use the web app to view your lists.
                      </p>
                    </div>
                  ),
                },
              );
            };

            return (
              <div className="flex flex-row gap-2">
                {lists.map((list, index) => (
                  <Fragment key={list}>
                    <Link
                      className="hidden w-10 hover:text-blue-500 hover:underline lg:block"
                      href={`https://infinitytheuniverse.com/army/list/${list}`}
                    >
                      List {index + 1}
                    </Link>
                    <Button
                      className="block lg:hidden"
                      variant="text"
                      onClick={() => handleCopyList(list, index + 1)}
                    >
                      List {index + 1}
                    </Button>
                  </Fragment>
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
  // TODO: change return try again
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
