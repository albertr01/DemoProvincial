"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getClientApplications } from "@/lib/backoffice-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock, Users, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const [clientStats, setClientStats] = useState({
    total: 0,
    incompleta: 0,
    pendiente_aprobacion: 0,
    aprobada: 0,
    rechazada: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const clients = getClientApplications()
    const stats = {
      total: clients.length,
      incompleta: clients.filter((c) => c.status === "incompleta").length,
      pendiente_aprobacion: clients.filter((c) => c.status === "pendiente_aprobacion").length,
      aprobada: clients.filter((c) => c.status === "aprobada").length,
      rechazada: clients.filter((c) => c.status === "rechazada").length,
    }
    setClientStats(stats)
    setLoading(false)
  }, [])

  const chartData = [
    { name: "Incompleta", value: clientStats.incompleta, fill: "#94a3b8" }, // slate-400
    { name: "Pendiente", value: clientStats.pendiente_aprobacion, fill: "#facc15" }, // yellow-500
    { name: "Aprobada", value: clientStats.aprobada, fill: "#22c55e" }, // green-500
    { name: "Rechazada", value: clientStats.rechazada, fill: "#ef4444" }, // red-500
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Clock className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Dashboard del Backoffice</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
            <p className="text-xs text-gray-500">Solicitudes de clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.pendiente_aprobacion}</div>
            <p className="text-xs text-gray-500">Solicitudes por revisar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.aprobada}</div>
            <p className="text-xs text-gray-500">Solicitudes aprobadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.rechazada}</div>
            <p className="text-xs text-gray-500">Solicitudes rechazadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Estado de Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
