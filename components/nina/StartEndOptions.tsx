"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  ChevronUp,
  ChevronDown,
  Thermometer,
  Telescope,
  RotateCw,
  Clock,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSimpleSequenceStore } from "@/lib/nina/simple-sequence-store";
import { useI18n } from "@/lib/i18n";

export function StartEndOptions() {
  const { t } = useI18n();
  const [startOpen, setStartOpen] = useState(true);
  const [endOpen, setEndOpen] = useState(true);

  const {
    startOptions,
    endOptions,
    estimatedDownloadTime,
    updateStartOptions,
    updateEndOptions,
    setEstimatedDownloadTime,
  } = useSimpleSequenceStore(
    useShallow((state) => ({
      startOptions: state.sequence.startOptions,
      endOptions: state.sequence.endOptions,
      estimatedDownloadTime: state.sequence.estimatedDownloadTime,
      updateStartOptions: state.updateStartOptions,
      updateEndOptions: state.updateEndOptions,
      setEstimatedDownloadTime: state.setEstimatedDownloadTime,
    })),
  );

  return (
    <div className="border-b border-border">
      {/* Start Options */}
      <Collapsible open={startOpen} onOpenChange={setStartOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">
              {t.simple?.startOptions || "Start Options"}
            </span>
          </div>
          {startOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3 space-y-3">
          {/* Cool Camera */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-blue-400" />
                <Label className="text-xs">
                  {t.simple?.coolCamera || "Cool Camera"}
                </Label>
              </div>
              <Checkbox
                checked={startOptions.coolCameraAtSequenceStart}
                onCheckedChange={(checked) =>
                  updateStartOptions({ coolCameraAtSequenceStart: !!checked })
                }
              />
            </div>
            {startOptions.coolCameraAtSequenceStart && (
              <div className="grid grid-cols-2 gap-2 pl-6">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">
                    {t.properties.temperature} (°C)
                  </Label>
                  <Input
                    type="number"
                    value={startOptions.coolCameraTemperature}
                    onChange={(e) =>
                      updateStartOptions({
                        coolCameraTemperature:
                          parseFloat(e.target.value) || -10,
                      })
                    }
                    className="h-7 text-xs"
                    min={-40}
                    max={20}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">
                    {t.properties.duration} (s)
                  </Label>
                  <Input
                    type="number"
                    value={startOptions.coolCameraDuration}
                    onChange={(e) =>
                      updateStartOptions({
                        coolCameraDuration: parseInt(e.target.value) || 600,
                      })
                    }
                    className="h-7 text-xs"
                    min={0}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Unpark Mount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Telescope className="w-4 h-4 text-emerald-400" />
              <Label className="text-xs">
                {t.simple?.unparkMount || "Unpark Mount"}
              </Label>
            </div>
            <Checkbox
              checked={startOptions.unparkMountAtSequenceStart}
              onCheckedChange={(checked) =>
                updateStartOptions({ unparkMountAtSequenceStart: !!checked })
              }
            />
          </div>

          {/* Meridian Flip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-amber-400" />
              <Label className="text-xs">
                {t.simple?.meridianFlip || "Meridian Flip"}
              </Label>
            </div>
            <Checkbox
              checked={startOptions.doMeridianFlip}
              onCheckedChange={(checked) =>
                updateStartOptions({ doMeridianFlip: !!checked })
              }
            />
          </div>

          {/* Estimated Download Time */}
          <div className="space-y-1 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label className="text-xs">
                {t.simple?.downloadTime || "Est. Download Time (s)"}
              </Label>
            </div>
            <Input
              type="number"
              value={estimatedDownloadTime}
              onChange={(e) =>
                setEstimatedDownloadTime(parseFloat(e.target.value) || 5)
              }
              className="h-7 text-xs"
              min={0}
              step={0.5}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* End Options */}
      <Collapsible open={endOpen} onOpenChange={setEndOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 transition-colors border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium">
              {t.simple?.endOptions || "End Options"}
            </span>
          </div>
          {endOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3 space-y-3">
          {/* Warm Camera */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <Label className="text-xs">
                  {t.simple?.warmCamera || "Warm Camera"}
                </Label>
              </div>
              <Checkbox
                checked={endOptions.warmCamAtSequenceEnd}
                onCheckedChange={(checked) =>
                  updateEndOptions({ warmCamAtSequenceEnd: !!checked })
                }
              />
            </div>
            {endOptions.warmCamAtSequenceEnd && (
              <div className="pl-6">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">
                    {t.properties.duration} (s)
                  </Label>
                  <Input
                    type="number"
                    value={endOptions.warmCameraDuration}
                    onChange={(e) =>
                      updateEndOptions({
                        warmCameraDuration: parseInt(e.target.value) || 600,
                      })
                    }
                    className="h-7 text-xs w-24"
                    min={0}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Park Mount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Telescope className="w-4 h-4 text-slate-400" />
              <Label className="text-xs">
                {t.simple?.parkMount || "Park Mount"}
              </Label>
            </div>
            <Checkbox
              checked={endOptions.parkMountAtSequenceEnd}
              onCheckedChange={(checked) =>
                updateEndOptions({ parkMountAtSequenceEnd: !!checked })
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
