import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string } | string;

interface RequiredInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  error?: string;
  required?: boolean;
  inputType?: "input" | "select";
  options?: Option[];
  inputSize?: "sm" | "md" | "lg";
  fullSize?: boolean;
  selectProps?: Omit<
    React.ComponentProps<typeof Select>,
    "children" | "value" | "onValueChange"
  >;
}

const sizeClasses = {
  sm: "h-8 text-sm px-2 w-[150px]",
  md: "h-9 text-base px-3 w-[200px]",
  lg: "h-10 text-lg px-4 w-[250px]",
};

export function RequiredInput({
  label,
  error,
  required = false,
  id,
  className,
  inputType = "input",
  options = [],
  value,
  onChange,
  onBlur,
  selectProps,
  inputSize = "md",
  fullSize = false,
  ...props
}: RequiredInputProps) {
  const inputId = id || `input-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={cn("flex flex-col gap-2", fullSize && "w-full")}>
      <Label
        htmlFor={inputId}
        className={cn(
          inputSize === "sm"
            ? "text-sm"
            : inputSize === "lg"
            ? "text-lg"
            : "text-base"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {inputType === "input" ? (
        <Input
          id={inputId}
          className={cn(
            sizeClasses[inputSize],
            fullSize && "w-full",
            error && "border border-destructive focus-visible:ring-destructive",
            className
          )}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          {...props}
        />
      ) : (
        <Select
          value={value?.toString()}
          onValueChange={(v) =>
            onChange?.({
              target: { value: v },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          {...selectProps}
        >
          <SelectTrigger
            id={inputId}
            className={cn(
              sizeClasses[inputSize],
              fullSize && "w-full",
              error && "border border-destructive focus-visible:ring-destructive",
              className
            )}
          >
            <SelectValue placeholder={`Seleccionar ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) =>
              typeof opt === "string" ? (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ) : (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      )}
      {error && (
        <span
          className={cn(
            "text-destructive",
            inputSize === "sm"
              ? "text-xs"
              : inputSize === "lg"
              ? "text-sm"
              : "text-xs"
          )}
        >
          {error}
        </span>
      )}
    </div>
  );
}
