"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { nanoid } from "nanoid" // For unique IDs
import {
  getBackofficeSettings,
  getClientApplications,
  getConfirmedAppointments,
  ALL_BBVA_AGENCIES,
} from "@/lib/backoffice-data" // Import ALL_BBVA_AGENCIES
import { useRouter, useSearchParams } from "next/navigation" // Import useRouter and useSearchParams
import { generateAppointmentConfirmationEmailHtml, generateAppointmentPdfUrl } from "@/lib/email-templates"

import {
  Building,
  User,
  TrendingUp,
  CreditCard,
  FileText,
  Upload,
  Info,
  Save,
  Clock,
  LogOut,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eraser,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Zod Schemas for validation
const institucionSchema = z.object({
  nombre: z.string().optional(),
  registroFiscal: z.string().optional(),
  sucursal: z.string().optional(),
  gerente: z.string().optional(),
  ejecutivo: z.string().optional(),
})

const identificacionSchema = z.object({
  registroFiscal: z.string().optional(),
  razonSocial: z.string().optional(),
  nombreComercial: z.string().optional(),
  actividadEconomica: z.string().optional(),
  actividadEspecifica: z.string().optional(),
  categoriaEspecial: z.string().optional(),
  datosRegistro: z
    .object({
      nombre: z.string().optional(),
      numero: z.string().optional(),
      tomo: z.string().optional(),
      folio: z.string().optional(),
      fecha: z.string().optional(),
      capitalSocial: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0, "Debe ser un número positivo.").optional(),
      ),
    })
    .optional(),
  ultimaModificacion: z
    .object({
      nombre: z.string().optional(),
      numero: z.string().optional(),
      tomo: z.string().optional(),
      folio: z.string().optional(),
      fecha: z.string().optional(),
      capitalActual: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0, "Debe ser un número positivo.").optional(),
      ),
    })
    .optional(),
  entesPublicos: z
    .object({
      numeroGaceta: z.string().optional(),
      fecha: z.string().optional(),
      autoridadAdscripcion: z.string().optional(),
      codigoOnt: z.string().optional(),
    })
    .optional(),
  telefonos: z.string().regex(/^\d*$/, "Formato de teléfono inválido.").optional(),
  sitioWeb: z.string().url("Formato de URL inválido.").optional(),
  correo: z.string().email("Formato de correo inválido.").optional(),
  direccion: z
    .object({
      edificio: z.string().optional(),
      piso: z.string().optional(),
      oficina: z.string().optional(),
      local: z.string().optional(),
      calle: z.string().optional(),
      urbanizacion: z.string().optional(),
      municipio: z.string().optional(),
      ciudad: z.string().optional(),
      estado: z.string().optional(),
      codigoPostal: z.string().optional(),
      numeroFax: z.string().optional(),
    })
    .optional(),
})

const economicaSchema = z.object({
  accionistas: z
    .array(
      z.object({
        nombre: z.string().optional(),
        documento: z.string().optional(),
        participacion: z.preprocess(
          (val) => (val === "" ? undefined : Number(val)),
          z.number().min(0).max(100).optional(),
        ),
      }),
    )
    .optional(),
  representantesLegales: z
    .array(
      z.object({
        nombre: z.string().optional(),
        documento: z.string().optional(),
        cargo: z.string().optional(),
      }),
    )
    .optional(),
  proveedores: z
    .array(
      z.object({
        nombre: z.string().optional(),
        producto: z.string().optional(),
        montoMensual: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
      }),
    )
    .optional(),
  clientes: z
    .array(
      z.object({
        nombre: z.string().optional(),
        producto: z.string().optional(),
        montoMensual: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
      }),
    )
    .optional(),
  empresasRelacionadas: z
    .array(
      z.object({
        nombre: z.string().optional(),
        relacion: z.string().optional(),
      }),
    )
    .optional(),
  referenciasBancarias: z
    .array(
      z.object({
        institucionSectorBancario: z.string().optional(),
        tipoProducto: z.string().optional(),
        numeroProducto: z.string().optional(),
        antiguedad: z.string().optional(),
      }),
    )
    .optional(),
  subsidiarias: z
    .object({
      numeroSubsidiarias: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
      paisMayorPresencia: z.string().optional(),
      numeroEmpleados: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
      ventasMensuales: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
      ingresosMensuales: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
      egresosMensuales: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
    })
    .optional(),
})

const productoSchema = z.object({
  nombre: z.string().optional(),
  numeroProducto: z.string().optional(),
  moneda: z.string().optional(),
  montoPromedio: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0.01, "Monto promedio mensual debe ser mayor a cero.").optional(),
  ),
  transaccionesMensuales: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
  credito: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
  debito: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0).optional()),
  paisOrigen: z.string().optional(),
  paisDestino: z.string().optional(),
  usoMonedaVirtual: z.string().optional(),
})

// Combined schema for overall form validation
const formSchema = z.object({
  institucion: institucionSchema,
  identificacion: identificacionSchema,
  economica: economicaSchema,
  producto: productoSchema,
  // files section is optional and not part of this schema for now
})

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
  pdfUrl?: string // Add optional pdfUrl
}

// Interface for client application data to be stored in localStorage for backoffice
interface ClientApplication {
  id: string
  userId: string
  type: "natural" | "juridica"
  status: "incompleta" | "pendiente_aprobacion" | "aprobada" | "rechazada"
  formData: z.infer<typeof formSchema>
  createdAt: number
  lastUpdated: number
}

export default function ClienteJuridicoPage() {
  const clientType = "juridica" // Define client type for this page

  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCitaModal, setShowCitaModal] = useState(false)
  const [showAyudaModal, setShowAyudaModal] = useState(false)
  const [showSaveResultModal, setShowSaveResultModal] = useState(false)
  const [saveResult, setSaveResult] = useState({ success: false, message: "" })
  const [showCitaConfirmModal, setShowCitaConfirmModal] = useState(false)
  const [citaConfirmDetails, setCitaConfirmDetails] = useState<ConfirmedAppointment>({
    fecha: "",
    hora: "",
    agenciaNombre: "",
    agenciaDireccion: "",
    clientEmail: "",
    bankEmail: "citas.juridicas@bbva.com", // Simulated bank email
    id: "", // Will be set by nanoid
    userId: "", // Will be set by userData.username
    clientType: "juridica", // Explicitly set
    createdAt: 0, // Will be set by Date.now()
    pdfUrl: "",
  })
  const [backofficeSettings, setBackofficeSettings] = useState(() => getBackofficeSettings()) // Initialize once
  const [hasConfirmedAppointment, setHasConfirmedAppointment] = useState(false) // New state for appointment lock
  const [activeTab, setActiveTab] = useState<string>("institucion") // Default to first tab, will be updated dynamically

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams() // Get search params
  const clientIdFromUrl = searchParams.get("clientId") // Get clientId from URL

  // Default values for clearing sections
  const defaultFormValues: z.infer<typeof formSchema> = useMemo(
    () => ({
      institucion: {
        nombre: "",
        registroFiscal: "",
        sucursal: "",
        gerente: "",
        ejecutivo: "",
      },
      identificacion: {
        registroFiscal: "",
        razonSocial: "",
        nombreComercial: "",
        actividadEconomica: "",
        actividadEspecifica: "",
        categoriaEspecial: "",
        datosRegistro: { nombre: "", numero: "", tomo: "", folio: "", fecha: "", capitalSocial: undefined },
        ultimaModificacion: { nombre: "", numero: "", tomo: "", folio: "", fecha: "", capitalActual: undefined },
        entesPublicos: { numeroGaceta: "", fecha: "", autoridadAdscripcion: "", codigoOnt: "" },
        telefonos: "",
        sitioWeb: "",
        correo: "",
        direccion: {
          edificio: "",
          piso: "",
          oficina: "",
          local: "",
          calle: "",
          urbanizacion: "",
          municipio: "",
          ciudad: "",
          estado: "",
          codigoPostal: "",
          numeroFax: "",
        },
      },
      economica: {
        accionistas: [],
        representantesLegales: [],
        proveedores: [],
        clientes: [],
        empresasRelacionadas: [],
        referenciasBancarias: [],
        subsidiarias: {
          numeroSubsidiarias: undefined,
          paisMayorPresencia: "",
          numeroEmpleados: undefined,
          ventasMensuales: undefined,
          ingresosMensuales: undefined,
          egresosMensuales: undefined,
        },
      },
      producto: {
        nombre: "",
        numeroProducto: "",
        moneda: "",
        montoPromedio: undefined,
        transaccionesMensuales: undefined,
        credito: undefined,
        debito: undefined,
        paisOrigen: "",
        paisDestino: "",
        usoMonedaVirtual: "",
      },
    }),
    [],
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger, // To manually trigger validation
    getValues, // To get current form values
    reset, // To reset the entire form
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues, // Use empty defaults, load from localStorage if available
    mode: "onChange", // Validate on change for better UX
  })

  const watchedFormData = watch() // Watch all form data for saving to local storage
  const watchedIdentificacionCorreo = watch("identificacion.correo")

  const [citaData, setCitaData] = useState({
    fecha: "",
    agenciaId: "", // Changed to agenciaId
    hora: "",
    mensaje: "",
  })

  // Horarios disponibles para citas
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])
  const [availableAgenciesForDate, setAvailableAgenciesForDate] = useState<
    { id: string; nombre: string; direccion: string }[]
  >([])
  const [unavailableMessage, setUnavailableMessage] = useState<string>("")

  // Visibility and Completion Logic
  const juridicalPersonFieldDefinitions = {
    institucion: {
      label: "Institución",
      fields: [
        { key: "nombre", label: "NOMBRE DE LA INSTITUCIÓN DEL SECTOR BANCARIO" },
        { key: "registroFiscal", label: "REGISTRO DE INFORMACIÓN FISCAL" },
        { key: "sucursal", label: "SUCURSAL O AGENCIA" },
        { key: "gerente", label: "NOMBRE DEL GERENTE" },
        { key: "ejecutivo", label: "NOMBRE DEL EJECUTIVO" },
      ],
    },
    identificacion: {
      label: "Identificación",
      fields: [
        { key: "registroFiscal", label: "REGISTRO DE INFORMACIÓN FISCAL (RIF)" },
        { key: "razonSocial", label: "RAZÓN SOCIAL" },
        { key: "nombreComercial", label: "NOMBRE COMERCIAL" },
        { key: "actividadEconomica", label: "ACTIVIDAD ECONÓMICA PRINCIPAL" },
        { key: "actividadEspecifica", label: "ACTIVIDAD ECONÓMICA ESPECÍFICA" },
        { key: "categoriaEspecial", label: "CATEGORÍA ESPECIAL (SI APLICA)" },
        { key: "datosRegistro.nombre", label: "NOMBRE DEL REGISTRO" },
        { key: "datosRegistro.numero", label: "NÚMERO DE REGISTRO" },
        { key: "datosRegistro.tomo", label: "TOMO" },
        { key: "datosRegistro.folio", label: "FOLIO" },
        { key: "datosRegistro.fecha", label: "FECHA DE REGISTRO" },
        { key: "datosRegistro.capitalSocial", label: "CAPITAL SOCIAL (USD)" },
        { key: "ultimaModificacion.nombre", label: "NOMBRE DEL REGISTRO" },
        { key: "ultimaModificacion.numero", label: "NÚMERO DE REGISTRO" },
        { key: "ultimaModificacion.tomo", label: "TOMO" },
        { key: "ultimaModificacion.folio", label: "FOLIO" },
        { key: "ultimaModificacion.fecha", label: "FECHA DE MODIFICACIÓN" },
        { key: "ultimaModificacion.capitalActual", label: "CAPITAL ACTUAL (USD)" },
        { key: "entesPublicos.numeroGaceta", label: "NÚMERO DE GACETA OFICIAL" },
        { key: "entesPublicos.fecha", label: "FECHA DE GACETA" },
        { key: "entesPublicos.autoridadAdscripcion", label: "AUTORIDAD DE ADSCRIPCIÓN" },
        { key: "entesPublicos.codigoOnt", label: "CÓDIGO ONT" },
        { key: "telefonos", label: "TELÉFONOS" },
        { key: "sitioWeb", label: "SITIO WEB" },
        { key: "correo", label: "CORREO ELECTRÓNICO" },
        { key: "direccion.edificio", label: "EDIFICIO" },
        { key: "direccion.piso", label: "PISO" },
        { key: "direccion.oficina", label: "OFICINA" },
        { key: "direccion.local", label: "LOCAL" },
        { key: "direccion.calle", label: "CALLE / AVENIDA" },
        { key: "direccion.urbanizacion", label: "URBANIZACIÓN" },
        { key: "direccion.municipio", label: "MUNICIPIO" },
        { key: "direccion.ciudad", label: "CIUDAD" },
        { key: "direccion.estado", label: "ESTADO" },
        { key: "direccion.codigoPostal", label: "CÓDIGO POSTAL" },
        { key: "direccion.numeroFax", label: "NÚMERO DE FAX" },
      ],
    },
    economica: {
      label: "Económica",
      fields: [
        { key: "accionistas.0.nombre", label: "NOMBRE ACCIONISTA 1" },
        { key: "accionistas.0.documento", label: "DOCUMENTO ACCIONISTA 1" },
        { key: "accionistas.0.participacion", label: "PARTICIPACIÓN (%) ACCIONISTA 1" },
        { key: "subsidiarias.numeroSubsidiarias", label: "NÚMERO DE SUBSIDIARIAS" },
        { key: "subsidiarias.paisMayorPresencia", label: "PAÍS DE MAYOR PRESENCIA" },
        { key: "subsidiarias.numeroEmpleados", label: "NÚMERO DE EMPLEADOS" },
        { key: "subsidiarias.ventasMensuales", label: "VENTAS MENSUALES (USD)" },
        { key: "subsidiarias.ingresosMensuales", label: "INGRESOS MENSUALES (USD)" },
        { key: "subsidiarias.egresosMensuales", label: "EGRESOS MENSUALES (USD)" },
        { key: "referenciasBancarias.0.institucionSectorBancario", label: "INSTITUCIÓN BANCARIA 1" },
        { key: "referenciasBancarias.0.tipoProducto", label: "TIPO DE PRODUCTO 1" },
        { key: "referenciasBancarias.0.numeroProducto", label: "NÚMERO DE PRODUCTO 1" },
        { key: "referenciasBancarias.0.antiguedad", label: "ANTIGÜEDAD 1" },
      ],
    },
    producto: {
      label: "Producto",
      fields: [
        { key: "nombre", label: "NOMBRE DEL PRODUCTO" },
        { key: "numeroProducto", label: "NÚMERO DE PRODUCTO" },
        { key: "moneda", label: "MONEDA" },
        { key: "montoPromedio", label: "MONTO PROMEDIO MENSUAL (USD)" },
        { key: "transaccionesMensuales", label: "TRANSACCIONES MENSUALES ESTIMADAS" },
        { key: "credito", label: "MONTO DE CRÉDITO (USD)" },
        { key: "debito", label: "MONTO DE DÉBITO (USD)" },
        { key: "paisOrigen", label: "PAÍS DE ORIGEN DE TRANSACCIONES" },
        { key: "paisDestino", label: "PAÍS DE DESTINO DE TRANSACCIONES" },
        { key: "usoMonedaVirtual", label: "¿USO DE MONEDA VIRTUAL?" },
      ],
    },
  }

  const isFieldVisible = useCallback(
    (section: string, field: string) => {
      if (!backofficeSettings || !backofficeSettings.fieldVisibility || !backofficeSettings.fieldVisibility.juridica) {
        return true // Default to visible if settings are not fully loaded or structured as expected
      }
      const sectionVisibility = backofficeSettings.fieldVisibility.juridica[section]
      if (!sectionVisibility) return true // Default to visible if no specific settings for this section
      return sectionVisibility[field] ?? true // Use nullish coalescing for default true
    },
    [backofficeSettings],
  )

  const isSectionVisible = useCallback(
    (sectionName: keyof z.infer<typeof formSchema> | "archivos") => {
      if (!backofficeSettings || !Array.isArray(backofficeSettings.visibleSections)) {
        return true // Default to visible if settings are not fully loaded or structured as expected
      }

      const isExplicitlyVisible = backofficeSettings.visibleSections.includes(sectionName)

      if (!isExplicitlyVisible) {
        return false
      }

      if (sectionName === "archivos") return true

      const sectionDefinitions =
        juridicalPersonFieldDefinitions[sectionName as keyof typeof juridicalPersonFieldDefinitions]
      if (!sectionDefinitions) return false

      return sectionDefinitions.fields.some((field) => isFieldVisible(sectionName, field.key))
    },
    [backofficeSettings, isFieldVisible],
  )

  const isSectionComplete = useCallback(
    (tabName: keyof z.infer<typeof formSchema> | "archivos"): boolean => {
      let hasZodErrors = false
      switch (tabName) {
        case "institucion":
          hasZodErrors = Object.keys(errors.institucion || {}).length > 0
          break
        case "identificacion":
          hasZodErrors = Object.keys(errors.identificacion || {}).length > 0
          break
        case "economica":
          hasZodErrors = Object.keys(errors.economica || {}).length > 0
          break
        case "producto":
          hasZodErrors = Object.keys(errors.producto || {}).length > 0
          break
        case "archivos":
          hasZodErrors = false // Files section is always considered complete for now
          break
      }

      if (hasZodErrors) {
        return false
      }

      const currentFormData = getValues()
      const sectionData = currentFormData[tabName as keyof z.infer<typeof formSchema>]

      if (!sectionData && tabName !== "archivos") return false

      let requiredFields: string[] = []
      const sectionDefinitions =
        juridicalPersonFieldDefinitions[tabName as keyof typeof juridicalPersonFieldDefinitions]
      if (sectionDefinitions) {
        requiredFields = sectionDefinitions.fields.map((f) => f.key)
      } else if (tabName === "archivos") {
        return true
      } else {
        return false
      }

      return requiredFields.every((fieldPath) => {
        const isFieldCurrentlyVisible = isFieldVisible(tabName as string, fieldPath)
        if (!isFieldCurrentlyVisible) return true

        const fieldValue = fieldPath
          .split(".")
          .reduce((obj: any, key: string) => (obj && obj[key] !== undefined ? obj[key] : undefined), sectionData)

        if (typeof fieldValue === "number") {
          return fieldValue > 0
        }
        return !!fieldValue && String(fieldValue).trim() !== ""
      })
    },
    [getValues, errors, isFieldVisible, juridicalPersonFieldDefinitions],
  )

  // Load user data and draft form data on mount
  useEffect(() => {
    // If clientId is present in URL, it means we are editing from backoffice
    if (clientIdFromUrl) {
      const allClients = getClientApplications()
      const existingClient = allClients.find((client) => client.id === clientIdFromUrl && client.type === clientType)
      if (existingClient) {
        setUserData({ username: existingClient.userId, name: existingClient.name }) // Set user data for display
        for (const key in existingClient.formData) {
          if (existingClient.formData.hasOwnProperty(key)) {
            setValue(key as keyof z.infer<typeof formSchema>, existingClient.formData[key], { shouldValidate: true })
          }
        }
        toast({
          title: "Datos de cliente cargados para edición",
          description: "Se han cargado los datos del cliente para su modificación.",
        })
        console.log(`[TRACKING] Datos de Persona Jurídica cargados desde backoffice para edición: ${clientIdFromUrl}.`)
      } else {
        toast({
          title: "Cliente no encontrado",
          description: "No se pudieron cargar los datos del cliente para edición.",
          variant: "destructive",
        })
        router.push("/backoffice/clients") // Redirect if client not found
      }
      return // Exit early if editing from backoffice
    }

    // Normal client-side flow
    const user = localStorage.getItem("bbva_user")
    if (!user) {
      router.push("/")
      return
    }
    setUserData(JSON.parse(user))
    console.log(`[TRACKING] Aplicación de Persona Jurídica iniciada para: ${JSON.parse(user).name}`)

    // Check if this client type is enabled from backoffice settings
    if (!backofficeSettings.enabledClientTypes.juridica) {
      toast({
        title: "Acceso Denegado",
        description: `La ficha de Persona Jurídica está deshabilitada por el administrador.`,
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Check for existing confirmed appointment for this user (only for client-side user)
    const storedAppointment = localStorage.getItem("bbva_confirmed_appointment")
    if (storedAppointment) {
      const appt: ConfirmedAppointment = JSON.parse(storedAppointment)
      if (appt.userId === JSON.parse(user).username) {
        setHasConfirmedAppointment(true)
        toast({
          title: "Cita Agendada",
          description: "Ya tienes una cita confirmada. El formulario está deshabilitado.",
          variant: "default",
        })
        console.log(
          `[TRACKING] Usuario ${JSON.parse(user).username} tiene una cita confirmada. Formulario deshabilitado.`,
        )
      }
    }

    // Load draft data from localStorage
    const savedDraft = localStorage.getItem(`bbva_${clientType}_draft`) // Use clientType for key
    if (savedDraft) {
      const { data, timestamp } = JSON.parse(savedDraft)
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      if (Date.now() - timestamp < fiveMinutes) {
        // Pre-fill form with saved data
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            setValue(key as keyof z.infer<typeof formSchema>, data[key], { shouldValidate: true })
          }
        }
        toast({
          title: "Borrador cargado",
          description: "Se ha recuperado su progreso de los últimos 5 minutos.",
        })
        console.log(`[TRACKING] Borrador de Persona ${clientType} cargado desde memoria.`)
      } else {
        localStorage.removeItem(`bbva_${clientType}_draft`)
        console.log(`[TRACKING] Borrador de Persona ${clientType} expirado y eliminado.`)
      }
    } else {
      // If no draft, try to load from client applications (mock data)
      const allClients = getClientApplications()
      const existingClient = allClients.find(
        (client) => client.userId === JSON.parse(user).username && client.type === clientType,
      )
      if (existingClient) {
        for (const key in existingClient.formData) {
          if (existingClient.formData.hasOwnProperty(key)) {
            setValue(key as keyof z.infer<typeof formSchema>, existingClient.formData[key], { shouldValidate: true })
          }
        }
        toast({
          title: "Datos de cliente cargados",
          description: "Se han cargado los datos existentes para su solicitud.",
        })
        console.log(
          `[TRACKING] Datos de cliente ${clientType} cargados desde backoffice-data mock.`,
          existingClient.formData,
        )
      }
    }

    // Determine the first visible tab after settings are loaded
    const sectionsOrder: (keyof z.infer<typeof formSchema> | "archivos")[] = [
      "institucion",
      "identificacion",
      "economica",
      "producto",
      "archivos",
    ]
    const firstVisibleTab = sectionsOrder.find((section) => isSectionVisible(section))
    if (firstVisibleTab) {
      setActiveTab(firstVisibleTab)
    } else {
      setActiveTab("archivos") // Fallback if no sections are visible
    }
  }, [setValue, toast, router, clientType, backofficeSettings, isSectionVisible, clientIdFromUrl])

  // Save form data to localStorage on changes (debounced or on significant changes)
  useEffect(() => {
    // Only save draft if not in backoffice editing mode
    if (!clientIdFromUrl) {
      const saveDraft = setTimeout(() => {
        const currentData = getValues()
        localStorage.setItem(`bbva_${clientType}_draft`, JSON.stringify({ data: currentData, timestamp: Date.now() }))
        console.log(`[TRACKING] Borrador de Persona ${clientType} guardado en memoria.`)
      }, 1000) // Save every 1 second of inactivity

      return () => clearTimeout(saveDraft)
    }
  }, [watchedFormData, getValues, clientType, clientIdFromUrl]) // Trigger save when any form data changes

  const handleSave = handleSubmit(
    async (data) => {
      setIsLoading(true)
      console.log("[TRACKING] Intento de guardar datos de Persona Jurídica iniciado.")

      // Simulate saving data
      setTimeout(() => {
        setSaveResult({ success: true, message: "Su información ha sido actualizada exitosamente." })
        setShowSaveResultModal(true)
        setIsLoading(false)
        console.log("[TRACKING] Datos de Persona Jurídica guardados exitosamente.")
        console.log("[TRACKING] Datos guardados:", data)

        // Update global client applications data for backoffice
        const allClients: ClientApplication[] = JSON.parse(localStorage.getItem("bbva_client_applications") || "[]")
        const targetUserId = clientIdFromUrl
          ? allClients.find((c) => c.id === clientIdFromUrl)?.userId
          : userData.username
        const targetClientName = clientIdFromUrl
          ? allClients.find((c) => c.id === clientIdFromUrl)?.name
          : userData.name

        const existingClientIndex = allClients.findIndex(
          (client) =>
            (clientIdFromUrl ? client.id === clientIdFromUrl : client.userId === targetUserId) &&
            client.type === "juridica",
        )

        const newClientData: ClientApplication = {
          id: existingClientIndex !== -1 ? allClients[existingClientIndex].id : nanoid(),
          userId: targetUserId,
          name: targetClientName,
          type: "juridica",
          status: existingClientIndex !== -1 ? allClients[existingClientIndex].status : "incompleta", // Preserve status if editing
          formData: data,
          createdAt: existingClientIndex !== -1 ? allClients[existingClientIndex].createdAt : Date.now(),
          lastUpdated: Date.now(),
          progressPercentage: progressPercentage, // Update progress percentage on save
        }

        if (existingClientIndex !== -1) {
          allClients[existingClientIndex] = newClientData
        } else {
          allClients.push(newClientData)
        }
        localStorage.setItem("bbva_client_applications", JSON.stringify(allClients))
        console.log("[TRACKING] Datos de Persona Jurídica actualizados en la base de datos simulada para backoffice.")

        // If editing from backoffice, redirect back to client details page
        if (clientIdFromUrl) {
          router.push(`/backoffice/clients/${clientIdFromUrl}`)
        }
      }, 1500)
    },
    (errors) => {
      setSaveResult({
        success: false,
        message: "Por favor, complete y corrija todos los campos obligatorios antes de guardar.",
      })
      setShowSaveResultModal(true)
      setIsLoading(false)
      console.log("[TRACKING] Guardado de Persona Jurídica fallido: Errores de validación.", errors)
    },
  )

  const handleSolicitarCita = async () => {
    // Only allow client-side user to request appointment
    if (clientIdFromUrl) {
      toast({
        title: "Acción no permitida",
        description: "Esta acción solo está disponible para el cliente final.",
        variant: "destructive",
      })
      return
    }

    if (hasConfirmedAppointment) {
      toast({
        title: "Cita Existente",
        description: "Ya tienes una cita agendada. No puedes solicitar otra.",
        variant: "destructive",
      })
      console.log(`[TRACKING] Solicitud de cita de Persona Jurídica fallida: Ya tiene una cita agendada.`)
      return
    }

    if (progressPercentage !== 100) {
      toast({
        title: "Formulario Incompleto",
        description: "Debe completar todas las secciones del formulario (100%) para solicitar una cita.",
        variant: "destructive",
      })
      console.log(
        `[TRACKING] Solicitud de cita de Persona Jurídica fallida: Formulario no completado al 100%. Progreso: ${progressPercentage}%`,
      )
      return
    }

    // Establecer fecha mínima como próximo día hábil
    setCitaData((prev) => ({ ...prev, fecha: getProximoDiaHabil() }))
    setShowCitaModal(true)
    console.log(`[TRACKING] Modal de agendar cita de Persona Jurídica abierto.`)
  }

  // Helper to get appointments for a specific date and agency
  const getAppointmentsForDateAndAgency = useCallback((date: string, agencyId: string) => {
    const allAppointments = getConfirmedAppointments()
    return allAppointments.filter(
      (appt) => appt.fecha === date && appt.agenciaNombre === ALL_BBVA_AGENCIES.find((a) => a.id === agencyId)?.nombre,
    )
  }, [])

  const handleFechaChange = useCallback(
    (fecha: string) => {
      setCitaData((prev) => ({ ...prev, fecha, agenciaId: "", hora: "" }))
      setHorariosDisponibles([])
      setUnavailableMessage("")

      if (!esDiaHabilBancario(fecha)) {
        setUnavailableMessage("La fecha seleccionada no es un día hábil bancario.")
        setAvailableAgenciesForDate([])
        return
      }

      const availableAgencies: { id: string; nombre: string; direccion: string }[] = []
      const backofficeAgencies = backofficeSettings.agencies // Parameterized agencies

      for (const paramAgency of backofficeAgencies) {
        const agencyDetails = ALL_BBVA_AGENCIES.find((a) => a.id === paramAgency.id)
        if (!agencyDetails) continue

        const appointmentsToday = getAppointmentsForDateAndAgency(fecha, paramAgency.id)
        if (appointmentsToday.length < paramAgency.maxAppointmentsPerDay) {
          availableAgencies.push(agencyDetails)
        }
      }

      if (availableAgencies.length === 0) {
        setUnavailableMessage("No hay agencias disponibles para citas en la fecha seleccionada.")
      }
      setAvailableAgenciesForDate(availableAgencies)
    },
    [backofficeSettings, getAppointmentsForDateAndAgency],
  )

  const handleAgenciaChange = useCallback(
    (agenciaId: string) => {
      setCitaData((prev) => ({ ...prev, agenciaId, hora: "" }))
      setHorariosDisponibles([])
      setUnavailableMessage("")

      if (!citaData.fecha || !agenciaId) {
        return
      }

      const selectedParamAgency = backofficeSettings.agencies.find((a) => a.id === agenciaId)
      if (!selectedParamAgency) {
        setUnavailableMessage("Configuración de agencia no encontrada.")
        return
      }

      const appointmentsToday = getAppointmentsForDateAndAgency(citaData.fecha, agenciaId)
      const bookedHours = appointmentsToday.map((appt) => appt.hora)

      const availableHours = selectedParamAgency.availableHours.filter((hour) => !bookedHours.includes(hour))

      if (availableHours.length === 0) {
        setUnavailableMessage("No hay horas disponibles para citas en esta agencia y fecha.")
      }
      setHorariosDisponibles(availableHours)
    },
    [citaData.fecha, backofficeSettings, getAppointmentsForDateAndAgency],
  )

  const handleConfirmarCita = async () => {
    if (!citaData.fecha || !citaData.hora || !citaData.agenciaId) {
      toast({
        title: "Datos de cita incompletos",
        description: "Por favor complete todos los campos requeridos para la cita",
        variant: "destructive",
      })
      console.log(`[TRACKING] Confirmación de cita de Persona Jurídica fallida: Datos incompletos.`)
      return
    }

    if (!esDiaHabilBancario(citaData.fecha)) {
      toast({
        title: "Fecha inválida",
        description: "La fecha seleccionada no es un día hábil bancario.",
        variant: "destructive",
      })
      console.log(`[TRACKING] Confirmación de cita de Persona Jurídica fallida: Fecha inválida (${citaData.fecha}).`)
      return
    }

    setIsLoading(true)
    console.log("[TRACKING] Confirmación de cita de Persona Jurídica iniciada.")

    // Simulate API call
    setTimeout(() => {
      const agenciaSeleccionadaDetails = ALL_BBVA_AGENCIES.find((a) => a.id === citaData.agenciaId)
      const clientEmail = watchedIdentificacionCorreo || "correo.cliente@ejemplo.com" // Use actual email or fallback
      const clientName = userData.name || "Cliente" // Get client name

      if (!agenciaSeleccionadaDetails) {
        toast({
          title: "Error de Agencia",
          description: "No se pudo encontrar la agencia seleccionada.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const confirmedAppt: ConfirmedAppointment = {
        id: nanoid(),
        userId: userData.username,
        clientType: "juridica",
        fecha: citaData.fecha,
        hora: citaData.hora,
        agenciaNombre: agenciaSeleccionadaDetails.nombre,
        agenciaDireccion: agenciaSeleccionadaDetails.direccion,
        clientEmail: clientEmail,
        bankEmail: "citas.juridicas@bbva.com",
        createdAt: Date.now(),
      }

      // Generate simulated PDF URL
      const simulatedPdfUrl = generateAppointmentPdfUrl(confirmedAppt.id)
      confirmedAppt.pdfUrl = simulatedPdfUrl // Add to confirmedAppt object

      // Generate simulated email content (for logging/display purposes)
      const emailContent = generateAppointmentConfirmationEmailHtml({
        clientName: clientName,
        clientEmail: clientEmail,
        fecha: confirmedAppt.fecha,
        hora: confirmedAppt.hora,
        agenciaNombre: confirmedAppt.agenciaNombre,
        agenciaDireccion: confirmedAppt.agenciaDireccion,
        pdfUrl: simulatedPdfUrl,
      })

      // Store confirmed appointment in localStorage for login check
      localStorage.setItem("bbva_confirmed_appointment", JSON.stringify(confirmedAppt))
      console.log("[TRACKING] Cita confirmada guardada en localStorage para verificación de login.")

      // Add to global appointments list for backoffice
      const allAppointments: ConfirmedAppointment[] = JSON.parse(localStorage.getItem("bbva_all_appointments") || "[]")
      allAppointments.push(confirmedAppt)
      localStorage.setItem("bbva_all_appointments", JSON.stringify(allAppointments))
      console.log("[TRACKING] Cita confirmada añadida a la base de datos simulada para backoffice.")

      setCitaConfirmDetails(confirmedAppt) // Use the updated confirmedAppt with pdfUrl
      setShowCitaConfirmModal(true)
      setShowCitaModal(false) // Close the appointment scheduling modal
      setHasConfirmedAppointment(true) // Lock the form after successful appointment

      console.log(
        `[TRACKING] Cita de Persona Jurídica agendada exitosamente para ${citaData.fecha} a las ${citaData.hora} en ${agenciaSeleccionadaDetails.nombre}.`,
      )
      console.log(`[TRACKING] Correo de confirmación enviado a: ${clientEmail}`)
      console.log(`[TRACKING] Notificación enviada al banco a: citas.juridicas@bbva.com`)
      console.log("Simulated Email HTML:", emailContent) // Log the email content

      // Reset form
      setCitaData({ fecha: "", agenciaId: "", hora: "", mensaje: "" })
      setIsLoading(false)
    }, 2000)
  }

  // Función auxiliar para obtener el próximo día hábil
  const getProximoDiaHabil = () => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + 1) // Mínimo el día siguiente

    // Asegurarse que no sea fin de semana
    while (fecha.getDay() === 0 || fecha.getDay() === 6) {
      fecha.setDate(fecha.getDate() + 1)
    }

    return fecha.toISOString().split("T")[0]
  }

  // Función auxiliar para verificar si una fecha es día hábil bancario
  const esDiaHabilBancario = (fecha: string) => {
    const date = new Date(fecha)
    return date.getDay() !== 0 && date.getDay() !== 6
  }

  const handleLogout = () => {
    localStorage.removeItem("bbva_user")
    // localStorage.removeItem("bbva_juridica_draft") // Do NOT remove bbva_juridica_draft here, it should persist for 5 minutes
    localStorage.removeItem("bbva_confirmed_appointment") // Clear confirmed appointment on logout
    router.push("/")
    console.log("[TRACKING] Sesión de Persona Jurídica cerrada.")
  }

  // Function to clear fields of a specific section
  const handleClearSection = (sectionName: keyof z.infer<typeof formSchema>) => {
    const sectionFields = juridicalPersonFieldDefinitions[sectionName].fields
    sectionFields.forEach((field) => {
      const fieldPath = `${sectionName}.${field.key}` as any
      // Reset based on type or to empty string/undefined
      const defaultValue = (defaultFormValues as any)[sectionName]?.[field.key]
      setValue(fieldPath, defaultValue, { shouldValidate: true })
    })
    toast({
      title: "Sección Limpiada",
      description: `Los campos de la sección "${juridicalPersonFieldDefinitions[sectionName].label}" han sido borrados.`,
    })
    console.log(`[TRACKING] Campos de la sección "${sectionName}" limpiados.`)
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  const getTabIcon = (tabName: keyof z.infer<typeof formSchema> | "archivos") => {
    let hasZodErrors = false
    switch (tabName) {
      case "institucion":
        hasZodErrors = Object.keys(errors.institucion || {}).length > 0
        break
      case "identificacion":
        hasZodErrors = Object.keys(errors.identificacion || {}).length > 0
        break
      case "economica":
        hasZodErrors = Object.keys(errors.economica || {}).length > 0
        break
      case "producto":
        hasZodErrors = Object.keys(errors.producto || {}).length > 0
        break
      case "archivos":
        hasZodErrors = false // Files section is always considered complete for now
        break
    }

    if (isSectionComplete(tabName)) {
      return <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
    } else if (hasZodErrors) {
      return <XCircle className="h-4 w-4 ml-2 text-red-500" />
    } else {
      return <AlertCircle className="h-4 w-4 ml-2 text-gray-400" />
    }
  }

  const renderField = useCallback(
    (
      section: keyof z.infer<typeof formSchema>,
      field: string,
      label: string,
      type = "text",
      options?: { value: string; label: string }[],
    ) => {
      const fieldPath = `${section}.${field}` as any // Type assertion for register
      const error = (errors as any)?.[section]?.[field]
      const fieldValue = watch(fieldPath)

      if (!isFieldVisible(section as string, field)) {
        return null // Do not render if not visible
      }

      // Determine if the field should be disabled.
      // It's disabled if a client-side user has a confirmed appointment.
      // It's NOT disabled if accessed from backoffice (clientIdFromUrl is present).
      const isDisabled = hasConfirmedAppointment && !clientIdFromUrl

      return (
        <div>
          <Label htmlFor={fieldPath} className="text-blue-900 font-medium">
            {label}:
          </Label>
          {type === "textarea" ? (
            <Textarea
              id={fieldPath}
              {...register(fieldPath)}
              className={`mt-1 ${error ? "border-red-500" : ""}`}
              disabled={isDisabled}
            />
          ) : type === "select" && options ? (
            <Select
              value={fieldValue}
              onValueChange={(value) => {
                setValue(fieldPath, value)
                trigger(fieldPath)
              }}
              disabled={isDisabled}
            >
              <SelectTrigger className={`mt-1 ${error ? "border-red-500" : ""}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={fieldPath}
              type={type}
              {...register(fieldPath, { valueAsNumber: type === "number" })}
              className={`mt-1 ${error ? "border-red-500" : ""}`}
              disabled={isDisabled}
            />
          )}
          {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
      )
    },
    [register, errors, watch, isFieldVisible, setValue, trigger, hasConfirmedAppointment, clientIdFromUrl],
  )

  const visibleTabs = useMemo(() => {
    const tabs: (keyof z.infer<typeof formSchema> | "archivos")[] = []
    if (isSectionVisible("institucion")) tabs.push("institucion")
    if (isSectionVisible("identificacion")) tabs.push("identificacion")
    if (isSectionVisible("economica")) tabs.push("economica")
    if (isSectionVisible("producto")) tabs.push("producto")
    if (isSectionVisible("archivos")) tabs.push("archivos")
    return tabs
  }, [isSectionVisible])

  const progressPercentage = useMemo(() => {
    let completedSections = 0
    if (isSectionVisible("institucion") && isSectionComplete("institucion")) completedSections++
    if (isSectionVisible("identificacion") && isSectionComplete("identificacion")) completedSections++
    if (isSectionVisible("economica") && isSectionComplete("economica")) completedSections++
    if (isSectionVisible("producto") && isSectionComplete("producto")) completedSections++
    if (isSectionVisible("archivos") && isSectionComplete("archivos")) completedSections++

    const visibleSectionCount = visibleTabs.length
    return visibleSectionCount > 0 ? (completedSections / visibleSectionCount) * 100 : 0
  }, [isSectionComplete, isSectionVisible, visibleTabs])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 relative">
        {" "}
        {/* Added relative for absolute positioning */}
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white text-blue-900 px-3 py-1 rounded font-bold">BBVA</div>
            <div>
              <h1 className="text-xl font-bold">Ficha de Cliente - Persona Jurídica</h1>
              <p className="text-blue-200">Bienvenido/a {userData.name}</p>
            </div>
          </div>
          {/* Moved logout button to top right and styled */}
          <Button onClick={handleLogout} className="absolute top-4 right-4 text-white hover:bg-blue-800 border-none">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-900">Progreso del Formulario</h3>
              <span className="text-sm font-medium text-blue-900">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">
              {Math.round(progressPercentage / (100 / 5))} de 5 secciones completadas
            </p>
            {hasConfirmedAppointment &&
              !clientIdFromUrl && ( // Only show for client-side user
                <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
                  <Info className="h-4 w-4" />
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    Ya tienes una cita agendada. El formulario está deshabilitado.
                  </AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-${visibleTabs.length} bg-blue-100`}>
            {isSectionVisible("institucion") && (
              <TabsTrigger
                value="institucion"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                Institución {getTabIcon("institucion")}
              </TabsTrigger>
            )}
            {isSectionVisible("identificacion") && (
              <TabsTrigger
                value="identificacion"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Identificación {getTabIcon("identificacion")}
              </TabsTrigger>
            )}
            {isSectionVisible("economica") && (
              <TabsTrigger value="economica" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Económica {getTabIcon("economica")}
              </TabsTrigger>
            )}
            {isSectionVisible("producto") && (
              <TabsTrigger value="producto" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Producto {getTabIcon("producto")}
              </TabsTrigger>
            )}
            {isSectionVisible("archivos") && (
              <TabsTrigger value="archivos" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Archivos {getTabIcon("archivos")}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Datos de la Institución */}
          <TabsContent value="institucion">
            <Card>
              <CardHeader className="bg-yellow-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  DATOS DE LA INSTITUCIÓN DEL SECTOR BANCARIO
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSection("institucion")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderField("institucion", "nombre", "NOMBRE DE LA INSTITUCIÓN DEL SECTOR BANCARIO")}
                  {renderField("institucion", "registroFiscal", "REGISTRO DE INFORMACIÓN FISCAL")}
                  {renderField("institucion", "sucursal", "SUCURSAL O AGENCIA")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {renderField("institucion", "gerente", "NOMBRE DEL GERENTE")}
                  {renderField("institucion", "ejecutivo", "NOMBRE DEL EJECUTIVO")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Datos de Identificación */}
          <TabsContent value="identificacion">
            <Card>
              <CardHeader className="bg-yellow-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  DATOS DE IDENTIFICACIÓN DE LA EMPRESA
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSection("identificacion")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderField("identificacion", "registroFiscal", "REGISTRO DE INFORMACIÓN FISCAL (RIF)")}
                  {renderField("identificacion", "razonSocial", "RAZÓN SOCIAL")}
                  {renderField("identificacion", "nombreComercial", "NOMBRE COMERCIAL")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {renderField("identificacion", "actividadEconomica", "ACTIVIDAD ECONÓMICA PRINCIPAL")}
                  {renderField("identificacion", "actividadEspecifica", "ACTIVIDAD ECONÓMICA ESPECÍFICA")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {renderField("identificacion", "categoriaEspecial", "CATEGORÍA ESPECIAL (SI APLICA)")}
                  {renderField("identificacion", "telefonos", "TELÉFONOS")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {renderField("identificacion", "sitioWeb", "SITIO WEB", "url")}
                  {renderField("identificacion", "correo", "CORREO ELECTRÓNICO", "email")}
                </div>

                <div className="mt-8 space-y-6">
                  {isFieldVisible("identificacion", "datosRegistro.nombre") && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Datos de Registro Mercantil</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderField("identificacion", "datosRegistro.nombre", "NOMBRE DEL REGISTRO")}
                        {renderField("identificacion", "datosRegistro.numero", "NÚMERO DE REGISTRO")}
                        {renderField("identificacion", "datosRegistro.tomo", "TOMO")}
                        {renderField("identificacion", "datosRegistro.folio", "FOLIO")}
                        {renderField("identificacion", "datosRegistro.fecha", "FECHA DE REGISTRO", "date")}
                        {renderField("identificacion", "datosRegistro.capitalSocial", "CAPITAL SOCIAL (USD)", "number")}
                      </div>
                    </div>
                  )}

                  {isFieldVisible("identificacion", "ultimaModificacion.nombre") && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Última Modificación Estatutaria</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderField("identificacion", "ultimaModificacion.nombre", "NOMBRE DEL REGISTRO")}
                        {renderField("identificacion", "ultimaModificacion.numero", "NÚMERO DE REGISTRO")}
                        {renderField("identificacion", "ultimaModificacion.tomo", "TOMO")}
                        {renderField("identificacion", "ultimaModificacion.folio", "FOLIO")}
                        {renderField("identificacion", "ultimaModificacion.fecha", "FECHA DE MODIFICACIÓN", "date")}
                        {renderField(
                          "identificacion",
                          "ultimaModificacion.capitalActual",
                          "CAPITAL ACTUAL (USD)",
                          "number",
                        )}
                      </div>
                    </div>
                  )}

                  {isFieldVisible("identificacion", "entesPublicos.numeroGaceta") && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Entes Públicos (Si Aplica)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField("identificacion", "entesPublicos.numeroGaceta", "NÚMERO DE GACETA OFICIAL")}
                        {renderField("identificacion", "entesPublicos.fecha", "FECHA DE GACETA", "date")}
                        {renderField(
                          "identificacion",
                          "entesPublicos.autoridadAdscripcion",
                          "AUTORIDAD DE ADSCRIPCIÓN",
                        )}
                        {renderField("identificacion", "entesPublicos.codigoOnt", "CÓDIGO ONT")}
                      </div>
                    </div>
                  )}

                  {isFieldVisible("identificacion", "direccion.calle") && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Dirección Fiscal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderField("identificacion", "direccion.edificio", "EDIFICIO")}
                        {renderField("identificacion", "direccion.piso", "PISO")}
                        {renderField("identificacion", "direccion.oficina", "OFICINA")}
                        {renderField("identificacion", "direccion.local", "LOCAL")}
                        {renderField("identificacion", "direccion.calle", "CALLE / AVENIDA")}
                        {renderField("identificacion", "direccion.urbanizacion", "URBANIZACIÓN")}
                        {renderField("identificacion", "direccion.municipio", "MUNICIPIO")}
                        {renderField("identificacion", "direccion.ciudad", "CIUDAD")}
                        {renderField("identificacion", "direccion.estado", "ESTADO")}
                        {renderField("identificacion", "direccion.codigoPostal", "CÓDIGO POSTAL")}
                        {renderField("identificacion", "direccion.numeroFax", "NÚMERO DE FAX")}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información Económica */}
          <TabsContent value="economica">
            <Card>
              <CardHeader className="bg-yellow-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  INFORMACIÓN ECONÓMICO FINANCIERA DE LA EMPRESA
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSection("economica")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {isFieldVisible("economica", "accionistas.nombre") && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Accionistas Principales</h3>
                      {/* Simplified for parametrization, actual implementation would map an array */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderField("economica", "accionistas.0.nombre", "NOMBRE ACCIONISTA 1")}
                        {renderField("economica", "accionistas.0.documento", "DOCUMENTO ACCIONISTA 1")}
                        {renderField(
                          "economica",
                          "accionistas.0.participacion",
                          "PARTICIPACIÓN (%) ACCIONISTA 1",
                          "number",
                        )}
                      </div>
                    </div>
                  )}

                  {isFieldVisible("economica", "subsidiarias.numeroSubsidiarias") && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Datos de Subsidiarias</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderField(
                          "economica",
                          "subsidiarias.numeroSubsidiarias",
                          "NÚMERO DE SUBSIDIARIAS",
                          "number",
                        )}
                        {renderField("economica", "subsidiarias.paisMayorPresencia", "PAÍS DE MAYOR PRESENCIA")}
                        {renderField("economica", "subsidiarias.numeroEmpleados", "NÚMERO DE EMPLEADOS", "number")}
                        {renderField("economica", "subsidiarias.ventasMensuales", "VENTAS MENSUALES (USD)", "number")}
                        {renderField(
                          "economica",
                          "subsidiarias.ingresosMensuales",
                          "INGRESOS MENSUALES (USD)",
                          "number",
                        )}
                        {renderField("economica", "subsidiarias.egresosMensuales", "EGRESOS MENSUALES (USD)", "number")}
                      </div>
                    </div>
                  )}

                  {isFieldVisible("economica", "referenciasBancarias.institucionSectorBancario") && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">Referencias Bancarias</h3>
                      {/* Simplified for parametrization, actual implementation would map an array */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {renderField(
                          "economica",
                          "referenciasBancarias.0.institucionSectorBancario",
                          "INSTITUCIÓN BANCARIA 1",
                        )}
                        {renderField("economica", "referenciasBancarias.0.tipoProducto", "TIPO DE PRODUCTO 1")}
                        {renderField("economica", "referenciasBancarias.0.numeroProducto", "NÚMERO DE PRODUCTO 1")}
                        {renderField("economica", "referenciasBancarias.0.antiguedad", "ANTIGÜEDAD 1")}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Producto Bancario */}
          <TabsContent value="producto">
            <Card>
              <CardHeader className="bg-yellow-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  INFORMACIÓN DEL PRODUCTO O SERVICIO BANCARIO
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSection("producto")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderField("producto", "nombre", "NOMBRE DEL PRODUCTO")}
                  {renderField("producto", "numeroProducto", "NÚMERO DE PRODUCTO")}
                  {renderField("producto", "moneda", "MONEDA", "select", [
                    { value: "USD", label: "USD" },
                    { value: "VES", label: "VES" },
                    { value: "EUR", label: "EUR" },
                  ])}
                  {renderField("producto", "montoPromedio", "MONTO PROMEDIO MENSUAL (USD)", "number")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {renderField("producto", "transaccionesMensuales", "TRANSACCIONES MENSUALES ESTIMADAS", "number")}
                  {renderField("producto", "credito", "MONTO DE CRÉDITO (USD)", "number")}
                  {renderField("producto", "debito", "MONTO DE DÉBITO (USD)", "number")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {renderField("producto", "paisOrigen", "PAÍS DE ORIGEN DE TRANSACCIONES")}
                  {renderField("producto", "paisDestino", "PAÍS DE DESTINO DE TRANSACCIONES")}
                  {renderField("producto", "usoMonedaVirtual", "¿USO DE MONEDA VIRTUAL?", "select", [
                    { value: "Si", label: "Sí" },
                    { value: "No", label: "No" },
                  ])}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archivos */}
          <TabsContent value="archivos">
            <Card>
              <CardHeader className="bg-yellow-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  DOCUMENTOS REQUERIDOS (OPCIONAL)
                </CardTitle>
                {/* No clear button for files as they are not part of react-hook-form state */}
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Registro Mercantil</h3>
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-gray-600 mb-4">Suba una copia del Registro Mercantil de la empresa.</p>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="upload-registro"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Subir Registro Mercantil
                          <Input
                            id="upload-registro"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                          />
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">RIF de la Empresa</h3>
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Suba una copia del Registro de Información Fiscal (RIF) de la empresa.
                      </p>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="upload-rif"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Subir RIF de la Empresa
                          <Input
                            id="upload-rif"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                          />
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Acta Constitutiva y Estatutos</h3>
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Suba la Acta Constitutiva y los Estatutos Sociales de la empresa.
                      </p>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="upload-acta"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Subir Acta Constitutiva
                          <Input
                            id="upload-acta"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                          />
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium text-blue-900 mb-2">Documentos Adicionales (Opcional)</h3>
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Puede adjuntar cualquier otro documento que considere relevante para su solicitud.
                      </p>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="upload-additional"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Subir documento adicional
                          <Input
                            id="upload-additional"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                          />
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h4 className="font-medium text-amber-800 mb-2">Información Importante</h4>
                    <ul className="text-sm text-amber-700 space-y-1 ml-4">
                      <li>• Los documentos deben estar legibles y vigentes</li>
                      <li>• Formatos aceptados: PDF, DOC, DOCX, JPG, PNG</li>
                      <li>• Tamaño máximo: 10MB para documentos, 5MB para imágenes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 sm:mt-8">
          <div className="text-xs sm:text-sm text-gray-600">
            <span className="text-red-500">*</span> Campos obligatorios
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button variant="secondary" onClick={() => setShowAyudaModal(true)} className="w-full sm:w-auto">
              <Info className="h-4 w-4 mr-2" />
              Ayuda
            </Button>
            <Button disabled={isLoading} onClick={handleSave} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Progreso
                </>
              )}
            </Button>
            <Button
              disabled={isLoading || progressPercentage !== 100 || hasConfirmedAppointment || !!clientIdFromUrl} // Disable if editing from backoffice
              onClick={handleSolicitarCita}
              className={`w-full sm:w-auto bg-green-600 hover:bg-green-700`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Solicitar Cita
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Ayuda */}
      <Dialog open={showAyudaModal} onOpenChange={setShowAyudaModal}>
        <DialogContent className="sm:max-w-[600px] mx-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">📚 Centro de Ayuda - Solicitud de Cuenta</DialogTitle>
            <DialogDescription>Guía completa para completar su solicitud de cuenta BBVA</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">🏢 Datos de la Empresa</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Complete la información fiscal y de contacto de su empresa.</li>
                <li>• La dirección fiscal debe ser la registrada oficialmente.</li>
                <li>• El correo electrónico será usado para notificaciones importantes.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">👤 Datos del Representante Legal</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Use el documento de identidad vigente del representante legal.</li>
                <li>• La dirección debe ser completa y actualizada.</li>
                <li>• Teléfonos: Celular (0412, 0424, 0414, 0416, 0426) o fijo (0212, 0213, etc.)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💰 Información Financiera</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Indique el capital inicial y los activos/pasivos totales de la empresa.</li>
                <li>• Las ventas anuales deben ser en USD.</li>
                <li>• Proporcione los datos de la cuenta bancaria principal de la empresa.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💳 Producto Bancario</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Seleccione el tipo de cuenta o servicio bancario que desea para su empresa.</li>
                <li>• Indique el monto promedio que manejará mensualmente.</li>
                <li>• Estime el número de transacciones mensuales.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">📎 Documentos (Opcional)</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Los archivos son opcionales pero pueden acelerar la aprobación.</li>
                <li>• Formatos aceptados: PDF, DOC, DOCX, JPG, PNG.</li>
                <li>• Tamaño máximo: 10MB para documentos, 5MB para imágenes.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">🗓️ Solicitud de Cita</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Solo disponible cuando complete todas las secciones obligatorias.</li>
                <li>• Las citas solo se pueden agendar en días hábiles bancarios.</li>
                <li>• Horario de atención: 8:00 AM a 4:30 PM.</li>
                <li>• Recibirá confirmación por correo electrónico.</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📞 ¿Necesita más ayuda?</h4>
              <p className="text-sm text-blue-800">Contacte nuestro centro de atención al cliente:</p>
              <ul className="text-sm text-blue-800 mt-2">
                <li>• Teléfono: 0500-BBVA (2282)</li>
                <li>• WhatsApp: +58 414-BBVA (2282)</li>
                <li>• Email: atencion.cliente@bbva.com</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAyudaModal(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cita */}
      <Dialog open={showCitaModal} onOpenChange={setShowCitaModal}>
        <DialogContent className="sm:max-w-[500px] mx-4">
          <DialogHeader>
            <DialogTitle className="text-blue-900">🗓️ Agendar Cita Bancaria</DialogTitle>
            <DialogDescription>Complete los datos para agendar su cita en una agencia BBVA</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha" className="text-right font-medium text-sm">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                id="fecha"
                value={citaData.fecha}
                onChange={(e) => handleFechaChange(e.target.value)}
                className="col-span-3"
                min={getProximoDiaHabil()}
                disabled={hasConfirmedAppointment}
              />
            </div>
            {unavailableMessage && citaData.fecha && (
              <div className="col-span-4 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {unavailableMessage}
              </div>
            )}
            {citaData.fecha && esDiaHabilBancario(citaData.fecha) && availableAgenciesForDate.length === 0 && (
              <div className="col-span-4 text-orange-500 text-sm flex items-center gap-1">
                <Info className="h-4 w-4" />
                No hay agencias disponibles para citas en esta fecha. Por favor, seleccione otra fecha.
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agencia" className="text-right font-medium text-sm">
                Agencia <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={handleAgenciaChange}
                value={citaData.agenciaId}
                disabled={hasConfirmedAppointment || availableAgenciesForDate.length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione una agencia" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgenciesForDate.map((agencia) => (
                    <SelectItem key={agencia.id} value={agencia.id}>
                      <div>
                        <div className="font-medium text-sm">{agencia.nombre}</div>
                        <div className="text-xs text-gray-500">{agencia.direccion}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hora" className="text-right font-medium text-sm">
                Hora <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={(value) => setCitaData({ ...citaData, hora: value })}
                disabled={
                  !citaData.fecha ||
                  !citaData.agenciaId ||
                  !esDiaHabilBancario(citaData.fecha) ||
                  hasConfirmedAppointment ||
                  horariosDisponibles.length === 0
                }
                value={citaData.hora}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione una hora" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponibles.map((hora) => (
                    <SelectItem key={hora} value={hora}>
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="mensaje" className="text-right mt-2 font-medium text-sm">
                Mensaje
              </Label>
              <Textarea
                id="mensaje"
                value={citaData.mensaje}
                onChange={(e) => setCitaData({ ...citaData, mensaje: e.target.value })}
                className="col-span-3"
                placeholder="Motivo de la cita o comentarios adicionales..."
                disabled={hasConfirmedAppointment}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCitaModal(false)}
              className="w-full sm:w-auto"
              disabled={hasConfirmedAppointment}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleConfirmarCita}
              disabled={
                isLoading ||
                !citaData.fecha ||
                !citaData.hora ||
                !citaData.agenciaId ||
                !esDiaHabilBancario(citaData.fecha) ||
                hasConfirmedAppointment
              }
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Confirmar Cita
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Resultado de Guardado */}
      <Dialog open={showSaveResultModal} onOpenChange={setShowSaveResultModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {saveResult.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              {saveResult.success ? "Guardado Exitoso" : "Error al Guardar"}
            </DialogTitle>
            <DialogDescription>{saveResult.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSaveResultModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Cita */}
      <Dialog open={showCitaConfirmModal} onOpenChange={setShowCitaConfirmModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              ¡Cita Agendada Exitosamente!
            </DialogTitle>
            <DialogDescription>Su cita ha sido confirmada con los siguientes detalles:</DialogDescription>
          </DialogHeader>
          {citaConfirmDetails && (
            <div className="grid gap-4 py-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <strong>Fecha:</strong> {citaConfirmDetails.fecha}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <strong>Hora:</strong> {citaConfirmDetails.hora}
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <strong>Agencia:</strong> {citaConfirmDetails.agenciaNombre} ({citaConfirmDetails.agenciaDireccion})
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">Notificaciones de Correo:</p>
                <p className="text-xs text-blue-700 mt-1">
                  Se ha enviado un correo de confirmación a:{" "}
                  <span className="font-semibold">{citaConfirmDetails.clientEmail}</span>
                </p>
                <p className="text-xs text-blue-700">
                  Se ha notificado al banco a: <span className="font-semibold">{citaConfirmDetails.bankEmail}</span>
                </p>
                {citaConfirmDetails.pdfUrl && (
                  <p className="text-xs text-blue-700 mt-2">
                    <a
                      href={citaConfirmDetails.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <FileText className="h-3 w-3 mr-1" /> Descargar detalles de la cita (PDF simulado)
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCitaConfirmModal(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
