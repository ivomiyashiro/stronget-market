import { useEffect, useState } from "react";
import { User, Star, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { CustomModal } from "../common/custom-modal";
import { Separator } from "../ui/separator";
import { RequiredInput } from "../common/required-input";
import { Label } from "@radix-ui/react-label";
import { reviewsService, type Review } from "@/services/reviews.service";
import { useAuth } from "@/store/auth/auth.hooks";
import { hiringService } from "@/services/hiring.service";

interface TrainerEvaluationsProps {
  trainerId: string;
  trainerName: string;
  serviceId?: string;
}

const TrainerEvaluations = ({
  trainerId,
  trainerName,
  serviceId,
}: TrainerEvaluationsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
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

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = serviceId
          ? await reviewsService.getReviewsByService(serviceId)
          : await reviewsService.getReviewsByTrainer(trainerId);
        setReviews(data);
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
        const completed = hirings.some(
          (h) => h.status === "completed" && h.serviceId._id === serviceId
        );
        // Only allow if not already reviewed
        const alreadyReviewed = reviews.some(
          (r) => r.user?._id === user.id && r.serviceId === serviceId
        );
        setCanWrite(completed && !alreadyReviewed);
      } catch {
        setCanWrite(false);
      }
    };
    checkEligibility();
  }, [user, serviceId, reviews]);

  const displayed = reviews.slice(0, 3);

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
                    {evalItem.user?.name || "Usuario"}{" "}
                    {evalItem.user?.surname || ""}
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
                  <div className="bg-muted rounded-md p-3 mt-2 ml-12">
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
          <p className="text-muted-foreground text-center py-8">
            Todavía no hay evaluaciones para este entrenador
          </p>
        )}
      </div>
      {reviews.length > 3 && (
        <Button
          variant="secondary"
          className="justify-start rounded-full mt-4"
          size="sm"
          onClick={onShowAll}
        >
          Mostrar todo: {reviews.length} evaluaciones
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h3 className="font-semibold mb-2">
                  Distribución de evaluaciones
                </h3>
                <div className="flex flex-col gap-1">
                  {ratingDistribution.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${
                              i < star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="text-muted-foreground">({count})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-6 max-h-[350px] overflow-y-auto">
                {reviews.map((evalItem, idx) => (
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
                        {evalItem.user?.name || "Usuario"}{" "}
                        {evalItem.user?.surname || ""}
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
                  </article>
                ))}
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
              return review?.user?.name || "Usuario";
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
