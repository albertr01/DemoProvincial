"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { PlusCircle, MinusCircle, Save, Clock, ChevronDown } from "lucide-react"
import {
  getBackofficeSettings,
  saveBackofficeSettings,
  type BackofficeSettings,
  ALL_BBVA_AGENCIES, // Import the master list of agencies
  type ParameterizedAgencySettings, // Import ParameterizedAgencySettings interface
} from "@/lib/backoffice-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Import Select

export default function BackofficeParametrizationPage() {
  const [settings, setSettings] = useState<BackofficeSettings>(getBackofficeSettings())
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false)

  useEffect(() => {
    setSettings(getBackofficeSettings())
    console.log("[BACKOFFICE_TRACKING] Página de Parametrización cargada.")
  }, [])

  const handleSaveSettings = () => {
    setIsLoading(true)
    console.log("[BACKOFFICE_TRACKING] Intento de guardar configuración de Backoffice.")
    setTimeout(() => {
      saveBackofficeSettings(settings)
      setIsLoading(false)
      setShowSaveSuccessModal(true)
      console.log("[BACKOFFICE_TRACKING] Configuración de Backoffice guardada exitosamente.", settings)
    }, 1000)
  }

  const handleAddAgency = (agencyId: string) => {
    // Check if agency is already parameterized
    if (settings.agencies.some((a) => a.id === agencyId)) {
      alert("Esta agencia ya ha sido añadida para parametrización.")
      return
    }

    setSettings((prev) => ({
      ...prev,
      agencies: [
        ...prev.agencies,
        {
          id: agencyId,
          maxAppointmentsPerDay: 5, // Default value
          availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00"], // Default hours
        },
      ],
    }))
    console.log(`[BACKOFFICE_TRACKING] Agencia ${agencyId} añadida para parametrización.`)
  }

  const handleRemoveAgency = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      agencies: prev.agencies.filter((agency) => agency.id !== id),
    }))
    console.log(`[BACKOFFICE_TRACKING] Agencia ${id} eliminada de la parametrización.`)
  }

  const handleAgencyParamChange = (agencyId: string, field: keyof ParameterizedAgencySettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      agencies: prev.agencies.map((agency) => (agency.id === agencyId ? { ...agency, [field]: value } : agency)),
    }))
  }

  const handleHoursChange = (agencyId: string, hours: string) => {
    setSettings((prev) => ({
      ...prev,
      agencies: prev.agencies.map((agency) =>
        agency.id === agencyId ? { ...agency, availableHours: hours.split(",").map((h) => h.trim()) } : agency,
      ),
    }))
  }

  const handleFieldVisibilityChange = (
    clientType: "natural" | "juridica",
    section: string,
    field: string,
    checked: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      fieldVisibility: {
        ...prev.fieldVisibility,
        [clientType]: {
          ...prev.fieldVisibility[clientType],
          [section]: {
            ...prev.fieldVisibility[clientType]?.[section],
            [field]: checked,
          },
        },
      },
    }))
  }

  // Define fields for Natural Person with Spanish labels and their corresponding keys
  const naturalPersonFieldDefinitions = {
    institutionData: {
      label: "Datos de la Institución",
      fields: [
        { key: "name", label: "Nombre de la Institución" },
        { key: "fiscalId", label: "RIF" },
        { key: "branch", label: "Sucursal o Agencia" },
        { key: "managerName", label: "Nombre del Gerente" },
        { key: "executiveName", label: "Nombre del Ejecutivo" },
      ],
    },
    personalData: {
      label: "Datos Personales",
      fields: [
        { key: "documentType", label: "Tipo de Documento" },
        { key: "documentNumber", label: "Número de Documento" },
        { key: "names", label: "Nombres" },
        { key: "lastNames", label: "Apellidos" },
        { key: "birthDate", label: "Fecha de Nacimiento" },
        { key: "birthPlace", label: "Lugar de Nacimiento" },
        { key: "nationality", label: "Nacionalidad" },
        { key: "gender", label: "Género" },
        { key: "profession", label: "Profesión u Oficio" },
        { key: "civilStatus", label: "Estado Civil" },
        { key: "phone", label: "Teléfono" },
        { key: "address", label: "Dirección" },
        { key: "email", label: "Correo Electrónico" },
        { key: "housingCondition", label: "Condición de Vivienda" },
      ],
    },
    referenceData: {
      label: "Referencias",
      fields: [
        { key: "bankName", label: "Institución Bancaria" },
        { key: "bankAccountType", label: "Tipo de Cuenta Bancaria" },
        { key: "bankAccountNumber", label: "Número de Cuenta Bancaria" },
        { key: "bankAccountYears", label: "Antigüedad Cuenta Bancaria" },
        { key: "personalReferenceName", label: "Nombre Referencia Personal" },
        { key: "personalReferencePhone", label: "Teléfono Referencia Personal" },
        { key: "personalReferenceRelation", label: "Relación Referencia Personal" },
      ],
    },
    economicData: {
      label: "Información Económica",
      fields: [
        { key: "currentOccupation", label: "Ocupación Actual" },
        { key: "companyName", label: "Nombre de la Empresa" },
        { key: "position", label: "Cargo" },
        { key: "yearsInCompany", label: "Antigüedad en la Empresa" },
        { key: "companyPhone", label: "Teléfono de la Empresa" },
        { key: "companyAddress", label: "Dirección de la Empresa" },
        { key: "monthlyIncome", label: "Ingresos Mensuales (USD)" },
        { key: "otherIncome", label: "Otros Ingresos (USD)" },
        { key: "totalIncome", label: "Total Ingresos (USD)" },
      ],
    },
    productData: {
      label: "Producto Bancario",
      fields: [
        { key: "productType", label: "Tipo de Producto" },
        { key: "currency", label: "Moneda" },
        { key: "averageMonthlyAmount", label: "Monto Promedio Mensual (USD)" },
        { key: "fundsOrigin", label: "Origen de los Fondos" },
        { key: "accountPurpose", label: "Propósito de la Cuenta" },
        { key: "estimatedMonthlyTransactions", label: "Transacciones Mensuales Estimadas" },
        { key: "averageTransactionAmount", label: "Monto Promedio por Transacción (USD)" },
        { key: "internationalTransactions", label: "¿Realizará Transacciones Internacionales?" },
      ],
    },
  }

  // Define fields for Juridical Person with Spanish labels and their corresponding keys
  const juridicalPersonFieldDefinitions = {
    institucion: {
      label: "Datos de la Institución",
      fields: [
        { key: "nombre", label: "Nombre de la Institución" },
        { key: "registroFiscal", label: "RIF" },
        { key: "sucursal", label: "Sucursal o Agencia" },
        { key: "gerente", label: "Nombre del Gerente" },
        { key: "ejecutivo", label: "Nombre del Ejecutivo" },
      ],
    },
    identificacion: {
      label: "Datos de Identificación de la Empresa",
      fields: [
        { key: "registroFiscal", label: "RIF" },
        { key: "razonSocial", label: "Razón Social" },
        { key: "nombreComercial", label: "Nombre Comercial" },
        { key: "actividadEconomica", label: "Actividad Económica" },
        { key: "actividadEspecifica", label: "Actividad Específica" },
        { key: "categoriaEspecial", label: "Categoría Especial" },
        { key: "datosRegistro.nombre", label: "Registro: Nombre" },
        { key: "datosRegistro.numero", label: "Registro: Número" },
        { key: "datosRegistro.tomo", label: "Registro: Tomo" },
        { key: "datosRegistro.folio", label: "Registro: Folio" },
        { key: "datosRegistro.fecha", label: "Registro: Fecha" },
        { key: "datosRegistro.capitalSocial", label: "Registro: Capital Social" },
        { key: "ultimaModificacion.nombre", label: "Última Mod.: Nombre" },
        { key: "ultimaModificacion.numero", label: "Última Mod.: Número" },
        { key: "ultimaModificacion.tomo", label: "Última Mod.: Tomo" },
        { key: "ultimaModificacion.folio", label: "Última Mod.: Folio" },
        { key: "ultimaModificacion.fecha", label: "Última Mod.: Fecha" },
        { key: "ultimaModificacion.capitalActual", label: "Última Mod.: Capital Actual" },
        { key: "entesPublicos.numeroGaceta", label: "Entes Públicos: N° Gaceta" },
        { key: "entesPublicos.fecha", label: "Entes Públicos: Fecha Gaceta" },
        { key: "entesPublicos.autoridadAdscripcion", label: "Entes Públicos: Autoridad Adscripción" },
        { key: "entesPublicos.codigoOnt", label: "Entes Públicos: Código ONT" },
        { key: "telefonos", label: "Teléfonos" },
        { key: "sitioWeb", label: "Sitio Web" },
        { key: "correo", label: "Correo Electrónico" },
        { key: "direccion.edificio", label: "Dirección: Edificio/Quinta/Torre" },
        { key: "direccion.piso", label: "Dirección: Piso" },
        { key: "direccion.oficina", label: "Dirección: Oficina" },
        { key: "direccion.local", label: "Dirección: Local" },
        { key: "direccion.calle", label: "Dirección: Calle o Avenida" },
        { key: "direccion.urbanizacion", label: "Dirección: Urbanización" },
        { key: "direccion.municipio", label: "Dirección: Municipio" },
        { key: "direccion.ciudad", label: "Dirección: Ciudad" },
        { key: "direccion.estado", label: "Dirección: Estado" },
        { key: "direccion.codigoPostal", label: "Dirección: Código Postal" },
        { key: "direccion.numeroFax", label: "Dirección: N° de Fax" },
      ],
    },
    economica: {
      label: "Información Económica",
      fields: [
        { key: "accionistas.nombre", label: "Accionistas: Nombre (ejemplo)" },
        { key: "subsidiarias.numeroSubsidiarias", label: "Subsidiarias: N° de Subsidiarias/Oficinas" },
        { key: "subsidiarias.paisMayorPresencia", label: "Subsidiarias: País con Mayor Presencia" },
        { key: "subsidiarias.numeroEmpleados", label: "Subsidiarias: N° de Empleados" },
        { key: "subsidiarias.ventasMensuales", label: "Subsidiarias: Ventas Mensuales" },
        { key: "subsidiarias.ingresosMensuales", label: "Subsidiarias: Ingresos Mensuales" },
        { key: "subsidiarias.egresosMensuales", label: "Subsidiarias: Egresos Mensuales" },
        { key: "referenciasBancarias.institucionSectorBancario", label: "Ref. Bancarias: Institución (ejemplo)" },
      ],
    },
    producto: {
      label: "Producto Bancario",
      fields: [
        { key: "nombre", label: "Nombre del Producto" },
        { key: "numeroProducto", label: "N° del Producto" },
        { key: "moneda", label: "Moneda" },
        { key: "montoPromedio", label: "Monto Promedio Mensual" },
        { key: "transaccionesMensuales", label: "N° Transacciones por Mes/Promedio" },
        { key: "credito", label: "Crédito" },
        { key: "debito", label: "Débito" },
        { key: "paisOrigen", label: "País Origen" },
        { key: "paisDestino", label: "País Destino" },
        { key: "usoMonedaVirtual", label: "Uso Moneda Virtual" },
      ],
    },
  }

  const [selectedAgencyToAdd, setSelectedAgencyToAdd] = useState<string>("") // State for the agency select dropdown

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-900">Parametrización del Sistema</h1>

      {/* Fichas a Habilitar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Fichas de Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-natural" className="text-lg font-medium">
              Habilitar Ficha Persona Natural
            </Label>
            <Switch
              id="enable-natural"
              checked={settings.enabledClientTypes.natural}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  enabledClientTypes: { ...prev.enabledClientTypes, natural: checked },
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-juridica" className="text-lg font-medium">
              Habilitar Ficha Persona Jurídica
            </Label>
            <Switch
              id="enable-juridica"
              checked={settings.enabledClientTypes.juridica}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  enabledClientTypes: { ...prev.enabledClientTypes, juridica: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="field-parametrization" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="field-parametrization">Parametrización de Campos de Ficha</TabsTrigger>
          <TabsTrigger value="appointment-parametrization">Parametrización de Citas</TabsTrigger>
        </TabsList>

        {/* Parametrización de Campos de Ficha Tab */}
        <TabsContent value="field-parametrization">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Parametrización de Campos de Ficha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <Tabs defaultValue="natural-fields" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="natural-fields">Persona Natural</TabsTrigger>
                  <TabsTrigger value="juridica-fields">Persona Jurídica</TabsTrigger>
                </TabsList>

                {/* Persona Natural Fields Tab */}
                <TabsContent value="natural-fields">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-800 mb-4 sr-only">Persona Natural</h2>
                    {Object.entries(naturalPersonFieldDefinitions).map(([sectionKey, sectionDef]) => (
                      <Collapsible key={sectionKey} className="group/collapsible mb-4">
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-blue-50 p-3 text-lg font-medium text-blue-900 hover:bg-blue-100 transition-colors">
                          {sectionDef.label}
                          <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <div className="border border-t-0 p-4 rounded-b-md bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sectionDef.fields.map((field) => (
                              <div key={field.key} className="flex items-center justify-between">
                                <Label htmlFor={`natural-${sectionKey}-${field.key}`} className="text-base">
                                  {field.label}
                                </Label>
                                <Switch
                                  id={`natural-${sectionKey}-${field.key}`}
                                  checked={settings.fieldVisibility.natural?.[sectionKey]?.[field.key] ?? true}
                                  onCheckedChange={(checked) =>
                                    handleFieldVisibilityChange("natural", sectionKey, field.key, checked)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </TabsContent>

                {/* Persona Jurídica Fields Tab */}
                <TabsContent value="juridica-fields">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-800 mb-4 sr-only">Persona Jurídica</h2>
                    {Object.entries(juridicalPersonFieldDefinitions).map(([sectionKey, sectionDef]) => (
                      <Collapsible key={sectionKey} className="group/collapsible mb-4">
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-blue-50 p-3 text-lg font-medium text-blue-900 hover:bg-blue-100 transition-colors">
                          {sectionDef.label}
                          <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <div className="border border-t-0 p-4 rounded-b-md bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sectionDef.fields.map((field) => (
                              <div key={field.key} className="flex items-center justify-between">
                                <Label htmlFor={`juridica-${sectionKey}-${field.key}`} className="text-base">
                                  {field.label}
                                </Label>
                                <Switch
                                  id={`juridica-${sectionKey}-${field.key}`}
                                  checked={settings.fieldVisibility.juridica?.[sectionKey]?.[field.key] ?? true}
                                  onCheckedChange={(checked) =>
                                    handleFieldVisibilityChange("juridica", sectionKey, field.key, checked)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parametrizar Citas Tab */}
        <TabsContent value="appointment-parametrization">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Parametrización de Citas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.agencies.map((agencyParam) => {
                const agencyDetails = ALL_BBVA_AGENCIES.find((a) => a.id === agencyParam.id)
                if (!agencyDetails) return null // Should not happen if data is consistent

                return (
                  <Collapsible
                    key={agencyParam.id}
                    className="group/collapsible border p-4 rounded-md space-y-4 bg-gray-50"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-semibold text-blue-800">
                      <h3>{agencyDetails.nombre}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent collapsible from toggling
                            handleRemoveAgency(agencyParam.id)
                          }}
                        >
                          <MinusCircle className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                        <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down pt-4">
                      <div className="text-sm text-gray-600 mb-4">
                        <p>**Dirección:** {agencyDetails.direccion}</p>
                        <p>**Estado:** {agencyDetails.estado}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`max-appointments-${agencyParam.id}`}>Citas Máximas por Día</Label>
                          <Input
                            id={`max-appointments-${agencyParam.id}`}
                            type="number"
                            value={agencyParam.maxAppointmentsPerDay}
                            onChange={(e) =>
                              handleAgencyParamChange(
                                agencyParam.id,
                                "maxAppointmentsPerDay",
                                Number.parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`available-hours-${agencyParam.id}`}>
                            Horas Disponibles (separadas por coma)
                          </Label>
                          <Input
                            id={`available-hours-${agencyParam.id}`}
                            value={agencyParam.availableHours.join(", ")}
                            onChange={(e) => handleHoursChange(agencyParam.id, e.target.value)}
                            placeholder="Ej: 08:00, 09:00, 10:00"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
              <div className="flex items-center gap-4">
                <Select onValueChange={setSelectedAgencyToAdd} value={selectedAgencyToAdd}>
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Seleccionar agencia para añadir" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_BBVA_AGENCIES.filter((agency) => !settings.agencies.some((p) => p.id === agency.id)).map(
                      (agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.nombre} ({agency.estado})
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleAddAgency(selectedAgencyToAdd)} disabled={!selectedAgencyToAdd}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Añadir
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Parámetros
            </>
          )}
        </Button>
      </div>

      {/* Success Modal */}
      <Dialog open={showSaveSuccessModal} onOpenChange={setShowSaveSuccessModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-600">¡Configuración Guardada!</DialogTitle>
            <DialogDescription>Los parámetros del backoffice han sido actualizados exitosamente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSaveSuccessModal(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
