import { Separator } from "@radix-ui/react-separator";
import { CustomModal } from "../common/custom-modal";

interface PendingClient {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface PendingModalProps {
  pendingModalOpen: boolean;
  setPendingModalOpen: (open: boolean) => void;
  handleAccept: (clientId: string) => void;
  handleReject: (clientId: string) => void;
  pendingClients: PendingClient[];
  setCurrentServiceId: (id: string | null) => void;
}

const PendingModal = ({
  pendingModalOpen,
  setPendingModalOpen,
  handleAccept,
  handleReject,
  pendingClients,
  setCurrentServiceId,
}: PendingModalProps) => {
  return (
    <CustomModal
      isOpen={pendingModalOpen}
      onClose={() => {
        setPendingModalOpen(false);
        setCurrentServiceId(null);
      }}
      className="w-[600px]"
    >
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold p">
            Clientes Pendientes ({pendingClients.length})
          </h2>
          <Separator />
        </div>
        {pendingClients.map((client) => (
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
            </div>
            <div className="flex gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full"
                onClick={() => handleAccept(client.id)}
              >
                Aceptar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-full"
                onClick={() => handleReject(client.id)}
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </CustomModal>
  );
};

export default PendingModal;
