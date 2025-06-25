import {
  User,
  Star,
  MapPin,
  Clock,
  Globe,
  Users,
  Loader2,
  Search,
  Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import TrainerEvaluations from "../trainer-evaluations/trainer-evaluations";
import {
  useCurrentService,
  useServicesLoading,
} from "@/store/services/services.hooks";
import { useDispatch } from "react-redux";
import { getServiceById } from "@/store/services/services.thunks";
import type { AppDispatch } from "@/store/store";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth/auth.hooks";
import { useCurrentTrainer } from "@/store/trainer/trainer.hooks";
import { addServiceToCart } from "@/store/cart/cart.slice";
import { toast } from "sonner";
import { servicesService } from "@/services/services.service";
import { hiringService, type HiringItem } from "@/services/hiring.service";

const ServiceExpanded = () => {
  const { id } = useParams();
  const service = useCurrentService();
  const isLoading = useServicesLoading();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [myHirings, setMyHirings] = useState<HiringItem[]>([]);
  const { user } = useAuth();
  const trainer = useCurrentTrainer();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      dispatch(getServiceById(id));
    }
  }, [id, dispatch]);

  // Load user's hirings when user or service changes
  useEffect(() => {
    const loadUserHirings = async () => {
      if (!user) {
        setMyHirings([]);
        return;
      }
      const hirings = await hiringService.getMyHirings();
      setMyHirings(hirings);
    };

    loadUserHirings();
  }, [user]);

  // Check if user has already hired this service using useMemo
  const hasHiredService = useMemo(() => {
    if (!user || !service || !myHirings.length) return false;

    return myHirings.some((hiring) => hiring.serviceId._id === service.id);
  }, [user, service, myHirings]);

  // Track visualization when service is loaded and user is authenticated
  useEffect(() => {
    if (service && user && id) {
      // Don't track if the user is the creator of the service
      if (service.trainerId !== user.id) {
        servicesService.trackVisualization(id).catch((error) => {
          console.error("Failed to track visualization:", error);
        });
      }
    }
  }, [service, user, id]);

  const availableDays = service?.availability
    ? [...new Set(service.availability.map((av: { day: string }) => av.day))]
    : [];

  const availableTimes = service?.availability
    ? service.availability
        .filter(
          (av: { day: string; startTime: string }) => av.day === selectedDay
        )
        .map((av: { day: string; startTime: string }) => av.startTime)
    : [];

  const handleAddToCart = () => {
    if (!service || !selectedDay || !selectedTime) {
      toast.error("Por favor selecciona un día y horario");
      return;
    }

    const cartService = {
      id: service.id,
      trainerName: service.trainerName || "Entrenador",
      category: service.category,
      price: service.price,
      duration: service.duration,
      zone: service.zone,
      language: service.language,
      mode: service.mode,
      selectedDay,
      selectedTime,
      description: service.description,
      trainerImage: service.trainerImage,
    };

    dispatch(addServiceToCart(cartService));
    toast.success("Servicio agregado al carrito");
    navigate("/cart");
  };

  return (
    <section className="flex flex-col md:flex-row gap-50 mx-auto w-full py-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center w-full">
          <Loader2 className="size-10 animate-spin" />
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            Cargando servicio...
          </h2>
        </div>
      ) : !service ? (
        <div className="flex flex-col items-center justify-center py-16 text-center w-full">
          <Search className="size-10" />
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            No se encontró el servicio
          </h2>
          <p className="text-gray-600">
            El servicio que buscas no existe o ha sido eliminado.
          </p>
        </div>
      ) : (
        <>
          <article className="flex-1 flex flex-col gap-8">
            <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6">
              <div className="flex items-center gap-4">
                <div
                  className="size-20 rounded-full bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/profile/${service.trainerId}`)}
                >
                  {service.trainerImage ? (
                    <img
                      src={service.trainerImage}
                      alt={`Foto de ${trainer?.name || "Entrenador"}`}
                      className="size-20 rounded-full object-cover"
                    />
                  ) : (
                    <User
                      className="size-10 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">
                    <Link
                      to={`/profile/${service.trainerId}`}
                      className="hover:underline cursor-pointer"
                    >
                      {service.trainerName || "Entrenador"}
                    </Link>
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {service.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star
                      className="size-4 fill-yellow-400 text-yellow-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {service.rating} · {service.totalReviews} evaluaciones
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <section className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-6">
                Información del Servicio
              </h2>
              <dl className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Clock
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-medium text-sm">Duración</dt>
                    <dd className="text-sm text-muted-foreground">
                      {service.duration} minutos
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-medium text-sm">Zona</dt>
                    <dd className="text-sm text-muted-foreground">
                      {service.zone}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-medium text-sm">Idioma</dt>
                    <dd className="text-sm text-muted-foreground">
                      {service.language}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-medium text-sm">Modalidad</dt>
                    <dd className="text-sm text-muted-foreground">
                      {service.mode === "online" ? "Virtual" : "Presencial"}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>

            <section className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-sm text-muted-foreground mb-2">
                {service.description}
              </p>
            </section>
            <section>
              <TrainerEvaluations
                evaluations={[]}
                totalEvaluations={service.totalReviews}
                trainerName={service.category}
              />
            </section>
          </article>

          <aside className="w-full md:w-80 flex-shrink-0">
            {service.trainerId !== user?.id &&
              user?.role !== "entrenador" &&
              !hasHiredService && (
                <div className="border rounded-lg p-6 flex flex-col gap-4 bg-card">
                  <div>
                    <span className="text-2xl font-bold">${service.price}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="day-select" className="text-sm font-medium">
                      Día
                    </label>
                    <select
                      id="day-select"
                      className="border rounded px-3 py-2 text-sm"
                      value={selectedDay}
                      onChange={(e) => {
                        setSelectedDay(e.target.value);
                        setSelectedTime("");
                      }}
                    >
                      <option value="" disabled>
                        Seleccionar un día
                      </option>
                      {availableDays.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="time-select"
                      className="text-sm font-medium"
                    >
                      Horario
                    </label>
                    <select
                      id="time-select"
                      className="border rounded px-3 py-2 text-sm"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={!selectedDay}
                    >
                      <option value="" disabled>
                        {selectedDay
                          ? "Seleccionar un horario"
                          : "Primero selecciona un día"}
                      </option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    disabled={!selectedDay || !selectedTime || user === null}
                    onClick={handleAddToCart}
                  >
                    Contratar
                  </Button>
                </div>
              )}

            {service.trainerId === user?.id && (
              <div className="flex flex-col gap-4 border rounded-lg p-6 bg-card">
                <div className="flex flex-row gap-2">
                  <Check className="size-10 text-green-500" />
                  <p className="text-lg">
                    Este servicio fue creado por vos. Podés{" "}
                    <Link
                      to={`/create-service/${service.id}`}
                      className="underline font-bold"
                    >
                      editar este servicio
                    </Link>
                  </p>
                </div>
                <Button disabled>Contratar</Button>
              </div>
            )}

            {hasHiredService && service.trainerId !== user?.id && (
              <div className="flex flex-col gap-4 border rounded-lg p-6 bg-card">
                <div className="flex flex-row gap-2">
                  <Check className="size-10 text-green-500" />
                  <p className="text-lg">Ya has contratado este servicio.</p>
                </div>
                <Button disabled>Contratar</Button>
              </div>
            )}
          </aside>
        </>
      )}
    </section>
  );
};

export default ServiceExpanded;
