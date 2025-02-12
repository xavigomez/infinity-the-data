import "~/styles/globals.css";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Infinity The Data",
  description: "Infinity satellites data for everyone",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <TRPCReactProvider>
        {/* <body className={`${spaceGrotesk.variable} ${glitchRobot.variable}`}> */}
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </TRPCReactProvider>
    </html>
  );
}
