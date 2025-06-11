import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingProvider } from "./loading-context"
import GlobalLoader from "./global-loader"

export const metadata: Metadata = {
  title: "BBVA Provincial",
  description: "Solicitud de Cuenta BBVA Provincial",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <LoadingProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            <GlobalLoader />
          </ThemeProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
