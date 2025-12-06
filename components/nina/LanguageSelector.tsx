"use client";

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useI18n, availableLocales, type Locale } from "@/lib/i18n";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  const currentLocale = availableLocales.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 sm:gap-2 h-8 w-8 sm:w-auto px-0 sm:px-2"
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline text-xs">
            {currentLocale?.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {availableLocales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => setLocale(loc.code as Locale)}
            className={`${locale === loc.code ? "bg-accent" : ""} text-sm py-2`}
          >
            <span className="mr-2">{loc.code === "en" ? "🇺🇸" : "🇨🇳"}</span>
            {loc.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
