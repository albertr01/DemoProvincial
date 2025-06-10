// --- Interfaces ---
export interface BackofficeSettings {
  enabledClientTypes: {
    natural: boolean
    juridica: boolean
  }
  fieldVisibility: {
    natural: { [key: string]: { [field: string]: boolean } }
    juridica: { [key: string]: { [field: string]: boolean } }
  }
  visibleSections: string[] // Added visibleSections to interface
  agencies: ParameterizedAgencySettings[]
}

export interface ParameterizedAgencySettings {
  id: string
  maxAppointmentsPerDay: number
  availableHours: string[]
}

export interface ClientApplication {
  id: string
  userId: string
  name: string // Added name for easier display in backoffice
  type: "natural" | "juridica"
  status: "incompleta" | "pendiente_aprobacion" | "aprobada" | "rechazada"
  formData: any // Use 'any' for now to accommodate both schemas
  createdAt: number
  lastUpdated: number
  progressPercentage: number // Added progressPercentage
  uploadedDocuments?: { name: string; url: string }[] // Added uploadedDocuments
}

export interface ConfirmedAppointment {
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
  pdfUrl?: string
  clientId?: string // Link to client application
  status: "agendada" | "procesada" | "cancelada" | "completada" // Added status tracking
  cancelReason?: string // Added cancel reason
  processedAt?: number // Added processed timestamp
  canceledAt?: number // Added canceled timestamp
  completedAt?: number // Added completed timestamp
}

// Enhanced tracking interfaces
export interface ClientTrackingMetrics {
  totalFichas: number
  fichasIncompletas: number
  fichasPendientes: number
  fichasAprobadas: number
  fichasRechazadas: number
  fichasHoy: number
  fichasEstaSemana: number
  fichasEsteMes: number
  promedioTiempoProcesamiento: number // in hours
  tasaAprobacion: number // percentage
}

export interface AppointmentTrackingMetrics {
  totalCitas: number
  citasAgendadas: number
  citasProcesadas: number
  citasCanceladas: number
  citasCompletadas: number
  citasHoy: number
  citasEstaSemana: number
  citasEsteMes: number
  promedioTiempoAtencion: number // in minutes
  tasaCompletacion: number // percentage
  motivosCancelacion: { [reason: string]: number }
}

// --- Mock Data ---

// Mock data for ALL_BBVA_AGENCIES
export const ALL_BBVA_AGENCIES = [
  { id: "agency-1", nombre: "Agencia Principal Caracas", direccion: "Av. Francisco de Miranda, Caracas", estado: "Distrito Capital" },
  { id: "agency-2", nombre: "Agencia Valencia Centro", direccion: "Av. Bolívar, Valencia", estado: "Carabobo" },
  { id: "agency-3", nombre: "Agencia Maracaibo Norte", direccion: "Av. 15 Delicias, Maracaibo", estado: "Zulia" },
  { id: "agency-4", nombre: "Agencia Barquisimeto Este", direccion: "Av. Lara, Barquisimeto", estado: "Lara" },
]

// Default backoffice settings
const defaultBackofficeSettings: BackofficeSettings = {
  enabledClientTypes: {
    natural: true,
    juridica: true,
  },
  fieldVisibility: {
    natural: {
      institutionData: {
        name: true,
        fiscalId: true,
        branch: true,
        managerName: true,
        executiveName: true,
      },
      personalData: {
        documentType: true,
        documentNumber: true,
        names: true,
        lastNames: true,
        birthDate: true,
        birthPlace: true,
        nationality: true,
        gender: true,
        profession: true,
        civilStatus: true,
        phone: true,
        address: true,
        email: true,
        housingCondition: true,
      },
      referenceData: {
        bankName: true,
        bankAccountType: true,
        bankAccountNumber: true,
        bankAccountYears: true,
        personalReferenceName: true,
        personalReferencePhone: true,
        personalReferenceRelation: true,
      },
      economicData: {
        currentOccupation: true,
        companyName: true,
        position: true,
        yearsInCompany: true,
        companyPhone: true,
        companyAddress: true,
        monthlyIncome: true,
        otherIncome: true,
        totalIncome: true,
      },
      productData: {
        productType: true,
        currency: true,
        averageMonthlyAmount: true,
        fundsOrigin: true,
        accountPurpose: true,
        estimatedMonthlyTransactions: true,
        averageTransactionAmount: true,
        internationalTransactions: true,
      },
    },
    juridica: {
      institucion: {
        nombre: true,
        registroFiscal: true,
        sucursal: true,
        gerente: true,
        ejecutivo: true,
      },
      identificacion: {
        registroFiscal: true,
        razonSocial: true,
        nombreComercial: true,
        actividadEconomica: true,
        actividadEspecifica: true,
        categoriaEspecial: true,
        "datosRegistro.nombre": true,
        "datosRegistro.numero": true,
        "datosRegistro.tomo": true,
        "datosRegistro.folio": true,
        "datosRegistro.fecha": true,
        "datosRegistro.capitalSocial": true,
        "ultimaModificacion.nombre": true,
        "ultimaModificacion.numero": true,
        "ultimaModificacion.tomo": true,
        "ultimaModificacion.folio": true,
        "ultimaModificacion.fecha": true,
        "ultimaModificacion.capitalActual": true,
        "entesPublicos.numeroGaceta": true,
        "entesPublicos.fecha": true,
        "entesPublicos.autoridadAdscripcion": true,
        "entesPublicos.codigoOnt": true,
        telefonos: true,
        sitioWeb: true,
        correo: true,
        "direccion.edificio": true,
        "direccion.piso": true,
        "direccion.oficina": true,
        "direccion.local": true,
        "direccion.calle": true,
        "direccion.urbanizacion": true,
        "direccion.municipio": true,
        "direccion.ciudad": true,
        "direccion.estado": true,
        "direccion.codigoPostal": true,
        "direccion.numeroFax": true,
      },
      economica: {
        "accionistas.0.nombre": true,
        "accionistas.0.documento": true,
        "accionistas.0.participacion": true,
        "representantesLegales.0.nombre": true,
        "representantesLegales.0.documento": true,
        "representantesLegales.0.cargo": true,
        "proveedores.0.nombre": true,
        "proveedores.0.producto": true,
        "proveedores.0.montoMensual": true,
        "clientes.0.nombre": true,
        "clientes.0.producto": true,
        "clientes.0.montoMensual": true,
        "empresasRelacionadas.0.nombre": true,
        "empresasRelacionadas.0.relacion": true,
        "referenciasBancarias.0.institucionSectorBancario": true,
        "referenciasBancarias.0.tipoProducto": true,
        "referenciasBancarias.0.numeroProducto": true,
        "referenciasBancarias.0.antiguedad": true,
        "subsidiarias.numeroSubsidiarias": true,
        "subsidiarias.paisMayorPresencia": true,
        "subsidiarias.numeroEmpleados": true,
        "subsidiarias.ventasMensuales": true,
        "subsidiarias.ingresosMensuales": true,
        "subsidiarias.egresosMensuales": true,
      },
      producto: {
        nombre: true,
        numeroProducto: true,
        moneda: true,
        montoPromedio: true,
        transaccionesMensuales: true,
        credito: true,
        debito: true,
        paisOrigen: true,
        paisDestino: true,
        usoMonedaVirtual: true,
      },
    },
  },
  visibleSections: [
    "institutionData",
    "personalData",
    "referenceData",
    "economicData",
    "productData",
    "archivos",
    "institucion",
    "identificacion",
    "economica",
    "producto",
  ], // All sections visible by default
  agencies: [
    { id: "agency-1", maxAppointmentsPerDay: 5, availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
    { id: "agency-2", maxAppointmentsPerDay: 3, availableHours: ["09:30", "10:30", "11:30"] },
    {
      id: "agency-3",
      maxAppointmentsPerDay: 7,
      availableHours: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
    },
    { id: "agency-4", maxAppointmentsPerDay: 4, availableHours: ["08:30", "09:30", "10:30", "11:30"] },
  ],
}

// Enhanced mock client applications data
const mockClientApplications: ClientApplication[] = [
  {
    id: "client-1-natural",
    userId: "user123",
    name: "Juan Pérez",
    type: "natural",
    status: "incompleta",
    formData: {
      institutionData: {
        name: "BBVA Provincial",
        fiscalId: "J-00000012-0",
        branch: "Agencia Principal Caracas",
        managerName: "Ana García",
        executiveName: "Carlos Ruiz",
      },
      personalData: {
        documentType: "V",
        documentNumber: "12345678",
        names: "Juan",
        lastNames: "Pérez",
        birthDate: "1985-05-10",
        birthPlace: "Caracas",
        nationality: "Venezolana",
        gender: "M",
        profession: "Ingeniero",
        civilStatus: "Soltero",
        phone: "04141234567",
        address: "Av. Libertador, Edif. Centro, Piso 5, Ofic. 501, Caracas",
        email: "juan.perez@example.com",
        housingCondition: "Alquilada",
      },
      referenceData: {
        bankName: "Banco Mercantil",
        bankAccountType: "Corriente",
        bankAccountNumber: "01050000000000000001",
        bankAccountYears: "5 años",
        personalReferenceName: "María Rodríguez",
        personalReferencePhone: "04129876543",
        personalReferenceRelation: "Amigo",
      },
      economicData: {
        currentOccupation: "Empleado",
        companyName: "Tech Solutions C.A.",
        position: "Desarrollador Senior",
        yearsInCompany: "3 años",
        companyPhone: "02125551234",
        companyAddress: "Calle 10, Edif. Tech, Caracas",
        monthlyIncome: 1500,
        otherIncome: 200,
        totalIncome: 1700,
      },
      productData: {
        productType: "cuenta-corriente",
        currency: "USD",
        averageMonthlyAmount: 1000,
        fundsOrigin: "salario",
        accountPurpose: "gastos",
        estimatedMonthlyTransactions: 20,
        averageTransactionAmount: 50,
        internationalTransactions: "no",
      },
    },
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    lastUpdated: Date.now() - 86400000 * 2, // 2 days ago
    progressPercentage: 75,
    uploadedDocuments: [
      { name: "Cedula_Juan_Perez.pdf", url: "/placeholder.svg?height=300&width=200" },
      { name: "Recibo_Nomina_Juan.pdf", url: "/placeholder.svg?height=300&width=200" },
    ],
  },
  {
    id: "client-2-juridica",
    userId: "empresaXYZ",
    name: "Empresa XYZ C.A.",
    type: "juridica",
    status: "pendiente_aprobacion",
    formData: {
      institucion: {
        nombre: "BBVA Provincial",
        registroFiscal: "J-00000012-0",
        sucursal: "Agencia Valencia Centro",
        gerente: "Pedro Martínez",
        ejecutivo: "Laura Blanco",
      },
      identificacion: {
        registroFiscal: "J-12345678-9",
        razonSocial: "Empresa XYZ C.A.",
        nombreComercial: "XYZ Solutions",
        actividadEconomica: "Tecnología",
        actividadEspecifica: "Desarrollo de Software",
        categoriaEspecial: "PYME",
        datosRegistro: {
          nombre: "Registro Mercantil Primero de Valencia",
          numero: "12345",
          tomo: "100-A",
          folio: "200",
          fecha: "2010-01-15",
          capitalSocial: 50000,
        },
        ultimaModificacion: {
          nombre: "Registro Mercantil Primero de Valencia",
          numero: "67890",
          tomo: "150-B",
          folio: "300",
          fecha: "2020-03-20",
          capitalActual: 75000,
        },
        entesPublicos: {
          numeroGaceta: "40.123",
          fecha: "2013-07-01",
          autoridadAdscripcion: "Ministerio de Ciencia y Tecnología",
          codigoOnt: "ONT-XYZ-001",
        },
        telefonos: "02418887777",
        sitioWeb: "https://www.xyzsolutions.com",
        correo: "contacto@xyzsolutions.com",
        direccion: {
          edificio: "Torre Empresarial",
          piso: "12",
          oficina: "1201",
          local: "",
          calle: "Av. Cedeño",
          urbanizacion: "Centro",
          municipio: "Valencia",
          ciudad: "Valencia",
          estado: "Carabobo",
          codigoPostal: "2001",
          numeroFax: "02418887778",
        },
      },
      economica: {
        accionistas: [
          { nombre: "Roberto Gómez", documento: "V-9876543", participacion: 60 },
          { nombre: "Sofía Castro", documento: "V-1122334", participacion: 40 },
        ],
        representantesLegales: [{ nombre: "Roberto Gómez", documento: "V-9876543", cargo: "Presidente" }],
        proveedores: [{ nombre: "Software Tools Inc.", producto: "Licencias de Software", montoMensual: 1500 }],
        clientes: [{ nombre: "Gran Empresa S.A.", producto: "Servicios de Consultoría", montoMensual: 3000 }],
        empresasRelacionadas: [{ nombre: "XYZ Marketing", relacion: "Filial" }],
        referenciasBancarias: [
          {
            institucionSectorBancario: "Banco Nacional de Crédito",
            tipoProducto: "Cuenta Corriente",
            numeroProducto: "01160000000000000002",
            antiguedad: "8 años",
          },
        ],
        subsidiarias: {
          numeroSubsidiarias: 1,
          paisMayorPresencia: "Colombia",
          numeroEmpleados: 50,
          ventasMensuales: 20000,
          ingresosMensuales: 25000,
          egresosMensuales: 18000,
        },
      },
      producto: {
        nombre: "Cuenta Jurídica Plus",
        numeroProducto: "01050000000000000003",
        moneda: "USD",
        montoPromedio: 5000,
        transaccionesMensuales: 50,
        credito: 10000,
        debito: 8000,
        paisOrigen: "Venezuela",
        paisDestino: "Estados Unidos",
        usoMonedaVirtual: "No",
      },
    },
    createdAt: Date.now() - 86400000 * 10, // 10 days ago
    lastUpdated: Date.now(),
    progressPercentage: 100,
    uploadedDocuments: [
      { name: "RIF_EmpresaXYZ.pdf", url: "/placeholder.svg?height=300&width=200" },
      { name: "Acta_Constitutiva_XYZ.pdf", url: "/placeholder.svg?height=300&width=200" },
    ],
  },
  {
    id: "client-3-natural-approved",
    userId: "user456",
    name: "María García",
    type: "natural",
    status: "aprobada",
    formData: {
      institutionData: {
        name: "BBVA Provincial",
        fiscalId: "J-00000012-0",
        branch: "Agencia Maracaibo Norte",
        managerName: "Luis Hernández",
        executiveName: "Sofía Pérez",
      },
      personalData: {
        documentType: "V",
        documentNumber: "98765432",
        names: "María",
        lastNames: "García",
        birthDate: "1990-11-22",
        birthPlace: "Maracaibo",
        nationality: "Venezolana",
        gender: "F",
        profession: "Abogada",
        civilStatus: "Casado",
        phone: "04241112233",
        address: "Calle 50, Res. Sol, Apto. 3B, Maracaibo",
        email: "maria.garcia@example.com",
        housingCondition: "Propia",
      },
      referenceData: {
        bankName: "Banco Banesco",
        bankAccountType: "Ahorro",
        bankAccountNumber: "01340000000000000004",
        bankAccountYears: "7 años",
        personalReferenceName: "Pedro López",
        personalReferencePhone: "04169998877",
        personalReferenceRelation: "Familiar",
      },
      economicData: {
        currentOccupation: "Independiente",
        companyName: "",
        position: "",
        yearsInCompany: "",
        companyPhone: "",
        companyAddress: "",
        monthlyIncome: 2500,
        otherIncome: 500,
        totalIncome: 3000,
      },
      productData: {
        productType: "cuenta-ahorro",
        currency: "USD",
        averageMonthlyAmount: 2000,
        fundsOrigin: "ahorros",
        accountPurpose: "ahorro",
        estimatedMonthlyTransactions: 10,
        averageTransactionAmount: 200,
        internationalTransactions: "si",
      },
    },
    createdAt: Date.now() - 86400000 * 20, // 20 days ago
    lastUpdated: Date.now() - 86400000 * 15, // 15 days ago
    progressPercentage: 100,
    uploadedDocuments: [
      { name: "Pasaporte_Maria_Garcia.pdf", url: "/placeholder.svg?height=300&width=200" },
      { name: "Declaracion_Impuestos_Maria.pdf", url: "/placeholder.svg?height=300&width=200" },
    ],
  },
  // Additional mock data for better tracking
  {
    id: "client-4-natural-rejected",
    userId: "user789",
    name: "Carlos Mendoza",
    type: "natural",
    status: "rechazada",
    formData: {},
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    lastUpdated: Date.now() - 86400000 * 1, // 1 day ago
    progressPercentage: 90,
    uploadedDocuments: [],
  },
  {
    id: "client-5-juridica-today",
    userId: "empresa123",
    name: "Innovación Tech S.A.",
    type: "juridica",
    status: "incompleta",
    formData: {},
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
    lastUpdated: Date.now() - 3600000 * 1, // 1 hour ago
    progressPercentage: 45,
    uploadedDocuments: [],
  },
]

// Enhanced mock confirmed appointments data with status tracking
const mockConfirmedAppointments: ConfirmedAppointment[] = [
  {
    id: "appt-1",
    userId: "empresaXYZ",
    clientId: "client-2-juridica",
    clientType: "juridica",
    fecha: "2025-06-15",
    hora: "10:00",
    agenciaNombre: "Agencia Valencia Centro",
    agenciaDireccion: "Av. Bolívar, Valencia",
    clientEmail: "contacto@xyzsolutions.com",
    bankEmail: "citas.juridicas@bbva.com",
    createdAt: Date.now() - 86400000 * 9,
    pdfUrl: "/placeholder.svg?height=300&width=200",
    status: "agendada",
  },
  {
    id: "appt-2",
    userId: "user456",
    clientId: "client-3-natural-approved",
    clientType: "natural",
    fecha: "2025-06-18",
    hora: "11:00",
    agenciaNombre: "Agencia Maracaibo Norte",
    agenciaDireccion: "Av. 15 Delicias, Maracaibo",
    clientEmail: "maria.garcia@example.com",
    bankEmail: "citas@bbva.com",
    createdAt: Date.now() - 86400000 * 14,
    pdfUrl: "/placeholder.svg?height=300&width=200",
    status: "completada",
    completedAt: Date.now() - 86400000 * 12,
  },
  {
    id: "appt-3",
    userId: "user111",
    clientId: "client-extra-1",
    clientType: "natural",
    fecha: "2025-06-10",
    hora: "09:00",
    agenciaNombre: "Agencia Principal Caracas",
    agenciaDireccion: "Av. Francisco de Miranda, Caracas",
    clientEmail: "cliente@example.com",
    bankEmail: "citas@bbva.com",
    createdAt: Date.now() - 86400000 * 7,
    pdfUrl: "/placeholder.svg?height=300&width=200",
    status: "procesada",
    processedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "appt-4",
    userId: "user222",
    clientId: "client-extra-2",
    clientType: "natural",
    fecha: "2025-06-12",
    hora: "14:00",
    agenciaNombre: "Agencia Barquisimeto Este",
    agenciaDireccion: "Av. Lara, Barquisimeto",
    clientEmail: "otro@example.com",
    bankEmail: "citas@bbva.com",
    createdAt: Date.now() - 86400000 * 5,
    pdfUrl: "/placeholder.svg?height=300&width=200",
    status: "cancelada",
    canceledAt: Date.now() - 86400000 * 3,
    cancelReason: "Cliente no disponible",
  },
  {
    id: "appt-5",
    userId: "user333",
    clientId: "client-extra-3",
    clientType: "juridica",
    fecha: new Date().toISOString().split('T')[0], // Today
    hora: "15:00",
    agenciaNombre: "Agencia Principal Caracas",
    agenciaDireccion: "Av. Francisco de Miranda, Caracas",
    clientEmail: "hoy@example.com",
    bankEmail: "citas@bbva.com",
    createdAt: Date.now() - 86400000 * 1,
    pdfUrl: "/placeholder.svg?height=300&width=200",
    status: "agendada",
  },
]

// --- Utility Functions ---

export function getBackofficeSettings(): BackofficeSettings {
  if (typeof window === "undefined") return defaultBackofficeSettings
  const settings = localStorage.getItem("bbva_backoffice_settings")
  return settings ? JSON.parse(settings) : defaultBackofficeSettings
}

export function saveBackofficeSettings(settings: BackofficeSettings) {
  if (typeof window === "undefined") return
  localStorage.setItem("bbva_backoffice_settings", JSON.stringify(settings))
}

export function getClientApplications(): ClientApplication[] {
  if (typeof window === "undefined") return mockClientApplications
  const clients = localStorage.getItem("bbva_client_applications")
  if (!clients) {
    localStorage.setItem("bbva_client_applications", JSON.stringify(mockClientApplications))
    return mockClientApplications
  }
  return JSON.parse(clients)
}

export function saveClientApplication(client: ClientApplication) {
  if (typeof window === "undefined") return
  const clients = getClientApplications()
  const index = clients.findIndex((c) => c.id === client.id)
  if (index !== -1) {
    clients[index] = client
  } else {
    clients.push(client)
  }
  localStorage.setItem("bbva_client_applications", JSON.stringify(clients))
}

export function updateClientApplicationStatus(clientId: string, status: ClientApplication["status"]): boolean {
  if (typeof window === "undefined") return false
  const clients = getClientApplications()
  const clientIndex = clients.findIndex((c) => c.id === clientId)
  if (clientIndex !== -1) {
    clients[clientIndex].status = status
    clients[clientIndex].lastUpdated = Date.now()
    localStorage.setItem("bbva_client_applications", JSON.stringify(clients))
    return true
  }
  return false
}

export function getConfirmedAppointments(): ConfirmedAppointment[] {
  if (typeof window === "undefined") return mockConfirmedAppointments
  const appointments = localStorage.getItem("bbva_all_appointments")
  if (!appointments) {
    localStorage.setItem("bbva_all_appointments", JSON.stringify(mockConfirmedAppointments))
    return mockConfirmedAppointments
  }
  return JSON.parse(appointments)
}

export function updateAppointmentStatus(appointmentId: string, status: ConfirmedAppointment["status"], reason?: string): boolean {
  if (typeof window === "undefined") return false
  const appointments = getConfirmedAppointments()
  const appointmentIndex = appointments.findIndex((a) => a.id === appointmentId)
  if (appointmentIndex !== -1) {
    appointments[appointmentIndex].status = status
    const now = Date.now()
    
    switch (status) {
      case "procesada":
        appointments[appointmentIndex].processedAt = now
        break
      case "cancelada":
        appointments[appointmentIndex].canceledAt = now
        appointments[appointmentIndex].cancelReason = reason
        break
      case "completada":
        appointments[appointmentIndex].completedAt = now
        break
    }
    
    localStorage.setItem("bbva_all_appointments", JSON.stringify(appointments))
    return true
  }
  return false
}

// Enhanced tracking functions
export function getClientTrackingMetrics(): ClientTrackingMetrics {
  const clients = getClientApplications()
  const now = Date.now()
  const today = new Date().setHours(0, 0, 0, 0)
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000)
  const monthAgo = now - (30 * 24 * 60 * 60 * 1000)

  const totalFichas = clients.length
  const fichasIncompletas = clients.filter(c => c.status === "incompleta").length
  const fichasPendientes = clients.filter(c => c.status === "pendiente_aprobacion").length
  const fichasAprobadas = clients.filter(c => c.status === "aprobada").length
  const fichasRechazadas = clients.filter(c => c.status === "rechazada").length
  
  const fichasHoy = clients.filter(c => c.createdAt >= today).length
  const fichasEstaSemana = clients.filter(c => c.createdAt >= weekAgo).length
  const fichasEsteMes = clients.filter(c => c.createdAt >= monthAgo).length

  // Calculate average processing time for approved/rejected clients
  const processedClients = clients.filter(c => c.status === "aprobada" || c.status === "rechazada")
  const promedioTiempoProcesamiento = processedClients.length > 0 
    ? processedClients.reduce((acc, client) => acc + (client.lastUpdated - client.createdAt), 0) / processedClients.length / (1000 * 60 * 60) // Convert to hours
    : 0

  const tasaAprobacion = processedClients.length > 0 
    ? (fichasAprobadas / processedClients.length) * 100 
    : 0

  return {
    totalFichas,
    fichasIncompletas,
    fichasPendientes,
    fichasAprobadas,
    fichasRechazadas,
    fichasHoy,
    fichasEstaSemana,
    fichasEsteMes,
    promedioTiempoProcesamiento,
    tasaAprobacion,
  }
}

export function getAppointmentTrackingMetrics(): AppointmentTrackingMetrics {
  const appointments = getConfirmedAppointments()
  const now = Date.now()
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000)
  const monthAgo = now - (30 * 24 * 60 * 60 * 1000)

  const totalCitas = appointments.length
  const citasAgendadas = appointments.filter(a => a.status === "agendada").length
  const citasProcesadas = appointments.filter(a => a.status === "procesada").length
  const citasCanceladas = appointments.filter(a => a.status === "cancelada").length
  const citasCompletadas = appointments.filter(a => a.status === "completada").length

  const citasHoy = appointments.filter(a => a.fecha === today).length
  const citasEstaSemana = appointments.filter(a => a.createdAt >= weekAgo).length
  const citasEsteMes = appointments.filter(a => a.createdAt >= monthAgo).length

  // Calculate average attention time for completed appointments
  const completedAppointments = appointments.filter(a => a.status === "completada" && a.completedAt)
  const promedioTiempoAtencion = completedAppointments.length > 0
    ? completedAppointments.reduce((acc, appt) => acc + (appt.completedAt! - appt.createdAt), 0) / completedAppointments.length / (1000 * 60) // Convert to minutes
    : 0

  const finishedAppointments = citasProcesadas + citasCanceladas + citasCompletadas
  const tasaCompletacion = finishedAppointments > 0 
    ? (citasCompletadas / finishedAppointments) * 100 
    : 0

  // Count cancellation reasons
  const motivosCancelacion: { [reason: string]: number } = {}
  appointments.filter(a => a.status === "cancelada" && a.cancelReason).forEach(a => {
    const reason = a.cancelReason!
    motivosCancelacion[reason] = (motivosCancelacion[reason] || 0) + 1
  })

  return {
    totalCitas,
    citasAgendadas,
    citasProcesadas,
    citasCanceladas,
    citasCompletadas,
    citasHoy,
    citasEstaSemana,
    citasEsteMes,
    promedioTiempoAtencion,
    tasaCompletacion,
    motivosCancelacion,
  }
}

export function isAuthenticatedBackoffice(): boolean {
  if (typeof window === "undefined") return false
  const user = localStorage.getItem("bbva_backoffice_user")
  return !!user
}

export function backofficeLogin(username: string, password: string): boolean {
  if (typeof window === "undefined") return false
  // Simple mock login: admin/admin123
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("bbva_backoffice_user", JSON.stringify({ username }))
    return true
  }
  return false
}

export function backofficeLogout() {
  if (typeof window === "undefined") return
  localStorage.removeItem("bbva_backoffice_user")
}