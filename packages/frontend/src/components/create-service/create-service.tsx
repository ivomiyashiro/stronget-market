import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RequiredInput } from "@/components/common/required-input";
import { Button } from "@/components/ui/button";
import {
  useCreateServiceLoading,
  useCurrentService,
  useUpdateServiceLoading,
} from "@/store/services/services.hooks";
import { useDispatch } from "react-redux";
import {
  createService,
  updateService,
  getServiceById,
} from "@/store/services/services.thunks";
import type { AppDispatch } from "@/store/store";
import type { CreateServiceRequest } from "@/services/services.service";
import {
  AvailabilitySelector,
  type DailyAvailability,
} from "./availability-selector";
import { useMediaQuery } from "react-responsive";

const DURATION_OPTIONS = ["1 hora", "2 horas", "3 horas", "4 horas", "5 horas"];
const MODALITY_OPTIONS = ["Virtual", "Presencial"];

interface ServiceFormValues {
  description: string;
  duration: string;
  price: string;
  zone: string;
  category: string;
  modality: string;
  language: string;
  maxPeople: string;
}

const CreateService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mode = id ? "edit" : "create";

  const dispatch = useDispatch<AppDispatch>();

  const isLoading = useCreateServiceLoading();
  const updateLoading = useUpdateServiceLoading();

  const currentService = useCurrentService();

  const [values, setValues] = useState<ServiceFormValues>({
    description: "",
    duration: "",
    price: "",
    zone: "",
    category: "",
    modality: "",
    language: "",
    maxPeople: "",
  });
  const [availability, setAvailability] = useState<DailyAvailability[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceFormValues, string>>
  >({});

  useEffect(() => {
    if (id && mode === "edit") {
      dispatch(getServiceById(id));
    }
  }, [id, mode, dispatch]);

  useEffect(() => {
    if (currentService && mode === "edit") {
      setValues({
        description: currentService.description,
        duration: `${Math.floor(currentService.duration / 60)} hora${
          Math.floor(currentService.duration / 60) > 1 ? "s" : ""
        }`,
        price: currentService.price.toString(),
        zone: currentService.zone,
        category: currentService.category,
        modality: currentService.mode === "online" ? "Virtual" : "Presencial",
        language: currentService.language,
        maxPeople: currentService.maxPeople.toString(),
      });
      if (currentService.availability) {
        const groupedAvailability = currentService.availability.reduce(
          (acc, curr) => {
            let dayEntry = acc.find((item) => item.day === curr.day);
            if (!dayEntry) {
              dayEntry = { day: curr.day, timeSlots: [] };
              acc.push(dayEntry);
            }
            dayEntry.timeSlots.push({
              id: crypto.randomUUID(),
              startTime: curr.startTime,
            });
            return acc;
          },
          [] as DailyAvailability[]
        );
        setAvailability(groupedAvailability);
      }
    }
  }, [currentService, mode]);

  const handleChange = (field: keyof ServiceFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ServiceFormValues, string>> = {};
    if (!values.description)
      newErrors.description = "La descripción es obligatoria.";
    if (!values.duration) newErrors.duration = "La duración es obligatoria.";
    if (!values.price) newErrors.price = "El precio es obligatorio.";
    if (!values.zone) newErrors.zone = "La zona es obligatoria.";
    if (!values.category) newErrors.category = "La categoría es obligatoria.";
    if (!values.modality) newErrors.modality = "La modalidad es obligatoria.";
    if (!values.language) newErrors.language = "El idioma es obligatorio.";
    if (!values.maxPeople)
      newErrors.maxPeople = "El número de personas es obligatorio.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    navigate("/my-services");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      const flattenedAvailability = availability.flatMap((daily) =>
        daily.timeSlots.map((slot) => ({
          day: daily.day,
          startTime: slot.startTime,
        }))
      );

      const serviceData: CreateServiceRequest = {
        description: values.description,
        duration: parseInt(values.duration.split(" ")[0]) * 60,
        price: parseFloat(values.price),
        zone: values.zone,
        category: values.category,
        mode: values.modality === "Virtual" ? "online" : "in-person",
        language: values.language,
        maxPeople: parseInt(values.maxPeople),
        availability: flattenedAvailability,
      };

      if (mode === "create") {
        dispatch(
          createService({
            data: serviceData,
            onSuccess: () => {
              navigate("/my-services");
            },
          })
        );
      } else if (mode === "edit" && id) {
        dispatch(
          updateService({
            id,
            data: serviceData,
            onSuccess: () => {
              navigate("/my-services");
            },
          })
        );
      }
    }
  };

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const displayLoading = isLoading || updateLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto flex flex-col gap-6 p-6"
    >
      <h1 className="text-2xl font-bold">
        {mode === "edit" ? "Editar Servicio" : "Crear Servicio"}
      </h1>
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
        <RequiredInput
          label="Descripción"
          type="text"
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          required
          fullSize
        />
        <RequiredInput
          label="Duración"
          inputType="select"
          value={values.duration}
          onChange={(e) => handleChange("duration", e.target.value)}
          error={errors.duration}
          required
          options={DURATION_OPTIONS}
          fullSize
        />
        <RequiredInput
          label="Precio"
          type="number"
          value={values.price}
          onChange={(e) => handleChange("price", e.target.value)}
          error={errors.price}
          required
          fullSize
        />
        <RequiredInput
          label="Zona"
          inputType="input"
          value={values.zone}
          onChange={(e) => handleChange("zone", e.target.value)}
          error={errors.zone}
          required
          fullSize
        />
        <RequiredInput
          label="Categoría"
          inputType="input"
          value={values.category}
          onChange={(e) => handleChange("category", e.target.value)}
          error={errors.category}
          required
          fullSize
        />
        <RequiredInput
          label="Idioma"
          inputType="input"
          value={values.language}
          onChange={(e) => handleChange("language", e.target.value)}
          error={errors.language}
          required
          fullSize
        />
        <RequiredInput
          label="Modalidad"
          inputType="select"
          value={values.modality}
          onChange={(e) => handleChange("modality", e.target.value)}
          error={errors.modality}
          required
          options={MODALITY_OPTIONS}
          fullSize
        />
        <RequiredInput
          label="Número de Personas"
          type="number"
          value={values.maxPeople}
          onChange={(e) => handleChange("maxPeople", e.target.value)}
          error={errors.maxPeople}
          required
          fullSize
        />
      </div>
      <AvailabilitySelector
        availability={availability}
        onChange={setAvailability}
        duration={
          values.duration ? parseInt(values.duration.split(" ")[0]) * 60 : 0
        }
      />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="destructive"
          onClick={handleCancel}
          disabled={displayLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={displayLoading}>
          {displayLoading
            ? mode === "edit"
              ? "Editando..."
              : "Creando..."
            : mode === "edit"
            ? "Editar Servicio"
            : "Crear Servicio"}
        </Button>
      </div>
    </form>
  );
};

export default CreateService;
