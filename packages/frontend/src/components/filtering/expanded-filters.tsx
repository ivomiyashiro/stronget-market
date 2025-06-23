import { CustomModal } from "@/components/common/custom-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { filtersService, type FiltersResponse, type GetServicesParams } from "@/services";

const MODALITIES = ["Virtual", "Presencial"];
const RATINGS = [1, 2, 3, 4, 5];

interface ExpandedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: GetServicesParams) => void;
  currentFilters: GetServicesParams;
}

export function ExpandedFilters({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: ExpandedFiltersProps) {
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1000);
  const [durationMin, setDurationMin] = useState(30);
  const [durationMax, setDurationMax] = useState(180);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  // Fetch filters when component mounts or when modal opens
  useEffect(() => {
    if (isOpen && !filters) {
      fetchFilters();
    }
  }, [isOpen, filters]);

  const fetchFilters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filtersData = await filtersService.getFilters();
      setFilters(filtersData);
      // Initialize price range with API values
      setPriceMin(filtersData.minPrice);
      setPriceMax(filtersData.maxPrice);
      // Initialize duration range with API values
      setDurationMin(filtersData.minDuration);
      setDurationMax(filtersData.maxDuration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load filters");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (filters) {
      setPriceMin(filters.minPrice);
      setPriceMax(filters.maxPrice);
      setDurationMin(filters.minDuration);
      setDurationMax(filters.maxDuration);
    }
    setSelectedZones([]);
    setSelectedLanguages([]);
    setSelectedModalities([]);
    setSelectedRatings([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters: GetServicesParams = {
      ...currentFilters,
      category: selectedCategories,
      minPrice: priceMin,
      maxPrice: priceMax,
      minDuration: durationMin,
      maxDuration: durationMax,
      zone: selectedZones,
      language: selectedLanguages,
      mode:
        selectedModalities.length > 0
          ? (selectedModalities[0] as "online" | "in-person" | "both")
          : undefined,
      rating: selectedRatings,
    };
    onApplyFilters(newFilters);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <form
        className="flex flex-col gap-4 p-4 min-w-[320px] max-w-[400px]"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-2">Filtros</h2>

        {isLoading && (
          <div className="text-center py-4">
            <span className="text-sm text-muted-foreground">Cargando filtros...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {filters && !isLoading && (
          <>
            {/* Categorías */}
            <div>
              <Label className="mb-1">Categorías</Label>
              <div className="flex flex-wrap gap-2">
                {filters.categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() =>
                        handleCheckbox(cat, selectedCategories, setSelectedCategories)
                      }
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Precio Min */}
            <div>
              <Label className="mb-1">Precio Min: ${priceMin}</Label>
              <Slider
                min={filters.minPrice}
                max={priceMax}
                value={[priceMin]}
                onValueChange={([v]) => setPriceMin(v)}
                className="mb-1 mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${filters.minPrice}</span>
                <span>${priceMax}</span>
              </div>
            </div>

            {/* Precio Max */}
            <div>
              <Label className="mb-1">Precio Max: ${priceMax}</Label>
              <Slider
                min={priceMin}
                max={filters.maxPrice}
                value={[priceMax]}
                onValueChange={([v]) => setPriceMax(v)}
                className="mb-1 mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${priceMin}</span>
                <span>${filters.maxPrice}</span>
              </div>
            </div>

            {/* Duración Min */}
            <div>
              <Label className="mb-1">Duración Min: {durationMin} min</Label>
              <Slider
                min={filters.minDuration}
                max={durationMax}
                value={[durationMin]}
                onValueChange={([v]) => setDurationMin(v)}
                className="mb-1 mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filters.minDuration} min</span>
                <span>{durationMax} min</span>
              </div>
            </div>

            {/* Duración Max */}
            <div>
              <Label className="mb-1">Duración Max: {durationMax} min</Label>
              <Slider
                min={durationMin}
                max={filters.maxDuration}
                value={[durationMax]}
                onValueChange={([v]) => setDurationMax(v)}
                className="mb-1 mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{durationMin} min</span>
                <span>{filters.maxDuration} min</span>
              </div>
            </div>

            {/* Zona */}
            <div>
              <Label className="mb-1">Zona</Label>
              <div className="flex flex-wrap gap-2">
                {filters.zones.map((z) => (
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
                {filters.languages.map((l) => (
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
          </>
        )}

        {/* Acciones */}
        <div className="flex justify-between gap-2 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="text-muted-foreground"
            disabled={isLoading}
          >
            Borrar todo
          </Button>
          <Button type="submit" className="ml-auto" disabled={isLoading}>
            Aceptar
          </Button>
        </div>
      </form>
    </CustomModal>
  );
}
