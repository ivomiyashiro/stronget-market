import { useEffect, useCallback, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    FileText,
    CheckCircle,
    XCircle,
    Loader2,
    Download,
    Upload,
    Plus,
    Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useAuth } from "@/store/auth/auth.hooks";
import { hiringService } from "@/services/hiring.service";
import { servicesService } from "@/services/services.service";
import { archivesService, type ArchiveFile } from "@/services/archives.service";
import type { ServiceClient } from "@/services/services.service";
import { useParams } from "react-router-dom";

const ClientsTable = () => {
    const { user } = useAuth();
    const { id: serviceId } = useParams();
    const isTrainer = user?.role === "entrenador";
    const hasFetched = useRef(false);

    const [clients, setClients] = useState<ServiceClient[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // State for action confirmation dialogs
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<"complete" | "cancel">("complete");
    const [clientToAction, setClientToAction] = useState<ServiceClient | null>(null);

    // State for files modal
    const [filesModalOpen, setFilesModalOpen] = useState(false);
    const [currentClientFiles, setCurrentClientFiles] = useState<ArchiveFile[]>([]);
    const [currentClientName, setCurrentClientName] = useState("");
    const [currentClientHiringId, setCurrentClientHiringId] = useState("");
    const [filesLoading, setFilesLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

    const fetchClients = useCallback(async () => {
        if (!serviceId || !isTrainer) return;

        setIsLoading(true);
        try {
            const clientsData = await servicesService.getServiceClients(serviceId);
            setClients(clientsData);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setIsLoading(false);
        }
    }, [serviceId, isTrainer]);

    useEffect(() => {
        if (!hasFetched.current && isTrainer && serviceId) {
            hasFetched.current = true;
            fetchClients();
        }
    }, [isTrainer, serviceId, fetchClients]);

    const handleCompleteService = (client: ServiceClient) => {
        setClientToAction(client);
        setActionType("complete");
        setActionDialogOpen(true);
    };

    const handleCancelService = (client: ServiceClient) => {
        setClientToAction(client);
        setActionType("cancel");
        setActionDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!clientToAction) return;

        try {
            const newStatus = actionType === "complete" ? "completed" : "cancelled";

            await hiringService.updateHiringStatus(clientToAction.hiringId, newStatus);

            // Update the client status in the local state
            setClients((prevClients) =>
                prevClients.map((client) =>
                    client.id === clientToAction.id
                        ? {
                              ...client,
                              status: newStatus as
                                  | "completed"
                                  | "cancelled"
                                  | "pending"
                                  | "confirmed"
                                  | "rejected",
                          }
                        : client
                )
            );

            setActionDialogOpen(false);
            setClientToAction(null);
        } catch (error) {
            console.error(`Error ${actionType}ing service:`, error);
        }
    };

    const handleViewFiles = async (client: ServiceClient) => {
        setCurrentClientName(client.name);
        setCurrentClientHiringId(client.hiringId);
        setFilesModalOpen(true);
        setFilesLoading(true);

        try {
            const files = await archivesService.getFilesByHiring(client.hiringId);
            setCurrentClientFiles(files);
        } catch (error) {
            console.error("Error fetching files:", error);
            if (error instanceof Error && error.message.includes("404")) {
                setCurrentClientFiles([]);
            } else {
                setCurrentClientFiles([]);
            }
        } finally {
            setFilesLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentClientHiringId) return;

        setUploadLoading(true);
        try {
            const uploadedFile = await archivesService.uploadFile(
                currentClientHiringId,
                file
            );

            // Add the new file to the current files list
            setCurrentClientFiles((prevFiles) => [uploadedFile, ...prevFiles]);

            // Reset the input
            event.target.value = "";
        } catch (error) {
            console.error("Error uploading file:", error);
            // You could add a toast notification here
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        try {
            await archivesService.deleteFile(fileId);

            // Remove the file from the current files list
            setCurrentClientFiles((prevFiles) =>
                prevFiles.filter((file) => file._id !== fileId)
            );
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const handleCloseFilesModal = () => {
        setFilesModalOpen(false);
        setCurrentClientFiles([]);
        setCurrentClientName("");
        setCurrentClientHiringId("");
    };

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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getActionDialogContent = () => {
        const isComplete = actionType === "complete";
        return {
            title: isComplete ? "¿Completar servicio?" : "¿Cancelar servicio?",
            description: isComplete
                ? "Esta acción marcará el servicio como completado. Esta acción no se puede deshacer."
                : "Esta acción cancelará el servicio para este cliente. Esta acción no se puede deshacer.",
            action: isComplete ? "Completar" : "Cancelar",
            variant: isComplete ? "default" : ("destructive" as const),
        };
    };

    if (!isTrainer) {
        return (
            <div className="text-center text-gray-500 py-8">
                Solo los entrenadores pueden ver la tabla de clientes.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Clientes del Servicio</h2>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : clients.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    No hay clientes registrados para este servicio.
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Turno</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Archivos</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.hiringId}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                                {client.avatarUrl ? (
                                                    <img
                                                        src={client.avatarUrl}
                                                        alt={client.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    client.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="font-medium">
                                                {client.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="font-medium">
                                                {client.day}
                                            </div>
                                            <div className="text-gray-500">
                                                {client.time}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                client.status
                                            )}`}
                                        >
                                            {getStatusText(client.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewFiles(client)}
                                        >
                                            <FileText className="h-4 w-4 mr-1" />
                                            Ver Archivos
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {client.status === "confirmed" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleCompleteService(client)
                                                    }
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                </Button>
                                            )}
                                            {(client.status === "pending" ||
                                                client.status === "confirmed") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleCancelService(client)
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Action Confirmation Dialog */}
            <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {getActionDialogContent().title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {getActionDialogContent().description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAction}
                            className={
                                getActionDialogContent().variant === "destructive"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : ""
                            }
                        >
                            {getActionDialogContent().action}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Files Modal */}
            <Dialog open={filesModalOpen} onOpenChange={handleCloseFilesModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between mt-4">
                            <span>Archivos de {currentClientName}</span>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                    disabled={uploadLoading}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        document.getElementById("file-upload")?.click()
                                    }
                                    disabled={uploadLoading}
                                >
                                    {uploadLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    Subir Archivo
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        {filesLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : currentClientFiles.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No hay archivos subidos para este cliente.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentClientFiles.map((file) => (
                                    <div
                                        key={file._id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {file.originalName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatFileSize(file.fileSize)} •{" "}
                                                    {formatDate(file.uploadDate)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        file.downloadUrl,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteFile(file._id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ClientsTable;
