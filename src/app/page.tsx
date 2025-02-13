import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="container mx-auto flex min-h-[calc(100vh-128px)] grid-rows-[auto_1fr_auto] flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-6xl 2xl:text-8xl">Work in progress</h1>
      </main>
    </HydrateClient>
  );
}
