import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { ExpandedFilters, type FilterContext } from "./expanded-filters";
import type { GetServicesParams } from "@/services/services.service";

interface FilteringProps {
    onApplyFilters?: (filters: GetServicesParams) => void;
    onSearch?: (searchTerm: string) => void;
    currentFilters: GetServicesParams;
    context?: FilterContext;
}

const Filtering = ({
    onApplyFilters,
    currentFilters,
    context = "landing",
}: FilteringProps) => {
    const [search, setSearch] = useState("");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onApplyFilters?.({ ...currentFilters, search });
    };

    const handleApplyFilters = (filters: GetServicesParams) => {
        if (onApplyFilters) {
            onApplyFilters(filters);
        }
        setIsFiltersOpen(false);
    };

    // Check if there are active filters
    const hasActiveFilters = currentFilters && Object.keys(currentFilters).length > 0;

    return (
        <>
            <nav
                className="flex items-center gap-2 py-8"
                aria-label="Filtros de búsqueda"
            >
                <form onSubmit={handleSearch} className="relative w-full">
                    <label htmlFor="trainer-search" className="sr-only">
                        Buscar entrenadores
                    </label>
                    <Input
                        id="trainer-search"
                        type="search"
                        placeholder="Explora nuestros servicios"
                        className="w-full pr-10 rounded-full px-4"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Buscar servicios"
                    />
                    <Button
                        type="submit"
                        variant="default"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-0 size-7"
                        aria-label="Buscar"
                    >
                        <Search className="size-4 text-white" aria-hidden="true" />
                    </Button>
                </form>
                <Button
                    variant={hasActiveFilters ? "default" : "secondary"}
                    className="gap-2"
                    aria-label="Abrir filtros avanzados"
                    onClick={() => setIsFiltersOpen(true)}
                >
                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                    {hasActiveFilters ? "Filtros activos" : "Filtros"}
                </Button>
            </nav>
            <ExpandedFilters
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                onApplyFilters={handleApplyFilters}
                currentFilters={currentFilters}
                context={context}
            />
        </>
    );
};

export default Filtering;
