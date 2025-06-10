"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, User, Loader2 } from "lucide-react"
import { backofficeLogin } from "@/lib/backoffice-data"
import { useRouter } from "next/navigation"

export default function BackofficeLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    console.log("[BACKOFFICE_TRACKING] Intento de inicio de sesión de Backoffice iniciado.")

    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son obligatorios.")
      setIsLoading(false)
      console.log("[BACKOFFICE_TRACKING] Inicio de sesión fallido: Campos vacíos.")
      return
    }

    // Simulate API call
    setTimeout(() => {
      const success = backofficeLogin(username, password)
      if (success) {
        console.log("[BACKOFFICE_TRACKING] Inicio de sesión de Backoffice exitoso.")
        router.push("/backoffice")
      } else {
        setError("Credenciales incorrectas. Verifique su usuario y contraseña.")
        console.log("[BACKOFFICE_TRACKING] Inicio de sesión de Backoffice fallido: Credenciales incorrectas.")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <div className="text-blue-900 font-bold text-2xl">BBVA</div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Backoffice</h1>
          <p className="text-blue-200">Acceso para administradores</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-blue-900 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Ingrese sus credenciales de administrador
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
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
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
                    type="password"
                    placeholder="admin123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Credenciales de Prueba:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>Usuario:</strong> admin
                </p>
                <p>
                  <strong>Contraseña:</strong> admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-blue-200 text-sm">
          <p>© 2024 BBVA. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
