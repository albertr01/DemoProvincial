"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  Shield,
  Clock,
  Users,
  FileText,
  Search,
  Menu,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-blue-900 font-bold text-xl sm:text-2xl">
                BBVA <span className="font-normal">Provincial</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-900 px-3 py-2 text-sm font-medium">
                Personas
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-900 px-3 py-2 text-sm font-medium">
                Empresas
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="text-blue-900 hover:text-blue-700">
                Regístrate
              </Button>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white">Acceso</Button>
              <Link href="/login">
                <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50">
                  Solicitud
                </Button>
              </Link>
              <Link href="/backoffice/login">
                <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-50">
                  Backoffice
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-bg.jpg')",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            {/* Hero Content */}
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Bienvenido a BBVA Provincial</h1>
              <p className="text-xl text-gray-200 mb-8">Tu banco de confianza para el crecimiento financiero</p>
              <Link href="/login">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                  Solicitar Ahora
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="todas">Todas las cuentas</TabsTrigger>
              <TabsTrigger value="ahorro">Cuentas de ahorro</TabsTrigger>
              <TabsTrigger value="corrientes">Cuentas corrientes</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <CreditCard className="h-6 w-6 text-blue-900" />
                    </div>
                    <CardTitle className="text-blue-900">Cuenta Corriente Premium</CardTitle>
                    <CardDescription>
                      Para personas que buscan servicios bancarios completos y exclusivos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li>• Sin comisión de mantenimiento</li>
                      <li>• Tarjeta de débito internacional</li>
                      <li>• Banca en línea y móvil</li>
                      <li>• Asesoría personalizada</li>
                    </ul>
                    <Link href="/login">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800">Solicitar Ahora</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <PiggyBank className="h-6 w-6 text-green-700" />
                    </div>
                    <CardTitle className="text-blue-900">Cuenta de Ahorro</CardTitle>
                    <CardDescription>
                      Ideal para ahorrar y hacer crecer tu dinero con excelentes rendimientos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li>• Rendimientos competitivos</li>
                      <li>• Acceso 24/7 a tu dinero</li>
                      <li>• Sin monto mínimo</li>
                      <li>• Protección FOGADE</li>
                    </ul>
                    <Link href="/login">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800">Solicitar Ahora</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-purple-700" />
                    </div>
                    <CardTitle className="text-blue-900">Cuenta Empresarial</CardTitle>
                    <CardDescription>
                      Soluciones financieras diseñadas para el crecimiento de tu empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li>• Múltiples usuarios autorizados</li>
                      <li>• Transferencias masivas</li>
                      <li>• Reportes detallados</li>
                      <li>• Líneas de crédito</li>
                    </ul>
                    <Link href="/login">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800">Solicitar Ahora</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ahorro">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <PiggyBank className="h-6 w-6 text-green-700" />
                    </div>
                    <CardTitle className="text-blue-900">Ahorro Tradicional</CardTitle>
                    <CardDescription>La cuenta de ahorro clásica con todos los beneficios BBVA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/login">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800">Solicitar Ahora</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-yellow-700" />
                    </div>
                    <CardTitle className="text-blue-900">Ahorro Plus</CardTitle>
                    <CardDescription>Mayor rendimiento para tus ahorros con beneficios adicionales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/login">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800">Solicitar Ahora</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="corrientes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <CreditCard className="h-6 w-6 text-blue-900" />
                    </div>
                    <CardTitle className="text-blue-900">Corriente Estándar</CardTitle>
                    <CardDescription>Para el manejo diario de tus finanzas personales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/login">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800">Solicitar Ahora</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-purple-700" />
                    </div>
                    <CardTitle className="text-blue-900">Corriente Premium</CardTitle>
                    <CardDescription>Servicios exclusivos y beneficios únicos para clientes VIP</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/login">
                      <Button className="w-full bg-blue-900 hover:bg-blue-800">Solicitar Ahora</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">¿Por qué elegir BBVA Provincial?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más de 60 años de experiencia respaldando tus sueños y proyectos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-900" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Seguridad</h3>
              <p className="text-gray-600">Tecnología de punta para proteger tu dinero y datos personales</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Disponibilidad 24/7</h3>
              <p className="text-gray-600">Accede a tus cuentas cuando quieras, donde quieras</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Atención Personalizada</h3>
              <p className="text-gray-600">Ejecutivos especializados para atender todas tus necesidades</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-yellow-700" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Proceso Ágil</h3>
              <p className="text-gray-600">Solicitud 100% digital con respuesta inmediata</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Listo para abrir tu cuenta?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Completa tu solicitud en línea y recibe una respuesta inmediata. El proceso es 100% digital y seguro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                Iniciar Solicitud
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
              Contactar Asesor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-white font-bold text-xl mb-4">
                BBVA <span className="font-normal">Provincial</span>
              </div>
              <p className="text-gray-400">Tu banco de confianza desde 1953</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Productos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Cuentas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Tarjetas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Préstamos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Inversiones
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ayuda</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Ubicaciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Reclamos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Defensa del Usuario
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BBVA Provincial. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
