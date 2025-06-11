// Utilidad para obtener la clase CSS según el estado del cliente
import type { ClientApplication } from "@/lib/backoffice-data";

const getStatusBadgeClass = (status: ClientApplication["status"]) => {
  switch (status) {
    case "aprobada":
      return "bg-green-100 text-green-800";
    case "rechazada":
      return "bg-red-100 text-red-800";
    case "pendiente_aprobacion":
      return "bg-yellow-100 text-yellow-800";
    case "incompleta":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default getStatusBadgeClass;
