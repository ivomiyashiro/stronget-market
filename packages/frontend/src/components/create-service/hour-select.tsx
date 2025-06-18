import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";

const HOURS = [
  "06:00",
  "07:00",
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
  "21:00",
  "22:00",
];

interface HourSelectProps {
  day: string;
}

export default function HourSelect({ day }: HourSelectProps) {
  const [startHour, setStartHour] = useState<string>("");
  const [endHour, setEndHour] = useState<string>("");

  return (
    <div className="border rounded-xl p-6 bg-white flex flex-col gap-4 mt-2">
      <span className="font-semibold text-lg capitalize">{day}</span>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label>Hora Inicio</Label>
          <Select value={startHour} onValueChange={setStartHour}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar un horario de inicio" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Hora Fin</Label>
          <Select value={endHour} onValueChange={setEndHour}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar un horario de fin" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
