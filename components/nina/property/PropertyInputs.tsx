"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

// Text Input Component
interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: TextInputProps) {
  const id = `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-1 sm:space-y-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] sm:text-xs text-muted-foreground"
      >
        {label}
      </Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2.5 sm:px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-shadow min-h-[80px]"
          rows={3}
          aria-label={label}
        />
      ) : (
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-background border-input h-9 sm:h-10 text-sm"
          aria-label={label}
        />
      )}
    </div>
  );
}

// Number Input Component
interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: NumberInputProps) {
  const id = `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-1 sm:space-y-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] sm:text-xs text-muted-foreground"
      >
        {label}
      </Label>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="flex-1 bg-background border-input h-9 sm:h-10 text-sm"
          aria-label={label}
        />
        {unit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] sm:text-xs text-muted-foreground cursor-help flex items-center gap-0.5 sm:gap-1 shrink-0">
                {unit}
                <HelpCircle className="w-3 h-3 hidden sm:inline" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden sm:block">
              <p className="text-xs">Unit: {unit}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// Select Input Component
interface SelectInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
}: SelectInputProps) {
  return (
    <div className="space-y-1 sm:space-y-1.5">
      <Label className="text-[11px] sm:text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-background border-input h-9 sm:h-10 text-sm">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-[50vh]">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={String(opt.value)}
              className="text-sm"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Boolean Input Component
interface BooleanInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanInput({ label, value, onChange }: BooleanInputProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <Label className="text-[11px] sm:text-xs text-muted-foreground">
        {label}
      </Label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? "bg-primary" : "bg-muted"
        }`}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
