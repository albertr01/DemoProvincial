"use client"

import { CardFooter } from "@/components/ui/card"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getClientApplications,
  updateClientApplicationStatus,
  getConfirmedAppointments,
  saveClientApplication,
} from "@/lib/backoffice-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  Calendar,
  Building,
  User,
  Users,
  TrendingUp,
  CreditCard,
  X,
  Edit,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Import Tabs components
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState("")
  const [currentDocumentName, setCurrentDocumentName] = useState("")
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null)

  useEffect(() => {
    if (clientId) {
      const clients = getClientApplications()
      const foundClient = clients.find((c) => c.id === clientId)
      if (foundClient) {
        setClient(foundClient)
        console.log("[BACKOFFICE_TRACKING] Detalles del cliente cargados:", foundClient)
        // Show appointment details ONLY if progress is 100%
        if (foundClient.progressPercentage === 100) {
          const appointments = getConfirmedAppointments()
          const foundAppointment = appointments.find((a) => a.clientId === clientId)
          if (foundAppointment) {
            setAppointmentDetails(foundAppointment)
            console.log("[BACKOFFICE_TRACKING] Detalles de cita agendada cargados:", foundAppointment)
          }
        }
      } else {
        console.log(`[BACKOFFICE_TRACKING] Cliente con ID ${clientId} no encontrado.`)
        // Optionally redirect to clients list or show a not found message
      }
      setLoading(false)
    }
  }, [clientId])

  const handleStatusUpdate = (status: "aprobada" | "rechazada") => {
    setIsUpdatingStatus(true)
    console.log(`[BACKOFFICE_TRACKING] Intento de actualizar estado del cliente ${clientId} a: ${status}.`)
    setTimeout(() => {
      if (status === "rechazada" && !rejectionReason.trim()) {
        alert("Por favor, ingrese un motivo de rechazo.")
        setIsUpdatingStatus(false)
        return
      }

      const success = updateClientApplicationStatus(clientId, status)
      if (success) {
        // Update client data in state
        setClient((prev: any) => ({
          ...prev,
          status: status,
          formData: {
            ...prev.formData,
            rejectionReason: status === "rechazada" ? rejectionReason : undefined,
          },
        }))
        // Also update the formData in localStorage for persistence
        const allClients = getClientApplications()
        const clientIndex = allClients.findIndex((c) => c.id === clientId)
        if (clientIndex !== -1) {
          allClients[clientIndex].formData = {
            ...allClients[clientIndex].formData,
            rejectionReason: status === "rechazada" ? rejectionReason : undefined,
          }
          saveClientApplication(allClients[clientIndex]) // Use saveClientApplication to update
        }

        console.log(`[BACKOFFICE_TRACKING] Estado del cliente ${clientId} actualizado a: ${status}.`)
        setShowRejectionDialog(false) // Close dialog if approved or reason provided
        setRejectionReason("") // Clear rejection reason
      } else {
        console.error(`[BACKOFFICE_TRACKING] Fallo al actualizar estado del cliente ${clientId}.`)
      }
      setIsUpdatingStatus(false)
    }, 1000)
  }

  const handleEditClient = () => {
    if (client) {
      const targetPath = client.type === "natural" ? "/cliente-natural" : "/cliente-juridico"
      router.push(`${targetPath}?clientId=${client.id}`)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "aprobada":
        return "default" // Green by default
      case "rechazada":
        return "destructive" // Red
      case "pendiente_aprobacion":
        return "secondary" // Grey/Yellow
      case "incompleta":
      default:
        return "outline" // Light grey
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "aprobada":
        return "bg-green-500 hover:bg-green-600 text-white"
      case "rechazada":
        return "bg-red-500 hover:bg-red-600 text-white"
      case "pendiente_aprobacion":
        return "bg-yellow-500 hover:bg-yellow-600 text-white"
      case "incompleta":
      default:
        return "bg-gray-400 hover:bg-gray-500 text-white"
    }
  }

  const renderField = (label: string, value: any) => {
    if (value === undefined || value === null || value === "") {
      return null // Don't render if value is empty
    }
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-base font-semibold text-gray-900">{String(value)}</span>
      </div>
    )
  }

  const renderSection = (title: string, data: any, icon: React.ReactNode) => {
    if (!data || Object.keys(data).length === 0) return null

    const fieldsToRender: { label: string; key: string }[] = []

    // Dynamically determine fields based on client type and section
    if (client.type === "natural") {
      switch (title) {
        case "Datos de la Institución":
          fieldsToRender.push(
            { label: "Nombre", key: "name" },
            { label: "RIF", key: "fiscalId" },
            { label: "Sucursal", key: "branch" },
            { label: "Gerente", key: "managerName" },
            { label: "Ejecutivo", key: "executiveName" },
          )
          break
        case "Datos Personales":
          fieldsToRender.push(
            { label: "Tipo Doc.", key: "documentType" },
            { label: "N° Doc.", key: "documentNumber" },
            { label: "Nombres", key: "names" },
            { label: "Apellidos", key: "lastNames" },
            { label: "F. Nac.", key: "birthDate" },
            { label: "L. Nac.", key: "birthPlace" },
            { label: "Nacionalidad", key: "nationality" },
            { label: "Género", key: "gender" },
            { label: "Profesión", key: "profession" },
            { label: "E. Civil", key: "civilStatus" },
            { label: "Teléfono", key: "phone" },
            { label: "Dirección", key: "address" },
            { label: "Email", key: "email" },
            { label: "Vivienda", key: "housingCondition" },
          )
          break
        case "Referencias":
          fieldsToRender.push(
            { label: "Banco Ref.", key: "bankName" },
            { label: "Tipo Cta.", key: "bankAccountType" },
            { label: "N° Cta.", key: "bankAccountNumber" },
            { label: "Antigüedad Cta.", key: "bankAccountYears" },
            { label: "Ref. Personal", key: "personalReferenceName" },
            { label: "Tel. Ref. Personal", key: "personalReferencePhone" },
            { label: "Relación Ref.", key: "personalReferenceRelation" },
          )
          break
        case "Información Económica":
          fieldsToRender.push(
            { label: "Ocupación", key: "currentOccupation" },
            { label: "Empresa", key: "companyName" },
            { label: "Cargo", key: "position" },
            { label: "Antigüedad Emp.", key: "yearsInCompany" },
            { label: "Tel. Empresa", key: "companyPhone" },
            { label: "Dir. Empresa", key: "companyAddress" },
            { label: "Ing. Mensuales", key: "monthlyIncome" },
            { label: "Otros Ing.", key: "otherIncome" },
            { label: "Total Ing.", key: "totalIncome" },
          )
          break
        case "Producto Bancario":
          fieldsToRender.push(
            { label: "Tipo Producto", key: "productType" },
            { label: "Moneda", key: "currency" },
            { label: "Monto Promedio", key: "averageMonthlyAmount" },
            { label: "Origen Fondos", key: "fundsOrigin" },
            { label: "Propósito Cta.", key: "accountPurpose" },
            { label: "Trans. Estimadas", key: "estimatedMonthlyTransactions" },
            { label: "Monto Trans. Prom.", key: "averageTransactionAmount" },
            { label: "Trans. Intl.", key: "internationalTransactions" },
          )
          break
      }
    } else if (client.type === "juridica") {
      switch (title) {
        case "Datos de la Institución":
          fieldsToRender.push(
            { label: "Nombre", key: "nombre" },
            { label: "RIF", key: "registroFiscal" },
            { label: "Sucursal", key: "sucursal" },
            { label: "Gerente", key: "gerente" },
            { label: "Ejecutivo", key: "ejecutivo" },
          )
          break
        case "Datos de Identificación de la Empresa":
          fieldsToRender.push(
            { label: "RIF", key: "registroFiscal" },
            { label: "Razón Social", key: "razonSocial" },
            { label: "Nombre Comercial", key: "nombreComercial" },
            { label: "Act. Económica", key: "actividadEconomica" },
            { label: "Act. Específica", key: "actividadEspecifica" },
            { label: "Categoría Especial", key: "categoriaEspecial" },
            { label: "Teléfonos", key: "telefonos" },
            { label: "Sitio Web", key: "sitioWeb" },
            { label: "Correo", key: "correo" },
          )
          // Handle nested objects for juridical person
          if (data.datosRegistro) {
            fieldsToRender.push(
              { label: "Reg. Nombre", key: "datosRegistro.nombre" },
              { label: "Reg. Número", key: "datosRegistro.numero" },
              { label: "Reg. Tomo", key: "datosRegistro.tomo" },
              { label: "Reg. Folio", key: "datosRegistro.folio" },
              { label: "Reg. Fecha", key: "datosRegistro.fecha" },
              { label: "Reg. Capital Social", key: "datosRegistro.capitalSocial" },
            )
          }
          if (data.ultimaModificacion) {
            fieldsToRender.push(
              { label: "Últ. Mod. Nombre", key: "ultimaModificacion.nombre" },
              { label: "Últ. Mod. Número", key: "ultimaModificacion.numero" },
              { label: "Últ. Mod. Tomo", key: "ultimaModificacion.tomo" },
              { label: "Últ. Mod. Folio", key: "ultimaModificacion.folio" },
              { label: "Últ. Mod. Fecha", key: "ultimaModificacion.fecha" },
              { label: "Últ. Mod. Capital Actual", key: "ultimaModificacion.capitalActual" },
            )
          }
          if (data.entesPublicos) {
            fieldsToRender.push(
              { label: "Gaceta Oficial", key: "entesPublicos.numeroGaceta" },
              { label: "Fecha Gaceta", key: "entesPublicos.fecha" },
              { label: "Autoridad Adscripción", key: "entesPublicos.autoridadAdscripcion" },
              { label: "Código ONT", key: "entesPublicos.codigoOnt" },
            )
          }
          if (data.direccion) {
            fieldsToRender.push(
              { label: "Edificio", key: "direccion.edificio" },
              { label: "Piso", key: "direccion.piso" },
              { label: "Oficina", key: "direccion.oficina" },
              { label: "Local", key: "direccion.local" },
              { label: "Calle/Av.", key: "direccion.calle" },
              { label: "Urbanización", key: "direccion.urbanizacion" },
              { label: "Municipio", key: "direccion.municipio" },
              { label: "Ciudad", key: "direccion.ciudad" },
              { label: "Estado", key: "direccion.estado" },
              { label: "Cód. Postal", key: "direccion.codigoPostal" },
              { label: "N° Fax", key: "direccion.numeroFax" },
            )
          }
          break
        case "Información Económica":
          // Simplified for display, actual data might be arrays
          if (data.accionistas && data.accionistas.length > 0) {
            fieldsToRender.push({ label: "Accionista 1", key: "accionistas.0.nombre" })
          }
          if (data.subsidiarias) {
            fieldsToRender.push(
              { label: "N° Subsidiarias", key: "subsidiarias.numeroSubsidiarias" },
              { label: "País Mayor Presencia", key: "subsidiarias.paisMayorPresencia" },
              { label: "N° Empleados", key: "subsidiarias.numeroEmpleados" },
              { label: "Ventas Mensuales", key: "subsidiarias.ventasMensuales" },
              { label: "Ingresos Mensuales", key: "subsidiarias.ingresosMensuales" },
              { label: "Egresos Mensuales", key: "subsidiarias.egresosMensuales" },
            )
          }
          if (data.referenciasBancarias && data.referenciasBancarias.length > 0) {
            fieldsToRender.push({ label: "Ref. Bancaria 1", key: "referenciasBancarias.0.institucionSectorBancario" })
          }
          break
        case "Producto Bancario":
          fieldsToRender.push(
            { label: "Nombre Producto", key: "nombre" },
            { label: "N° Producto", key: "numeroProducto" },
            { label: "Moneda", key: "moneda" },
            { label: "Monto Promedio", key: "montoPromedio" },
            { label: "Trans. Mensuales", key: "transaccionesMensuales" },
            { label: "Crédito", key: "credito" },
            { label: "Débito", key: "debito" },
            { label: "País Origen", key: "paisOrigen" },
            { label: "País Destino", key: "paisDestino" },
            { label: "Uso Moneda Virtual", key: "usoMonedaVirtual" },
          )
          break
      }
    }

    return (
      <Card className="mb-4">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-blue-900 flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fieldsToRender.map((field) => {
            // Handle nested keys like "datosRegistro.nombre"
            const keys = field.key.split(".")
            let value = data
            for (const k of keys) {
              if (value && typeof value === "object" && k in value) {
                value = value[k]
              } else {
                value = undefined // Path not found
                break
              }
            }
            return renderField(field.label, value)
          })}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Clock className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Cargando detalles del cliente...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Cliente no encontrado.</p>
      </div>
    )
  }

  const clientData = client.formData || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()} className="text-blue-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
        <h1 className="text-3xl font-bold text-blue-900">Detalles del Cliente</h1>
        <Badge className={`text-lg px-4 py-2 ${getStatusBadgeColor(client.status)}`}>
          Estado: {client.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Información General</CardTitle>
          <CardDescription>
            Detalles de la solicitud de {client.type === "natural" ? "Persona Natural" : "Persona Jurídica"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderField("ID de Solicitud", client.id)}
          {renderField("Usuario (RIF/Cédula)", client.userId)}
          {renderField("Nombre/Razón Social", client.name)}
          {renderField("Tipo de Cliente", client.type === "natural" ? "Natural" : "Jurídica")}
          {renderField("Fecha de Creación", new Date(client.createdAt).toLocaleDateString())}
          {renderField("Última Actualización", new Date(client.lastUpdated).toLocaleDateString())}
        </CardContent>
        {client.status === "rechazada" && client.formData?.rejectionReason && (
          <CardFooter className="bg-red-50 p-4 border-t border-red-200 text-red-800">
            <p className="font-medium">Motivo de Rechazo: {client.formData.rejectionReason}</p>
          </CardFooter>
        )}
      </Card>

      {/* Conditionally render appointment details: ONLY if progress is 100% */}
      {client.progressPercentage === 100 && appointmentDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalles de Cita Agendada
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField("Fecha", appointmentDetails.fecha)}
            {renderField("Hora", appointmentDetails.hora)}
            {renderField("Agencia", appointmentDetails.agenciaNombre)}
            {renderField("Dirección Agencia", appointmentDetails.agenciaDireccion)}
            {renderField("Email Cliente", appointmentDetails.clientEmail)}
            {renderField("Email Banco", appointmentDetails.bankEmail)}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={client.type === "natural" ? "institutionData" : "institucion"} className="w-full">
        <TabsList className={`grid w-full grid-cols-${client.type === "natural" ? 5 : 4} bg-blue-100`}>
          {client.type === "natural" ? (
            <>
              <TabsTrigger value="institutionData">
                <Building className="h-4 w-4 mr-2" /> Institución
              </TabsTrigger>
              <TabsTrigger value="personalData">
                <User className="h-4 w-4 mr-2" /> Personal
              </TabsTrigger>
              <TabsTrigger value="referenceData">
                <Users className="h-4 w-4 mr-2" /> Referencias
              </TabsTrigger>
              <TabsTrigger value="economicData">
                <TrendingUp className="h-4 w-4 mr-2" /> Económica
              </TabsTrigger>
              <TabsTrigger value="productData">
                <CreditCard className="h-4 w-4 mr-2" /> Producto
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="institucion">
                <Building className="h-4 w-4 mr-2" /> Institución
              </TabsTrigger>
              <TabsTrigger value="identificacion">
                <User className="h-4 w-4 mr-2" /> Identificación
              </TabsTrigger>
              <TabsTrigger value="economica">
                <TrendingUp className="h-4 w-4 mr-2" /> Económica
              </TabsTrigger>
              <TabsTrigger value="producto">
                <CreditCard className="h-4 w-4 mr-2" /> Producto
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {client.type === "natural" ? (
          <>
            <TabsContent value="institutionData">
              {renderSection("Datos de la Institución", clientData.institutionData, <Building className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="personalData">
              {renderSection("Datos Personales", clientData.personalData, <User className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="referenceData">
              {renderSection("Referencias", clientData.referenceData, <Users className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="economicData">
              {renderSection("Información Económica", clientData.economicData, <TrendingUp className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="productData">
              {renderSection("Producto Bancario", clientData.productData, <CreditCard className="h-5 w-5" />)}
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="institucion">
              {renderSection("Datos de la Institución", clientData.institucion, <Building className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="identificacion">
              {renderSection(
                "Datos de Identificación de la Empresa",
                clientData.identificacion,
                <User className="h-5 w-5" />,
              )}
            </TabsContent>
            <TabsContent value="economica">
              {renderSection("Información Económica", clientData.economica, <TrendingUp className="h-5 w-5" />)}
            </TabsContent>

            <TabsContent value="producto">
              {renderSection("Producto Bancario", clientData.producto, <CreditCard className="h-5 w-5" />)}
            </TabsContent>
          </>
        )}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Subidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {client.uploadedDocuments && client.uploadedDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.uploadedDocuments.map((doc: any, index: number) => (
                <div key={index} className="border rounded-md p-3 flex items-center justify-between bg-gray-50">
                  <span className="text-sm font-medium text-gray-800 truncate">{doc.name}</span>
                  <Dialog
                    open={showDocumentModal && currentDocumentUrl === doc.url}
                    onOpenChange={setShowDocumentModal}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentDocumentUrl(doc.url)
                          setCurrentDocumentName(doc.name)
                          setShowDocumentModal(true)
                        }}
                      >
                        Ver
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] w-[90vw] h-[90vh] flex flex-col">
                      <DialogHeader className="relative">
                        <DialogTitle>{currentDocumentName}</DialogTitle>
                        <DialogDescription>Previsualización del documento.</DialogDescription>
                        <DialogClose asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4"
                            onClick={() => setShowDocumentModal(false)}
                          >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Cerrar</span>
                          </Button>
                        </DialogClose>
                      </DialogHeader>
                      <div className="flex-grow flex items-center justify-center bg-gray-100 p-2 rounded-md">
                        {/* Using an img tag for placeholder, in a real app this would be an iframe or PDF viewer */}
                        <img
                          src={currentDocumentUrl || "/placeholder.svg"}
                          alt={`Documento: ${currentDocumentName}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <DialogFooter className="flex justify-end p-4">
                        <Button asChild>
                          <a href={currentDocumentUrl} download={currentDocumentName}>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </a>
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay documentos subidos para este cliente.</p>
          )}
        </CardContent>
      </Card>

      <CardFooter className="flex justify-end gap-4 p-6 bg-gray-50 border-t">
        {client.status !== "aprobada" && client.status !== "rechazada" && (
          <>
            <Button variant="outline" onClick={handleEditClient} disabled={isUpdatingStatus}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Ficha
            </Button>
            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={isUpdatingStatus}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar Solicitud
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rechazar Solicitud</DialogTitle>
                  <DialogDescription>
                    Por favor, ingrese el motivo por el cual se rechaza esta solicitud.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="rejection-reason">Motivo de Rechazo</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ej: Documentación incompleta, información inconsistente, etc."
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rechazada")}
                    disabled={isUpdatingStatus || !rejectionReason.trim()}
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Rechazando...
                      </>
                    ) : (
                      "Confirmar Rechazo"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => handleStatusUpdate("aprobada")}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdatingStatus ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprobar Solicitud
                </>
              )}
            </Button>
          </>
        )}
        {client.status === "aprobada" && (
          <Button variant="secondary" disabled>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Solicitud Aprobada
          </Button>
        )}
        {client.status === "rechazada" && (
          <Button variant="secondary" disabled>
            <XCircle className="h-4 w-4 mr-2" />
            Solicitud Rechazada
          </Button>
        )}
        {client.status === "pendiente_aprobacion" && (
          <Button variant="secondary" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Pendiente de Aprobación
          </Button>
        )}
      </CardFooter>
    </div>
  )
}
