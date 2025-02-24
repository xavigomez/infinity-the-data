import "~/styles/globals.css";
import "~/styles/fonts.css";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/providers/theme-provider";
import { ThemeToggleButton } from "~/components/theme-toggle-button";
import Link from "next/link";
import { Orbit } from "lucide-react";

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
            <footer className="container mx-auto h-16 px-4 text-center">
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
            </footer>
          </ThemeProvider>
        </body>
      </TRPCReactProvider>
    </html>
  );
}
