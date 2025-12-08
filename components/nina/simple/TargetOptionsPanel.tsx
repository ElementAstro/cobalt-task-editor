"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ChevronUp, ChevronDown } from "lucide-react";
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
import type { SimpleTarget } from "@/lib/nina/simple-sequence-types";

interface TargetOptionsPanelProps {
  target: SimpleTarget;
}

export function TargetOptionsPanel({ target }: TargetOptionsPanelProps) {
  const { t } = useI18n();
  const { updateTarget, updateTargetCoordinates } = useSimpleSequenceStore(
    useShallow((state) => ({
      updateTarget: state.updateTarget,
      updateTargetCoordinates: state.updateTargetCoordinates,
    })),
  );

  const [targetOpen, setTargetOpen] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [autofocusOpen, setAutofocusOpen] = useState(false);

  return (
    <div className="p-3 space-y-3">
      {/* Target Info */}
      <Collapsible open={targetOpen} onOpenChange={setTargetOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50">
          <span className="text-sm font-medium">{t.properties.target}</span>
          {targetOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {/* Target Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t.properties.targetName}</Label>
            <Input
              value={target.targetName}
              onChange={(e) =>
                updateTarget(target.id, { targetName: e.target.value })
              }
              className="h-8 text-sm"
            />
          </div>

          {/* RA/Dec */}
          <div className="space-y-2">
            <Label className="text-xs">{t.properties.ra}</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input
                type="number"
                value={target.coordinates.raHours}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    raHours: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="H"
                min={0}
                max={23}
              />
              <Input
                type="number"
                value={target.coordinates.raMinutes}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    raMinutes: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="M"
                min={0}
                max={59}
              />
              <Input
                type="number"
                value={target.coordinates.raSeconds}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    raSeconds: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="S"
                min={0}
                max={59.99}
                step={0.1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t.properties.dec}</Label>
            <div className="grid grid-cols-4 gap-1">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={target.coordinates.negativeDec}
                  onCheckedChange={(checked) =>
                    updateTargetCoordinates(target.id, {
                      negativeDec: !!checked,
                    })
                  }
                />
                <span className="ml-1 text-xs">-</span>
              </div>
              <Input
                type="number"
                value={target.coordinates.decDegrees}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    decDegrees: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="°"
                min={0}
                max={90}
              />
              <Input
                type="number"
                value={target.coordinates.decMinutes}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    decMinutes: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder="'"
                min={0}
                max={59}
              />
              <Input
                type="number"
                value={target.coordinates.decSeconds}
                onChange={(e) =>
                  updateTargetCoordinates(target.id, {
                    decSeconds: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
                placeholder='"'
                min={0}
                max={59.99}
                step={0.1}
              />
            </div>
          </div>

          {/* Position Angle */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t.properties.positionAngle} (°)</Label>
            <Input
              type="number"
              value={target.positionAngle}
              onChange={(e) =>
                updateTarget(target.id, {
                  positionAngle: parseFloat(e.target.value) || 0,
                })
              }
              className="h-8 text-sm"
              min={0}
              max={360}
              step={0.1}
            />
          </div>

          {/* Delay */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              {t.properties.delay} ({t.common.seconds})
            </Label>
            <Input
              type="number"
              value={target.delay}
              onChange={(e) =>
                updateTarget(target.id, {
                  delay: parseFloat(e.target.value) || 0,
                })
              }
              className="h-8 text-sm"
              min={0}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Target Options */}
      <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50">
          <span className="text-sm font-medium">
            {t.simple?.targetOptions || "Target Options"}
          </span>
          {optionsOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.slewToTarget || "Slew to Target"}
            </Label>
            <Checkbox
              checked={target.slewToTarget}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { slewToTarget: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.centerTarget || "Center Target"}
            </Label>
            <Checkbox
              checked={target.centerTarget}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { centerTarget: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.rotateTarget || "Rotate Target"}
            </Label>
            <Checkbox
              checked={target.rotateTarget}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { rotateTarget: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.startGuiding || "Start Guiding"}
            </Label>
            <Checkbox
              checked={target.startGuiding}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { startGuiding: !!checked })
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Autofocus Options */}
      <Collapsible open={autofocusOpen} onOpenChange={setAutofocusOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50">
          <span className="text-sm font-medium">
            {t.simple?.autofocusOptions || "Autofocus Options"}
          </span>
          {autofocusOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.autoFocusOnStart || "Autofocus on Start"}
            </Label>
            <Checkbox
              checked={target.autoFocusOnStart}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { autoFocusOnStart: !!checked })
              }
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">
              {t.simple?.autoFocusOnFilterChange || "On Filter Change"}
            </Label>
            <Checkbox
              checked={target.autoFocusOnFilterChange}
              onCheckedChange={(checked) =>
                updateTarget(target.id, { autoFocusOnFilterChange: !!checked })
              }
            />
          </div>

          {/* After Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterTime || "After Time"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterSetTime}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, { autoFocusAfterSetTime: !!checked })
                }
              />
            </div>
            {target.autoFocusAfterSetTime && (
              <Input
                type="number"
                value={target.autoFocusSetTime}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusSetTime: parseInt(e.target.value) || 30,
                  })
                }
                className="h-8 text-sm"
                min={1}
                placeholder={t.common.minutes}
              />
            )}
          </div>

          {/* After Exposures */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterExposures || "After Exposures"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterSetExposures}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, {
                    autoFocusAfterSetExposures: !!checked,
                  })
                }
              />
            </div>
            {target.autoFocusAfterSetExposures && (
              <Input
                type="number"
                value={target.autoFocusSetExposures}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusSetExposures: parseInt(e.target.value) || 10,
                  })
                }
                className="h-8 text-sm"
                min={1}
              />
            )}
          </div>

          {/* After Temperature Change */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterTempChange || "After Temp Change"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterTemperatureChange}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, {
                    autoFocusAfterTemperatureChange: !!checked,
                  })
                }
              />
            </div>
            {target.autoFocusAfterTemperatureChange && (
              <Input
                type="number"
                value={target.autoFocusAfterTemperatureChangeAmount}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusAfterTemperatureChangeAmount:
                      parseFloat(e.target.value) || 1,
                  })
                }
                className="h-8 text-sm"
                min={0.1}
                step={0.1}
                placeholder="°C"
              />
            )}
          </div>

          {/* After HFR Change */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {t.simple?.autoFocusAfterHFRChange || "After HFR Change"}
              </Label>
              <Checkbox
                checked={target.autoFocusAfterHFRChange}
                onCheckedChange={(checked) =>
                  updateTarget(target.id, {
                    autoFocusAfterHFRChange: !!checked,
                  })
                }
              />
            </div>
            {target.autoFocusAfterHFRChange && (
              <Input
                type="number"
                value={target.autoFocusAfterHFRChangeAmount}
                onChange={(e) =>
                  updateTarget(target.id, {
                    autoFocusAfterHFRChangeAmount:
                      parseFloat(e.target.value) || 15,
                  })
                }
                className="h-8 text-sm"
                min={1}
                max={100}
                placeholder="%"
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
