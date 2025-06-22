import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Archive,
  Ban,
  Copy,
  Eye,
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
} from "@/store/services/services.thunks";
import type { AppDispatch } from "@/store/store";
import type { Service } from "@/services/services.service";

const ServicesTable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isTrainer = user?.role === "entrenador";
  const hasFetched = useRef(false);

  const services = useServices();
  const isLoading = useServicesLoading();

  const fetchTrainerServices = useCallback(() => {
    if (isTrainer && user?.id && user.id.trim() !== "") {
      dispatch(getServicesByTrainerId(user.id));
    }
  }, [isTrainer, user, dispatch]);

  useEffect(() => {
    if (!hasFetched.current && isTrainer && user?.id && user.id.trim() !== "") {
      hasFetched.current = true;
      fetchTrainerServices();
    }
  }, [isTrainer, user?.id, fetchTrainerServices]);

  const handleEditService = (serviceId: string) => {
    navigate(`/create-service/${serviceId}`);
  };

  const handleCreateService = () => {
    navigate("/create-service");
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      dispatch(deleteService({ id: serviceId }));
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Servicios</h1>
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
      <Filtering />
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Cargando servicios...</div>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-gray-400 mb-4">
            <Archive className="size-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isTrainer
              ? "No tienes servicios creados"
              : "Todavía no estas anotado en ningún servicio"}
          </h3>
          <p className="text-gray-500 mb-6">
            {isTrainer
              ? "Crea tu primer servicio para empezar a recibir clientes"
              : "Busca un servicio para anotarte"}
          </p>
          {isTrainer ? (
            <Button
              onClick={handleCreateService}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Crear Servicio
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              Buscar Servicios
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            {isTrainer ? (
              <TableRow>
                <TableHead className="w-[250px]">Título</TableHead>
                <TableHead>Visualizaciones</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Tasa de conversión</TableHead>
                <TableHead>Evaluaciones</TableHead>
                <TableHead>Pendientes</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            ) : (
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-[300px]">Servicio</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Duración</TableHead>
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
                      {service.description}
                    </TableCell>
                    <TableCell className="px-4">
                      {/* Placeholder for visualizations - not in current Service model */}
                      0
                    </TableCell>
                    <TableCell className="px-4">
                      {/* Placeholder for clients - not in current Service model */}
                      0
                    </TableCell>
                    <TableCell className="px-4">
                      {/* Placeholder for conversion rate - not in current Service model */}
                      0%
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-yellow-400 fill-yellow-400" />
                        <span>
                          {service.rating.toFixed(1)} ({service.totalReviews})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      {/* Placeholder for pending - not in current Service model */}
                      0
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditService(service.id)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteService(service.id)}
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
                      {/* Placeholder for trainer name - would need to be fetched separately */}
                      "Trainer Name"
                    </TableCell>
                    <TableCell className="max-w-[300px] overflow-hidden text-ellipsis px-4">
                      {service.description}
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
                        <Archive className="size-4" />
                        {/* Placeholder for files count - not in current Service model */}
                        (0)
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Star className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Ban className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
};

export default ServicesTable;
