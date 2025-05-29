import Filtering from "../filtering/filtering";
import ServiceCard from "../service-card/service-card";

const trainers = [
  {
    name: "John Doe",
    description:
      "Personal trainer specializing in strength training and weight loss. 5+ years of experience helping clients achieve their fitness goals.",
    price: 100,
    rating: 4.5,
    amountOfReviews: 100,
  },
  {
    name: "Sarah Smith",
    description:
      "Yoga instructor with expertise in Vinyasa and Hatha yoga. Focus on mindfulness and flexibility training.",
    price: 85,
    rating: 4.8,
    amountOfReviews: 75,
  },
  {
    name: "Mike Johnson",
    description:
      "CrossFit coach and nutrition specialist. Helping athletes improve performance and achieve peak physical condition.",
    price: 120,
    rating: 4.9,
    amountOfReviews: 150,
  },
  {
    name: "Emma Wilson",
    description:
      "Dance fitness instructor specializing in Zumba and cardio dance. Making workouts fun and effective.",
    price: 70,
    rating: 4.7,
    amountOfReviews: 60,
  },
  {
    name: "David Chen",
    description:
      "Martial arts trainer with black belt in multiple disciplines. Teaching self-defense and fitness through martial arts.",
    price: 90,
    rating: 4.6,
    amountOfReviews: 45,
  },
  {
    name: "Lisa Martinez",
    description:
      "Pilates instructor focusing on core strength and posture improvement. Perfect for rehabilitation and body awareness.",
    price: 95,
    rating: 4.9,
    amountOfReviews: 120,
  },
  {
    name: "James Wilson",
    description:
      "Swimming coach for all levels. Specializing in technique improvement and competitive training.",
    price: 110,
    rating: 4.7,
    amountOfReviews: 85,
  },
  {
    name: "Maria Garcia",
    description:
      "HIIT and circuit training specialist. High-energy workouts for maximum calorie burn and muscle toning.",
    price: 80,
    rating: 4.8,
    amountOfReviews: 95,
  },
  {
    name: "Alex Thompson",
    description:
      "Senior fitness trainer specializing in age-appropriate exercises and mobility training.",
    price: 75,
    rating: 4.9,
    amountOfReviews: 110,
  },
  {
    name: "Sophie Anderson",
    description:
      "Nutrition coach and wellness trainer. Holistic approach to health and fitness through proper nutrition and exercise.",
    price: 105,
    rating: 4.8,
    amountOfReviews: 70,
  },
];

const Landing = () => {
  return (
    <main className="flex h-full w-full flex-col gap-6">
      <Filtering />
      <section
        className="grid grid-cols-1 auto-rows-fr gap-8"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
        }}
        aria-label="Lista de entrenadores disponibles"
      >
        {trainers.map((trainer) => (
          <article key={trainer.name} className="w-full">
            <ServiceCard
              name={trainer.name}
              description={trainer.description}
              price={trainer.price}
              rating={trainer.rating}
              amountOfReviews={trainer.amountOfReviews}
            />
          </article>
        ))}
      </section>
    </main>
  );
};

export default Landing;
