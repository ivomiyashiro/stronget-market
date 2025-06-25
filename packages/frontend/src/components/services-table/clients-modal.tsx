import { Separator } from "@radix-ui/react-separator";
import { CustomModal } from "../common/custom-modal";
import type { ServiceClient } from "@/services/services.service";

interface ClientsModalProps {
  clientsModalOpen: boolean;
  setClientsModalOpen: (open: boolean) => void;
  clients: ServiceClient[];
  setCurrentServiceId: (id: string | null) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "rejected":
      return "bg-orange-100 text-orange-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmado";
    case "cancelled":
      return "Cancelado";
    case "rejected":
      return "Rechazado";
    case "completed":
      return "Completado";
    default:
      return status;
  }
};

const ClientsModal = ({
  clientsModalOpen,
  setClientsModalOpen,
  clients,
  setCurrentServiceId,
}: ClientsModalProps) => {
  return (
    <CustomModal
      isOpen={clientsModalOpen}
      onClose={() => {
        setClientsModalOpen(false);
        setCurrentServiceId(null);
      }}
      className="w-[600px]"
    >
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">
            Clientes del Servicio ({clients.length})
          </h2>
          <Separator />
        </div>
        {clients.map((client) => (
          <div key={client.id} className="flex items-center py-4 gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
              {client.avatarUrl ? (
                <img
                  src={client.avatarUrl}
                  alt={client.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span className={client.avatarUrl ? "hidden" : ""}>
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-semibold">{client.name}</div>
              <div className="text-gray-500 text-sm">{client.email}</div>
              <div className="text-gray-400 text-xs">
                {client.day} - {client.time}
              </div>
            </div>
            <div className="flex items-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  client.status
                )}`}
              >
                {getStatusText(client.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CustomModal>
  );
};

export default ClientsModal;
