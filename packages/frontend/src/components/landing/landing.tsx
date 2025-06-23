import { useServices } from "@/store/services/services.hooks";
import Filtering from "../filtering/filtering";
import ServiceCard from "../service-card/service-card";
import type { Service } from "@/services/services.service";

const Landing = () => {
  const services = useServices();

  return (
    <main className="flex h-full w-full flex-col gap-6">
      <Filtering />
      {services.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-6xl">🏋️‍♂️</div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            No se encontraron servicios
          </h2>
          <p className="text-gray-600">
            No hay servicios disponibles con los filtros actuales.
            <br />
            Intenta ajustar tus criterios de búsqueda.
          </p>
        </section>
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
            <article key={service.id} className="w-full">
              <ServiceCard
                name={service.category}
                imageUrl={service.trainerImage}
                description={service.description}
                price={service.price}
                rating={service.rating}
                amountOfReviews={service.totalReviews}
              />
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default Landing;
