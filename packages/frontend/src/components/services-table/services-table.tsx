import { useEffect, useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import {
  Archive,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import Filtering from "../filtering/filtering";
import { Button } from "../ui/button";
import { useAuth } from "@/store/auth/auth.hooks";
import {
  useServices,
  useServicesLoading,
} from "@/store/services/services.hooks";
import { useDispatch } from "react-redux";
import {
  getServicesByTrainerId,
  deleteService,
  getUserServices,
  updateService,
} from "@/store/services/services.thunks";
import { hiringService } from "@/services/hiring.service";
import { servicesService } from "@/services/services.service";
import type { AppDispatch } from "@/store/store";
import type {
  Service,
  GetServicesParams,
  ServiceClient,
} from "@/services/services.service";
import CreateReviewPopup from "../create-review/create-review-popup";
import PendingModal from "./pending-modal";
import ClientsModal from "./clients-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { archivesService, type ArchiveFile } from "@/services/archives.service";

// Interface for pending clients
interface PendingClient {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

const ServicesTable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isTrainer = user?.role === "entrenador";
  const isClient = user?.role === "cliente";
  const hasFetched = useRef(false);

  const services = useServices();
  const isLoading = useServicesLoading();

  // Track current applied filters
  const [currentFilters, setCurrentFilters] = useState<GetServicesParams>({});

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // State for unpublish confirmation dialog
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [serviceToUnpublish, setServiceToUnpublish] = useState<Service | null>(
    null
  );

  // State for review popup
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [serviceToReview, setServiceToReview] = useState<Service | null>(null);

  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);

  // State for clients modal
  const [clientsModalOpen, setClientsModalOpen] = useState(false);
  const [clients, setClients] = useState<ServiceClient[]>([]);

  // State for archives modal
  const [archivesModalOpen, setArchivesModalOpen] = useState(false);
  const [archiveFiles, setArchiveFiles] = useState<ArchiveFile[]>([]);
  const [archivesLoading, setArchivesLoading] = useState(false);

  const getDeleteDialogContent = () => {
    if (isTrainer) {
      return {
        title: "¿Eliminar servicio?",
        description:
          "Esta acción no se puede deshacer. El servicio será eliminado permanentemente.",
        action: "Eliminar",
      };
    } else {
      return {
        title: "¿Abandonar servicio?",
        description:
          "Esta acción no se puede deshacer. Te desuscribirás del servicio permanentemente.",
        action: "Abandonar",
      };
    }
  };

  const fetchServices = useCallback(
    (filters?: GetServicesParams) => {
      const filtersToApply = filters !== undefined ? filters : currentFilters;

      if (isTrainer && user?.id && user.id.trim() !== "") {
        // For trainers, fetch their specific services
        dispatch(
          getServicesByTrainerId({ id: user.id, params: filtersToApply })
        );
      } else if (isClient) {
        // For clients, fetch their hired services from /users/services
        dispatch(getUserServices(filtersToApply));
      }
    },
    [isTrainer, isClient, user, dispatch, currentFilters]
  );

  useEffect(() => {
    if (!hasFetched.current && (isTrainer || isClient)) {
      hasFetched.current = true;
      // Initial load without filters
      fetchServices({});
    }
  }, [isTrainer, isClient, fetchServices, user]);

  const handleEditService = (serviceId: string) => {
    navigate(`/create-service/${serviceId}`);
  };

  const handleCreateService = () => {
    navigate("/create-service");
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      if (isTrainer) {
        // For trainers, delete the service
        dispatch(
          deleteService({
            id: serviceToDelete.id,
            onSuccess: () => {
              // Refresh the services list after successful deletion
              fetchServices();
              setDeleteDialogOpen(false);
              setServiceToDelete(null);
            },
            onError: (error) => {
              console.error("Delete service error:", error);
              // Keep the dialog open so user can see the error
            },
          })
        );
      } else if (isClient && serviceToDelete.hiringId) {
        // For clients, remove the hiring
        hiringService
          .removeHiring(serviceToDelete.hiringId)
          .then(() => {
            // Refresh the services list after successful removal
            fetchServices();
            setDeleteDialogOpen(false);
            setServiceToDelete(null);
          })
          .catch((error) => {
            console.error("Remove hiring error:", error);
            // Keep the dialog open so user can see the error
          });
      }
    }
  };

  const cancelDeleteService = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleUnpublishService = (service: Service) => {
    setServiceToUnpublish(service);
    setUnpublishDialogOpen(true);
  };

  const confirmUnpublishService = () => {
    if (serviceToUnpublish) {
      const newStatus =
        serviceToUnpublish.status === "active" ? "inactive" : "active";
      const actionText = newStatus === "active" ? "publicar" : "despublicar";

      dispatch(
        updateService({
          id: serviceToUnpublish.id,
          data: { status: newStatus },
          onSuccess: () => {
            // Refresh the services list after successful status update
            fetchServices();
            setUnpublishDialogOpen(false);
            setServiceToUnpublish(null);
          },
          onError: (error) => {
            console.error(`${actionText} service error:`, error);
            // Keep the dialog open so user can see the error
          },
        })
      );
    }
  };

  const cancelUnpublishService = () => {
    setUnpublishDialogOpen(false);
    setServiceToUnpublish(null);
  };

  const handleViewService = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  const handleApplyFilters = (filters: GetServicesParams) => {
    setCurrentFilters(filters);
    fetchServices(filters);
  };

  const handleCreateReview = (service: Service) => {
    setServiceToReview(service);
    setReviewPopupOpen(true);
  };

  const handleReviewCreated = () => {
    // Optionally refresh the services list to update ratings
    fetchServices();
  };

  const getPageTitle = () => {
    if (isTrainer) return "Mis Servicios";
    if (isClient) return "Mis Servicios Contratados";
    return "Servicios";
  };

  const getEmptyStateMessage = () => {
    if (isTrainer) {
      return {
        title: "No tienes servicios creados",
        description: "Crea tu primer servicio para empezar a recibir clientes",
        buttonText: "Crear Servicio",
        buttonAction: handleCreateService,
      };
    }
    if (isClient) {
      return {
        title: "Todavía no estás anotado en ningún servicio",
        description: "Busca un servicio para anotarte",
        buttonText: "Buscar Servicios",
        buttonAction: () => navigate("/"),
      };
    }
    return {
      title: "No hay servicios disponibles",
      description: "No se encontraron servicios",
      buttonText: "Buscar Servicios",
      buttonAction: () => navigate("/"),
    };
  };

  const handleAccept = (clientId: string) => {
    if (!currentServiceId) {
      console.error("No current service ID found");
      return;
    }

    hiringService.acceptHiring(clientId, currentServiceId).then(() => {
      // Refresh the services list to update pending counts
      fetchServices();
      // Close the modal
      handleClosePendingModal();
    });
  };

  const handleReject = (clientId: string) => {
    if (!currentServiceId) {
      console.error("No current service ID found");
      return;
    }

    hiringService.rejectHiring(clientId, currentServiceId).then(() => {
      // Refresh the services list to update pending counts
      fetchServices();
      // Close the modal
      handleClosePendingModal();
    });
  };

  const handleOpenPendingModal = (service: Service) => {
    // Convert service.pendings to PendingClient format
    const pendingClientsData: PendingClient[] = service.pendings.map(
      (client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        avatarUrl: client.avatarUrl,
      })
    );

    setPendingClients(pendingClientsData);
    setPendingModalOpen(true);
    setCurrentServiceId(service.id);
  };

  const handleClosePendingModal = () => {
    setPendingModalOpen(false);
    setPendingClients([]);
    setCurrentServiceId(null);
  };

  const handleOpenClientsModal = async (service: Service) => {
    if (service.clients === 0) return;
    try {
      const clientsData = await servicesService.getServiceClients(service.id);
      setClients(clientsData);
      setClientsModalOpen(true);
      setCurrentServiceId(service.id);
    } catch (error) {
      console.error("Error fetching service clients:", error);
    }
  };

  const handleCloseClientsModal = () => {
    setClientsModalOpen(false);
    setClients([]);
    setCurrentServiceId(null);
  };

  const handleOpenArchivesModal = async (service: Service) => {
    if (!service.hiringId) {
      console.error("No hiring ID found for service");
      return;
    }

    setArchivesLoading(true);
    setArchivesModalOpen(true);

    try {
      const files = await archivesService.getFilesByHiring(service.hiringId);
      setArchiveFiles(files);
    } catch (error) {
      console.error("Error fetching archive files:", error);
      setArchiveFiles([]);
    } finally {
      setArchivesLoading(false);
    }
  };

  const handleCloseArchivesModal = () => {
    setArchivesModalOpen(false);
    setArchiveFiles([]);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
        {isTrainer && (
          <Button
            onClick={handleCreateService}
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Crear Servicio
          </Button>
        )}
      </div>
      <Filtering
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
        context={isTrainer ? "trainer" : isClient ? "client" : "landing"}
      />
      {isLoading ? (
        <div className="flex justify-center items-center py-8 w-full">
          <Loader2 className="size-10 animate-spin" />
        </div>
      ) : services?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-gray-400 mb-4">
            <Archive className="size-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getEmptyStateMessage().title}
          </h3>
          <p className="text-gray-500 mb-6">
            {getEmptyStateMessage().description}
          </p>
          <Button
            onClick={getEmptyStateMessage().buttonAction}
            className="flex items-center gap-2"
          >
            {isTrainer && <Plus className="size-4" />}
            {getEmptyStateMessage().buttonText}
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            {isTrainer ? (
              <TableRow>
                <TableHead className="w-[250px]">Descripción</TableHead>
                <TableHead>Visualizaciones</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Tasa de conversión</TableHead>
                <TableHead>Evaluaciones</TableHead>
                <TableHead>Pendientes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            ) : (
              <TableRow>
                <TableHead>Entrenador</TableHead>
                <TableHead className="w-[300px]">Servicio</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Evaluación</TableHead>
                <TableHead>Archivos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {isTrainer
              ? services.map((service: Service, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[250px] overflow-hidden text-ellipsis px-4">
                      <Link
                        to={`/my-services/${service.id}/clients`}
                        className="hover:underline"
                      >
                        {service.description}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4">
                      {service.visualizations}
                    </TableCell>
                    <TableCell className="px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenClientsModal(service)}
                        className="cursor-pointer w-fit"
                      >
                        {service.clients}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4">
                      {service.visualizations > 0
                        ? `${(
                            (service.clients / service.visualizations) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-yellow-400 fill-yellow-400" />
                        <span>
                          {(service.rating || 0).toFixed(1)} (
                          {service.totalReviews || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (service.pendings?.length > 0) {
                            handleOpenPendingModal(service);
                          }
                        }}
                        className="p-0"
                      >
                        {service.pendings?.length}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {service.status === "active"
                            ? "Publicado"
                            : "Despublicado"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewService(service.id)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditService(service.id)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnpublishService(service)}
                          title={
                            service.status === "active"
                              ? "Despublicar"
                              : "Publicar"
                          }
                          className={
                            service.status === "inactive" ? "text-gray-400" : ""
                          }
                        >
                          {service.status === "active" ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : services.map((service: Service, index) => (
                  <TableRow key={index}>
                    <TableCell className="overflow-hidden text-ellipsis px-4">
                      {service.trainerName}
                    </TableCell>
                    <TableCell className="max-w-[300px] overflow-hidden text-ellipsis px-4">
                      {service.category}
                    </TableCell>
                    <TableCell className="px-4">${service.price}</TableCell>
                    <TableCell className="px-4">
                      {service.mode === "online" ? "Virtual" : "Presencial"}
                    </TableCell>
                    <TableCell className="px-4">
                      {service.duration} min
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-yellow-400 fill-yellow-400" />
                        <span>
                          {(service.rating || 0).toFixed(1)} (
                          {service.totalReviews || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenArchivesModal(service)}
                        title="Ver archivos"
                      >
                        <FileText className="size-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="px-4">
                      {service.hiringStatus === "confirmed" || service.hiringStatus === "completed" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewService(service.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCreateReview(service)}
                            title="Crear reseña"
                          >
                            <Star className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteService(service)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              service.hiringStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : service.hiringStatus === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : service.hiringStatus === "rejected"
                                ? "bg-orange-100 text-orange-800"
                                : service.hiringStatus === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {service.hiringStatus === "pending"
                              ? "Pendiente"
                              : service.hiringStatus === "cancelled"
                              ? "Cancelado"
                              : service.hiringStatus === "rejected"
                              ? "Rechazado"
                              : service.hiringStatus === "completed"
                              ? "Completado"
                              : service.hiringStatus}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewService(service.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCreateReview(service)}
                            title="Crear reseña"
                          >
                            <Star className="size-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getDeleteDialogContent().title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getDeleteDialogContent().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteService}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteService}
              className="bg-red-600 hover:bg-red-700"
            >
              {getDeleteDialogContent().action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog
        open={unpublishDialogOpen}
        onOpenChange={setUnpublishDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {serviceToUnpublish?.status === "active"
                ? "¿Despublicar servicio?"
                : "¿Publicar servicio?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {serviceToUnpublish?.status === "active"
                ? "El servicio ya no será visible en la página principal, pero seguirá existiendo y podrás volver a publicarlo cuando quieras."
                : "El servicio será visible nuevamente en la página principal para que los clientes puedan contratarlo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelUnpublishService}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnpublishService}
              className={
                serviceToUnpublish?.status === "active"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {serviceToUnpublish?.status === "active"
                ? "Despublicar"
                : "Publicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Popup */}
      <CreateReviewPopup
        isOpen={reviewPopupOpen}
        onClose={() => setReviewPopupOpen(false)}
        service={serviceToReview}
        onReviewCreated={handleReviewCreated}
      />
      <PendingModal
        pendingModalOpen={pendingModalOpen}
        setPendingModalOpen={handleClosePendingModal}
        handleAccept={handleAccept}
        handleReject={handleReject}
        pendingClients={pendingClients}
        setCurrentServiceId={setCurrentServiceId}
      />
      <ClientsModal
        clientsModalOpen={clientsModalOpen}
        setClientsModalOpen={handleCloseClientsModal}
        clients={clients}
        setCurrentServiceId={setCurrentServiceId}
      />

      {/* Archives Modal */}
      <Dialog open={archivesModalOpen} onOpenChange={handleCloseArchivesModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Archivos del Servicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {archivesLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="size-8 animate-spin" />
              </div>
            ) : archiveFiles?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="size-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  No hay archivos disponibles para este servicio
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {archiveFiles.map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.originalName}</p>
                        <p className="text-sm text-gray-500">
                          Subido por: {file.uploadedBy.name}{" "}
                          {file.uploadedBy.surname}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(file.uploadDate).toLocaleDateString()} •{" "}
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.downloadUrl, "_blank")}
                      disabled={!file.downloadUrl}
                    >
                      <Eye className="size-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ServicesTable;
