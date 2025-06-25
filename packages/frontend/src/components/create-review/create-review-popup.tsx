import { useState } from "react";
import {
    Dialog,
    DialogContent,
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
                    <DialogTitle className="text-xl font-semibold">
                        Escribir Evaluación
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Subtitle */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            Contanos como fue tu experiencia con {service?.trainerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Podés escribir hasta un máximo de 200 caracteres.
                        </p>
                    </div>

                    {/* Rating */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">
                            Puntuación
                            <span className="text-xs text-gray-500">
                                (1 pésimo - 5 excelente)
                            </span>
                        </Label>
                        <div className="flex items-center space-x-1">{renderStars()}</div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-3">
                        <Label htmlFor="comments" className="text-base font-medium">
                            Descripción de la evaluación
                        </Label>
                        <textarea
                            id="comments"
                            placeholder="Ej: Una experiencia increíble...."
                            value={comments}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setComments(e.target.value.slice(0, 200))
                            }
                            rows={4}
                            disabled={isSubmitting}
                            maxLength={200}
                            className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-end pt-4">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0 || !comments.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Evaluando...
                            </>
                        ) : (
                            "Evaluar"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateReviewPopup;
