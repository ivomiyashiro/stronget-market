import { Button } from "@/components/ui/button";
import { RequiredInput } from "@/components/common/required-input";
import { PlusCircle, XCircle } from "lucide-react";

const DAYS = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

const TIME_OPTIONS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export interface TimeSlot {
  id: string;
  startTime: string;
}

export interface DailyAvailability {
  day: string;
  timeSlots: TimeSlot[];
}

interface AvailabilitySelectorProps {
  availability: DailyAvailability[];
  onChange: (availability: DailyAvailability[]) => void;
  duration: number;
}

export const AvailabilitySelector = ({
  availability,
  onChange,
  duration,
}: AvailabilitySelectorProps) => {
  const toggleDay = (day: string) => {
    const isSelected = availability.some((item) => item.day === day);
    if (isSelected) {
      onChange(availability.filter((item) => item.day !== day));
    } else {
      onChange([
        ...availability,
        { day, timeSlots: [{ id: crypto.randomUUID(), startTime: "" }] },
      ]);
    }
  };

  const handleTimeChange = (
    day: string,
    timeSlotId: string,
    startTime: string
  ) => {
    onChange(
      availability.map((item) =>
        item.day === day
          ? {
              ...item,
              timeSlots: item.timeSlots.map((slot) =>
                slot.id === timeSlotId ? { ...slot, startTime } : slot
              ),
            }
          : item
      )
    );
  };

  const addTimeSlot = (day: string) => {
    onChange(
      availability.map((item) =>
        item.day === day
          ? {
              ...item,
              timeSlots: [
                ...item.timeSlots,
                { id: crypto.randomUUID(), startTime: "" },
              ],
            }
          : item
      )
    );
  };

  const removeTimeSlot = (day: string, timeSlotId: string) => {
    onChange(
      availability
        .map((item) =>
          item.day === day
            ? {
                ...item,
                timeSlots: item.timeSlots.filter(
                  (slot) => slot.id !== timeSlotId
                ),
              }
            : item
        )
        .filter((item) => item.timeSlots.length > 0)
    );
  };

  const getAvailableTimes = (day: string, currentSlotId: string) => {
    const dayAvailability = availability.find((item) => item.day === day);
    if (!dayAvailability) return TIME_OPTIONS;

    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const otherSlots = dayAvailability.timeSlots.filter(
      (slot) => slot.id !== currentSlotId && slot.startTime
    );

    if (duration === 0) {
      const selectedTimes = new Set(otherSlots.map((s) => s.startTime));
      return TIME_OPTIONS.filter((t) => !selectedTimes.has(t));
    }

    const unavailableIntervals = otherSlots.map((slot) => {
      const start = timeToMinutes(slot.startTime);
      return { start, end: start + duration };
    });

    return TIME_OPTIONS.filter((timeOption) => {
      const timeOptionMinutes = timeToMinutes(timeOption);
      const timeOptionEnd = timeOptionMinutes + duration;

      for (const interval of unavailableIntervals) {
        if (
          timeOptionMinutes < interval.end &&
          timeOptionEnd > interval.start
        ) {
          return false;
        }
      }
      return true;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Disponibilidad</h2>
        <p className="text-sm text-muted-foreground">
          Dias y horarios en el que se ofrece el servicio
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => (
          <Button
            key={day}
            type="button"
            variant={
              availability.some((item) => item.day === day)
                ? "default"
                : "outline"
            }
            onClick={() => toggleDay(day)}
          >
            {day}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {availability
          .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
          .map(({ day, timeSlots }) => (
            <div
              key={day}
              className="border rounded-lg p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">{day}</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addTimeSlot(day)}
                >
                  <PlusCircle className="size-4 mr-2" />
                  Añadir horario
                </Button>
              </div>
              {timeSlots.map((slot) => (
                <div key={slot.id} className="flex items-end gap-2">
                  <RequiredInput
                    label="Hora Inicio"
                    inputType="select"
                    value={slot.startTime}
                    onChange={(e) =>
                      handleTimeChange(day, slot.id, e.target.value)
                    }
                    options={getAvailableTimes(day, slot.id)}
                    required
                    fullSize
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimeSlot(day, slot.id)}
                  >
                    <XCircle className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};
