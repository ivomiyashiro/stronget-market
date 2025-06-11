import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { ExpandedFilters } from "./expanded-filters";

const Filtering = () => {
  const [search, setSearch] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <>
      <nav
        className="flex items-center gap-2 py-8"
        aria-label="Filtros de búsqueda"
      >
        <div className="relative w-full">
          <label htmlFor="trainer-search" className="sr-only">
            Buscar entrenadores
          </label>
          <Input
            id="trainer-search"
            type="search"
            placeholder="Explora nuestros entrenadores"
            className="w-full pr-10 rounded-full px-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar entrenadores"
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-0 size-7"
            aria-label="Buscar"
          >
            <Search className="size-5 text-white" aria-hidden="true" />
          </Button>
        </div>
        <Button
          variant="secondary"
          className="gap-2"
          aria-label="Abrir filtros avanzados"
          onClick={() => setIsFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
        </Button>
      </nav>
      <ExpandedFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
      />
    </>
  );
};

export default Filtering;
