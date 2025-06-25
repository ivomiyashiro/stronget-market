import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
    useServices,
    useServicesActions,
    useServicesLoading,
    useServicesError,
} from "@/store/services/services.hooks";
import Filtering from "../filtering/filtering";
import ServiceCard from "../service-card/service-card";
import type { Service, GetServicesParams } from "@/services/services.service";

const Landing = () => {
    const services = useServices();
    const { getServices } = useServicesActions();
    const isLoading = useServicesLoading();
    const error = useServicesError();

    // Track current applied filters
    const [currentFilters, setCurrentFilters] = useState<GetServicesParams>({});

    useEffect(() => {
        getServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilters = (filters: GetServicesParams) => {
        setCurrentFilters(filters);
        getServices(filters);
    };

    const handleSearch = (searchTerm: string) => {
        setCurrentFilters({});
        getServices({ ...currentFilters, search: searchTerm });
    };

    return (
        <main className="flex h-full w-full flex-col gap-6">
            <Filtering
                onApplyFilters={handleApplyFilters}
                onSearch={handleSearch}
                currentFilters={currentFilters}
                context="landing"
            />
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Loader2 className="size-10 animate-spin" />
                    <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                        Cargando servicios...
                    </h2>
                    <p className="text-gray-600">
                        Estamos obteniendo los servicios disponibles.
                    </p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 text-6xl">❌</div>
                    <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                        Error al cargar servicios
                    </h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            ) : !services || services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 text-6xl">🏋️‍♂️</div>
                    <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                        No se encontraron servicios
                    </h2>
                    <p className="text-gray-600">
                        No hay servicios disponibles con los filtros actuales.
                        <br />
                        Intenta ajustar tus criterios de búsqueda.
                    </p>
                </div>
            ) : (
                <section
                    className="grid grid-cols-1 auto-rows-fr gap-8"
                    style={{
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
                    }}
                    aria-label="Lista de servicios disponibles"
                >
                    {services.map((service: Service) => (
                        <article key={service.id} className="max-w-[360px] w-full">
                            <ServiceCard
                                name={service.trainerName}
                                imageUrl={service.trainerImage}
                                description={service.description}
                                price={service.price}
                                rating={service.rating}
                                amountOfReviews={service.totalReviews}
                                id={service.id}
                            />
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
};

export default Landing;
