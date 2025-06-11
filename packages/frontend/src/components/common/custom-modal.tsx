import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomModalProps extends React.ComponentProps<"div"> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function CustomModal({
  isOpen,
  onClose,
  children,
  className,
  ...props
}: CustomModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      data-slot="modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={handleOverlayClick}
      {...props}
    >
      <div
        data-slot="modal-content"
        className={cn(
          "relative bg-background rounded-lg shadow-lg max-w-[90%] max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X className="size-4" />
        </Button>
        {children}
      </div>
    </div>
  );
}
