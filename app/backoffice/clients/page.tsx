"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClientApplications, type ClientApplication } from "@/lib/backoffice-data"
import { Search, Eye, Clock } from "lucide-react"

export default function BackofficeClientsPage() {
  const [clients, setClients] = useState<ClientApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setIsLoading(true)
    // Simulate fetching data
    setTimeout(() => {
      const fetchedClients = getClientApplications()
      setClients(fetchedClients)
      setIsLoading(false)
      console.log("[BACKOFFICE_TRACKING] Página de Gestión de Clientes cargada.")
    }, 500)
  }, [])

  const filteredClients = useMemo(() => {
    let filtered = clients

    if (filterStatus !== "all") {
      filtered = filtered.filter((client) => client.status === filterStatus)
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          client.userId.toLowerCase().includes(lowerCaseSearchTerm) ||
          client.type.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }
    return filtered
  }, [clients, filterStatus, searchTerm])

  const getStatusBadgeClass = (status: ClientApplication["status"]) => {
    switch (status) {
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      case "pendiente_aprobacion":
        return "bg-yellow-100 text-yellow-800"
      case "incompleta":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Clock className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2 text-blue-900">Cargando clientes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-900">Gestión de Clientes</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Buscar y Filtrar Clientes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nombre, ID o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="incompleta">Incompleta</option>
            <option value="pendiente_aprobacion">Pendiente de Aprobación</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          <Button
            onClick={() => {
              setSearchTerm("")
              setFilterStatus("all")
            }}
          >
            Restablecer Filtros
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Lista de Solicitudes de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <p className="text-center text-gray-500">
              No se encontraron clientes que coincidan con los criterios de búsqueda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Cliente</TableHead>
                    <TableHead>Nombre/Razón Social</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.userId}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.type === "natural" ? "Natural" : "Jurídica"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(client.status)}`}
                        >
                          {client.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(client.lastUpdated).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/backoffice/clients/${client.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
