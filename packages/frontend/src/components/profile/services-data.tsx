import { Label } from "@radix-ui/react-label";

interface ServicesDataProps {
  title: string;
  number: number;
}

const ServicesData = ({ title, number }: ServicesDataProps) => {
  return (
    <div className="flex flex-col gap-2 border-1 border-muted-foreground rounded-md p-4 w-full">
      <Label className="text-lg font-medium text-muted-foreground">
        {title}
      </Label>
      <Label className="text-3xl font-bold">{number}</Label>
    </div>
  );
};

export default ServicesData;
