// NINA Simple Sequence Editor - Zustand Store
// Based on N.I.N.A. SimpleSequenceVM

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import {
  SimpleSequence,
  SimpleTarget,
  SimpleExposure,
  StartOptions,
  EndOptions,
  Coordinates,
  SequenceEntityStatus,
  createDefaultSimpleSequence,
  createDefaultTarget,
  createDefaultExposure,
  calculateTargetRuntime,
  parseHMS,
  parseDMS,
  TargetSetExport,
  CaptureSequenceExport,
  CaptureSequenceItemExport,
} from "./simple-sequence-types";

// ============================================================================
// Store State Interface
// ============================================================================

interface SimpleSequenceState {
  sequence: SimpleSequence;

  // Undo/Redo
  history: SimpleSequence[];
  historyIndex: number;
  maxHistorySize: number;

  // UI State
  isImporting: boolean;
  isExporting: boolean;
  lastError: string | null;
}

// ============================================================================
// Store Actions Interface
// ============================================================================

interface SimpleSequenceActions {
  // Sequence actions
  newSequence: () => void;
  loadSequence: (sequence: SimpleSequence) => void;
  setSequenceTitle: (title: string) => void;
  setSavePath: (path: string) => void;
  clearDirty: () => void;

  // Start/End options
  updateStartOptions: (options: Partial<StartOptions>) => void;
  updateEndOptions: (options: Partial<EndOptions>) => void;

  // Target actions
  addTarget: (target?: Partial<SimpleTarget>) => string;
  removeTarget: (targetId: string) => void;
  duplicateTarget: (targetId: string) => string | null;
  moveTargetUp: (targetId: string) => void;
  moveTargetDown: (targetId: string) => void;
  selectTarget: (targetId: string) => void;
  updateTarget: (targetId: string, updates: Partial<SimpleTarget>) => void;
  updateTargetCoordinates: (
    targetId: string,
    coordinates: Partial<Coordinates>,
  ) => void;
  resetTargetProgress: (targetId: string) => void;

  // Exposure actions
  addExposure: (targetId: string, exposure?: Partial<SimpleExposure>) => string;
  removeExposure: (targetId: string, exposureId: string) => void;
  duplicateExposure: (targetId: string, exposureId: string) => string | null;
  moveExposureUp: (targetId: string, exposureId: string) => void;
  moveExposureDown: (targetId: string, exposureId: string) => void;
  updateExposure: (
    targetId: string,
    exposureId: string,
    updates: Partial<SimpleExposure>,
  ) => void;
  resetExposureProgress: (targetId: string, exposureId: string) => void;
  resetAllExposureProgress: (targetId: string) => void;

  // Import/Export
  importFromCSV: (csvContent: string) => Promise<boolean>;
  importFromJSON: (jsonContent: string) => boolean;
  exportToJSON: () => string;
  exportToCSV: () => string;
  exportToXML: () => string;
  exportToTargetSet: () => TargetSetExport;

  // Copy/Paste operations
  copyExposuresToAllTargets: (sourceTargetId: string) => void;
  copyExposuresToTarget: (sourceTargetId: string, destTargetId: string) => void;

  // ETA Calculation
  calculateETAs: () => void;
  setEstimatedDownloadTime: (seconds: number) => void;

  // Running state
  setRunning: (running: boolean) => void;
  setActiveTarget: (targetId: string | null) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Getters
  getSelectedTarget: () => SimpleTarget | null;
  getTargetById: (targetId: string) => SimpleTarget | null;
  getTotalExposureCount: () => number;
  getTotalRemainingExposures: () => number;
}

type SimpleSequenceStore = SimpleSequenceState & SimpleSequenceActions;

// ============================================================================
// Helper Functions
// ============================================================================

function pushToHistory(state: SimpleSequenceState): void {
  // Remove any future history if we're not at the end
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }

  // Deep clone and push current state
  const snapshot = JSON.parse(JSON.stringify(state.sequence));
  state.history.push(snapshot);

  // Limit history size
  if (state.history.length > state.maxHistorySize) {
    state.history.shift();
  } else {
    state.historyIndex++;
  }
}

function markDirty(state: SimpleSequenceState): void {
  state.sequence.isDirty = true;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useSimpleSequenceStore = create<SimpleSequenceStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      sequence: createDefaultSimpleSequence(),
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      isImporting: false,
      isExporting: false,
      lastError: null,

      // ========================================================================
      // Sequence Actions
      // ========================================================================

      newSequence: () => {
        set((state) => {
          pushToHistory(state);
          state.sequence = createDefaultSimpleSequence();
        });
      },

      loadSequence: (sequence) => {
        set((state) => {
          pushToHistory(state);
          state.sequence = sequence;
        });
      },

      setSequenceTitle: (title) => {
        set((state) => {
          pushToHistory(state);
          state.sequence.title = title;
          markDirty(state);
        });
      },

      setSavePath: (path) => {
        set((state) => {
          state.sequence.savePath = path;
        });
      },

      clearDirty: () => {
        set((state) => {
          state.sequence.isDirty = false;
        });
      },

      // ========================================================================
      // Start/End Options
      // ========================================================================

      updateStartOptions: (options) => {
        set((state) => {
          pushToHistory(state);
          Object.assign(state.sequence.startOptions, options);
          markDirty(state);
        });
      },

      updateEndOptions: (options) => {
        set((state) => {
          pushToHistory(state);
          Object.assign(state.sequence.endOptions, options);
          markDirty(state);
        });
      },

      // ========================================================================
      // Target Actions
      // ========================================================================

      addTarget: (targetData) => {
        const newTarget = { ...createDefaultTarget(), ...targetData };
        set((state) => {
          pushToHistory(state);
          state.sequence.targets.push(newTarget);
          state.sequence.selectedTargetId = newTarget.id;
          markDirty(state);
        });
        return newTarget.id;
      },

      removeTarget: (targetId) => {
        set((state) => {
          const index = state.sequence.targets.findIndex(
            (t) => t.id === targetId,
          );
          if (index === -1) return;

          pushToHistory(state);
          state.sequence.targets.splice(index, 1);

          // Update selection
          if (state.sequence.selectedTargetId === targetId) {
            if (state.sequence.targets.length > 0) {
              const newIndex = Math.min(
                index,
                state.sequence.targets.length - 1,
              );
              state.sequence.selectedTargetId =
                state.sequence.targets[newIndex].id;
            } else {
              state.sequence.selectedTargetId = null;
            }
          }

          // Update active target
          if (state.sequence.activeTargetId === targetId) {
            state.sequence.activeTargetId =
              state.sequence.targets[0]?.id || null;
          }

          markDirty(state);
        });
      },

      duplicateTarget: (targetId) => {
        const state = get();
        const target = state.sequence.targets.find((t) => t.id === targetId);
        if (!target) return null;

        const newTarget: SimpleTarget = {
          ...JSON.parse(JSON.stringify(target)),
          id: crypto.randomUUID(),
          name: `${target.name} (Copy)`,
          targetName: `${target.targetName} (Copy)`,
          status: SequenceEntityStatus.CREATED,
          exposures: target.exposures.map((e) => ({
            ...JSON.parse(JSON.stringify(e)),
            id: crypto.randomUUID(),
            progressCount: 0,
            status: SequenceEntityStatus.CREATED,
          })),
        };

        set((state) => {
          pushToHistory(state);
          const index = state.sequence.targets.findIndex(
            (t) => t.id === targetId,
          );
          state.sequence.targets.splice(index + 1, 0, newTarget);
          state.sequence.selectedTargetId = newTarget.id;
          markDirty(state);
        });

        return newTarget.id;
      },

      moveTargetUp: (targetId) => {
        set((state) => {
          const index = state.sequence.targets.findIndex(
            (t) => t.id === targetId,
          );
          if (index <= 0) return;

          pushToHistory(state);
          const target = state.sequence.targets[index];
          state.sequence.targets.splice(index, 1);
          state.sequence.targets.splice(index - 1, 0, target);
          markDirty(state);
        });
      },

      moveTargetDown: (targetId) => {
        set((state) => {
          const index = state.sequence.targets.findIndex(
            (t) => t.id === targetId,
          );
          if (index === -1 || index >= state.sequence.targets.length - 1)
            return;

          pushToHistory(state);
          const target = state.sequence.targets[index];
          state.sequence.targets.splice(index, 1);
          state.sequence.targets.splice(index + 1, 0, target);
          markDirty(state);
        });
      },

      selectTarget: (targetId) => {
        set((state) => {
          if (state.sequence.targets.some((t) => t.id === targetId)) {
            state.sequence.selectedTargetId = targetId;
            if (!state.sequence.isRunning) {
              state.sequence.activeTargetId = targetId;
            }
          }
        });
      },

      updateTarget: (targetId, updates) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          pushToHistory(state);
          Object.assign(target, updates);

          // Sync name and targetName
          if (updates.targetName !== undefined) {
            target.name = updates.targetName;
          }

          markDirty(state);
        });
      },

      updateTargetCoordinates: (targetId, coordinates) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          pushToHistory(state);
          Object.assign(target.coordinates, coordinates);
          markDirty(state);
        });
      },

      resetTargetProgress: (targetId) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          pushToHistory(state);
          target.status = SequenceEntityStatus.CREATED;
          for (const exposure of target.exposures) {
            exposure.progressCount = 0;
            exposure.status = SequenceEntityStatus.CREATED;
          }
          markDirty(state);
        });
      },

      // ========================================================================
      // Exposure Actions
      // ========================================================================

      addExposure: (targetId, exposureData) => {
        const newExposure = { ...createDefaultExposure(), ...exposureData };
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          pushToHistory(state);
          target.exposures.push(newExposure);
          markDirty(state);
        });
        return newExposure.id;
      },

      removeExposure: (targetId, exposureId) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          const index = target.exposures.findIndex((e) => e.id === exposureId);
          if (index === -1) return;

          pushToHistory(state);
          target.exposures.splice(index, 1);
          markDirty(state);
        });
      },

      duplicateExposure: (targetId, exposureId) => {
        const state = get();
        const target = state.sequence.targets.find((t) => t.id === targetId);
        if (!target) return null;

        const exposure = target.exposures.find((e) => e.id === exposureId);
        if (!exposure) return null;

        const newExposure: SimpleExposure = {
          ...JSON.parse(JSON.stringify(exposure)),
          id: crypto.randomUUID(),
          progressCount: 0,
          status: SequenceEntityStatus.CREATED,
        };

        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          pushToHistory(state);
          const index = target.exposures.findIndex((e) => e.id === exposureId);
          target.exposures.splice(index + 1, 0, newExposure);
          markDirty(state);
        });

        return newExposure.id;
      },

      moveExposureUp: (targetId, exposureId) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          const index = target.exposures.findIndex((e) => e.id === exposureId);
          if (index <= 0) return;

          pushToHistory(state);
          const exposure = target.exposures[index];
          target.exposures.splice(index, 1);
          target.exposures.splice(index - 1, 0, exposure);
          markDirty(state);
        });
      },

      moveExposureDown: (targetId, exposureId) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          const index = target.exposures.findIndex((e) => e.id === exposureId);
          if (index === -1 || index >= target.exposures.length - 1) return;

          pushToHistory(state);
          const exposure = target.exposures[index];
          target.exposures.splice(index, 1);
          target.exposures.splice(index + 1, 0, exposure);
          markDirty(state);
        });
      },

      updateExposure: (targetId, exposureId, updates) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          const exposure = target.exposures.find((e) => e.id === exposureId);
          if (!exposure) return;

          pushToHistory(state);
          Object.assign(exposure, updates);
          markDirty(state);
        });
      },

      resetExposureProgress: (targetId, exposureId) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          const exposure = target.exposures.find((e) => e.id === exposureId);
          if (!exposure) return;

          pushToHistory(state);
          exposure.progressCount = 0;
          exposure.status = SequenceEntityStatus.CREATED;
          markDirty(state);
        });
      },

      resetAllExposureProgress: (targetId) => {
        set((state) => {
          const target = state.sequence.targets.find((t) => t.id === targetId);
          if (!target) return;

          pushToHistory(state);
          for (const exposure of target.exposures) {
            exposure.progressCount = 0;
            exposure.status = SequenceEntityStatus.CREATED;
          }
          target.status = SequenceEntityStatus.CREATED;
          markDirty(state);
        });
      },

      // ========================================================================
      // Import/Export
      // ========================================================================

      importFromCSV: async (csvContent) => {
        set((state) => {
          state.isImporting = true;
          state.lastError = null;
        });

        try {
          const lines = csvContent
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          if (lines.length < 2) {
            throw new Error("CSV file is empty or has no data rows");
          }

          const headerLine = lines[0].toLowerCase();
          const headers = headerLine
            .split(",")
            .map((h) => h.trim().replace(/"/g, ""));

          // Detect format (Telescopius or standard)
          const isTelescopius =
            headers.includes("pane") || headers.includes("familiar name");

          const targets: SimpleTarget[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i]
              .split(",")
              .map((v) => v.trim().replace(/"/g, ""));
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => {
              row[h] = values[idx] || "";
            });

            let name = "";
            let raStr = "";
            let decStr = "";
            let positionAngle = 0;

            if (isTelescopius) {
              if (row["pane"]) {
                name = row["pane"];
                raStr = row["ra"] || "";
                decStr = row["dec"] || "";
                positionAngle =
                  parseFloat(row["position angle (east)"] || "0") || 0;
              } else if (row["familiar name"] || row["catalogue entry"]) {
                name = row["familiar name"] || row["catalogue entry"];
                raStr =
                  row["right ascension"] ||
                  row["right ascension (j2000)"] ||
                  "";
                decStr = row["declination"] || row["declination (j2000)"] || "";
                positionAngle =
                  parseFloat(row["position angle (east)"] || "0") || 0;
              }
            } else {
              // Standard CSV format
              name =
                row["name"] || row["target"] || row["object"] || `Target ${i}`;
              raStr = row["ra"] || row["right ascension"] || "";
              decStr = row["dec"] || row["declination"] || "";
              positionAngle =
                parseFloat(row["pa"] || row["position angle"] || "0") || 0;
            }

            if (!name || !raStr || !decStr) continue;

            const raParsed = parseHMS(raStr);
            const decParsed = parseDMS(decStr);

            if (!raParsed || !decParsed) continue;

            const target = createDefaultTarget();
            target.name = name;
            target.targetName = name;
            target.coordinates = {
              raHours: raParsed.hours,
              raMinutes: raParsed.minutes,
              raSeconds: raParsed.seconds,
              decDegrees: decParsed.degrees,
              decMinutes: decParsed.minutes,
              decSeconds: decParsed.seconds,
              negativeDec: decParsed.negative,
            };
            target.positionAngle = positionAngle % 360;

            targets.push(target);
          }

          if (targets.length === 0) {
            throw new Error("No valid targets found in CSV file");
          }

          set((state) => {
            pushToHistory(state);
            state.sequence.targets = targets;
            state.sequence.selectedTargetId = targets[0].id;
            state.sequence.activeTargetId = targets[0].id;
            state.isImporting = false;
            markDirty(state);
          });

          return true;
        } catch (error) {
          set((state) => {
            state.isImporting = false;
            state.lastError =
              error instanceof Error ? error.message : "Import failed";
          });
          return false;
        }
      },

      importFromJSON: (jsonContent) => {
        try {
          const data = JSON.parse(jsonContent);

          // Validate required fields
          if (!data.targets || !Array.isArray(data.targets)) {
            throw new Error("Invalid JSON format: missing targets array");
          }

          set((state) => {
            pushToHistory(state);

            // Load sequence data
            if (data.title) state.sequence.title = data.title;
            if (data.startOptions)
              Object.assign(state.sequence.startOptions, data.startOptions);
            if (data.endOptions)
              Object.assign(state.sequence.endOptions, data.endOptions);
            if (data.estimatedDownloadTime)
              state.sequence.estimatedDownloadTime = data.estimatedDownloadTime;

            // Load targets
            state.sequence.targets = data.targets.map((t: SimpleTarget) => ({
              ...createDefaultTarget(),
              ...t,
              id: t.id || crypto.randomUUID(),
              exposures: (t.exposures || []).map((e: SimpleExposure) => ({
                ...createDefaultExposure(),
                ...e,
                id: e.id || crypto.randomUUID(),
              })),
            }));

            if (state.sequence.targets.length > 0) {
              state.sequence.selectedTargetId = state.sequence.targets[0].id;
              state.sequence.activeTargetId = state.sequence.targets[0].id;
            }

            markDirty(state);
          });

          return true;
        } catch (error) {
          set((state) => {
            state.lastError =
              error instanceof Error ? error.message : "Import failed";
          });
          return false;
        }
      },

      exportToJSON: () => {
        const state = get();
        return JSON.stringify(state.sequence, null, 2);
      },

      exportToTargetSet: () => {
        const state = get();
        const { sequence } = state;

        const targetSet: TargetSetExport = {
          Title: sequence.title,
          StartOptions: {
            CoolCameraAtSequenceStart:
              sequence.startOptions.coolCameraAtSequenceStart,
            CoolCameraTemperature: sequence.startOptions.coolCameraTemperature,
            CoolCameraDuration: sequence.startOptions.coolCameraDuration,
            UnparkMountAtSequenceStart:
              sequence.startOptions.unparkMountAtSequenceStart,
            DoMeridianFlip: sequence.startOptions.doMeridianFlip,
          },
          EndOptions: {
            WarmCamAtSequenceEnd: sequence.endOptions.warmCamAtSequenceEnd,
            WarmCameraDuration: sequence.endOptions.warmCameraDuration,
            ParkMountAtSequenceEnd: sequence.endOptions.parkMountAtSequenceEnd,
          },
          Targets: sequence.targets.map(
            (target): CaptureSequenceExport => ({
              TargetName: target.targetName,
              Coordinates: {
                RAHours: target.coordinates.raHours,
                RAMinutes: target.coordinates.raMinutes,
                RASeconds: target.coordinates.raSeconds,
                DecDegrees: target.coordinates.decDegrees,
                DecMinutes: target.coordinates.decMinutes,
                DecSeconds: target.coordinates.decSeconds,
                NegativeDec: target.coordinates.negativeDec,
              },
              PositionAngle: target.positionAngle,
              Delay: target.delay,
              Mode: target.mode,
              SlewToTarget: target.slewToTarget,
              CenterTarget: target.centerTarget,
              RotateTarget: target.rotateTarget,
              StartGuiding: target.startGuiding,
              AutoFocusOnStart: target.autoFocusOnStart,
              AutoFocusOnFilterChange: target.autoFocusOnFilterChange,
              AutoFocusAfterSetTime: target.autoFocusAfterSetTime,
              AutoFocusSetTime: target.autoFocusSetTime,
              AutoFocusAfterSetExposures: target.autoFocusAfterSetExposures,
              AutoFocusSetExposures: target.autoFocusSetExposures,
              AutoFocusAfterTemperatureChange:
                target.autoFocusAfterTemperatureChange,
              AutoFocusAfterTemperatureChangeAmount:
                target.autoFocusAfterTemperatureChangeAmount,
              AutoFocusAfterHFRChange: target.autoFocusAfterHFRChange,
              AutoFocusAfterHFRChangeAmount:
                target.autoFocusAfterHFRChangeAmount,
              Items: target.exposures.map(
                (exp): CaptureSequenceItemExport => ({
                  Enabled: exp.enabled,
                  ExposureTime: exp.exposureTime,
                  ImageType: exp.imageType,
                  FilterType: exp.filter
                    ? { Name: exp.filter.name, Position: exp.filter.position }
                    : null,
                  Binning: { X: exp.binning.x, Y: exp.binning.y },
                  Gain: exp.gain,
                  Offset: exp.offset,
                  TotalExposureCount: exp.totalCount,
                  ProgressExposureCount: exp.progressCount,
                  Dither: exp.dither,
                  DitherAmount: exp.ditherEvery,
                }),
              ),
            }),
          ),
        };

        return targetSet;
      },

      exportToCSV: () => {
        const state = get();
        const { sequence } = state;

        // CSV header (Telescopius format - exact format NINA expects)
        // NINA uses case-insensitive header matching with ToLower().Trim()
        const headers = ["Pane", "RA", "Dec", "Position Angle (East)"];

        const rows = sequence.targets.map((target) => {
          // Format RA as "00h 42m 44.3s" - NINA's AstroUtil.HMSToDegrees expects this
          const raStr = `${target.coordinates.raHours.toString().padStart(2, "0")}h ${target.coordinates.raMinutes.toString().padStart(2, "0")}m ${target.coordinates.raSeconds.toFixed(1)}s`;
          // Format Dec as "+41d 16m 9.0s" - NINA's AstroUtil.DMSToDegrees expects this
          const decSign = target.coordinates.negativeDec ? "-" : "+";
          const decStr = `${decSign}${target.coordinates.decDegrees.toString().padStart(2, "0")}d ${target.coordinates.decMinutes.toString().padStart(2, "0")}m ${target.coordinates.decSeconds.toFixed(1)}s`;

          return [
            target.targetName,
            raStr,
            decStr,
            target.positionAngle.toFixed(1),
          ].join(",");
        });

        return [headers.join(","), ...rows].join("\n");
      },

      exportToXML: () => {
        const state = get();
        const { sequence } = state;

        // Generate XML in NINA's .ninaTargetSet format
        // This is a Collection<CaptureSequenceList> serialized as XML
        const escapeXml = (str: string) =>
          str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        const targetsXml = sequence.targets
          .map((target) => {
            // Convert coordinates to decimal degrees for NINA
            const raDegrees =
              (target.coordinates.raHours +
                target.coordinates.raMinutes / 60 +
                target.coordinates.raSeconds / 3600) *
              15; // RA hours to degrees
            const decDegrees =
              (target.coordinates.decDegrees +
                target.coordinates.decMinutes / 60 +
                target.coordinates.decSeconds / 3600) *
              (target.coordinates.negativeDec ? -1 : 1);

            const exposuresXml = target.exposures
              .map(
                (exp) => `
      <CaptureSequence>
        <Enabled>${exp.enabled}</Enabled>
        <ExposureTime>${exp.exposureTime}</ExposureTime>
        <ImageType>${exp.imageType}</ImageType>
        <FilterType${exp.filter ? "" : ' xsi:nil="true"'}>${exp.filter ? `<Name>${escapeXml(exp.filter.name)}</Name><Position>${exp.filter.position}</Position>` : ""}</FilterType>
        <Binning><X>${exp.binning.x}</X><Y>${exp.binning.y}</Y></Binning>
        <Gain>${exp.gain}</Gain>
        <Offset>${exp.offset}</Offset>
        <TotalExposureCount>${exp.totalCount}</TotalExposureCount>
        <ProgressExposureCount>${exp.progressCount}</ProgressExposureCount>
        <Dither>${exp.dither}</Dither>
        <DitherAmount>${exp.ditherEvery}</DitherAmount>
      </CaptureSequence>`,
              )
              .join("");

            return `
  <CaptureSequenceList TargetName="${escapeXml(target.targetName)}" Mode="${target.mode}" Delay="${target.delay}" SlewToTarget="${target.slewToTarget}" CenterTarget="${target.centerTarget}" RotateTarget="${target.rotateTarget}" StartGuiding="${target.startGuiding}" AutoFocusOnStart="${target.autoFocusOnStart}" AutoFocusOnFilterChange="${target.autoFocusOnFilterChange}" AutoFocusAfterSetTime="${target.autoFocusAfterSetTime}" AutoFocusSetTime="${target.autoFocusSetTime}" AutoFocusAfterSetExposures="${target.autoFocusAfterSetExposures}" AutoFocusSetExposures="${target.autoFocusSetExposures}" AutoFocusAfterTemperatureChange="${target.autoFocusAfterTemperatureChange}" AutoFocusAfterTemperatureChangeAmount="${target.autoFocusAfterTemperatureChangeAmount}" AutoFocusAfterHFRChange="${target.autoFocusAfterHFRChange}" AutoFocusAfterHFRChangeAmount="${target.autoFocusAfterHFRChangeAmount}">
    <Coordinates>
      <RA>${raDegrees}</RA>
      <Dec>${decDegrees}</Dec>
      <Epoch>J2000</Epoch>
    </Coordinates>
    <PositionAngle>${target.positionAngle}</PositionAngle>
    <Items>${exposuresXml}
    </Items>
  </CaptureSequenceList>`;
          })
          .join("");

        return `<?xml version="1.0" encoding="utf-8"?>
<ArrayOfCaptureSequenceList xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">${targetsXml}
</ArrayOfCaptureSequenceList>`;
      },

      // ========================================================================
      // Copy/Paste Operations
      // ========================================================================

      copyExposuresToAllTargets: (sourceTargetId) => {
        const state = get();
        const sourceTarget = state.sequence.targets.find(
          (t) => t.id === sourceTargetId,
        );
        if (!sourceTarget) return;

        set((innerState) => {
          pushToHistory(innerState);
          for (const target of innerState.sequence.targets) {
            if (target.id !== sourceTargetId) {
              // Deep clone exposures with new IDs
              target.exposures = sourceTarget.exposures.map((e) => ({
                ...JSON.parse(JSON.stringify(e)),
                id: crypto.randomUUID(),
                progressCount: 0,
                status: SequenceEntityStatus.CREATED,
              }));
            }
          }
          markDirty(innerState);
        });
      },

      copyExposuresToTarget: (sourceTargetId, destTargetId) => {
        const state = get();
        const sourceTarget = state.sequence.targets.find(
          (t) => t.id === sourceTargetId,
        );
        if (!sourceTarget) return;

        set((innerState) => {
          const destTarget = innerState.sequence.targets.find(
            (t) => t.id === destTargetId,
          );
          if (!destTarget) return;

          pushToHistory(innerState);
          destTarget.exposures = sourceTarget.exposures.map((e) => ({
            ...JSON.parse(JSON.stringify(e)),
            id: crypto.randomUUID(),
            progressCount: 0,
            status: SequenceEntityStatus.CREATED,
          }));
          markDirty(innerState);
        });
      },

      // ========================================================================
      // ETA Calculation
      // ========================================================================

      calculateETAs: () => {
        set((state) => {
          const downloadTime = state.sequence.estimatedDownloadTime;
          let currentTime = new Date();
          let totalDuration = 0;

          for (const target of state.sequence.targets) {
            const targetDuration = calculateTargetRuntime(target, downloadTime);
            target.estimatedStartTime = new Date(currentTime);
            target.estimatedDuration = targetDuration;
            currentTime = new Date(
              currentTime.getTime() + targetDuration * 1000,
            );
            target.estimatedEndTime = new Date(currentTime);
            totalDuration += targetDuration;
          }

          state.sequence.overallStartTime = new Date();
          state.sequence.overallEndTime = new Date(
            Date.now() + totalDuration * 1000,
          );
          state.sequence.overallDuration = totalDuration;
        });
      },

      setEstimatedDownloadTime: (seconds) => {
        set((state) => {
          state.sequence.estimatedDownloadTime = Math.max(0, seconds);
        });
        get().calculateETAs();
      },

      // ========================================================================
      // Running State
      // ========================================================================

      setRunning: (running) => {
        set((state) => {
          state.sequence.isRunning = running;
        });
      },

      setActiveTarget: (targetId) => {
        set((state) => {
          state.sequence.activeTargetId = targetId;
        });
      },

      // ========================================================================
      // Undo/Redo
      // ========================================================================

      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            state.sequence = JSON.parse(
              JSON.stringify(state.history[state.historyIndex]),
            );
          }
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.sequence = JSON.parse(
              JSON.stringify(state.history[state.historyIndex]),
            );
          }
        });
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // ========================================================================
      // Error Handling
      // ========================================================================

      setError: (error) => {
        set((state) => {
          state.lastError = error;
        });
      },

      clearError: () => {
        set((state) => {
          state.lastError = null;
        });
      },

      // ========================================================================
      // Getters
      // ========================================================================

      getSelectedTarget: () => {
        const state = get();
        return (
          state.sequence.targets.find(
            (t) => t.id === state.sequence.selectedTargetId,
          ) || null
        );
      },

      getTargetById: (targetId) => {
        return get().sequence.targets.find((t) => t.id === targetId) || null;
      },

      getTotalExposureCount: () => {
        return get().sequence.targets.reduce(
          (total, target) =>
            total + target.exposures.reduce((t, e) => t + e.totalCount, 0),
          0,
        );
      },

      getTotalRemainingExposures: () => {
        return get().sequence.targets.reduce(
          (total, target) =>
            total +
            target.exposures.reduce(
              (t, e) => t + Math.max(0, e.totalCount - e.progressCount),
              0,
            ),
          0,
        );
      },
    })),
    {
      name: "simple-sequence-storage",
      partialize: (state) => ({
        sequence: state.sequence,
      }),
    },
  ),
);

// ============================================================================
// Selectors
// ============================================================================

export const selectSequence = (state: SimpleSequenceStore) => state.sequence;
export const selectTargets = (state: SimpleSequenceStore) =>
  state.sequence.targets;
export const selectSelectedTargetId = (state: SimpleSequenceStore) =>
  state.sequence.selectedTargetId;
export const selectActiveTargetId = (state: SimpleSequenceStore) =>
  state.sequence.activeTargetId;
export const selectStartOptions = (state: SimpleSequenceStore) =>
  state.sequence.startOptions;
export const selectEndOptions = (state: SimpleSequenceStore) =>
  state.sequence.endOptions;
export const selectIsRunning = (state: SimpleSequenceStore) =>
  state.sequence.isRunning;
export const selectIsDirty = (state: SimpleSequenceStore) =>
  state.sequence.isDirty;
export const selectCanUndo = (state: SimpleSequenceStore) =>
  state.historyIndex > 0;
export const selectCanRedo = (state: SimpleSequenceStore) =>
  state.historyIndex < state.history.length - 1;
