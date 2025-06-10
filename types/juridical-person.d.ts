// types/juridical-person.d.ts
export interface JuridicalPersonData {
  institucion: {
    nombre: string
    registroFiscal: string
    sucursal: string
    gerente: string
    ejecutivo: string
  }
  identificacion: {
    registroFiscal: string
    razonSocial: string
    nombreComercial: string
    actividadEconomica: string
    actividadEspecifica: string
    categoriaEspecial: string
    datosRegistro: {
      nombre: string
      numero: string
      tomo: string
      folio: string
      fecha: string
      capitalSocial: string
    }
    ultimaModificacion: {
      nombre: string
      numero: string
      tomo: string
      folio: string
      fecha: string
      capitalActual: string
    }
    entesPublicos: {
      numeroGaceta: string
      fecha: string
      autoridadAdscripcion: string
      codigoOnt: string
    }
    telefonos: string
    sitioWeb: string
    correo: string
    direccion: {
      edificio: string
      piso: string
      oficina: string
      local: string
      calle: string
      urbanizacion: string
      municipio: string
      ciudad: string
      estado: string
      codigoPostal: string
      numeroFax: string
    }
  }
  economica: {
    accionistas: Array<{
      nombre: string
      documento: string
      porcentajeAccionario: string
      cargo: string
      esPep: string
      relacionadoPep: string
    }>
    representantesLegales: Array<{
      nombre: string
      documento: string
      cargo: string
      condicion: string
    }>
    subsidiarias: {
      numeroSubsidiarias: string
      paisMayorPresencia: string
      numeroEmpleados: string
      ventasMensuales: string
      ingresosMensuales: string
      egresosMensuales: string
    }
    proveedores: Array<{
      nombreRazonSocial: string
      ubicacion: string
    }>
    clientes: Array<{
      nombreRazonSocial: string
      ubicacion: string
    }>
    empresasRelacionadas: Array<{
      nombreRazonSocial: string
      actividadEconomica: string
      registroFiscal: string
    }>
    referenciasBancarias: Array<{
      institucionSectorBancario: string
      nombreProducto: string
      numeroProducto: string
      cifrasPromedio: string
    }>
  }
  producto: {
    nombre: string
    numeroProducto: string
    moneda: string
    montoPromedio: string
    transaccionesMensuales: string
    credito: string
    debito: string
    paisOrigen: string
    paisDestino: string
    usoMonedaVirtual: string
  }
}
