import { User, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { CustomModal } from "../common/custom-modal";
import { Separator } from "../ui/separator";
import { RequiredInput } from "../common/required-input";
import { Label } from "@radix-ui/react-label";

interface Evaluation {
  user: string;
  date: string;
  comment: string;
  rating: number;
}

interface TrainerEvaluationsProps {
  evaluations: Evaluation[];
  totalEvaluations: number;
  trainerName: string;
}

const TrainerEvaluations = ({
  evaluations,
  totalEvaluations,
  trainerName,
}: TrainerEvaluationsProps) => {
  const displayed = evaluations.slice(0, 3);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<"list" | "form">("list");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

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

  const handleEvaluationSubmit = () => {
    console.log("New evaluation:", { rating, comment });
    // Here you would typically handle the submission to the backend
    onCloseModal();
  };

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const star = 5 - i;
    const count = evaluations.filter(
      (ev) => Math.round(ev.rating) === star
    ).length;
    return { star, count };
  });

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Evaluaciones</h2>
      <div className="flex flex-col gap-6">
        {evaluations.length > 0 ? (
          displayed.map((evalItem, idx) => {
            const expandedState = expanded[idx] || false;
            const showReadMore = evalItem.comment.length > 200;
            return (
              <article key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <User
                    className="size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-sm">{evalItem.user}</span>
                  <span className="flex items-center gap-1 text-yellow-500 text-xs ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${
                          i < Math.round(evalItem.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    · {evalItem.date}
                  </span>
                </div>
                <Label
                  className={`text-sm text-muted-foreground mb-2 whitespace-pre-line max-w-xl md:max-w-2xl ${
                    !expandedState ? "line-clamp-2" : ""
                  }`}
                >
                  {evalItem.comment}
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
              </article>
            );
          })
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Todavía no hay evaluaciones para este entrenador
          </p>
        )}
      </div>
      {totalEvaluations > 3 && (
        <Button
          variant="secondary"
          className="justify-start rounded-full mt-4"
          size="sm"
          onClick={onShowAll}
        >
          Mostrar todo: {totalEvaluations} evaluaciones
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
              Evaluaciones ({totalEvaluations})
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
                {evaluations.map((evalItem, idx) => (
                  <article key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User
                        className="size-6 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-sm">
                        {evalItem.user}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500 text-xs ml-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${
                              i < Math.round(evalItem.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        · {evalItem.date}
                      </span>
                    </div>
                    <Label className="text-sm text-muted-foreground mb-2 whitespace-pre-line max-w-xl md:max-w-2xl">
                      {evalItem.comment}
                    </Label>
                  </article>
                ))}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <Button onClick={handleWriteEvaluationClick}>
                Escribir Evaluación
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Evaluaciones ({totalEvaluations})
            </h2>
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
              onChange={(e) => setComment(e.target.value)}
              required
              fullSize
            />
            <div className="flex justify-end mt-6">
              <Button onClick={handleEvaluationSubmit}>Evaluar</Button>
            </div>
          </div>
        )}
      </CustomModal>
    </section>
  );
};

export default TrainerEvaluations;
