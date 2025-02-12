import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import TestingTournaments from "~/app/_components/testing-tournaments";
import TestingTable from "~/app/_components/testing-table";
import { ThemeToggleButton } from "~/components/theme-toggle-button";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
        <header className="sticky top-0 z-50 w-full text-center backdrop-blur-lg">
          <div className="container mx-auto flex py-2">
            <h1 className="text-xl font-bold">Infinity the Data</h1>
            <nav className="">
              <ThemeToggleButton />
            </nav>
          </div>
        </header>
        <main className="container mx-auto flex flex-col items-center justify-center">
          <TestingTournaments />
          <TestingTable />
        </main>
        <footer className="text-center">
          <div className="container mx-auto py-2">
            <p className="text-xs text-zinc-700">
              Made with ❤️ by{" "}
              <Link
                href="https://github.com/xavigomez"
                target="_blank"
                rel="noopener noreferer"
              >
                Codegoons
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </HydrateClient>
  );
}
