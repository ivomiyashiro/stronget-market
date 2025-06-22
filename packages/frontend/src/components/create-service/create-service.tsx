import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RequiredInput } from "@/components/common/required-input";
import { Button } from "@/components/ui/button";
import { useServicesActions, useCreateServiceLoading, useCreateServiceError, useCurrentService, useUpdateServiceLoading, useUpdateServiceError } from "@/store/services/services.hooks";
import type { CreateServiceRequest } from "@/services/services.service";

const DURATION_OPTIONS = ["1 hora", "2 horas"];
const ZONE_OPTIONS = ["Nuñez", "Palermo"];
const CATEGORY_OPTIONS = ["Running", "Gimnasio", "Nutrición", "Yoga"];
const MODALITY_OPTIONS = ["Virtual", "Presencial"];
const LANGUAGE_OPTIONS = ["Español", "Inglés", "Portugués"];

interface ServiceFormValues {
  description: string;
  duration: string;
  price: string;
  zone: string;
  category: string;
  modality: string;
  language: string;
}

const CreateService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mode = id ? "edit" : "create";
  
  const { 
    createService, 
    updateService, 
    getServiceById 
  } = useServicesActions();
  
  const isLoading = useCreateServiceLoading();
  const updateLoading = useUpdateServiceLoading();
  const error = useCreateServiceError();
  const updateError = useUpdateServiceError();
  const currentService = useCurrentService();

  const [values, setValues] = useState<ServiceFormValues>({
    description: "",
    duration: "",
    price: "",
    zone: "",
    category: "",
    modality: "",
    language: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceFormValues, string>>
  >({});

  // Fetch service data if in edit mode
  useEffect(() => {
    if (id && mode === "edit") {
      getServiceById(id);
    }
  }, [id, mode, getServiceById]);

  // Update form values when service data is loaded
  useEffect(() => {
    if (currentService && mode === "edit") {
      setValues({
        description: currentService.description,
        duration: `${Math.floor(currentService.duration / 60)} hora${Math.floor(currentService.duration / 60) > 1 ? 's' : ''}`,
        price: currentService.price.toString(),
        zone: currentService.zone,
        category: currentService.category,
        modality: currentService.mode === "online" ? "Virtual" : "Presencial",
        language: currentService.language,
      });
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    navigate("/my-services");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      // Convert form values to API format
      const serviceData: CreateServiceRequest = {
        description: values.description,
        duration: parseInt(values.duration.split(" ")[0]) * 60, // Convert hours to minutes
        price: parseFloat(values.price),
        zone: values.zone,
        category: values.category,
        mode: values.modality === "Virtual" ? "online" : "in-person",
        language: values.language,
      };

      if (mode === "create") {
        createService(
          serviceData,
          () => {
            // Success callback - navigate to my services
            navigate("/my-services");
          },
          (errorMessage) => {
            // Error callback - you can handle this if needed
            console.error("Failed to create service:", errorMessage);
          }
        );
      } else if (mode === "edit" && id) {
        updateService(
          id,
          serviceData,
          () => {
            // Success callback - navigate to my services
            navigate("/my-services");
          },
          (errorMessage) => {
            // Error callback - you can handle this if needed
            console.error("Failed to update service:", errorMessage);
          }
        );
      }
    }
  };

  const displayError = error || updateError;
  const displayLoading = isLoading || updateLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto flex flex-col gap-6 p-6"
    >
      <h1 className="text-2xl font-bold">
        {mode === "edit" ? "Editar Servicio" : "Crear Servicio"}
      </h1>
      
      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {displayError}
        </div>
      )}
      
      <RequiredInput
        label="Descripción"
        type="text"
        value={values.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        required
        fullSize
      />
      <div className="grid grid-cols-3 gap-4">
        <RequiredInput
          label="Duración"
          inputType="select"
          value={values.duration}
          onChange={(e) => handleChange("duration", e.target.value)}
          error={errors.duration}
          required
          options={DURATION_OPTIONS}
        />
        <RequiredInput
          label="Precio"
          type="number"
          value={values.price}
          onChange={(e) => handleChange("price", e.target.value)}
          error={errors.price}
          required
        />
        <RequiredInput
          label="Zona"
          inputType="select"
          value={values.zone}
          onChange={(e) => handleChange("zone", e.target.value)}
          error={errors.zone}
          required
          options={ZONE_OPTIONS}
        />
        <RequiredInput
          label="Categoría"
          inputType="select"
          value={values.category}
          onChange={(e) => handleChange("category", e.target.value)}
          error={errors.category}
          required
          options={CATEGORY_OPTIONS}
        />
        <RequiredInput
          label="Idioma"
          inputType="select"
          value={values.language}
          onChange={(e) => handleChange("language", e.target.value)}
          error={errors.language}
          required
          options={LANGUAGE_OPTIONS}
        />
        <RequiredInput
          label="Modalidad"
          inputType="select"
          value={values.modality}
          onChange={(e) => handleChange("modality", e.target.value)}
          error={errors.modality}
          required
          options={MODALITY_OPTIONS}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="destructive" onClick={handleCancel} disabled={displayLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={displayLoading}>
          {displayLoading 
            ? (mode === "edit" ? "Editando..." : "Creando...") 
            : (mode === "edit" ? "Editar Servicio" : "Crear Servicio")
          }
        </Button>
      </div>
    </form>
  );
};

export default CreateService;
