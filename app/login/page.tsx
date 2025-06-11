"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useLoading } from "@/app/loading-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, Lock, User, ArrowLeft, Loader2, Calendar, Clock, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Mock users data
const mockUsers = [
  {
    username: "12345678",
    password: "Pepito123!",
    type: "natural",
    name: "Pepito Pérez",
  },
  {
    username: "J-12345678-9",
    password: "Empresa123!",
    type: "juridica",
    name: "Tecnología Avanzada C.A.",
  },
  {
    username: "87654321",
    password: "Maria456!",
    type: "natural",
    name: "María González",
  },
]

// Interface for confirmed appointment data
interface ConfirmedAppointment {
  id: string
  userId: string
  clientType: "natural" | "juridica"
  fecha: string
  hora: string
  agenciaNombre: string
  agenciaDireccion: string
  clientEmail: string
  bankEmail: string
  createdAt: number
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const { setLoading } = useLoading();

  // Helper para mostrar loader en cualquier acción relevante
  const showLoader = (message: string) => setLoading(true, message);
  const hideLoader = () => setLoading(false);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [confirmedAppointment, setConfirmedAppointment] = useState<ConfirmedAppointment | null>(null)

  useEffect(() => {
    // Check for existing confirmed appointment on component mount
    const storedAppointment = localStorage.getItem("bbva_confirmed_appointment")
    if (storedAppointment) {
      const appt: ConfirmedAppointment = JSON.parse(storedAppointment)
      // Optional: Check if appointment is still relevant (e.g., not in the past)
      // For simplicity, we'll just show it if it exists.
      setConfirmedAppointment(appt)
      setShowAppointmentModal(true)
      console.log(`[TRACKING] Cita confirmada encontrada al cargar login para usuario: ${appt.userId}`)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    showLoader("Verificando credenciales...");
    e.preventDefault()
    setError("")
    setLoading(true, "Verificando credenciales...");
    console.log("[TRACKING] Intento de inicio de sesión iniciado.")

    // Validation
    if (!username.trim()) {
      setError("El número de documento es obligatorio")
      setLoading(false);
      console.log("[TRACKING] Inicio de sesión fallido: Número de documento vacío.")
      return
    }

    if (!password.trim()) {
      setError("La contraseña es obligatoria")
      setLoading(false);
      console.log("[TRACKING] Inicio de sesión fallido: Contraseña vacía.")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false);
      console.log("[TRACKING] Inicio de sesión fallido: Contraseña muy corta.")
      return
    }

    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find((u) => u.username === username && u.password === password)

      if (user) {
        // Check if this specific user has a confirmed appointment
        const storedAppointment = localStorage.getItem("bbva_confirmed_appointment")
        if (storedAppointment) {
          const appt: ConfirmedAppointment = JSON.parse(storedAppointment)
          if (appt.userId === user.username) {
            setConfirmedAppointment(appt)
            setShowAppointmentModal(true)
            toast({
              title: "Cita Pendiente",
              description: "Ya tienes una cita agendada. Revisa los detalles.",
              variant: "default",
            })
            console.log(`[TRACKING] Usuario ${user.username} inició sesión y tiene una cita confirmada.`)
            // Do not redirect immediately, let the modal show. The client page will handle disabling.
            localStorage.setItem("bbva_user", JSON.stringify(user)) // Still log in the user
            window.location.href = user.type === "natural" ? "/cliente-natural" : "/cliente-juridico"
            return
          }
        }

        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido/a ${user.name}`,
        })

        // Tracking: Successful login
        console.log(`[TRACKING] Inicio de sesión exitoso para ${user.type}: ${user.name} (${user.username})`)

        // Store user data and redirect
        localStorage.setItem("bbva_user", JSON.stringify(user))
        window.location.href = user.type === "natural" ? "/cliente-natural" : "/cliente-juridico"
      } else {
        setError("Credenciales incorrectas. Verifique su documento y contraseña.")
        toast({
          title: "Error de autenticación",
          description: "Las credenciales ingresadas no son válidas",
          variant: "destructive",
        })
        // Tracking: Failed login
        console.log(`[TRACKING] Intento de inicio de sesión fallido para usuario: ${username}`)
        hideLoader();
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* BBVA Logo and Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <div className="text-blue-900 font-bold text-2xl">BBVA</div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Solicitud de Cuenta</h1>
          <p className="text-blue-200">Acceso seguro al sistema de solicitudes</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-blue-900 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-blue-900 font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Número de Documento
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ej: 12345678 o J-12345678-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-900 font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5"
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Credenciales de Prueba:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Persona Natural:</strong> 12345678 / Pepito123!
                </p>
                <p>
                  <strong>Persona Jurídica:</strong> J-12345678-9 / Empresa123!
                </p>
                <p>
                  <strong>Otra Natural:</strong> 87654321 / Maria456!
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Sistema seguro protegido con encriptación SSL</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-blue-200 text-sm">
          <p>© 2024 BBVA. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Modal de Cita Confirmada */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="h-6 w-6 text-blue-600" />
              ¡Cita Agendada!
            </DialogTitle>
            <DialogDescription>
              Estimado/a {confirmedAppointment?.clientType === "natural" ? "cliente" : "empresa"}, ya tienes una cita
              confirmada con BBVA.
            </DialogDescription>
          </DialogHeader>
          {confirmedAppointment && (
            <div className="grid gap-4 py-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <strong>Fecha:</strong> {confirmedAppointment.fecha}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <strong>Hora:</strong> {confirmedAppointment.hora}
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <strong>Agencia:</strong> {confirmedAppointment.agenciaNombre} ({confirmedAppointment.agenciaDireccion})
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">Notificaciones de Correo:</p>
                <p className="text-xs text-blue-700 mt-1">
                  Se envió un correo de confirmación a:{" "}
                  <span className="font-semibold">{confirmedAppointment.clientEmail}</span>
                </p>
                <p className="text-xs text-blue-700">
                  Se notificó al banco a: <span className="font-semibold">{confirmedAppointment.bankEmail}</span>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowAppointmentModal(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
