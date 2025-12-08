"use client";

import { Target, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExposureTable } from "../ExposureTable";
import { TargetOptionsPanel } from "./TargetOptionsPanel";
import { formatDuration } from "@/lib/nina/simple-sequence-types";
import type { SimpleTarget } from "@/lib/nina/simple-sequence-types";
import type { Translations } from "@/lib/i18n";

interface SimpleTargetDetailsProps {
  target: SimpleTarget | null;
  activeTab: "targets" | "exposures";
  onActiveTabChange: (tab: "targets" | "exposures") => void;
  onResetProgress: (id: string) => void;
  t: Translations;
}

export function SimpleTargetDetails({
  target,
  activeTab,
  onActiveTabChange,
  onResetProgress,
  t,
}: SimpleTargetDetailsProps) {
  if (!target) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>
            {t.simple?.selectTarget || "Select a target to view details"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Target Details Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{target.targetName}</h2>
              <p className="text-xs text-muted-foreground">
                {t.simple?.exposureCount || "Exposures"}: {target.exposures.length}
                {target.estimatedDuration &&
                  ` • ${formatDuration(target.estimatedDuration)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResetProgress(target.id)}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">
                    {t.simple?.resetProgress || "Reset"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t.simple?.resetProgress || "Reset Progress"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <Tabs
          value={activeTab}
          onValueChange={(v) => onActiveTabChange(v as "targets" | "exposures")}
        >
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="targets" className="flex-1">
              {t.simple?.targetOptions || "Target Options"}
            </TabsTrigger>
            <TabsTrigger value="exposures" className="flex-1">
              {t.simple?.exposures || "Exposures"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="targets" className="m-0">
            <TargetOptionsPanel target={target} />
          </TabsContent>
          <TabsContent value="exposures" className="m-0">
            <ExposureTable targetId={target.id} exposures={target.exposures} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Target Options */}
        <div className="w-80 border-r border-border overflow-y-auto">
          <TargetOptionsPanel target={target} />
        </div>
        {/* Exposure Table */}
        <div className="flex-1 overflow-hidden">
          <ExposureTable targetId={target.id} exposures={target.exposures} />
        </div>
      </div>
    </>
  );
}
