"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  getClientTrackingMetrics, 
  getAppointmentTrackingMetrics,
  type ClientTrackingMetrics,
  type AppointmentTrackingMetrics 
} from "@/lib/backoffice-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  FileText,
  Target,
  Activity,
  Timer,
  UserCheck,
  CalendarCheck,
  CalendarX,
  CalendarClock
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [clientMetrics, setClientMetrics] = useState<ClientTrackingMetrics | null>(null)
  const [appointmentMetrics, setAppointmentMetrics] = useState<AppointmentTrackingMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simulate loading time
    setTimeout(() => {
      const clientData = getClientTrackingMetrics()
      const appointmentData = getAppointmentTrackingMetrics()
      setClientMetrics(clientData)
      setAppointmentMetrics(appointmentData)
      setLoading(false)
      console.log("[BACKOFFICE_TRACKING] Dashboard cargado con métricas detalladas")
    }, 500)
  }, [])

  if (loading || !clientMetrics || !appointmentMetrics) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Clock className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Cargando dashboard...</p>
      </div>
    )
  }

  // Prepare chart data
  const clientStatusData = [
    { name: "Incompletas", value: clientMetrics.fichasIncompletas, fill: "#94a3b8" },
    { name: "Pendientes", value: clientMetrics.fichasPendientes, fill: "#facc15" },
    { name: "Aprobadas", value: clientMetrics.fichasAprobadas, fill: "#22c55e" },
    { name: "Rechazadas", value: clientMetrics.fichasRechazadas, fill: "#ef4444" },
  ]

  const appointmentStatusData = [
    { name: "Agendadas", value: appointmentMetrics.citasAgendadas, fill: "#3b82f6" },
    { name: "Procesadas", value: appointmentMetrics.citasProcesadas, fill: "#f59e0b" },
    { name: "Completadas", value: appointmentMetrics.citasCompletadas, fill: "#10b981" },
    { name: "Canceladas", value: appointmentMetrics.citasCanceladas, fill: "#ef4444" },
  ]

  const timelineData = [
    { period: "Hoy", fichas: clientMetrics.fichasHoy, citas: appointmentMetrics.citasHoy },
    { period: "Esta Semana", fichas: clientMetrics.fichasEstaSemana, citas: appointmentMetrics.citasEstaSemana },
    { period: "Este Mes", fichas: clientMetrics.fichasEsteMes, citas: appointmentMetrics.citasEsteMes },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-900">Dashboard del Backoffice</h1>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="clients">Tracking de Fichas</TabsTrigger>
          <TabsTrigger value="appointments">Tracking de Citas</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fichas</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.totalFichas}</div>
                <p className="text-xs text-gray-500">
                  {clientMetrics.fichasHoy} nuevas hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.totalCitas}</div>
                <p className="text-xs text-gray-500">
                  {appointmentMetrics.citasHoy} para hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa Aprobación</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.tasaAprobacion.toFixed(1)}%</div>
                <p className="text-xs text-gray-500">Fichas aprobadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa Completación</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.tasaCompletacion.toFixed(1)}%</div>
                <p className="text-xs text-gray-500">Citas completadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Estado de Fichas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clientStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {clientStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Estado de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentStatusData}>
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

          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Tendencia Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="fichas" stroke="#3b82f6" name="Fichas" />
                    <Line type="monotone" dataKey="citas" stroke="#10b981" name="Citas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incompletas</CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.fichasIncompletas}</div>
                <p className="text-xs text-gray-500">Fichas sin completar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.fichasPendientes}</div>
                <p className="text-xs text-gray-500">Por revisar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.fichasAprobadas}</div>
                <p className="text-xs text-gray-500">Fichas aprobadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.fichasRechazadas}</div>
                <p className="text-xs text-gray-500">Fichas rechazadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Timer className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.promedioTiempoProcesamiento.toFixed(1)}h</div>
                <p className="text-xs text-gray-500">Procesamiento</p>
              </CardContent>
            </Card>
          </div>

          {/* Client Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fichas Hoy</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.fichasHoy}</div>
                <p className="text-xs text-gray-500">Nuevas solicitudes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.fichasEstaSemana}</div>
                <p className="text-xs text-gray-500">Últimos 7 días</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.fichasEsteMes}</div>
                <p className="text-xs text-gray-500">Últimos 30 días</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Client Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Distribución Detallada de Fichas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          {/* Appointment Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
                <CalendarClock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.citasAgendadas}</div>
                <p className="text-xs text-gray-500">Citas programadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Procesadas</CardTitle>
                <UserCheck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.citasProcesadas}</div>
                <p className="text-xs text-gray-500">En proceso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <CalendarCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.citasCompletadas}</div>
                <p className="text-xs text-gray-500">Finalizadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                <CalendarX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.citasCanceladas}</div>
                <p className="text-xs text-gray-500">No realizadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.citasHoy}</div>
                <p className="text-xs text-gray-500">Programadas para hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.citasEstaSemana}</div>
                <p className="text-xs text-gray-500">Últimos 7 días</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.citasEsteMes}</div>
                <p className="text-xs text-gray-500">Últimos 30 días</p>
              </CardContent>
            </Card>
          </div>

          {/* Cancellation Reasons */}
          {Object.keys(appointmentMetrics.motivosCancelacion).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Motivos de Cancelación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(appointmentMetrics.motivosCancelacion).map(([reason, count]) => (
                    <div key={reason} className="flex justify-between items-center">
                      <span className="text-sm">{reason}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Appointment Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Estado de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Procesamiento</CardTitle>
                <Timer className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.promedioTiempoProcesamiento.toFixed(1)}h</div>
                <p className="text-xs text-gray-500">Promedio fichas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Atención</CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.promedioTiempoAtencion.toFixed(0)}min</div>
                <p className="text-xs text-gray-500">Promedio citas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia Fichas</CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientMetrics.tasaAprobacion.toFixed(1)}%</div>
                <p className="text-xs text-gray-500">Tasa aprobación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia Citas</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointmentMetrics.tasaCompletacion.toFixed(1)}%</div>
                <p className="text-xs text-gray-500">Tasa completación</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Tendencias de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="fichas" 
                      stroke="#3b82f6" 
                      name="Fichas Nuevas"
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="citas" 
                      stroke="#10b981" 
                      name="Citas Nuevas"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">KPIs de Fichas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Procesadas:</span>
                  <span className="font-semibold">{clientMetrics.fichasAprobadas + clientMetrics.fichasRechazadas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasa de Aprobación:</span>
                  <span className="font-semibold text-green-600">{clientMetrics.tasaAprobacion.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo Promedio:</span>
                  <span className="font-semibold">{clientMetrics.promedioTiempoProcesamiento.toFixed(1)} horas</span>
                </div>
                <div className="flex justify-between">
                  <span>Pendientes de Revisión:</span>
                  <span className="font-semibold text-yellow-600">{clientMetrics.fichasPendientes}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">KPIs de Citas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Finalizadas:</span>
                  <span className="font-semibold">{appointmentMetrics.citasProcesadas + appointmentMetrics.citasCompletadas + appointmentMetrics.citasCanceladas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasa de Completación:</span>
                  <span className="font-semibold text-green-600">{appointmentMetrics.tasaCompletacion.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo Promedio:</span>
                  <span className="font-semibold">{appointmentMetrics.promedioTiempoAtencion.toFixed(0)} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span>Citas Agendadas:</span>
                  <span className="font-semibold text-blue-600">{appointmentMetrics.citasAgendadas}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}