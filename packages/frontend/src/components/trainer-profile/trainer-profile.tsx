import { User, Star, MapPin, Clock, Globe, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import TrainerEvaluations from "../trainer-evaluations/trainer-evaluations";

const dummyProfile = {
  name: "Chris Bumstead",
  tags: ["Running", "Nutrición"],
  rating: 5.0,
  reviews: 10,
  avatarUrl: "",
  price: 500,
  serviceInfo: {
    duration: "La duración del servicio es de aproximadamente 1 hora",
    zone: "Nuñez / Saavedra",
    language: "Español",
    modality: "Presencial",
  },
  description:
    "Asesoría de nutrición personalizada para mejorar tu salud y bienestar. Recibe un plan alimenticio adaptado a tus objetivos, necesidades y estilo de vida, con seguimiento profesional y recomendaciones prácticas para lograr una alimentación equilibrada y sostenible. Ideal para perder peso, ganar masa muscular o mejorar hábitos...",
  evaluations: [
    {
      user: "Jorge",
      date: "27 de abril 2025",
      comment:
        "Excelente servicio, el plan fue justo lo que necesitaba. ¡Noté resultados en pocas semanas!",
      rating: 5,
    },
    {
      user: "Ana",
      date: "15 de marzo 2025",
      comment:
        "Muy profesional y atento. Me ayudó a mejorar mis hábitos alimenticios de manera increíble. El plan nutricional que me dio fue muy detallado y fácil de seguir. Aprendí mucho sobre alimentación saludable y cómo mantener un estilo de vida equilibrado. Chris siempre estuvo disponible para resolver mis dudas y me dio excelentes consejos para mantenerme motivada. Después de varios meses siguiendo sus recomendaciones, no solo mejoré mi alimentación sino que también me siento con más energía y vitalidad.",
      rating: 4,
    },
    {
      user: "Carlos",
      date: "2 de febrero 2025",
      comment:
        "Las rutinas y consejos fueron muy útiles. Recomiendo totalmente a Chris.",
      rating: 5,
    },
    {
      user: "Lucía",
      date: "10 de enero 2025",
      comment:
        "Me sentí acompañada en todo el proceso. Resultados visibles y sostenibles.",
      rating: 5,
    },
  ],
};

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const times = ["08:00", "10:00", "12:00", "14:00", "16:00"];

const TrainerProfile = () => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <section className="flex flex-col md:flex-row gap-50 mx-auto w-full  py-8">
      <article className="flex-1 flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center">
              {dummyProfile.avatarUrl ? (
                <img
                  src={dummyProfile.avatarUrl}
                  alt={dummyProfile.name}
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <User
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{dummyProfile.name}</h1>
              <div className="flex flex-wrap gap-2 mt-1">
                {dummyProfile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Star
                  className="size-4 fill-yellow-400 text-yellow-400"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {dummyProfile.rating.toFixed(1)} · {dummyProfile.reviews}{" "}
                  evaluaciones
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-6">
            Información del Servicio
          </h2>
          <dl className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Clock
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <dt className="font-medium text-sm">Duración</dt>
                <dd className="text-sm text-muted-foreground">
                  {dummyProfile.serviceInfo.duration}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <dt className="font-medium text-sm">Zona</dt>
                <dd className="text-sm text-muted-foreground">
                  {dummyProfile.serviceInfo.zone}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <dt className="font-medium text-sm">Idioma</dt>
                <dd className="text-sm text-muted-foreground">
                  {dummyProfile.serviceInfo.language}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <dt className="font-medium text-sm">Modalidad</dt>
                <dd className="text-sm text-muted-foreground">
                  {dummyProfile.serviceInfo.modality}
                </dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-2">Descripción</h2>
          <p className="text-sm text-muted-foreground mb-2">
            {dummyProfile.description}
          </p>
        </section>
        <section>
          <TrainerEvaluations
            evaluations={dummyProfile.evaluations}
            totalEvaluations={dummyProfile.reviews}
          />
        </section>
      </article>

      <aside className="w-full md:w-80 flex-shrink-0">
        <div className="border rounded-lg p-6 flex flex-col gap-4 bg-card">
          <div>
            <span className="text-2xl font-bold">${dummyProfile.price}</span>
            <span className="text-muted-foreground ml-1">Día</span>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="day-select" className="text-sm font-medium">
              Día
            </label>
            <select
              id="day-select"
              className="border rounded px-3 py-2 text-sm"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="" disabled>
                Seleccionar un día
              </option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="time-select" className="text-sm font-medium">
              Horario
            </label>
            <select
              id="time-select"
              className="border rounded px-3 py-2 text-sm"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="" disabled>
                Seleccionar un horario
              </option>
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <Button>Contratar</Button>
        </div>
      </aside>
    </section>
  );
};

export default TrainerProfile;
