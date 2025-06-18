import { useState } from "react";
import { RequiredInput } from "@/components/common/required-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "../ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import HourSelect from "./hour-select";

const DURATION_OPTIONS = ["1 hora", "2 horas"];
const ZONE_OPTIONS = ["Nuñez", "Palermo"];
const CATEGORY_OPTIONS = ["Running", "Gimnasio", "Nutrición", "Yoga"];
const MODALITY_OPTIONS = ["Virtual", "Presencial"];
const LANGUAGE_OPTIONS = ["Español", "Inglés"];

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

const DAYS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
] as const;

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
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
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
    if (!values.language) newErrors.language = "El idioma es obligatorio.";
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
      className="max-w-7xl mx-auto flex flex-col gap-6 p-6"
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
        fullSize
        required
      />
      <div className="grid grid-cols-3 gap-4 w-full justify-center">
        <RequiredInput
          label="Duración"
          inputType="select"
          value={values.duration}
          onChange={(e) => handleChange("duration", e.target.value)}
          error={errors.duration}
          options={DURATION_OPTIONS}
          fullSize
          required
        />
        <RequiredInput
          label="Precio"
          type="number"
          value={values.price}
          onChange={(e) => handleChange("price", e.target.value)}
          error={errors.price}
          fullSize
          required
        />
        <RequiredInput
          label="Zona"
          inputType="select"
          value={values.zone}
          onChange={(e) => handleChange("zone", e.target.value)}
          error={errors.zone}
          options={ZONE_OPTIONS}
          fullSize
          required
        />
        <RequiredInput
          label="Categoría"
          inputType="select"
          value={values.category}
          onChange={(e) => handleChange("category", e.target.value)}
          error={errors.category}
          options={CATEGORY_OPTIONS}
          fullSize
          required
        />
        <RequiredInput
          label="Idioma"
          inputType="select"
          value={values.language}
          onChange={(e) => handleChange("language", e.target.value)}
          error={errors.language}
          options={LANGUAGE_OPTIONS}
          fullSize
          required
        />
        <RequiredInput
          label="Modalidad"
          inputType="select"
          value={values.modality}
          onChange={(e) => handleChange("modality", e.target.value)}
          error={errors.modality}
          options={MODALITY_OPTIONS}
          fullSize
          required
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Disponibilidad</h2>
          <Label>Días y horarios en el que se ofrece el servicio</Label>
        </div>
        <div className="flex flex-row gap-2">
          {DAYS.map((day) => (
            <div key={day.id}>
              <Checkbox
                id={day.id}
                checked={selectedDays.includes(day.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedDays([...selectedDays, day.id]);
                  } else {
                    setSelectedDays(selectedDays.filter((d) => d !== day.id));
                  }
                }}
                className="hidden"
              />
              <Label htmlFor={day.id} className="cursor-pointer">
                <Badge
                  variant={
                    selectedDays.includes(day.id) ? "default" : "outline"
                  }
                  className={cn(
                    "px-6 py-1 rounded-full",
                    selectedDays.includes(day.id) && "bg-black text-white"
                  )}
                >
                  {day.label}
                </Badge>
              </Label>
            </div>
          ))}
        </div>
      </div>
      {selectedDays.map((day) => (
        <HourSelect key={day} day={day} />
      ))}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" onClick={() => onSubmit?.(values)}>
          {mode === "edit" ? "Editar Servicio" : "Crear Servicio"}
        </Button>
      </div>
    </form>
  );
};

export default CreateService;
