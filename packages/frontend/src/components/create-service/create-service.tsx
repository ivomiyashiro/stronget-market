import { useState } from "react";
import { RequiredInput } from "@/components/common/required-input";
import { Button } from "@/components/ui/button";

const DURATION_OPTIONS = ["1 hora", "2 horas"];
const ZONE_OPTIONS = ["Nuñez", "Palermo"];
const CATEGORY_OPTIONS = ["Running", "Gimnasio", "Nutrición", "Yoga"];
const MODALITY_OPTIONS = ["Virtual", "Presencial"];

interface ServiceFormValues {
  description: string;
  duration: string;
  price: string;
  zone: string;
  category: string;
  modality: string;
  language: string;
}

interface CreateServiceProps {
  mode?: "create" | "edit";
  initialValues?: Partial<ServiceFormValues>;
  onSubmit?: (values: ServiceFormValues) => void;
  onCancel?: () => void;
}

const CreateService = ({
  mode = "create",
  initialValues = {},
  onSubmit,
  onCancel,
}: CreateServiceProps) => {
  const [values, setValues] = useState<ServiceFormValues>({
    description: initialValues.description || "",
    duration: initialValues.duration || "",
    price: initialValues.price || "",
    zone: initialValues.zone || "",
    category: initialValues.category || "",
    modality: initialValues.modality || "",
    language: initialValues.language || "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceFormValues, string>>
  >({});

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      if (onSubmit) onSubmit(values);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto flex flex-col gap-6 p-6"
    >
      <h1 className="text-2xl font-bold">
        {mode === "edit" ? "Editar Servicio" : "Crear Servicio"}
      </h1>
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
          options={CATEGORY_OPTIONS}
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
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {mode === "edit" ? "Editar Servicio" : "Crear Servicio"}
        </Button>
      </div>
    </form>
  );
};

export default CreateService;
