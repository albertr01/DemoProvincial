"use client"

import Link from "next/link"
import { Home, Settings, Users, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { backofficeLogout } from "@/lib/backoffice-data"
import { useRouter, usePathname } from "next/navigation"

export default function BackofficeHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    backofficeLogout()
    router.replace("/backoffice/login")
  }

  return (
    <header className="flex items-center justify-between p-4 bg-blue-900 text-white shadow-md">
      <div className="text-2xl font-bold">BBVA Backoffice</div>
      <nav className="flex items-center gap-6">
        <Link
          href="/backoffice"
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            pathname === "/backoffice" ? "bg-blue-800" : "hover:bg-blue-800"
          }`}
        >
          <Home className="h-5 w-5" />
          Dashboard
        </Link>
        <Link
          href="/backoffice/clients"
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            pathname.startsWith("/backoffice/clients") ? "bg-blue-800" : "hover:bg-blue-800"
          }`}
        >
          <Users className="h-5 w-5" />
          Gestión de Clientes
        </Link>
        <Link
          href="/backoffice/parametrization"
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            pathname === "/backoffice/parametrization" ? "bg-blue-800" : "hover:bg-blue-800"
          }`}
        >
          <Settings className="h-5 w-5" />
          Parametrización
        </Link>
        <Button
          onClick={handleLogout}
          variant="ghost" // Use ghost variant for no background
          className="text-white hover:bg-blue-800 hover:text-white" // Ensure text remains white and hover effect
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </nav>
    </header>
  )
}
