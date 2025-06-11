"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import { formSchemaNatural, FormDataNatural } from "@/types/form-data"
import * as z from "zod"
import { nanoid } from "nanoid"
import {
  getBackofficeSettings,
  getClientApplications,
  getConfirmedAppointments,
  ALL_BBVA_AGENCIES,
} from "@/lib/backoffice-data"
import { generateAppointmentConfirmationEmailHtml, generateAppointmentPdfUrl } from "@/lib/email-templates"

import {
  Building,
  User,
  Users,
  TrendingUp,
  CreditCard,
  FileText,
  Info,
  LogOut,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eraser,
  Clock,
  Calendar,
  Upload,
  Save,
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
import { Alert, AlertDescription } from "@/components/ui/alert"













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
  name: string; // Added to match backoffice data structure
  type: "natural" | "juridica"
  status: "incompleta" | "pendiente_aprobacion" | "aprobada" | "rechazada"
  formData: FormDataNatural
  createdAt: number
  lastUpdated: number
  progressPercentage: number; // Added to match backoffice data structure
}

// Field definitions for each section
const naturalPersonFieldDefinitions = {
  institutionData: {
    label: "Datos de la Institución",
    fields: [
      { key: "name", label: "NOMBRE DE LA INSTITUCIÓN DEL SECTOR BANCARIO" },
      { key: "fiscalId", label: "REGISTRO DE INFORMACIÓN FISCAL" },
      { key: "branch", label: "SUCURSAL O AGENCIA" },
      { key: "managerName", label: "NOMBRE DEL GERENTE" },
      { key: "executiveName", label: "NOMBRE DEL EJECUTIVO" },
    ],
  },
  personalData: {
    label: "Datos Personales",
    fields: [
      { key: "documentType", label: "TIPO DE DOCUMENTO" },
      { key: "documentNumber", label: "NÚMERO DE DOCUMENTO" },
      { key: "names", label: "NOMBRES" },
      { key: "lastNames", label: "APELLIDOS" },
      { key: "birthDate", label: "FECHA DE NACIMIENTO" },
      { key: "birthPlace", label: "LUGAR DE NACIMIENTO" },
      { key: "nationality", label: "NACIONALIDAD" },
      { key: "gender", label: "GÉNERO" },
      { key: "profession", label: "PROFESIÓN U OFICIO" },
      { key: "civilStatus", label: "ESTADO CIVIL" },
      { key: "phone", label: "TELÉFONO" },
      { key: "address", label: "DIRECCIÓN" },
      { key: "email", label: "CORREO ELECTRÓNICO" },
      { key: "housingCondition", label: "CONDICIÓN DE LA VIVIENDA" },
    ],
  },
  referenceData: {
    label: "Referencias",
    fields: [
      { key: "bankName", label: "INSTITUCIÓN BANCARIA" },
      { key: "bankAccountType", label: "TIPO DE CUENTA" },
      { key: "bankAccountNumber", label: "NÚMERO DE CUENTA" },
      { key: "bankAccountYears", label: "ANTIGÜEDAD" },
      { key: "personalReferenceName", label: "NOMBRE COMPLETO" },
      { key: "personalReferencePhone", label: "TELÉFONO" },
      { key: "personalReferenceRelation", label: "RELACIÓN" },
    ],
  },
  economicData: {
    label: "Información Económica",
    fields: [
      { key: "currentOccupation", label: "OCUPACIÓN ACTUAL" },
      { key: "companyName", label: "NOMBRE DE LA EMPRESA" },
      { key: "position", label: "CARGO" },
      { key: "yearsInCompany", label: "ANTIGÜEDAD" },
      { key: "companyPhone", label: "TELÉFONO DE LA EMPRESA" },
      { key: "companyAddress", label: "DIRECCIÓN DE LA EMPRESA" },
      { key: "monthlyIncome", label: "INGRESOS MENSUALES (USD)" },
      { key: "otherIncome", label: "OTROS INGRESOS (USD)" },
      { key: "totalIncome", label: "TOTAL INGRESOS (USD)" },
    ],
  },
  productData: {
    label: "Producto Bancario",
    fields: [
      { key: "productType", label: "TIPO DE PRODUCTO" },
      { key: "currency", label: "MONEDA" },
      { key: "averageMonthlyAmount", label: "MONTO PROMEDIO MENSUAL (USD)" },
      { key: "fundsOrigin", label: "ORIGEN DE LOS FONDOS" },
      { key: "accountPurpose", label: "PROPÓSITO DE LA CUENTA" },
      { key: "estimatedMonthlyTransactions", label: "TRANSACCIONES MENSUALES ESTIMADAS" },
      { key: "averageTransactionAmount", label: "MONTO PROMEDIO POR TRANSACCIÓN (USD)" },
      { key: "internationalTransactions", label: "¿REALIZARÁ TRANSACCIONES INTERNACIONALES?" },
    ],


export default function ClienteNaturalPage() {
  // State for loading and UI
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("institucion");
  
  // Form and submission state
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSaveResultModal, setShowSaveResultModal] = useState(false);
  
  // Appointment scheduling state
  const [citaData, setCitaData] = useState({
    fecha: "",
    agenciaId: "",
    hora: "",
    mensaje: "",
  });
  
  const [showCitaModal, setShowCitaModal] = useState(false);
  const [showCitaConfirmModal, setShowCitaConfirmModal] = useState(false);
  const [hasConfirmedAppointment, setHasConfirmedAppointment] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [unavailableMessage, setUnavailableMessage] = useState("");
  
  const [availableAgenciesForDate, setAvailableAgenciesForDate] = useState<
    Array<{ id: string; nombre: string; direccion: string }>
  >([]);
  
  const [citaConfirmDetails, setCitaConfirmDetails] = useState<ConfirmedAppointment | null>({
    id: "",
    userId: "",
    clientType: "natural",
    fecha: "",
    hora: "",
    agenciaNombre: "",
    agenciaDireccion: "",
    clientEmail: "",
    bankEmail: "citas@bbva.com",
    createdAt: 0,
  });
  
  // Backoffice settings state
  const [backofficeSettings, setBackofficeSettings] = useState({
    enabledClientTypes: { natural: true, juridica: true },
    agencies: [],
    fieldVisibility: {
      institutionData: {},
      personalData: {},
      referenceData: {},
      economicData: {},
      economicActivity: {},
      taxData: {},
      bankData: {},
      additionalData: {},
      documents: {},
    },
  });

  // Hooks
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get("id");
  const clientType: "natural" | "juridica" = "natural";

  // Form handling with React Hook Form and Zod validation
  const { 
    register, 
    handleSubmit, 
    setValue, 
    getValues, 
    watch, 
    trigger, 
    formState: { errors } 
  } = useForm<FormDataNatural>({
    resolver: zodResolver(formSchemaNatural),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  // Watch form data for side effects
  const watchedFormData = watch();
  const watchedEconomicData = watch("economicData");

  // Default values for clearing sections - DEFINED BEFORE useForm
  const defaultFormValues: FormDataNatural = useMemo(
    () => ({
      institutionData: {
        name: "",
        fiscalId: "",
        branch: "",
        managerName: "",
        executiveName: "",
      },
      personalData: {
        documentType: "",
        documentNumber: "",
        names: "",
        lastNames: "",
        birthDate: "",
        birthPlace: "",
        nationality: "",
        gender: "",
        profession: "",
        civilStatus: "",
        phone: "",
        address: "",
        email: "",
        housingCondition: "",
      },
      referenceData: {
        bankName: "",
        bankAccountType: "",
        bankAccountNumber: "",
        bankAccountYears: "",
        personalReferenceName: "",
        personalReferencePhone: "",
        personalReferenceRelation: "",
      },
      economicData: {
        currentOccupation: "",
        companyName: "",
        position: "",
        yearsInCompany: "",
        companyPhone: "",
        companyAddress: "",
        monthlyIncome: undefined,
        otherIncome: undefined,
        totalIncome: undefined,
      },
      productData: {
        productType: "",
        currency: "",
        averageMonthlyAmount: undefined,
        fundsOrigin: "",
        accountPurpose: "",
        estimatedMonthlyTransactions: undefined,
        averageTransactionAmount: undefined,
        internationalTransactions: "",
      },
    }),
    [],
  )

  // useForm hook - MUST be declared before any use of its return values
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger, // To manually trigger validation
    getValues, // To get current form values
    reset, // To reset the entire form
  } = useForm<FormDataNatural>({
    resolver: zodResolver(formSchemaNatural),
    defaultValues: defaultFormValues, // Use empty defaults, load from localStorage if available
    mode: "onChange", // Validate on change for better UX
  })

  const watchedEconomicData = watch("economicData")
  const watchedPersonalDataEmail = watch("personalData.email")
  const watchedFormData = watch() // Watch all form data for saving to local storage

  // Helper to check if a field is visible based on backoffice settings
  const isFieldVisible = useCallback(
    (section: keyof FormDataNatural, field: string) => {
      // Ensure backofficeSettings and its nested properties are defined
      if (!backofficeSettings || !backofficeSettings.fieldVisibility || !backofficeSettings.fieldVisibility.natural) {
        return true // Default to visible if settings are not fully loaded or structured as expected
      }
      const sectionVisibility = backofficeSettings.fieldVisibility.natural[section]
      if (!sectionVisibility) return true // Default to visible if no specific settings for this section
      return sectionVisibility[field] ?? true // Use nullish coalescing for default true
    },
    [backofficeSettings],
  )

  // Helper to determine if a section (tab) should be visible
  const isSectionVisible = useCallback(
    (sectionName: keyof z.infer<typeof formSchemaNatural> | "archivos") => {
      // Ensure backofficeSettings and visibleSections are defined and visibleSections is an array
      if (!backofficeSettings || !Array.isArray(backofficeSettings.visibleSections)) {
        // If settings are not fully loaded or visibleSections is not an array,
        // default to showing all sections for now to prevent errors.
        return true
      }

      // Check if the section is explicitly listed as visible in backoffice settings
      const isExplicitlyVisible = backofficeSettings.visibleSections.includes(sectionName)

      // If the section is not explicitly visible, then it's hidden.
      if (!isExplicitlyVisible) {
        return false
      }

      // If it is explicitly visible, then check if any of its fields are visible.
      if (sectionName === "archivos") return true // Files section is always visible if explicitly enabled

      const sectionDefinitions =
        naturalPersonFieldDefinitions[sectionName as keyof typeof naturalPersonFieldDefinitions]
      if (!sectionDefinitions) return false // Should not happen if sectionName is valid

      // If the section is explicitly visible, and it has fields, check if at least one field is visible.
      // This ensures that a section isn't shown if all its fields are hidden.
      return sectionDefinitions.fields.some((field) => isFieldVisible(sectionName, field.key))
    },
    [backofficeSettings, isFieldVisible],
  )

  // Helper to determine if a section is "complete" based on key fields having values AND being visible
  const isSectionComplete = useCallback(
    (tabName: keyof FormDataNatural | "archivos"): boolean => {
      let hasZodErrors = false
      switch (tabName) {
        case "institutionData":
          hasZodErrors = Object.keys(errors.institutionData || {}).length > 0
          break
        case "personalData":
          hasZodErrors = Object.keys(errors.personalData || {}).length > 0
          break
        case "referenceData":
          hasZodErrors = Object.keys(errors.referenceData || {}).length > 0
          break
        case "economicData":
          hasZodErrors = Object.keys(errors.economicData || {}).length > 0
          break
        case "productData":
          hasZodErrors = Object.keys(errors.productData || {}).length > 0
          break
        case "archivos":
          hasZodErrors = false // Files section is always considered complete for now
          break
      }

      if (hasZodErrors) {
        return false
      }

      // Add custom logic to determine if a section is complete based on visible fields
      const currentData = getValues()[tabName as keyof z.infer<typeof formSchemaNatural>]
      if (!currentData && tabName !== "archivos") return false

      let requiredFields: string[] = []
      switch (tabName) {
        case "institutionData":
          requiredFields = ["name", "fiscalId", "branch", "managerName", "executiveName"]
          break
        case "personalData":
          requiredFields = [
            "documentType",
            "documentNumber",
            "names",
            "lastNames",
            "birthDate",
            "birthPlace",
            "nationality",
            "gender",
            "profession",
            "civilStatus",
            "phone",
            "address",
            "email",
            "housingCondition",
          ]
          break
        case "referenceData":
          requiredFields = [
            "bankName",
            "bankAccountType",
            "bankAccountNumber",
            "bankAccountYears",
            "personalReferenceName",
            "personalReferencePhone",
            "personalReferenceRelation",
          ]
          break
        case "economicData":
          requiredFields = [
            "currentOccupation",
            "companyName",
            "position",
            "yearsInCompany",
            "companyPhone",
            "companyAddress",
            "monthlyIncome",
            "otherIncome",
            "totalIncome",
          ]
          break
        case "productData":
          requiredFields = [
            "productType",
            "currency",
            "averageMonthlyAmount",
            "fundsOrigin",
            "accountPurpose",
            "estimatedMonthlyTransactions",
            "averageTransactionAmount",
            "internationalTransactions",
          ]
          break
        case "archivos":
          return true // Always true for now
      }

      // Check only visible and required fields
      return requiredFields.every((field) => {
        const isFieldCurrentlyVisible = isFieldVisible(tabName as string, field)
        if (!isFieldCurrentlyVisible) return true // If hidden, it's considered complete for this check

        const fieldValue = (currentData as any)?.[field]
        // For numbers, check if it's a valid number greater than 0 if required
        if (typeof fieldValue === "number") {
          return fieldValue > 0
        }
        // For strings, check if it's not empty
        return !!fieldValue && String(fieldValue).trim() !== ""
      })
    },
    [getValues, errors, isFieldVisible], // Added isFieldVisible to dependencies
  )

  // Calculate visible tabs for dynamic TabsList grid-cols and default active tab
  const visibleTabs = useMemo(
    () =>
      (["institutionData", "personalData", "referenceData", "economicData", "productData", "archivos"] as const).filter(
        (tab) => isSectionVisible(tab),
      ),
    [isSectionVisible],
  )

  // Calculate progress percentage using useMemo to prevent excessive re-renders
  const progressPercentage = useMemo(() => {
    let completedSections = 0
    const sectionsToCheck: (keyof z.infer<typeof formSchemaNatural> | "archivos")[] = [
      "institutionData",
      "personalData",
      "referenceData",
      "economicData",
      "productData",
      "archivos",
    ]

    const visibleSectionsCount = sectionsToCheck.filter((section) => isSectionVisible(section)).length

    sectionsToCheck.forEach((section) => {
      if (isSectionVisible(section) && isSectionComplete(section)) {
        completedSections++
      }
    })

    return visibleSectionsCount > 0 ? Math.round((completedSections / visibleSectionsCount) * 100) : 0
  }, [
    isSectionComplete,
    isSectionVisible,
    // No need for backofficeSettings.showInstitutionData, backofficeSettings.showDocumentType, getValues, errors here
    // as they are already dependencies of isSectionVisible and isSectionComplete
  ])

  // Load user data and draft form data on mount
  useEffect(() => {
    // If clientId is present in URL, it means we are editing from backoffice
    if (clientIdFromUrl) {
      const allClients = getClientApplications();
      const existingClient = allClients.find((client) => client.id === clientIdFromUrl && client.type === clientType);

      if (existingClient) {
        setUserData(existingClient.userId);
        const naturalFormData = existingClient.formData as FormDataNatural;
        (Object.keys(naturalFormData) as Array<keyof FormDataNatural>).forEach((key) => {
          setValue(key, naturalFormData[key], { shouldValidate: true });
        });
        toast({
          title: "Datos de cliente cargados para edición",
          description: "Se han cargado los datos del cliente para su modificación.",
        });
        console.log(`[TRACKING] Datos de Persona Natural cargados desde backoffice para edición: ${clientIdFromUrl}.`);
      } else {
        toast({
          title: "Cliente no encontrado",
          description: "No se pudieron cargar los datos del cliente para edición.",
          variant: "destructive",
        });
        router.push("/backoffice/clients");
      }
      return; // Exit early if editing from backoffice
    }

    // Normal client-side flow
    const user = localStorage.getItem("bbva_user");
    if (!user) {
      router.push("/");
      return;
    }
    setUserData(JSON.parse(user))
    console.log(`[TRACKING] Aplicación de Persona Natural iniciada para: ${JSON.parse(user).username}`)

    // Check if this client type is enabled from backoffice settings
    if (!backofficeSettings.enabledClientTypes.natural) {
      toast({
        title: "Acceso Denegado",
        description: `La ficha de Persona Natural está deshabilitada por el administrador.`,
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
            setValue(key as keyof z.infer<typeof formSchemaNatural>, data[key], { shouldValidate: true })
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
            setValue(key as keyof z.infer<typeof formSchemaNatural>, existingClient.formData[key], { shouldValidate: true })
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
    const sectionsOrder: (keyof z.infer<typeof formSchemaNatural> | "archivos")[] = [
      "institutionData",
      "personalData",
      "referenceData",
      "economicData",
      "productData",
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

  // Calculate total income whenever monthlyIncome or otherIncome changes
  useEffect(() => {
    const total = (Number(watchedEconomicData.monthlyIncome) || 0) + (Number(watchedEconomicData.otherIncome) || 0)
    setValue("economicData.totalIncome", total)
  }, [watchedEconomicData.monthlyIncome, watchedEconomicData.otherIncome, setValue])

  const handleSave = handleSubmit(
    async (data) => {
      setLoading(true)
      console.log("[TRACKING] Intento de guardar datos de Persona Natural iniciado.")

      // Simulate saving data
      setTimeout(() => {
        setSaveResult({ success: true, message: "Su información ha sido actualizada exitosamente." })
        setShowSaveResultModal(true)
        setLoading(false)
        console.log("[TRACKING] Datos de Persona Natural guardados exitosamente.")
        console.log("[TRACKING] Datos guardados:", data)

        // Update global client applications data for backoffice
        const allClients: ClientApplication[] = JSON.parse(localStorage.getItem("bbva_client_applications") || "[]")
        const targetUserId = clientIdFromUrl
          ? allClients.find((c) => c.id === clientIdFromUrl)?.userId
          : userData.username
        const existingClientIndex = allClients.findIndex(
          (client) =>
            (clientIdFromUrl ? client.id === clientIdFromUrl : client.userId === targetUserId) &&
            client.type === "natural",
        )

                const newClientData: ClientApplication = {
          id: existingClientIndex !== -1 ? allClients[existingClientIndex].id : nanoid(),
          userId: targetUserId,
          name: `${data.personalData.names} ${data.personalData.lastNames}`.trim(), // Construct name from form data
          type: "natural",
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
        console.log("[TRACKING] Datos de Persona Natural actualizados en la base de datos simulada para backoffice.")

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
      setLoading(false)
      console.log("[TRACKING] Guardado de Persona Natural fallido: Errores de validación.", errors)
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
      console.log(`[TRACKING] Solicitud de cita de Persona Natural fallida: Ya tiene una cita agendada.`)
      return
    }

    if (progressPercentage !== 100) {
      toast({
        title: "Formulario Incompleto",
        description: "Debe completar todas las secciones del formulario (100%) para solicitar una cita.",
        variant: "destructive",
      })
      console.log(
        `[TRACKING] Solicitud de cita de Persona Natural fallida: Formulario no completado al 100%. Progreso: ${progressPercentage}%`,
      )
      return
    }

    // Establecer fecha mínima como próximo día hábil
    setCitaData((prev) => ({ ...prev, fecha: getProximoDiaHabil() }))
    setShowCitaModal(true)
    console.log(`[TRACKING] Modal de agendar cita de Persona Natural abierto.`)
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
      console.log(`[TRACKING] Confirmación de cita de Persona Natural fallida: Datos incompletos.`)
      return
    }

    if (!esDiaHabilBancario(citaData.fecha)) {
      toast({
        title: "Fecha inválida",
        description: "La fecha seleccionada no es un día hábil bancario.",
        variant: "destructive",
      })
      console.log(`[TRACKING] Confirmación de cita de Persona Natural fallida: Fecha inválida (${citaData.fecha}).`)
      return
    }

    setLoading(true)
    console.log("[TRACKING] Confirmación de cita de Persona Natural iniciada.")

    // Simulate API call
    setTimeout(() => {
      const agenciaSeleccionadaDetails = ALL_BBVA_AGENCIES.find((a) => a.id === citaData.agenciaId)
      const clientEmail = watchedPersonalDataEmail || "correo.cliente@ejemplo.com" // Use actual email or fallback
      const clientName = userData || "Cliente" // Get client name

      if (!agenciaSeleccionadaDetails) {
        toast({
          title: "Error de Agencia",
          description: "No se pudo encontrar la agencia seleccionada.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const confirmedAppt: ConfirmedAppointment = {
        id: nanoid(),
        userId: userData.username,
        clientType: "natural",
        fecha: citaData.fecha,
        hora: citaData.hora,
        agenciaNombre: agenciaSeleccionadaDetails.nombre,
        agenciaDireccion: agenciaSeleccionadaDetails.direccion,
        clientEmail: clientEmail,
        bankEmail: "citas@bbva.com",
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
        `[TRACKING] Cita de Persona Natural agendada exitosamente para ${citaData.fecha} a las ${citaData.hora} en ${agenciaSeleccionadaDetails.nombre}.`,
      )
      console.log(`[TRACKING] Correo de confirmación enviado a: ${clientEmail}`)
      console.log(`[TRACKING] Notificación enviada al banco a: citas@bbva.com`)
      console.log("Simulated Email HTML:", emailContent) // Log the email content

      // Reset form
      setCitaData({ fecha: "", agenciaId: "", hora: "", mensaje: "" })
      setLoading(false)
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
    // localStorage.removeItem("bbva_natural_draft") // Do NOT remove bbva_natural_draft here, it should persist for 5 minutes
    localStorage.removeItem("bbva_confirmed_appointment") // Clear confirmed appointment on logout
    router.push("/")
    console.log("[TRACKING] Sesión de Persona Natural cerrada.")
  }

  // Function to clear fields of a specific section
  const handleClearSection = (sectionName: keyof FormDataNatural) => {
    const sectionFields = naturalPersonFieldDefinitions[sectionName].fields
    sectionFields.forEach((field) => {
      const fieldPath = `${sectionName}.${field.key}` as any
      // Reset based on type or to empty string/undefined
      const defaultValue = (defaultFormValues as any)[sectionName]?.[field.key]
      setValue(fieldPath, defaultValue, { shouldValidate: true })
    })
    toast({
      title: "Sección Limpiada",
      description: `Los campos de la sección "${naturalPersonFieldDefinitions[sectionName].label}" han sido borrados.`,
    })
    console.log(`[TRACKING] Campos de la sección "${sectionName}" limpiados.`)
  }

  const getTabIcon = (tabName: keyof FormDataNatural | "archivos") => {
    let hasZodErrors = false
    switch (tabName) {
      case "institutionData":
        hasZodErrors = Object.keys(errors.institutionData || {}).length > 0
        break
      case "personalData":
        hasZodErrors = Object.keys(errors.personalData || {}).length > 0
        break
      case "referenceData":
        hasZodErrors = Object.keys(errors.referenceData || {}).length > 0
        break
      case "economicData":
        hasZodErrors = Object.keys(errors.economicData || {}).length > 0
        break
      case "productData":
        hasZodErrors = Object.keys(errors.productData || {}).length > 0
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

  const renderField = (
    section: keyof FormDataNatural,
    field: string,
    label: string,
    type = "text",
    options?: { value: string; label: string }[],
  ) => {
    if (!isFieldVisible(section as string, field)) {
      return null // Do not render if not visible
    }

    const fieldPath = `${section}.${field}` as any // Type assertion for register
    const error = (errors as any)?.[section]?.[field]

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
            value={watch(fieldPath)}
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
              <h1 className="text-xl font-bold">Ficha de Cliente - Persona Natural</h1>
              <p className="text-blue-200">Bienvenido/a {userData}</p>
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
              {Math.round(progressPercentage / (100 / 6))} de 6 secciones completadas
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
            {isSectionVisible("institutionData") && (
              <TabsTrigger
                value="institucion"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                Institución {getTabIcon("institutionData")}
              </TabsTrigger>
            )}
            {isSectionVisible("personalData") && (
              <TabsTrigger value="personal" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Personal {getTabIcon("personalData")}
              </TabsTrigger>
            )}
            {isSectionVisible("referenceData") && (
              <TabsTrigger
                value="referencias"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Referencias {getTabIcon("referenceData")}
              </TabsTrigger>
            )}
            {isSectionVisible("economicData") && (
              <TabsTrigger value="economica" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Económica {getTabIcon("economicData")}
              </TabsTrigger>
            )}
            {isSectionVisible("productData") && (
              <TabsTrigger value="producto" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Producto {getTabIcon("productData")}
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
                  onClick={() => handleClearSection("institutionData")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderField("institutionData", "name", "NOMBRE DE LA INSTITUCIÓN DEL SECTOR BANCARIO")}
                  {renderField("institutionData", "fiscalId", "REGISTRO DE INFORMACIÓN FISCAL")}
                  {renderField("institutionData", "branch", "SUCURSAL O AGENCIA")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {renderField("institutionData", "managerName", "NOMBRE DEL GERENTE")}
                  {renderField("institutionData", "executiveName", "NOMBRE DEL EJECUTIVO")}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Datos Personales */}
          <TabsContent value="personal">
            <Card>
              <CardHeader className="bg-yellow-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  DATOS PERSONALES DEL CLIENTE
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSection("personalData")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {isFieldVisible("personalData", "documentType") &&
                    isFieldVisible("personalData", "documentNumber") && (
                      <div>
                        <Label htmlFor="docType" className="text-blue-900 font-medium">
                          DOCUMENTO DE IDENTIDAD:
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Select
                            value={watch("personalData.documentType")}
                            onValueChange={(value) => {
                              setValue("personalData.documentType", value)
                              trigger("personalData.documentType")
                            }}
                            disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                          >
                            <SelectTrigger className={`${errors.personalData?.documentType ? "border-red-500" : ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="V">V</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                              <SelectItem value="P">P</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            id="docNumber"
                            {...register("personalData.documentNumber")}
                            className={`mt-1 ${errors.personalData?.documentNumber ? "border-red-500" : ""}`}
                            disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                          />
                        </div>
                        {errors.personalData?.documentNumber && (
                          <p className="text-red-500 text-sm mt-1">{errors.personalData.documentNumber.message}</p>
                        )}
                      </div>
                    )}
                  {renderField("personalData", "names", "NOMBRES")}
                  {renderField("personalData", "lastNames", "APELLIDOS")}
                  {renderField("personalData", "birthDate", "FECHA DE NACIMIENTO", "date")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {renderField("personalData", "birthPlace", "LUGAR DE NACIMIENTO")}
                  {renderField("personalData", "nationality", "NACIONALIDAD", "select", [
                    { value: "Venezolana", label: "Venezolana" },
                    { value: "Colombiana", label: "Colombiana" },
                    { value: "Estadounidense", label: "Estadounidense" },
                    { value: "Española", label: "Española" },
                    { value: "Otra", label: "Otra" },
                  ])}
                  {renderField("personalData", "gender", "GÉNERO", "select", [
                    { value: "M", label: "Masculino" },
                    { value: "F", label: "Femenino" },
                  ])}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {renderField("personalData", "profession", "PROFESIÓN U OFICIO")}
                  {renderField("personalData", "civilStatus", "ESTADO CIVIL", "select", [
                    { value: "Soltero", label: "Soltero" },
                    { value: "Casado", label: "Casado" },
                    { value: "Divorciado", label: "Divorciado" },
                    { value: "Viudo", label: "Viudo" },
                  ])}
                  {renderField("personalData", "phone", "TELÉFONO")}
                </div>

                <div className="mt-6">{renderField("personalData", "address", "DIRECCIÓN", "textarea")}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {renderField("personalData", "email", "CORREO ELECTRÓNICO", "email")}
                  {renderField("personalData", "housingCondition", "CONDICIÓN DE LA VIVIENDA", "select", [
                    { value: "Propia", label: "Propia" },
                    { value: "Alquilada", label: "Alquilada" },
                    { value: "Familiar", label: "Familiar" },
                  ])}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referencias */}
          <TabsContent value="referencias">
            <Card>
              <CardHeader className="bg-yellow-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  REFERENCIA DEL CLIENTE
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSection("referenceData")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Referencia Bancaria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {renderField("referenceData", "bankName", "INSTITUCIÓN BANCARIA")}
                      {renderField("referenceData", "bankAccountType", "TIPO DE CUENTA", "select", [
                        { value: "Corriente", label: "Corriente" },
                        { value: "Ahorro", label: "Ahorro" },
                      ])}
                      {renderField("referenceData", "bankAccountNumber", "NÚMERO DE CUENTA")}
                      {renderField("referenceData", "bankAccountYears", "ANTIGÜEDAD")}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Referencia Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {renderField("referenceData", "personalReferenceName", "NOMBRE COMPLETO")}
                      {renderField("referenceData", "personalReferencePhone", "TELÉFONO")}
                      {renderField("referenceData", "personalReferenceRelation", "RELACIÓN", "select", [
                        { value: "Familiar", label: "Familiar" },
                        { value: "Amigo", label: "Amigo" },
                        { value: "Colega", label: "Colega" },
                        { value: "Otro", label: "Otro" },
                      ])}
                    </div>
                  </div>
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
                  INFORMACIÓN ECONÓMICO FINANCIERA DEL CLIENTE
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSection("economicData")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField("economicData", "currentOccupation", "OCUPACIÓN ACTUAL")}
                  {renderField("economicData", "companyName", "NOMBRE DE LA EMPRESA")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {renderField("economicData", "position", "CARGO")}
                  {renderField("economicData", "yearsInCompany", "ANTIGÜEDAD")}
                  {renderField("economicData", "companyPhone", "TELÉFONO DE LA EMPRESA")}
                </div>

                <div className="mt-6">
                  {renderField("economicData", "companyAddress", "DIRECCIÓN DE LA EMPRESA", "textarea")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {renderField("economicData", "monthlyIncome", "INGRESOS MENSUALES (USD)", "number")}
                  {renderField("economicData", "otherIncome", "OTROS INGRESOS (USD)", "number")}
                  {renderField("economicData", "totalIncome", "TOTAL INGRESOS (USD)", "number")}
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
                  onClick={() => handleClearSection("productData")}
                  disabled={hasConfirmedAppointment && !clientIdFromUrl} // Disable only for client-side user
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderField("productData", "productType", "TIPO DE PRODUCTO", "select", [
                    { value: "cuenta-corriente", label: "Cuenta Corriente" },
                    { value: "cuenta-ahorro", label: "Cuenta de Ahorro" },
                    { value: "tarjeta-credito", label: "Tarjeta de Crédito" },
                    { value: "prestamo", label: "Préstamo Personal" },
                  ])}
                  {renderField("productData", "currency", "MONEDA", "select", [
                    { value: "USD", label: "USD" },
                    { value: "VES", label: "VES" },
                    { value: "EUR", label: "EUR" },
                  ])}
                  {renderField("productData", "averageMonthlyAmount", "MONTO PROMEDIO MENSUAL (USD)", "number")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {renderField("productData", "fundsOrigin", "ORIGEN DE LOS FONDOS", "select", [
                    { value: "salario", label: "Salario" },
                    { value: "ahorros", label: "Ahorros" },
                    { value: "inversion", label: "Inversiones" },
                    { value: "herencia", label: "Herencia" },
                    { value: "otro", label: "Otro" },
                  ])}
                  {renderField("productData", "accountPurpose", "PROPÓSITO DE LA CUENTA", "select", [
                    { value: "ahorro", label: "Ahorro" },
                    { value: "gastos", label: "Gastos Diarios" },
                    { value: "inversion", label: "Inversión" },
                    { value: "negocio", label: "Negocio" },
                    { value: "otro", label: "Otro" },
                  ])}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {renderField(
                    "productData",
                    "estimatedMonthlyTransactions",
                    "TRANSACCIONES MENSUALES ESTIMADAS",
                    "number",
                  )}
                  {renderField(
                    "productData",
                    "averageTransactionAmount",
                    "MONTO PROMEDIO POR TRANSACCIÓN (USD)",
                    "number",
                  )}
                  {renderField(
                    "productData",
                    "internationalTransactions",
                    "¿REALIZARÁ TRANSACCIONES INTERNACIONALES?",
                    "select",
                    [
                      { value: "si", label: "Sí" },
                      { value: "no", label: "No" },
                    ],
                  )}
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
                    <h3 className="font-medium text-blue-900 mb-2">Documento de Identidad</h3>
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Suba una copia de su cédula o pasaporte vigente (ambos lados).
                      </p>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="upload-id"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Subir documento de identidad
                          <Input
                            id="upload-id"
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
                    <h3 className="font-medium text-blue-900 mb-2">Comprobante de Ingresos</h3>
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Suba un recibo de nómina reciente, declaración de impuestos u otro comprobante de ingresos.
                      </p>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="upload-income"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Subir comprobante de ingresos
                          <Input
                            id="upload-income"
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
                    <h3 className="font-medium text-blue-900 mb-2">Formulario de Referencia</h3>
                    <div className="border rounded-md p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Suba el formulario de referencia bancaria o personal debidamente completado.
                      </p>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="upload-reference"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-900 px-3 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Subir formulario de referencia
                          <Input
                            id="upload-reference"
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
              <h3 className="font-semibold text-blue-900 mb-2">🏢 Datos de la Institución</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Complete la información de la sucursal BBVA donde desea abrir su cuenta</li>
                <li>• Todos los campos son obligatorios</li>
                <li>• El RIF de BBVA Provincial es J-00000012-0</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">👤 Datos Personales</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Use su documento de identidad vigente (V, E, o P)</li>
                <li>• La dirección debe ser completa y actualizada</li>
                <li>• Teléfonos: Celular (0412, 0424, 0414, 0416, 0426) o fijo (0212, 0213, etc.)</li>
                <li>• El correo electrónico será usado para notificaciones importantes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">👥 Referencias</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Referencia bancaria: Cuenta activa en otra institución financiera</li>
                <li>• Referencia personal: Persona que lo conozca y pueda dar referencias</li>
                <li>• El teléfono de referencia personal debe ser fijo (línea CANTV)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💰 Información Económica</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Indique su actividad económica principal</li>
                <li>• Si trabaja en relación de dependencia, complete los datos de la empresa</li>
                <li>• Los ingresos deben ser en USD</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💳 Producto Bancario</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Seleccione el tipo de cuenta que desea abrir</li>
                <li>• Indique el monto promedio que manejará mensualmente</li>
                <li>• Estime el número de transacciones mensuales</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">📎 Documentos (Opcional)</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Los archivos son opcionales pero pueden acelerar la aprobación</li>
                <li>• Formatos aceptados: PDF, DOC, DOCX, JPG, PNG</li>
                <li>• Tamaño máximo: 10MB para documentos, 5MB para imágenes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">🗓️ Solicitud de Cita</h3>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Solo disponible cuando complete todas las secciones obligatorias</li>
                <li>• Las citas solo se pueden agendar en días hábiles bancarios</li>
                <li>• Horario de atención: 8:00 AM a 4:30 PM</li>
                <li>• Recibirá confirmación por correo electrónico</li>
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
