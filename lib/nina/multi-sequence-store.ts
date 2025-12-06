// NINA Sequence Editor - Multi-Sequence Management Store

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  EditorSequence,
  EditorSequenceItem,
  EditorCondition,
  EditorTrigger,
} from "./types";
import {
  generateId,
  deepClone,
  createSequenceItem,
  createCondition,
  createTrigger,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

// Editor mode: 'normal' (simple, single-tab) vs 'advanced' (multi-tab, full features)
export type EditorMode = "normal" | "advanced";

export interface SequenceTab {
  id: string;
  sequence: EditorSequence;
  isDirty: boolean;
  filePath?: string;
  lastModified: number;
}

export interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  category: "default" | "custom";
  mode: EditorMode; // Which mode this template is for
  sequence: EditorSequence;
  createdAt: number;
  updatedAt: number;
}

interface MultiSequenceState {
  // Editor mode
  editorMode: EditorMode;

  // Open sequences (tabs)
  tabs: SequenceTab[];
  activeTabId: string | null;

  // Templates
  templates: SequenceTemplate[];
}

interface MultiSequenceActions {
  // Editor mode
  setEditorMode: (mode: EditorMode) => void;

  // Tab management
  addTab: (sequence?: EditorSequence, filePath?: string) => string;
  closeTab: (tabId: string) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (tabId: string) => void;
  updateTabSequence: (tabId: string, sequence: EditorSequence) => void;
  setTabDirty: (tabId: string, isDirty: boolean) => void;
  duplicateTab: (tabId: string) => string;
  renameTab: (tabId: string, title: string) => void;

  // Template management
  addTemplate: (
    template: Omit<SequenceTemplate, "id" | "createdAt" | "updatedAt">,
  ) => string;
  updateTemplate: (
    templateId: string,
    updates: Partial<SequenceTemplate>,
  ) => void;
  deleteTemplate: (templateId: string) => void;
  applyTemplate: (templateId: string) => string | null;
  saveAsTemplate: (tabId: string, name: string, description: string) => string;
  getTemplatesForMode: (mode?: EditorMode) => SequenceTemplate[];

  // Utility
  getActiveTab: () => SequenceTab | null;
  getTabById: (tabId: string) => SequenceTab | null;
  hasUnsavedChanges: () => boolean;
  canAddTab: () => boolean;
}

type MultiSequenceStore = MultiSequenceState & MultiSequenceActions;

// ============================================================================
// Default Templates
// ============================================================================

function createEmptySequence(title: string = "New Sequence"): EditorSequence {
  return {
    id: generateId(),
    title,
    startItems: [],
    targetItems: [],
    endItems: [],
    globalTriggers: [],
  };
}

// Template definitions - simplified to avoid hydration issues
// Templates are generated with new IDs when applied
interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
}

const templateDefinitions: TemplateDefinition[] = [
  {
    id: "template-basic-imaging",
    name: "Basic Imaging Session",
    description: "Cooling, guiding and a single DSO exposure block",
  },
  {
    id: "template-dual-target",
    name: "Dual Target Marathon",
    description:
      "Two sequential deep sky targets with dithering and altitude checks",
  },
  {
    id: "template-meridian-monitor",
    name: "Meridian Flip Monitor",
    description:
      "Handles meridian flip, re-centers and resumes guiding automatically",
  },
  {
    id: "template-autofocus-dither",
    name: "Autofocus & Dither Loop",
    description:
      "Exposure train that autofocuses and dithers between filter changes",
  },
  {
    id: "template-calibration-suite",
    name: "Calibration Frames Suite",
    description: "Capture dark, bias, and flat frames in one run",
  },
  {
    id: "template-planetary",
    name: "Planetary High-Speed Session",
    description: "Short exposures with derotation and ROI stacking prep",
  },
  {
    id: "template-mosaic",
    name: "Four-Tile Mosaic",
    description: "Grid slew and capture across four mosaic tiles",
  },
  {
    id: "template-startup",
    name: "Startup Routine",
    description: "Connect, cool, unpark and prep like NINA defaults",
  },
  {
    id: "template-flat-capture",
    name: "Flat Frame Capture",
    description: "Automated flat frame acquisition sequence",
  },
  {
    id: "template-shutdown",
    name: "Shutdown Routine",
    description: "Safe equipment shutdown and parking",
  },
];

type ItemOverride = Partial<Omit<EditorSequenceItem, "data">> & {
  data?: Record<string, unknown>;
};
type ConditionOverride = Partial<Omit<EditorCondition, "data">> & {
  data?: Record<string, unknown>;
};
type TriggerOverride = Partial<Omit<EditorTrigger, "data">> & {
  data?: Record<string, unknown>;
};

function buildItem(
  type: string,
  overrides: ItemOverride = {},
): EditorSequenceItem {
  const base = createSequenceItem(type);
  return {
    ...base,
    ...overrides,
    data: overrides.data ? { ...base.data, ...overrides.data } : base.data,
  };
}

function buildCondition(
  type: string,
  overrides: ConditionOverride = {},
): EditorCondition {
  const base = createCondition(type);
  return {
    ...base,
    ...overrides,
    data: overrides.data ? { ...base.data, ...overrides.data } : base.data,
  };
}

function buildTrigger(
  type: string,
  overrides: TriggerOverride = {},
): EditorTrigger {
  const base = createTrigger(type);
  return {
    ...base,
    ...overrides,
    data: overrides.data ? { ...base.data, ...overrides.data } : base.data,
  };
}

const CONTAINER_TYPES = {
  SEQUENTIAL: "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
  DEEP_SKY: "NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer",
} as const;

const ITEM_TYPES = {
  COOL_CAMERA: "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
  WARM_CAMERA: "NINA.Sequencer.SequenceItem.Camera.WarmCamera, NINA.Sequencer",
  START_GUIDING:
    "NINA.Sequencer.SequenceItem.Guider.StartGuiding, NINA.Sequencer",
  STOP_GUIDING:
    "NINA.Sequencer.SequenceItem.Guider.StopGuiding, NINA.Sequencer",
  DITHER: "NINA.Sequencer.SequenceItem.Guider.Dither, NINA.Sequencer",
  SWITCH_FILTER:
    "NINA.Sequencer.SequenceItem.FilterWheel.SwitchFilter, NINA.Sequencer",
  TAKE_MANY_EXPOSURES:
    "NINA.Sequencer.SequenceItem.Imaging.TakeManyExposures, NINA.Sequencer",
  RUN_AUTOFOCUS:
    "NINA.Sequencer.SequenceItem.Autofocus.RunAutofocus, NINA.Sequencer",
  UNPARK_SCOPE:
    "NINA.Sequencer.SequenceItem.Telescope.UnparkScope, NINA.Sequencer",
  PARK_SCOPE: "NINA.Sequencer.SequenceItem.Telescope.ParkScope, NINA.Sequencer",
  SLEW_TO_RA_DEC:
    "NINA.Sequencer.SequenceItem.Telescope.SlewScopeToRaDec, NINA.Sequencer",
  CENTER: "NINA.Sequencer.SequenceItem.Platesolving.Center, NINA.Sequencer",
  MOVE_ROTATOR_ABSOLUTE:
    "NINA.Sequencer.SequenceItem.Rotator.MoveRotatorAbsolute, NINA.Sequencer",
  TOGGLE_LIGHT:
    "NINA.Sequencer.SequenceItem.FlatDevice.ToggleLight, NINA.Sequencer",
  SET_BRIGHTNESS:
    "NINA.Sequencer.SequenceItem.FlatDevice.SetBrightness, NINA.Sequencer",
  EXTERNAL_SCRIPT:
    "NINA.Sequencer.SequenceItem.Utility.ExternalScript, NINA.Sequencer",
  CONNECT_EQUIPMENT:
    "NINA.Sequencer.SequenceItem.Connect.ConnectEquipment, NINA.Sequencer",
  DISCONNECT_EQUIPMENT:
    "NINA.Sequencer.SequenceItem.Connect.DisconnectEquipment, NINA.Sequencer",
  OPEN_DOME_SHUTTER:
    "NINA.Sequencer.SequenceItem.Dome.OpenDomeShutter, NINA.Sequencer",
  CLOSE_DOME_SHUTTER:
    "NINA.Sequencer.SequenceItem.Dome.CloseDomeShutter, NINA.Sequencer",
  PARK_DOME: "NINA.Sequencer.SequenceItem.Dome.ParkDome, NINA.Sequencer",
} as const;

const CONDITION_TYPES = {
  LOOP: "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer",
  ALTITUDE: "NINA.Sequencer.Conditions.AltitudeCondition, NINA.Sequencer",
} as const;

const TRIGGER_TYPES = {
  MERIDIAN_FLIP:
    "NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer",
  CENTER_AFTER_DRIFT:
    "NINA.Sequencer.Trigger.Platesolving.CenterAfterDriftTrigger, NINA.Sequencer",
  RESTORE_GUIDING:
    "NINA.Sequencer.Trigger.Guider.RestoreGuiding, NINA.Sequencer",
  AUTOFOCUS_AFTER_EXPOSURES:
    "NINA.Sequencer.Trigger.Autofocus.AutofocusAfterExposures, NINA.Sequencer",
} as const;

const exposureBlock = (
  title: string,
  exposureTime: number,
  filter: string,
  count: number,
) =>
  buildItem(CONTAINER_TYPES.SEQUENTIAL, {
    name: title,
    items: [
      buildItem(ITEM_TYPES.SWITCH_FILTER, {
        data: { FilterName: filter },
      }),
      buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
        data: {
          ExposureTime: exposureTime,
          Gain: 100,
          Offset: 10,
          ImageType: "LIGHT",
          TotalExposureCount: count,
          Binning: { X: 1, Y: 1 },
        },
      }),
    ],
    triggers: [
      buildTrigger(TRIGGER_TYPES.AUTOFOCUS_AFTER_EXPOSURES, {
        data: { ExposureInterval: 10 },
      }),
    ],
  });

// Generate template sequence on demand
function generateTemplateSequence(templateId: string): EditorSequence {
  switch (templateId) {
    case "template-basic-imaging":
      return {
        id: generateId(),
        title: "Basic Imaging Session",
        startItems: [
          buildItem(ITEM_TYPES.COOL_CAMERA, {
            data: { Temperature: -10, Duration: 600 },
          }),
          buildItem(ITEM_TYPES.UNPARK_SCOPE),
          buildItem(ITEM_TYPES.START_GUIDING, {
            data: { ForceCalibration: false },
          }),
        ],
        targetItems: [
          {
            ...buildItem(CONTAINER_TYPES.DEEP_SKY, {
              name: "Deep Sky Object",
              data: {
                Target: {
                  name: "M31",
                  ra: { hours: 0, minutes: 42, seconds: 44 },
                  dec: {
                    degrees: 41,
                    minutes: 16,
                    seconds: 9,
                    negative: false,
                  },
                  rotation: 0,
                },
              },
              items: [
                buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                  data: {
                    ExposureTime: 300,
                    Gain: 100,
                    Offset: 10,
                    ImageType: "LIGHT",
                    TotalExposureCount: 20,
                    Binning: { X: 1, Y: 1 },
                  },
                }),
              ],
              conditions: [
                buildCondition(CONDITION_TYPES.LOOP, {
                  data: { Iterations: 20, CompletedIterations: 0 },
                }),
              ],
              triggers: [],
            }),
          },
        ],
        endItems: [
          buildItem(ITEM_TYPES.STOP_GUIDING),
          buildItem(ITEM_TYPES.WARM_CAMERA, { data: { Duration: 600 } }),
          buildItem(ITEM_TYPES.PARK_SCOPE),
        ],
        globalTriggers: [],
      };
    case "template-dual-target":
      return {
        id: generateId(),
        title: "Dual Target Marathon",
        startItems: [
          buildItem(ITEM_TYPES.COOL_CAMERA, {
            data: { Temperature: -15, Duration: 900 },
          }),
          buildItem(ITEM_TYPES.UNPARK_SCOPE),
          buildItem(ITEM_TYPES.START_GUIDING, {
            data: { ForceCalibration: true },
          }),
        ],
        targetItems: [
          {
            ...buildItem(CONTAINER_TYPES.DEEP_SKY, {
              name: "Target A",
              data: { Target: { name: "NGC 7000" } },
              conditions: [
                buildCondition(CONDITION_TYPES.ALTITUDE, {
                  name: "Altitude > 35°",
                  data: { Altitude: 35 },
                }),
              ],
            }),
            items: [exposureBlock("Hydrogen Alpha Block", 600, "Ha", 12)],
          },
          {
            ...buildItem(CONTAINER_TYPES.DEEP_SKY, {
              name: "Target B",
              data: { Target: { name: "IC 1396" } },
              conditions: [
                buildCondition(CONDITION_TYPES.ALTITUDE, {
                  name: "Altitude > 30°",
                  data: { Altitude: 30 },
                }),
              ],
            }),
            items: [exposureBlock("OIII Block", 480, "OIII", 18)],
          },
        ],
        endItems: [
          buildItem(ITEM_TYPES.STOP_GUIDING),
          buildItem(ITEM_TYPES.PARK_SCOPE),
        ],
        globalTriggers: [
          buildTrigger(TRIGGER_TYPES.MERIDIAN_FLIP, {
            data: { PauseGuiding: true },
          }),
        ],
      };
    case "template-meridian-monitor":
      return {
        id: generateId(),
        title: "Meridian Flip Monitor",
        startItems: [
          buildItem(ITEM_TYPES.COOL_CAMERA, { data: { Temperature: -10 } }),
          buildItem(ITEM_TYPES.START_GUIDING, {
            data: { ForceCalibration: false },
          }),
        ],
        targetItems: [
          buildItem(CONTAINER_TYPES.SEQUENTIAL, {
            name: "Flip Friendly Imaging",
            items: [
              buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                name: "Expose Before Flip",
                data: {
                  ExposureTime: 300,
                  TotalExposureCount: 10,
                  ImageType: "LIGHT",
                  Binning: { X: 1, Y: 1 },
                },
              }),
            ],
            triggers: [
              buildTrigger(TRIGGER_TYPES.MERIDIAN_FLIP, {
                data: { PauseGuiding: true },
              }),
              buildTrigger(TRIGGER_TYPES.CENTER_AFTER_DRIFT, {
                data: { DriftLimit: 8 },
              }),
              buildTrigger(TRIGGER_TYPES.RESTORE_GUIDING),
            ],
          }),
        ],
        endItems: [
          buildItem(ITEM_TYPES.STOP_GUIDING),
          buildItem(ITEM_TYPES.WARM_CAMERA, { data: { Duration: 900 } }),
        ],
        globalTriggers: [],
      };
    case "template-autofocus-dither":
      return {
        id: generateId(),
        title: "Autofocus & Dither Loop",
        startItems: [
          buildItem(ITEM_TYPES.COOL_CAMERA, { data: { Temperature: -20 } }),
          buildItem(ITEM_TYPES.RUN_AUTOFOCUS, { name: "Initial Autofocus" }),
        ],
        targetItems: [
          buildItem(CONTAINER_TYPES.SEQUENTIAL, {
            name: "Filters Loop",
            items: [
              exposureBlock("Red Filter Block", 180, "R", 15),
              buildItem(ITEM_TYPES.DITHER, {
                name: "Dither After Block",
                data: { Settle: 8 },
              }),
              exposureBlock("Green Filter Block", 180, "G", 15),
              buildItem(ITEM_TYPES.RUN_AUTOFOCUS, {
                name: "Autofocus Mid Session",
              }),
              exposureBlock("Blue Filter Block", 180, "B", 15),
            ],
          }),
        ],
        endItems: [buildItem(ITEM_TYPES.STOP_GUIDING)],
        globalTriggers: [],
      };
    case "template-calibration-suite":
      return {
        id: generateId(),
        title: "Calibration Frames Suite",
        startItems: [
          buildItem(ITEM_TYPES.TOGGLE_LIGHT, {
            name: "Turn On Flat Panel",
            data: { OnOff: true },
          }),
        ],
        targetItems: [
          buildItem(CONTAINER_TYPES.SEQUENTIAL, {
            name: "Calibration Blocks",
            items: [
              buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                name: "Bias Frames",
                data: {
                  ExposureTime: 0.001,
                  ImageType: "BIAS",
                  TotalExposureCount: 40,
                },
              }),
              buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                name: "Dark Frames",
                data: {
                  ExposureTime: 300,
                  ImageType: "DARK",
                  TotalExposureCount: 20,
                },
              }),
              buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                name: "Flat Frames",
                data: {
                  ExposureTime: 3,
                  ImageType: "FLAT",
                  TotalExposureCount: 30,
                },
              }),
            ],
          }),
        ],
        endItems: [
          buildItem(ITEM_TYPES.TOGGLE_LIGHT, {
            name: "Turn Off Flat Panel",
            data: { OnOff: false },
          }),
        ],
        globalTriggers: [],
      };
    case "template-planetary":
      return {
        id: generateId(),
        title: "Planetary High-Speed Session",
        startItems: [
          buildItem(ITEM_TYPES.COOL_CAMERA, { data: { Temperature: 0 } }),
          buildItem(ITEM_TYPES.MOVE_ROTATOR_ABSOLUTE, {
            name: "Set Derotation Angle",
            data: { Position: 45 },
          }),
        ],
        targetItems: [
          buildItem(CONTAINER_TYPES.SEQUENTIAL, {
            name: "Capture & Stack",
            items: [
              buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                name: "High-speed Capture",
                data: {
                  ExposureTime: 0.02,
                  ImageType: "SNAPSHOT",
                  TotalExposureCount: 5000,
                  RegionOfInterest: "320x240",
                },
              }),
              buildItem(ITEM_TYPES.EXTERNAL_SCRIPT, {
                name: "Run Stacking Script",
                data: { ScriptPath: "WinJUPOS.ps1" },
              }),
            ],
          }),
        ],
        endItems: [
          buildItem(ITEM_TYPES.WARM_CAMERA, { data: { Duration: 600 } }),
        ],
        globalTriggers: [],
      };
    case "template-mosaic":
      return {
        id: generateId(),
        title: "Four-Tile Mosaic",
        startItems: [
          buildItem(ITEM_TYPES.COOL_CAMERA, { data: { Temperature: -12 } }),
          buildItem(ITEM_TYPES.START_GUIDING),
        ],
        targetItems: [
          buildItem(CONTAINER_TYPES.SEQUENTIAL, {
            name: "Mosaic Grid",
            items: ["Tile 1", "Tile 2", "Tile 3", "Tile 4"].map((label, idx) =>
              buildItem(CONTAINER_TYPES.SEQUENTIAL, {
                name: label,
                items: [
                  buildItem(ITEM_TYPES.SLEW_TO_RA_DEC, {
                    name: "Slew to Tile",
                    data: { TileIndex: idx + 1 },
                  }),
                  buildItem(ITEM_TYPES.CENTER, { name: "Center Tile" }),
                  buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                    name: "Expose Tile",
                    data: {
                      ExposureTime: 240,
                      ImageType: "LIGHT",
                      TotalExposureCount: 15,
                    },
                  }),
                ],
              }),
            ),
          }),
        ],
        endItems: [
          buildItem(ITEM_TYPES.STOP_GUIDING),
          buildItem(ITEM_TYPES.PARK_SCOPE),
        ],
        globalTriggers: [],
      };
    case "template-startup":
      return {
        id: generateId(),
        title: "Startup Routine",
        startItems: [
          buildItem(ITEM_TYPES.CONNECT_EQUIPMENT),
          buildItem(ITEM_TYPES.COOL_CAMERA, {
            data: { Temperature: -10, Duration: 600 },
          }),
          buildItem(ITEM_TYPES.UNPARK_SCOPE),
          buildItem(ITEM_TYPES.OPEN_DOME_SHUTTER),
        ],
        targetItems: [],
        endItems: [],
        globalTriggers: [],
      };
    case "template-shutdown":
      return {
        id: generateId(),
        title: "Shutdown Routine",
        startItems: [],
        targetItems: [],
        endItems: [
          buildItem(ITEM_TYPES.STOP_GUIDING),
          buildItem(ITEM_TYPES.WARM_CAMERA, { data: { Duration: 600 } }),
          buildItem(ITEM_TYPES.PARK_SCOPE),
          buildItem(ITEM_TYPES.CLOSE_DOME_SHUTTER),
          buildItem(ITEM_TYPES.PARK_DOME),
          buildItem(ITEM_TYPES.DISCONNECT_EQUIPMENT),
        ],
        globalTriggers: [],
      };
    case "template-flat-capture":
      return {
        id: generateId(),
        title: "Flat Frame Capture",
        startItems: [
          buildItem(ITEM_TYPES.SET_BRIGHTNESS, {
            name: "Set Panel Brightness",
            data: { Brightness: 50 },
          }),
          buildItem(ITEM_TYPES.TOGGLE_LIGHT, {
            name: "Turn On Light",
            data: { OnOff: true },
          }),
        ],
        targetItems: [
          {
            ...buildItem(CONTAINER_TYPES.SEQUENTIAL, {
              name: "Flat Frames",
              items: [
                buildItem(ITEM_TYPES.TAKE_MANY_EXPOSURES, {
                  name: "Take Flat Frames",
                  data: {
                    ExposureTime: 2,
                    Gain: 0,
                    Offset: 10,
                    ImageType: "FLAT",
                    TotalExposureCount: 30,
                    Binning: { X: 1, Y: 1 },
                  },
                }),
              ],
              conditions: [],
              triggers: [],
            }),
          },
        ],
        endItems: [
          buildItem(ITEM_TYPES.TOGGLE_LIGHT, {
            name: "Turn Off Light",
            data: { OnOff: false },
          }),
        ],
        globalTriggers: [],
      };
    default:
      return createEmptySequence();
  }
}

// Create default templates with empty sequences (sequences are generated on apply)
// Templates are separated by mode - some are for normal mode, some for advanced
const defaultTemplates: SequenceTemplate[] = templateDefinitions.map((def) => {
  // Determine which mode this template belongs to
  // Normal mode templates: basic imaging, startup, shutdown, flat capture
  // Advanced mode templates: everything else (multi-target, meridian, mosaic, etc.)
  const normalModeTemplates = [
    "template-basic-imaging",
    "template-startup",
    "template-shutdown",
    "template-flat-capture",
  ];
  const mode: EditorMode = normalModeTemplates.includes(def.id)
    ? "normal"
    : "advanced";

  return {
    id: def.id,
    name: def.name,
    description: def.description,
    category: "default" as const,
    mode,
    sequence: {
      id: def.id + "-seq",
      title: def.name,
      startItems: [],
      targetItems: [],
      endItems: [],
      globalTriggers: [],
    },
    createdAt: 0,
    updatedAt: 0,
  };
});

// ============================================================================
// Initial State
// ============================================================================

const initialState: MultiSequenceState = {
  editorMode: "advanced", // Default to advanced mode
  tabs: [],
  activeTabId: null,
  templates: defaultTemplates,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useMultiSequenceStore = create<MultiSequenceStore>()(
  immer((set, get) => ({
    ...initialState,

    // ========================================================================
    // Editor Mode
    // ========================================================================

    setEditorMode: (mode) => {
      set((state) => {
        state.editorMode = mode;
        // In normal mode, keep only one tab
        if (mode === "normal" && state.tabs.length > 1) {
          // Keep only the active tab or the first one
          const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
          state.tabs = activeTab ? [activeTab] : state.tabs.slice(0, 1);
          state.activeTabId = state.tabs[0]?.id || null;
        }
      });
    },

    // ========================================================================
    // Tab Management
    // ========================================================================

    addTab: (sequence, filePath) => {
      const { editorMode, tabs } = get();

      // In normal mode, only allow one tab - replace existing
      if (editorMode === "normal" && tabs.length > 0) {
        const existingTabId = tabs[0].id;
        set((state) => {
          state.tabs[0] = {
            id: existingTabId,
            sequence: sequence || createEmptySequence(),
            isDirty: false,
            filePath,
            lastModified: Date.now(),
          };
        });
        return existingTabId;
      }
      const newSequence = sequence || createEmptySequence();
      const tabId = generateId();

      set((state) => {
        state.tabs.push({
          id: tabId,
          sequence: newSequence,
          isDirty: false,
          filePath,
          lastModified: Date.now(),
        });
        state.activeTabId = tabId;
      });

      return tabId;
    },

    closeTab: (tabId) => {
      set((state) => {
        const index = state.tabs.findIndex((t) => t.id === tabId);
        if (index === -1) return;

        state.tabs.splice(index, 1);

        // Update active tab
        if (state.activeTabId === tabId) {
          if (state.tabs.length > 0) {
            // Select the tab at the same position or the last one
            const newIndex = Math.min(index, state.tabs.length - 1);
            state.activeTabId = state.tabs[newIndex].id;
          } else {
            state.activeTabId = null;
          }
        }
      });
    },

    closeOtherTabs: (tabId) => {
      set((state) => {
        state.tabs = state.tabs.filter((t) => t.id === tabId);
        state.activeTabId = tabId;
      });
    },

    closeAllTabs: () => {
      set((state) => {
        state.tabs = [];
        state.activeTabId = null;
      });
    },

    setActiveTab: (tabId) => {
      set((state) => {
        if (state.tabs.some((t) => t.id === tabId)) {
          state.activeTabId = tabId;
        }
      });
    },

    updateTabSequence: (tabId, sequence) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (tab) {
          tab.sequence = sequence;
          tab.lastModified = Date.now();
        }
      });
    },

    setTabDirty: (tabId, isDirty) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (tab) {
          tab.isDirty = isDirty;
        }
      });
    },

    duplicateTab: (tabId) => {
      const { tabs, addTab } = get();
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return "";

      const newSequence = deepClone(tab.sequence);
      newSequence.id = generateId();
      newSequence.title = `${tab.sequence.title} (Copy)`;

      return addTab(newSequence);
    },

    renameTab: (tabId, title) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (tab) {
          tab.sequence.title = title;
          tab.isDirty = true;
          tab.lastModified = Date.now();
        }
      });
    },

    // ========================================================================
    // Template Management
    // ========================================================================

    addTemplate: (template) => {
      const templateId = generateId();
      const now = Date.now();

      set((state) => {
        state.templates.push({
          ...template,
          id: templateId,
          createdAt: now,
          updatedAt: now,
        });
      });

      return templateId;
    },

    updateTemplate: (templateId, updates) => {
      set((state) => {
        const template = state.templates.find((t) => t.id === templateId);
        if (template && template.category === "custom") {
          Object.assign(template, updates, { updatedAt: Date.now() });
        }
      });
    },

    deleteTemplate: (templateId) => {
      set((state) => {
        const index = state.templates.findIndex((t) => t.id === templateId);
        if (index !== -1 && state.templates[index].category === "custom") {
          state.templates.splice(index, 1);
        }
      });
    },

    applyTemplate: (templateId) => {
      const { templates, addTab } = get();
      const template = templates.find((t) => t.id === templateId);
      if (!template) return null;

      // For default templates, generate fresh sequence with new IDs
      // For custom templates, clone the saved sequence
      const newSequence =
        template.category === "default"
          ? generateTemplateSequence(templateId)
          : deepClone(template.sequence);
      newSequence.id = generateId();

      return addTab(newSequence);
    },

    saveAsTemplate: (tabId, name, description) => {
      const { tabs, editorMode, addTemplate } = get();
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return "";

      return addTemplate({
        name,
        description,
        category: "custom",
        mode: editorMode, // Save template for current mode
        sequence: deepClone(tab.sequence),
      });
    },

    getTemplatesForMode: (mode) => {
      const { templates, editorMode } = get();
      const targetMode = mode || editorMode;
      return templates.filter(
        (t) => t.mode === targetMode || t.mode === "advanced",
      );
    },

    // ========================================================================
    // Utility
    // ========================================================================

    getActiveTab: () => {
      const { tabs, activeTabId } = get();
      return tabs.find((t) => t.id === activeTabId) || null;
    },

    getTabById: (tabId) => {
      const { tabs } = get();
      return tabs.find((t) => t.id === tabId) || null;
    },

    hasUnsavedChanges: () => {
      const { tabs } = get();
      return tabs.some((t) => t.isDirty);
    },

    canAddTab: () => {
      const { editorMode, tabs } = get();
      // In normal mode, only one tab allowed
      if (editorMode === "normal") {
        return tabs.length === 0;
      }
      return true;
    },
  })),
);

// ============================================================================
// Selectors
// ============================================================================

export const selectEditorMode = (state: MultiSequenceStore) => state.editorMode;
export const selectTabs = (state: MultiSequenceStore) => state.tabs;
export const selectActiveTabId = (state: MultiSequenceStore) =>
  state.activeTabId;
export const selectTemplates = (state: MultiSequenceStore) => state.templates;
export const selectDefaultTemplates = (state: MultiSequenceStore) =>
  state.templates.filter((t) => t.category === "default");
export const selectCustomTemplates = (state: MultiSequenceStore) =>
  state.templates.filter((t) => t.category === "custom");
export const selectTemplatesForCurrentMode = (state: MultiSequenceStore) =>
  state.templates.filter(
    (t) => t.mode === state.editorMode || t.mode === "advanced",
  );
export const selectCanAddTab = (state: MultiSequenceStore) =>
  state.editorMode === "advanced" || state.tabs.length === 0;
