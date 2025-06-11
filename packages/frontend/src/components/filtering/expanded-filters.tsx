import { CustomModal } from "@/components/common/custom-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const CATEGORIES = ["Running", "Gimnasio", "Nutrición", "Yoga"];
const DURATIONS = ["1 hora", "2 horas"];
const ZONES = ["Nuñez", "Palermo"];
const LANGUAGES = ["Inglés", "Español"];
const MODALITIES = ["Virtual", "Presencial"];
const RATINGS = [1, 2, 3, 4, 5];

interface ExpandedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpandedFilters({ isOpen, onClose }: ExpandedFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  // Handlers
  const handleCheckbox = (
    value: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };
  const handleRatingCheckbox = (value: number) => {
    setSelectedRatings(
      selectedRatings.includes(value)
        ? selectedRatings.filter((v) => v !== value)
        : [...selectedRatings, value]
    );
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setPriceMin(0);
    setPriceMax(1000);
    setSelectedDurations([]);
    setSelectedZones([]);
    setSelectedLanguages([]);
    setSelectedModalities([]);
    setSelectedRatings([]);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <form className="flex flex-col gap-4 p-4 min-w-[320px] max-w-[400px]">
        <h2 className="text-xl font-bold mb-2">Filtros</h2>
        {/* Categorías */}
        <div>
          <Label className="mb-1">Categorías</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() =>
                    handleCheckbox(
                      cat,
                      selectedCategories,
                      setSelectedCategories
                    )
                  }
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Precio Min */}
        <div>
          <Label className="mb-1">Precio Min.</Label>
          <Slider
            min={0}
            max={priceMax}
            value={[priceMin]}
            onValueChange={([v]) => setPriceMin(v)}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min.</span>
            <span>Max.</span>
          </div>
        </div>
        {/* Precio Max */}
        <div>
          <Label className="mb-1">Precio Max.</Label>
          <Slider
            min={priceMin}
            max={2000}
            value={[priceMax]}
            onValueChange={([v]) => setPriceMax(v)}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min.</span>
            <span>Max.</span>
          </div>
        </div>
        {/* Duración */}
        <div>
          <Label className="mb-1">Duración</Label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <label key={d} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDurations.includes(d)}
                  onCheckedChange={() =>
                    handleCheckbox(d, selectedDurations, setSelectedDurations)
                  }
                />
                <span className="text-sm">{d}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Zona */}
        <div>
          <Label className="mb-1">Zona</Label>
          <div className="flex flex-wrap gap-2">
            {ZONES.map((z) => (
              <label key={z} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedZones.includes(z)}
                  onCheckedChange={() =>
                    handleCheckbox(z, selectedZones, setSelectedZones)
                  }
                />
                <span className="text-sm">{z}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Idioma */}
        <div>
          <Label className="mb-1">Idioma</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <label key={l} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedLanguages.includes(l)}
                  onCheckedChange={() =>
                    handleCheckbox(l, selectedLanguages, setSelectedLanguages)
                  }
                />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Modalidad */}
        <div>
          <Label className="mb-1">Modalidad</Label>
          <div className="flex flex-wrap gap-2">
            {MODALITIES.map((m) => (
              <label key={m} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedModalities.includes(m)}
                  onCheckedChange={() =>
                    handleCheckbox(m, selectedModalities, setSelectedModalities)
                  }
                />
                <span className="text-sm">{m}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Calificación */}
        <div>
          <Label className="mb-1">Calificación</Label>
          <div className="flex flex-wrap gap-2">
            {RATINGS.map((r) => (
              <label key={r} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedRatings.includes(r)}
                  onCheckedChange={() => handleRatingCheckbox(r)}
                />
                <span className="text-sm">
                  {r} estrella{r > 1 ? "s" : ""}
                </span>
              </label>
            ))}
          </div>
        </div>
        {/* Acciones */}
        <div className="flex justify-between gap-2 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="text-muted-foreground"
          >
            Borrar todo
          </Button>
          <Button type="submit" className="ml-auto">
            Aceptar
          </Button>
        </div>
      </form>
    </CustomModal>
  );
}
