"use client"

import type React from "react"
import Link from "next/link"
import { Home, Settings, Users, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isAuthenticatedBackoffice, backofficeLogout } from "@/lib/backoffice-data"
import { useRouter, usePathname } from "next/navigation"
import { useLoading } from "@/app/loading-context"

export default function BackofficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const { setLoading } = useLoading();

  // Helper to handle menu navigation with loader
  const handleMenuNav = (href: string, message: string) => (e: React.MouseEvent) => {
    if (pathname === href) return; // Already on this page
    e.preventDefault();
    setLoading(true, message);
    setTimeout(() => {
      setLoading(false);
      router.push(href);
    }, 400);
  };

  // Client-side check for authentication
  // Only redirect if not authenticated AND not on the login page
  if (typeof window !== "undefined" && !isAuthenticatedBackoffice() && pathname !== "/backoffice/login") {
    router.replace("/backoffice/login") // Use router.replace for initial redirect
    return null // Return null to prevent rendering layout before redirect
  }

  // If we are on the login page and not authenticated, just render the children (login page)
  if (pathname === "/backoffice/login" && !isAuthenticatedBackoffice()) {
    return <>{children}</>
  }

  const handleLogout = () => {
    backofficeLogout()
    router.replace("/backoffice/login") // Use router.replace for logout
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col">
        <div className="text-2xl font-bold mb-8">BBVA Backoffice</div>
        <nav className="space-y-4 flex-grow">
          <Link
            href="/backoffice"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === "/backoffice" ? "bg-blue-800" : "hover:bg-blue-800"
            }`}
            onClick={handleMenuNav("/backoffice", "Cargando dashboard...")}
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/backoffice/clients"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname.startsWith("/backoffice/clients") ? "bg-blue-800" : "hover:bg-blue-800"
            }`}
            onClick={handleMenuNav("/backoffice/clients", "Cargando clientes...")}
          >
            <Users className="h-5 w-5" />
            Gestión de Clientes
          </Link>
          <Link
            href="/backoffice/parametrization"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === "/backoffice/parametrization" ? "bg-blue-800" : "hover:bg-blue-800"
            }`}
            onClick={handleMenuNav("/backoffice/parametrization", "Cargando parametrización...")}
          >
            <Settings className="h-5 w-5" />
            Parametrización
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header for main content area */}
        <header className="flex items-center justify-end p-4 bg-white shadow-sm">
          <Button
            onClick={handleLogout}
            variant="ghost" // Use ghost variant for no background
            className="text-blue-900 hover:bg-gray-100 hover:text-blue-900" // Ensure text remains blue and hover effect
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </header>
        <div className="flex-1 p-8 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
