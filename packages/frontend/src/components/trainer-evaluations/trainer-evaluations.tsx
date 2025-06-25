import { hiringService } from "@/services/hiring.service";
import { reviewsService, type Review } from "@/services/reviews.service";
import userService from "@/services/user.service";
import { useAuth } from "@/store/auth/auth.hooks";
import { Label } from "@radix-ui/react-label";
import { Pencil, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { CustomModal } from "../common/custom-modal";
import { RequiredInput } from "../common/required-input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface TrainerEvaluationsProps {
  trainerId: string;
  trainerName: string;
  serviceId?: string;
  onStatsUpdate?: (average: number, total: number) => void;
}

// Definir la interfaz ReviewWithUserName localmente
interface ReviewWithUserName extends Review {
  userId?: string;
  userName?: string;
}

const TrainerEvaluations = ({
  trainerId,
  trainerName,
  serviceId,
  onStatsUpdate,
}: TrainerEvaluationsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithUserName[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<"list" | "form">("list");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseReviewId, setResponseReviewId] = useState<string | null>(null);
  const [responseLoading, setResponseLoading] = useState(false);
  const { user: loggedInUser } = useAuth();
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = serviceId
          ? await reviewsService.getReviewsByService(serviceId)
          : await reviewsService.getReviewsByTrainer(trainerId);
        // Obtener nombre de usuario para cada review
        const reviewsWithUserName = await Promise.all(
          data.map(async (review: ReviewWithUserName) => {
            let userName = "Usuario";
            if (review.userId || review.user?._id) {
              const user = (await userService.getUser(
                review.userId || review.user._id
              )) as {
                name?: string;
                nombre?: string;
                email?: string;
              };
              userName = user.name || user.nombre || user.email || "Usuario";
            }
            return { ...review, userName };
          })
        );
        setReviews(reviewsWithUserName);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [trainerId, serviceId]);

  // Check eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || !serviceId) {
        setCanWrite(false);
        return;
      }
      try {
        // Get all hirings for this user
        const hirings = await hiringService.getMyHirings();
        const completedOrConfirmed = hirings.some(
          (h) =>
            (h.status === "completed" || h.status === "confirmed") &&
            h.serviceId._id === serviceId
        );
        // Only allow if not already reviewed
        const alreadyReviewed = reviews.some(
          (r) => r.user?._id === user.id && r.serviceId === serviceId
        );
        setCanWrite(completedOrConfirmed && !alreadyReviewed);
      } catch {
        setCanWrite(false);
      }
    };
    checkEligibility();
  }, [user, serviceId, reviews]);

  // Mostrar solo 2 evaluaciones si hay serviceId (es decir, en el contexto de un servicio)
  const displayed: ReviewWithUserName[] = serviceId
    ? reviews.slice(0, 2)
    : reviews.slice(0, 3);

  const onShowAll = () => {
    setModalContent("list");
    setIsModalOpen(true);
  };
  const onCloseModal = () => {
    setIsModalOpen(false);
    setModalContent("list");
    setRating(0);
    setComment("");
    setHoverRating(0);
  };

  const handleWriteEvaluationClick = () => {
    setModalContent("form");
  };

  const handleEvaluationSubmit = async () => {
    if (!user || !serviceId || !rating || !comment.trim()) return;
    setLoading(true);
    try {
      await reviewsService.createReview({
        serviceId,
        trainerId,
        calification: rating,
        comments: comment.trim(),
      });
      // Refresh reviews
      const data = await reviewsService.getReviewsByService(serviceId);
      setReviews(data);
      setModalContent("list");
      setRating(0);
      setComment("");
      setHoverRating(0);
    } catch {
      setError("No se pudo enviar la evaluación");
    } finally {
      setLoading(false);
    }
  };

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const star = 5 - i;
    const count = reviews.filter(
      (ev) => Math.round(ev.calification) === star
    ).length;
    return { star, count };
  });

  const handleOpenResponseModal = (reviewId: string) => {
    setResponseReviewId(reviewId);
    setResponseText("");
    setResponseModalOpen(true);
  };

  const handleCloseResponseModal = () => {
    setResponseModalOpen(false);
    setResponseText("");
    setResponseReviewId(null);
  };

  const handleSubmitResponse = async () => {
    if (!responseReviewId || !responseText.trim()) return;
    setResponseLoading(true);
    try {
      if (!loggedInUser?.id) return;
      const updatedReview = await reviewsService.respondToReview(
        responseReviewId,
        responseText.trim()
      );
      setReviews((prev) =>
        prev.map((r) => (r._id === updatedReview._id ? updatedReview : r))
      );
      handleCloseResponseModal();
    } finally {
      setResponseLoading(false);
    }
  };

  const modalReviews = starFilter
    ? reviews.filter((r) => Math.round(r.calification) === starFilter)
    : reviews;

  // Calcular promedio de estrellas y cantidad total de comentarios
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + (r.calification || 0), 0) /
        totalReviews
      : 0;

  // Llamar a onStatsUpdate cuando cambian el promedio o la cantidad
  useEffect(() => {
    if (!serviceId && onStatsUpdate) {
      onStatsUpdate(averageRating, totalReviews);
    }
  }, [averageRating, totalReviews, onStatsUpdate, serviceId]);

  console.log(reviews);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Evaluaciones</h2>
      <div className="flex flex-col gap-6">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Cargando...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-8">{error}</p>
        ) : reviews.length > 0 ? (
          displayed.map((evalItem, idx) => {
            const expandedState = expanded[idx] || false;
            const showReadMore = evalItem.comments.length > 200;
            return (
              <article key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {evalItem.user?.avatar ? (
                      <img
                        src={evalItem.user.avatar}
                        alt={evalItem.user.name}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <User
                        className="size-6 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <span className="font-semibold text-sm">
                    {evalItem.userName}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-500 text-xs ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${
                          i < Math.round(evalItem.calification)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ·{" "}
                    {new Date(evalItem.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {loggedInUser?.id === evalItem.trainerId &&
                    !evalItem.response && (
                      <button
                        className="ml-2 p-1 rounded-full hover:bg-muted transition"
                        onClick={() => handleOpenResponseModal(evalItem._id)}
                        title="Responder evaluación"
                        type="button"
                      >
                        <Pencil className="size-4 text-muted-foreground" />
                      </button>
                    )}
                </div>
                <Label
                  className={`text-sm text-muted-foreground mb-2 whitespace-pre-line max-w-xl md:max-w-2xl ${
                    !expandedState ? "line-clamp-2" : ""
                  }`}
                >
                  {evalItem.comments}
                </Label>
                {showReadMore && (
                  <Button
                    variant="link"
                    className="justify-start text-black hover:text-black/90"
                    size="sm"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [idx]: !expandedState,
                      }))
                    }
                  >
                    {expandedState ? "Mostrar menos" : "Mostrar más"}
                  </Button>
                )}
                {evalItem.response && (
                  <div className="bg-muted rounded-md p-3 mt-2 ml-12 max-w-xl">
                    <span className="font-semibold text-muted-foreground">
                      Respuesta del entrenador:
                    </span>
                    <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                      {evalItem.response}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="flex flex-col py-8">
            <p className="text-muted-foreground text-center">
              {serviceId
                ? "Todavía no hay evaluaciones para este entrenador en este servicio"
                : "Todavía no hay evaluaciones para este entrenador"}
            </p>
            {canWrite && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  onShowAll();
                  handleWriteEvaluationClick();
                }}
              >
                Sé el primero en evaluar
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Botón para mostrar todas las evaluaciones, siempre visible si hay más de 0 reviews */}
      {reviews.length > 0 && (
        <Button
          variant="outline"
          className="mt-4 self-center"
          onClick={onShowAll}
        >
          Mostrar todas las evaluaciones
        </Button>
      )}
      <CustomModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        className="p-0 w-4xl"
      >
        {modalContent === "list" ? (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Evaluaciones ({reviews.length})
            </h2>
            <Separator className="my-4" />
            <div>
              <div className="flex flex-row gap-8 justify-center mb-4">
                <div className="flex flex-col gap-2 min-w-[180px]">
                  <h3 className="text-lg font-semibold mb-2 text-left">
                    Distribución de evaluaciones
                  </h3>
                  {ratingDistribution.map(({ star, count }) => (
                    <div
                      key={star}
                      className={`flex items-center gap-2 cursor-pointer select-none ${
                        starFilter === star ? "font-bold" : ""
                      }`}
                      onClick={() =>
                        setStarFilter(starFilter === star ? null : star)
                      }
                      style={{ opacity: count === 0 ? 0.4 : 1 }}
                    >
                      <span className="w-6 text-right">{count}</span>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < star
                              ? starFilter === star
                                ? "fill-primary text-primary"
                                : "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col gap-6 max-h-[350px] overflow-y-auto">
                  {modalReviews.length > 0 ? (
                    modalReviews.map((evalItem, idx) => (
                      <article key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="size-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {evalItem.user?.avatar ? (
                              <img
                                src={evalItem.user?.avatar}
                                alt={evalItem.user?.name}
                                className="size-10 rounded-full object-cover"
                              />
                            ) : (
                              <User
                                className="size-6 text-muted-foreground"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <span className="font-semibold text-sm">
                            {evalItem.user?.name + " " + evalItem.user?.surname}
                          </span>
                          <span className="flex items-center gap-1 text-yellow-500 text-xs ml-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3 ${
                                  i < Math.round(evalItem.calification)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ·{" "}
                            {new Date(evalItem.date).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                          {loggedInUser?.id === evalItem.trainerId &&
                            !evalItem.response && (
                              <button
                                className="ml-2 p-1 rounded-full hover:bg-muted transition"
                                onClick={() =>
                                  handleOpenResponseModal(evalItem._id)
                                }
                                title="Responder evaluación"
                                type="button"
                              >
                                <Pencil className="size-4 text-muted-foreground" />
                              </button>
                            )}
                        </div>
                        <Label className="text-sm text-muted-foreground mb-2 whitespace-pre-line max-w-xl md:max-w-2xl">
                          {evalItem.comments}
                        </Label>
                        {evalItem.response && (
                          <div className="bg-muted rounded-md p-3 mt-2 ml-12 max-w-xl">
                            <span className="font-semibold text-muted-foreground">
                              Respuesta del entrenador:
                            </span>
                            <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                              {evalItem.response}
                            </div>
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No existen reseñas para esta calificación.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end">
              {canWrite && (
                <Button onClick={handleWriteEvaluationClick}>
                  Escribir Evaluación
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Escribir Evaluación</h2>
            <Separator className="my-4" />
            <div className="flex flex-col gap-2">
              <Label className="mt-2 font-semibold">
                Contanos como fue tu experiencia con {trainerName}
              </Label>
              <Label className="text-sm text-muted-foreground">
                Podés escribir hasta un máximo de 200 caracteres.
              </Label>
            </div>
            <div className="my-4 flex flex-col gap-1">
              <Label className="font-semibold text-sm mb-2">
                Puntuación (0 pésimo - 5 excelente)
              </Label>
              <div
                className="flex items-center"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <Star
                      key={i}
                      className={`size-6 cursor-pointer ${
                        starValue <= (hoverRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                    />
                  );
                })}
              </div>
            </div>
            <RequiredInput
              label="Descripción de la evaluación"
              inputType="input"
              placeholder="Ej: El mejor entrenador del mundo..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 200))}
              required
              fullSize
            />
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleEvaluationSubmit}
                disabled={loading || !rating || !comment.trim()}
              >
                Evaluar
              </Button>
            </div>
          </div>
        )}
      </CustomModal>
      <CustomModal
        isOpen={responseModalOpen}
        onClose={handleCloseResponseModal}
      >
        <div className="p-6 w-[500px]">
          <h2 className="text-xl font-bold mb-4">Responder evaluación</h2>
          <div className="mb-2 font-semibold">
            Respondé a la evaluación de{" "}
            {(() => {
              const review = reviews.find((r) => r._id === responseReviewId);
              return review?.user?.name + " " + review?.user?.surname;
            })()}
          </div>
          <div className="mb-4 text-muted-foreground">
            {(() => {
              const review = reviews.find((r) => r._id === responseReviewId);
              return review?.comments;
            })()}
          </div>
          <RequiredInput
            label="Respuesta"
            inputType="input"
            placeholder="Respuesta..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            required
            fullSize
          />
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSubmitResponse}
              disabled={responseLoading || !responseText.trim()}
            >
              Responder
            </Button>
          </div>
        </div>
      </CustomModal>
    </section>
  );
};

export default TrainerEvaluations;
