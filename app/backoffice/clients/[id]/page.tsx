"use client"

import { CardFooter } from "@/components/ui/card"
import { DialogFooter } from "@/components/ui/dialog"
import React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLoading } from "@/app/loading-context"
import {
  getClientApplications,
  updateClientApplicationStatus,
  getConfirmedAppointments,
  saveClientApplication,
} from "@/lib/backoffice-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import getStatusBadgeClass from "../utils/getStatusBadgeClass"
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
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { setLoading } = useLoading();
  const clientId = params.id as string

  useEffect(() => {
    setLoading(true, "Cargando detalles del cliente...");
    const allClients = getClientApplications();
    const foundClient = allClients.find((c) => c.id === clientId);
    setClient(foundClient || null);
    setTimeout(() => setLoading(false), 400); // Simula carga breve visual
  }, [clientId]);
  const handleEditClient = () => {
    // Estructura base por tipo de cliente
    const baseSections = client?.type === "natural"
      ? {
          institutionData: {},
          personalData: {},
          referenceData: {},
          economicData: {},
          productData: {},
        }
      : {
          institucion: {},
          identificacion: {},
          economica: {},
          producto: {},
        };
    // Mergea datos actuales con la base para asegurar todas las secciones
    const merged = { ...baseSections, ...(client?.formData || {}) };
    setEditData(merged);
    setEditMode(true);
  };

  const [client, setClient] = useState<any>(null)
  // Eliminado: const [loading, setLoading] = useState(true)
  // Removed isUpdatingStatus as loading UI, only used for disabling buttons
const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState("")
  const [currentDocumentName, setCurrentDocumentName] = useState("")
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null)
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleEditChange = (section: string, key: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [key]: value,
      },
    }));
  };

  // --- DEFINICIÓN DE CAMPOS CONSISTENTE CON SOLICITUD ---

type FieldDefinition = {
  key: string;
  label: string;
  isArray?: boolean;
  fields?: FieldDefinition[];
};

type SectionDefinition = {
  label: string;
  fields: FieldDefinition[];
};

const naturalPersonFieldDefinitions: Record<string, SectionDefinition> = {
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
  },
};

const juridicalFieldDefinitions: Record<string, SectionDefinition> = {
  institucion: {
    label: "Datos de la Institución",
    fields: [
      { key: "nombre", label: "NOMBRE DE LA INSTITUCIÓN DEL SECTOR BANCARIO" },
      { key: "registroFiscal", label: "REGISTRO DE INFORMACIÓN FISCAL" },
      { key: "sucursal", label: "SUCURSAL O AGENCIA" },
      { key: "gerente", label: "NOMBRE DEL GERENTE" },
      { key: "ejecutivo", label: "NOMBRE DEL EJECUTIVO" },
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
      { key: "telefonos", label: "Teléfonos" },
      { key: "sitioWeb", label: "Sitio Web" },
      { key: "correo", label: "Correo" },
      // Nested objects:
      { key: "datosRegistro.nombre", label: "Reg. Nombre" },
      { key: "datosRegistro.numero", label: "Reg. Número" },
      { key: "datosRegistro.tomo", label: "Reg. Tomo" },
      { key: "datosRegistro.folio", label: "Reg. Folio" },
      { key: "datosRegistro.fecha", label: "Reg. Fecha" },
      { key: "datosRegistro.capitalSocial", label: "Reg. Capital Social" },
      { key: "ultimaModificacion.nombre", label: "Últ. Mod. Nombre" },
      { key: "ultimaModificacion.numero", label: "Últ. Mod. Número" },
      { key: "ultimaModificacion.tomo", label: "Últ. Mod. Tomo" },
      { key: "ultimaModificacion.folio", label: "Últ. Mod. Folio" },
      { key: "ultimaModificacion.fecha", label: "Últ. Mod. Fecha" },
      { key: "ultimaModificacion.capitalActual", label: "Últ. Mod. Capital Actual" },
      { key: "entesPublicos.numeroGaceta", label: "Gaceta Oficial" },
      { key: "entesPublicos.fecha", label: "Fecha Gaceta" },
      { key: "entesPublicos.autoridadAdscripcion", label: "Autoridad Adscripción" },
      { key: "entesPublicos.codigoOnt", label: "Código ONT" },
      // Dirección
      { key: "direccion.edificio", label: "Edificio" },
      { key: "direccion.piso", label: "Piso" },
      { key: "direccion.oficina", label: "Oficina" },
      { key: "direccion.local", label: "Local" },
      { key: "direccion.calle", label: "Calle" },
      { key: "direccion.urbanizacion", label: "Urbanización" },
      { key: "direccion.municipio", label: "Municipio" },
      { key: "direccion.ciudad", label: "Ciudad" },
      { key: "direccion.estado", label: "Estado" },
      { key: "direccion.codigoPostal", label: "Código Postal" },
      { key: "direccion.numeroFax", label: "Número Fax" },
    ],
  },
  economica: {
    label: "Información Económica",
    fields: [
      // Arrays:
      { key: "accionistas", label: "Accionistas", isArray: true, fields: [
        { key: "nombre", label: "Nombre" },
        { key: "documento", label: "Documento" },
        { key: "participacion", label: "% Participación" },
      ]},
      { key: "representantesLegales", label: "Representantes Legales", isArray: true, fields: [
        { key: "nombre", label: "Nombre" },
        { key: "documento", label: "Documento" },
        { key: "cargo", label: "Cargo" },
      ]},
      { key: "proveedores", label: "Proveedores", isArray: true, fields: [
        { key: "nombre", label: "Nombre" },
        { key: "producto", label: "Producto" },
        { key: "montoMensual", label: "Monto Mensual" },
      ]},
      { key: "clientes", label: "Clientes", isArray: true, fields: [
        { key: "nombre", label: "Nombre" },
        { key: "producto", label: "Producto" },
        { key: "montoMensual", label: "Monto Mensual" },
      ]},
      { key: "empresasRelacionadas", label: "Empresas Relacionadas", isArray: true, fields: [
        { key: "nombre", label: "Nombre" },
        { key: "relacion", label: "Relación" },
      ]},
      { key: "referenciasBancarias", label: "Referencias Bancarias", isArray: true, fields: [
        { key: "institucionSectorBancario", label: "Institución" },
        { key: "tipoProducto", label: "Tipo de Producto" },
        { key: "numeroProducto", label: "Número de Producto" },
        { key: "antiguedad", label: "Antigüedad" },
      ]},
      // Subsidiarias (objeto):
      { key: "subsidiarias.numeroSubsidiarias", label: "N° Subsidiarias" },
      { key: "subsidiarias.paisMayorPresencia", label: "País Mayor Presencia" },
      { key: "subsidiarias.numeroEmpleados", label: "N° Empleados" },
      { key: "subsidiarias.ventasMensuales", label: "Ventas Mensuales" },
      { key: "subsidiarias.ingresosMensuales", label: "Ingresos Mensuales" },
      { key: "subsidiarias.egresosMensuales", label: "Egresos Mensuales" },
    ],
  },
  producto: {
    label: "Producto Bancario",
    fields: [
      { key: "nombre", label: "Nombre Producto" },
      { key: "numeroProducto", label: "N° Producto" },
      { key: "moneda", label: "Moneda" },
      { key: "montoPromedio", label: "Monto Promedio" },
      { key: "transaccionesMensuales", label: "Trans. Mensuales" },
      { key: "credito", label: "Crédito" },
      { key: "debito", label: "Débito" },
      { key: "paisOrigen", label: "País Origen" },
      { key: "paisDestino", label: "País Destino" },
      { key: "usoMonedaVirtual", label: "Uso Moneda Virtual" },
    ],
  },
};

// --- CONTROL DE FLUJO CORRECTO ---


  if (!client) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Cliente no encontrado.</p>
      </div>
    );
  }


  // --- FIN CONTROL DE FLUJO ---

  const handleSaveEdit = () => {
    setLoading(true, "Guardando cambios...");
    setTimeout(() => {
      const allClients = getClientApplications();
      const clientIndex = allClients.findIndex((c) => c.id === clientId);
      if (clientIndex !== -1) {
        allClients[clientIndex].formData = editData;
        saveClientApplication(allClients[clientIndex]);
        setClient((prev: any) => ({ ...prev, formData: editData }));
      }
      setEditMode(false);
      setShowSuccessModal(true);
      setLoading(false);
    }, 800);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData(null);
  };

  const handleStatusUpdate = (status: "aprobada" | "rechazada") => {
    setLoading(true, status === "aprobada" ? "Aprobando cliente..." : "Rechazando cliente...");
    setTimeout(() => {
      if (status === "rechazada" && !rejectionReason.trim()) {
        alert("Por favor, ingrese un motivo de rechazo.");
        setLoading(false);
        return;
      }
      const success = updateClientApplicationStatus(clientId, status);
      if (success) {
        setClient((prev: any) => ({
          ...prev,
          status: status,
          formData: {
            ...prev.formData,
            rejectionReason: status === "rechazada" ? rejectionReason : undefined,
          },
        }));
        const allClients = getClientApplications();
        const clientIndex = allClients.findIndex((c) => c.id === clientId);
        if (clientIndex !== -1) {
          allClients[clientIndex].formData = {
            ...allClients[clientIndex].formData,
            rejectionReason: status === "rechazada" ? rejectionReason : undefined,
          };
          saveClientApplication(allClients[clientIndex]);
        }
        setShowRejectionDialog(false);
        setRejectionReason("");
      } else {
        console.error(`[BACKOFFICE_TRACKING] Fallo al actualizar estado del cliente ${clientId}.`);
      }
      setLoading(false);
    }, 1000);
  }

  const renderField = (label: string, value: any, section?: string, key?: string, type: string = "text", forceReadOnly: boolean = false) => {
    if (!editMode || forceReadOnly) {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500">{label}</span>
          <span className="text-base font-semibold text-gray-900">{String(value)}</span>
        </div>
      );
    }
    // In edit mode
    const safeValue = section && key ? editData?.[section]?.[key] ?? "" : "";
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (section && key) handleEditChange(section, key, e.target.value);
    };
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {type === "textarea" ? (
          <Textarea
            value={safeValue}
            onChange={handleChange}
            className="text-base font-semibold text-gray-900"
          />
        ) : (
          <Input
            value={safeValue}
            onChange={handleChange}
            className="text-base font-semibold text-gray-900"
          />
        )}
      </div>
    );
  };

  const renderSection = (title: string, data: any, icon: React.ReactNode) => {
    // Selección de definición de campos según tipo de cliente
    const isNatural = client.type === "natural";
    const defs = isNatural ? naturalPersonFieldDefinitions : juridicalFieldDefinitions;
    const sectionKey = Object.keys(defs).find(
      (key) => defs[key as keyof typeof defs].label === title
    ) as keyof typeof defs;
    if (!sectionKey) return null;
    const sectionDef = defs[sectionKey];
    if (!editMode && (!data || Object.keys(data).length === 0)) return null;

    // Renderizado de campos
    return (
      <Card className="mb-4">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-blue-900 flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionDef.fields.map((field: any, idx: number) => {
            // Arrays (solo para jurídica)
            if (field.isArray) {
              const arr = (editMode ? editData?.[sectionKey]?.[field.key] : data?.[field.key]) || [];
              return (
                <div key={field.key} className="col-span-3">
                  <Label className="font-bold mb-2 block">{field.label}</Label>
                  {editMode && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 mb-2 rounded bg-white">
                        <thead className="bg-blue-50">
                          <tr>
                            {field.fields.map((sub: any) => (
                              <th key={sub.key} className="px-3 py-2 text-xs font-semibold text-blue-900 border-b border-gray-200 text-left whitespace-nowrap">{sub.label}</th>
                            ))}
                            <th className="px-2 py-2 border-b border-gray-200"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {arr.length === 0 && (
                            <tr>
                              <td colSpan={field.fields.length+1} className="text-gray-400 italic text-center py-2">Sin elementos</td>
                            </tr>
                          )}
                          {arr.map((item: any, i: number) => (
                            <tr key={`${field.key}-${i}`} className="hover:bg-blue-50">
                              {field.fields.map((sub: any) => (
                                <td key={sub.key} className="px-2 py-1">
                                  <Input
                                    type={typeof item?.[sub.key] === "number" ? "number" : "text"}
                                    value={item?.[sub.key] ?? ""}
                                    onChange={(e) => {
                                      setEditData((prev: any) => {
                                        const updated = [...(prev?.[sectionKey]?.[field.key] || [])];
                                        updated[i] = { ...updated[i], [sub.key]: e.target.value };
                                        return {
                                          ...prev,
                                          [sectionKey]: {
                                            ...prev[sectionKey],
                                            [field.key]: updated,
                                          },
                                        };
                                      });
                                    }}
                                    className="w-full min-w-[120px]"
                                  />
                                </td>
                              ))}
                              <td className="px-2 py-1 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditData((prev: any) => {
                                      const updated = [...(prev?.[sectionKey]?.[field.key] || [])];
                                      updated.splice(i, 1);
                                      return {
                                        ...prev,
                                        [sectionKey]: {
                                          ...prev[sectionKey],
                                          [field.key]: updated,
                                        },
                                      };
                                    });
                                  }}
                                  className="text-red-500 hover:bg-red-50"
                                  aria-label="Eliminar fila"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditData((prev: any) => {
                            const updated = [...(prev?.[sectionKey]?.[field.key] || [])];
                            const emptyRow = Object.fromEntries(field.fields.map((sub: any) => [sub.key, ""]));
                            updated.push(emptyRow);
                            return {
                              ...prev,
                              [sectionKey]: {
                                ...prev[sectionKey],
                                [field.key]: updated,
                              },
                            };
                          });
                        }}
                        className="mt-1"
                      >
                        + Agregar {field.label}
                      </Button>
                    </div>
                  )}
                  {!editMode && (
                    arr.length === 0 ? (
                      <div className="text-gray-400 italic">Sin elementos</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 mb-2 rounded bg-gray-50">
                          <thead className="bg-blue-50">
                            <tr>
                              {field.fields.map((sub: any) => (
                                <th key={sub.key} className="px-3 py-2 text-xs font-semibold text-blue-900 border-b border-gray-200 text-left whitespace-nowrap">{sub.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {arr.map((item: any, i: number) => (
                              <tr key={`${field.key}-${i}`} className="hover:bg-blue-100">
                                {field.fields.map((sub: any) => (
                                  <td key={sub.key} className="px-2 py-1">
                                    {item?.[sub.key] ?? ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              );
            }
            // Campos normales
            // Detecta tipo y opciones según key (puedes expandir esto según tus formularios)
            let inputType = "text";
            let options: string[] | undefined = undefined;
            if (["birthDate", "fecha", "ultimaModificacion.fecha", "datosRegistro.fecha"].includes(field.key)) inputType = "date";
            if (["monthlyIncome", "otherIncome", "totalIncome", "averageMonthlyAmount", "estimatedMonthlyTransactions", "averageTransactionAmount", "montoPromedio", "transaccionesMensuales", "credito", "debito", "subsidiarias.numeroSubsidiarias", "subsidiarias.numeroEmpleados", "subsidiarias.ventasMensuales", "subsidiarias.ingresosMensuales", "subsidiarias.egresosMensuales", "participacion", "montoMensual"].includes(field.key)) inputType = "number";
            if (["email", "correo"].includes(field.key)) inputType = "email";
            if (["address", "companyAddress", "direccion", "direccion.calle", "direccion.edificio", "direccion.urbanizacion", "direccion.municipio", "direccion.ciudad", "direccion.estado"].includes(field.key)) inputType = "textarea";
            // Opciones para selects
            if (field.key === "gender") options = ["Masculino", "Femenino", "Otro"];
            if (field.key === "documentType") options = ["V", "E", "J", "P"];
            if (field.key === "civilStatus") options = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"];
            if (field.key === "currency" || field.key === "moneda") options = ["USD", "VEF", "EUR"];
            if (field.key === "productType") options = ["Cuenta Corriente", "Cuenta de Ahorro", "Tarjeta de Crédito"];
            if (field.key === "housingCondition") options = ["Propia", "Alquilada", "Familiar", "Otra"];
            if (field.key === "internationalTransactions" || field.key === "usoMonedaVirtual") options = ["Sí", "No"];

            // Obtén el valor (soporta keys anidadas)
            const keys = field.key.split(".");
            let value = data;
            let editValue = editData?.[sectionKey];
            for (const k of keys) {
              value = value?.[k];
              editValue = editValue?.[k];
            }
            if (editMode) value = editValue;

            // Renderiza el input adecuado
            return (
              <div key={field.key}>
                <Label>{field.label}</Label>
                {options ? (
                  <Select
                    value={value || ""}
                    onValueChange={editMode ? (val) => handleEditChange(sectionKey, field.key, val) : undefined}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : inputType === "textarea" ? (
                  <Textarea
                    value={value || ""}
                    onChange={editMode ? (e) => handleEditChange(sectionKey, field.key, e.target.value) : undefined}
                    disabled={!editMode}
                  />
                ) : (
                  <Input
                    type={inputType}
                    value={value || ""}
                    onChange={editMode ? (e) => handleEditChange(sectionKey, field.key, e.target.value) : undefined}
                    disabled={!editMode}
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <>  
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Cambios guardados!</DialogTitle>
            <DialogDescription>Los datos del cliente han sido actualizados correctamente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()} className="text-blue-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Clientes
          </Button>
          <h1 className="text-3xl font-bold text-blue-900">Detalles del Cliente</h1>
          <Badge className={`text-lg px-4 py-2 ${getStatusBadgeClass(client.status)}`}>
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
            {renderField("ID de Solicitud", client.id, undefined, undefined, "text", true)}
            {renderField("Usuario (RIF/Cédula)", client.userId, undefined, undefined, "text", true)}
            {renderField("Nombre/Razón Social", client.name, undefined, undefined, "text", true)}
            {renderField("Tipo de Cliente", client.type === "natural" ? "Natural" : "Jurídica", undefined, undefined, "text", true)}
            {renderField("Fecha de Creación", new Date(client.createdAt).toLocaleDateString(), undefined, undefined, "text", true)}
            {renderField("Última Actualización", new Date(client.lastUpdated).toLocaleDateString(), undefined, undefined, "text", true)}
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
        <TabsList className="flex w-full bg-blue-100 gap-2 px-2 py-1 rounded-md border border-blue-200 overflow-x-auto">
  {/* Fixed/flexible layout for tabs, not grid-cols, to avoid misalignment */}
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
              {renderSection("Datos de la Institución", client.formData?.institutionData, <Building className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="personalData">
              {renderSection("Datos Personales", client.formData?.personalData, <User className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="referenceData">
              {renderSection("Referencias", client.formData?.referenceData, <Users className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="economicData">
              {renderSection("Información Económica", client.formData?.economicData, <TrendingUp className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="productData">
              {renderSection("Producto Bancario", client.formData?.productData, <CreditCard className="h-5 w-5" />)}
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="institucion">
              {renderSection("Datos de la Institución", client.formData?.institucion, <Building className="h-5 w-5" />)}
            </TabsContent>
            <TabsContent value="identificacion">
              {renderSection(
                "Datos de Identificación de la Empresa",
                client.formData?.identificacion,
                <User className="h-5 w-5" />,
              )}
            </TabsContent>
            <TabsContent value="economica">
              {renderSection("Información Económica", client.formData?.economica, <TrendingUp className="h-5 w-5" />)}
            </TabsContent>

            <TabsContent value="producto">
              {renderSection("Producto Bancario", client.formData?.producto, <CreditCard className="h-5 w-5" />)}
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
    {!editMode ? (
      <Button variant="outline" onClick={handleEditClient} disabled={isUpdatingStatus}>
        <Edit className="h-4 w-4 mr-2" />
        Editar Ficha
      </Button>
    ) : (
      <>
        <Button variant="default" onClick={handleSaveEdit} disabled={isUpdatingStatus}>
          Guardar
        </Button>
        <Button variant="outline" onClick={handleCancelEdit} disabled={isUpdatingStatus}>
          Cancelar
        </Button>
      </>
    )}

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
                    Confirmar Rechazo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => handleStatusUpdate("aprobada")}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700"
            >
              <>
  <CheckCircle2 className="h-4 w-4 mr-2" />
  Aprobar Solicitud
</>
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
            Pendiente de Aprobación
          </Button>
        )}
      </CardFooter>
    </div>
    </>
  );
}
