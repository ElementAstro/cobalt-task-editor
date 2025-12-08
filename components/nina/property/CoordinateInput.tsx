"use client";

interface CoordinateInputProps {
  label: string;
  ra: { hours: number; minutes: number; seconds: number };
  dec: { degrees: number; minutes: number; seconds: number; negative: boolean };
  onChange: (
    ra: { hours: number; minutes: number; seconds: number },
    dec: {
      degrees: number;
      minutes: number;
      seconds: number;
      negative: boolean;
    },
  ) => void;
  translations: {
    rightAscension: string;
    declination: string;
    raHours: string;
    raMinutes: string;
    raSeconds: string;
    decDegrees: string;
    decMinutes: string;
    decSeconds: string;
  };
}

export function CoordinateInput({
  label,
  ra,
  dec,
  onChange,
  translations,
}: CoordinateInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] sm:text-xs text-muted-foreground">
        {label}
      </label>

      <div className="space-y-2 sm:space-y-3">
        <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">
          {translations.rightAscension}
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="space-y-0.5">
            <input
              type="number"
              value={ra.hours}
              onChange={(e) =>
                onChange({ ...ra, hours: parseInt(e.target.value) || 0 }, dec)
              }
              min={0}
              max={23}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="h"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {translations.raHours}
            </span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={ra.minutes}
              onChange={(e) =>
                onChange({ ...ra, minutes: parseInt(e.target.value) || 0 }, dec)
              }
              min={0}
              max={59}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="m"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {translations.raMinutes}
            </span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={ra.seconds}
              onChange={(e) =>
                onChange(
                  { ...ra, seconds: parseFloat(e.target.value) || 0 },
                  dec,
                )
              }
              min={0}
              max={59.99}
              step={0.1}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="s"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {translations.raSeconds}
            </span>
          </div>
        </div>

        <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">
          {translations.declination}
        </div>
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          <div>
            <select
              value={dec.negative ? "-" : "+"}
              onChange={(e) =>
                onChange(ra, { ...dec, negative: e.target.value === "-" })
              }
              className="w-full px-1.5 sm:px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="+">+</option>
              <option value="-">-</option>
            </select>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={dec.degrees}
              onChange={(e) =>
                onChange(ra, { ...dec, degrees: parseInt(e.target.value) || 0 })
              }
              min={0}
              max={90}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="°"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {translations.decDegrees}
            </span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={dec.minutes}
              onChange={(e) =>
                onChange(ra, { ...dec, minutes: parseInt(e.target.value) || 0 })
              }
              min={0}
              max={59}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="'"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {translations.decMinutes}
            </span>
          </div>
          <div className="space-y-0.5">
            <input
              type="number"
              value={dec.seconds}
              onChange={(e) =>
                onChange(ra, {
                  ...dec,
                  seconds: parseFloat(e.target.value) || 0,
                })
              }
              min={0}
              max={59.99}
              step={0.1}
              className="w-full px-2 py-1.5 sm:py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder='"'
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {translations.decSeconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
