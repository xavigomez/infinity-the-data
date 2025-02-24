import "~/styles/globals.css";
import "~/styles/fonts.css";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { ThemeToggleButton } from "~/components/theme-toggle-button";
import Link from "next/link";
import { Orbit, SquareCode, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Infinity The Data",
  description: "Infinity satellites data for everyone",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <TRPCReactProvider>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="sticky top-0 z-50 w-full backdrop-blur-lg">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link
                  className="text-md flex items-center gap-2 font-bold"
                  href={"/"}
                >
                  <Orbit className="size-5 text-secondary" />
                  Infinity the Data
                </Link>
                <ThemeToggleButton />
              </div>
            </header>
            {children}
            <footer className="container mx-auto flex min-h-16 flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:gap-2">
              <p className="flex gap-1 text-xs text-muted-foreground">
                <SquareCode className="size-4 text-secondary" />
                <span>
                  Crafted by{" "}
                  <Link
                    className="underline transition-all hover:text-primary"
                    href="https://github.com/xavigomez"
                    target="_blank"
                    rel="noopener noreferer"
                  >
                    Goorie
                  </Link>
                </span>
              </p>
              <span className="hidden text-muted-foreground sm:block">•</span>
              <p className="flex gap-1 text-xs text-muted-foreground">
                <Zap className="size-4 text-secondary" />
                Powered by the Infinity the Game community
              </p>
            </footer>
          </ThemeProvider>
        </body>
      </TRPCReactProvider>
    </html>
  );
}
