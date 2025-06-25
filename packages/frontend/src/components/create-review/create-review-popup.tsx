import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { reviewsService, type CreateReviewRequest } from "@/services/reviews.service";
import type { Service } from "@/services/services.service";
import { toast } from "sonner";

interface CreateReviewPopupProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
    onReviewCreated?: () => void;
}

const CreateReviewPopup = ({
    isOpen,
    onClose,
    service,
    onReviewCreated,
}: CreateReviewPopupProps) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setRating(0);
        setHoveredRating(0);
        setComments("");
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!service) return;

        if (rating === 0) {
            toast.error("Por favor, selecciona una calificación");
            return;
        }

        if (!comments.trim()) {
            toast.error("Por favor, escribe un comentario");
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewData: CreateReviewRequest = {
                serviceId: service.id,
                trainerId: service.trainerId,
                calification: rating,
                comments: comments.trim(),
            };

            await reviewsService.createReview(reviewData);

            toast.success("Reseña creada exitosamente");

            if (onReviewCreated) {
                onReviewCreated();
            }

            handleClose();
        } catch (error) {
            console.error("Error creating review:", error);
            toast.error("Error al crear la reseña. Por favor, intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isActive = starValue <= (hoveredRating || rating);

            return (
                <button
                    key={index}
                    type="button"
                    className={`p-1 transition-colors ${
                        isActive ? "text-yellow-400" : "text-gray-300"
                    } hover:text-yellow-400`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={isSubmitting}
                >
                    <Star className={`size-8 ${isActive ? "fill-current" : ""}`} />
                </button>
            );
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Reseña</DialogTitle>
                    <DialogDescription>
                        Comparte tu experiencia con el servicio de {service?.trainerName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Service Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">{service?.category}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Entrenador: {service?.trainerName}
                        </p>
                        <p className="text-sm text-gray-600">
                            Duración: {service?.duration} min | Precio: ${service?.price}
                        </p>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <Label htmlFor="rating">Calificación *</Label>
                        <div className="flex items-center space-x-1">
                            {renderStars()}
                            <span className="ml-2 text-sm text-gray-600">
                                {rating > 0
                                    ? `${rating} de 5 estrellas`
                                    : "Selecciona una calificación"}
                            </span>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <Label htmlFor="comments">Comentarios *</Label>
                        <textarea
                            id="comments"
                            placeholder="Describe tu experiencia con este servicio..."
                            value={comments}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setComments(e.target.value)
                            }
                            rows={4}
                            disabled={isSubmitting}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                        <p className="text-xs text-gray-500">
                            {comments.length}/500 caracteres
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0 || !comments.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Creando...
                            </>
                        ) : (
                            "Crear Reseña"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateReviewPopup;
