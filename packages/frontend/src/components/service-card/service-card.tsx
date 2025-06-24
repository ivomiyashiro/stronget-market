import { Image, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  name: string;
  imageUrl?: string;
  description: string;
  price: number;
  rating: number;
  amountOfReviews: number;
  id: string;
}

const ServiceCard = ({
  name,
  imageUrl,
  description,
  price,
  rating,
  amountOfReviews,
  id,
}: ServiceCardProps) => {
  const navigate = useNavigate();
  return (
    <article
      className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/service/${id}`)}
    >
      <figure className="relative aspect-video w-full overflow-hidden rounded-t-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Foto de ${name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-muted"
            role="presentation"
          >
            <Image
              className="size-12 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        )}
      </figure>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <header className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{name}</h3>
          <div
            className="flex items-center gap-1"
            aria-label={`Calificación: ${rating} de 5 estrellas con ${amountOfReviews} reseñas`}
          >
            <Star
              className="size-4 fill-yellow-400 text-yellow-400"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-muted-foreground">
              {rating} ({amountOfReviews})
            </span>
          </div>
        </header>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
        <footer className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span
              className="text-lg font-semibold"
              aria-label={`Precio: ${price} dólares por hora`}
            >
              ${price}/hr
            </span>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default ServiceCard;
