"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface ToolboxSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function ToolboxSearch({
  value,
  onChange,
  placeholder,
}: ToolboxSearchProps) {
  return (
    <div className="p-2 border-b border-border">
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8 sm:pl-9 h-9 sm:h-10 bg-background border-input text-sm"
          aria-label={placeholder}
        />
      </div>
    </div>
  );
}
