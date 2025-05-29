import { User, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface Evaluation {
  user: string;
  date: string;
  comment: string;
  rating: number;
}

interface TrainerEvaluationsProps {
  evaluations: Evaluation[];
  totalEvaluations: number;
  onShowAll?: () => void;
}

const TrainerEvaluations = ({
  evaluations,
  totalEvaluations,
  onShowAll,
}: TrainerEvaluationsProps) => {
  const displayed = evaluations.slice(0, 3);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Evaluaciones</h2>
      <div className="flex flex-col gap-6">
        {displayed.map((evalItem, idx) => {
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
              <p
                className={`text-sm text-muted-foreground mb-2 whitespace-pre-line max-w-xl md:max-w-2xl ${
                  !expandedState ? "line-clamp-2" : ""
                }`}
              >
                {evalItem.comment}
              </p>
              {showReadMore && (
                <Button
                  variant="link"
                  className="justify-start text-black hover:text-black/90"
                  size="sm"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [idx]: !expandedState }))
                  }
                >
                  {expandedState ? "Mostrar menos" : "Mostrar más"}
                </Button>
              )}
            </article>
          );
        })}
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
    </section>
  );
};

export default TrainerEvaluations;
