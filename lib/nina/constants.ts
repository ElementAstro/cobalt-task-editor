// NINA Sequence Editor - Constants and Definitions

import {
  ExecutionStrategyType,
  ImageType,
  InstructionErrorBehavior,
} from "./types";

// ============================================================================
// Item Categories
// ============================================================================

export const CATEGORIES = {
  CONTAINER: "Container",
  CAMERA: "Camera",
  IMAGING: "Imaging",
  TELESCOPE: "Telescope",
  FOCUSER: "Focuser",
  FILTER_WHEEL: "Filter Wheel",
  GUIDER: "Guider",
  AUTOFOCUS: "Autofocus",
  PLATESOLVING: "Platesolving",
  ROTATOR: "Rotator",
  DOME: "Dome",
  FLAT_DEVICE: "Flat Device",
  SAFETY_MONITOR: "Safety Monitor",
  SWITCH: "Switch",
  UTILITY: "Utility",
  CONNECT: "Connect",
  CONDITION: "Condition",
  TRIGGER: "Trigger",
} as const;

// ============================================================================
// Sequence Item Definitions
// ============================================================================

export interface ItemDefinition {
  type: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  defaultValues: Record<string, unknown>;
}

export const SEQUENCE_ITEMS: ItemDefinition[] = [
  // Containers
  {
    type: "NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer",
    name: "Sequential Container",
    category: CATEGORIES.CONTAINER,
    icon: "list-ordered",
    description: "Execute items in sequence",
    defaultValues: { IsExpanded: true },
  },
  {
    type: "NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer",
    name: "Parallel Container",
    category: CATEGORIES.CONTAINER,
    icon: "git-branch",
    description: "Execute items in parallel",
    defaultValues: { IsExpanded: true },
  },
  {
    type: "NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer",
    name: "Deep Sky Object",
    category: CATEGORIES.CONTAINER,
    icon: "star",
    description: "Container for a deep sky object target",
    defaultValues: {
      IsExpanded: true,
      Target: {
        TargetName: "",
        Rotation: 0,
        InputCoordinates: {
          RAHours: 0,
          RAMinutes: 0,
          RASeconds: 0,
          DecDegrees: 0,
          DecMinutes: 0,
          DecSeconds: 0,
        },
      },
    },
  },

  // Camera
  {
    type: "NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer",
    name: "Cool Camera",
    category: CATEGORIES.CAMERA,
    icon: "thermometer-snowflake",
    description: "Cool the camera to a target temperature",
    defaultValues: { Temperature: -10, Duration: 0 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Camera.WarmCamera, NINA.Sequencer",
    name: "Warm Camera",
    category: CATEGORIES.CAMERA,
    icon: "thermometer-sun",
    description: "Warm the camera back to ambient temperature",
    defaultValues: { Duration: 0 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Camera.SetReadoutMode, NINA.Sequencer",
    name: "Set Readout Mode",
    category: CATEGORIES.CAMERA,
    icon: "settings",
    description: "Set camera readout mode",
    defaultValues: { Mode: 0 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Camera.DewHeater, NINA.Sequencer",
    name: "Dew Heater",
    category: CATEGORIES.CAMERA,
    icon: "flame",
    description: "Toggle dew heater on/off",
    defaultValues: { OnOff: true },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Camera.SetUSBLimit, NINA.Sequencer",
    name: "Set USB Limit",
    category: CATEGORIES.CAMERA,
    icon: "usb",
    description: "Set camera USB bandwidth limit",
    defaultValues: { USBLimit: 40 },
  },

  // Imaging
  {
    type: "NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer",
    name: "Take Exposure",
    category: CATEGORIES.IMAGING,
    icon: "camera",
    description: "Take a single exposure",
    defaultValues: {
      ExposureTime: 60,
      Gain: -1,
      Offset: -1,
      ImageType: ImageType.LIGHT,
      ExposureCount: 0,
      Binning: { X: 1, Y: 1 },
    },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Imaging.TakeManyExposures, NINA.Sequencer",
    name: "Take Many Exposures",
    category: CATEGORIES.IMAGING,
    icon: "images",
    description: "Take multiple exposures",
    defaultValues: {
      ExposureTime: 60,
      Gain: -1,
      Offset: -1,
      ImageType: ImageType.LIGHT,
      ExposureCount: 0,
      TotalExposureCount: 10,
      Binning: { X: 1, Y: 1 },
    },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Imaging.SmartExposure, NINA.Sequencer",
    name: "Smart Exposure",
    category: CATEGORIES.IMAGING,
    icon: "sparkles",
    description: "Combined filter switch, exposure and dither",
    defaultValues: { IsExpanded: true },
  },

  // Telescope
  {
    type: "NINA.Sequencer.SequenceItem.Telescope.SlewScopeToRaDec, NINA.Sequencer",
    name: "Slew to RA/Dec",
    category: CATEGORIES.TELESCOPE,
    icon: "compass",
    description: "Slew telescope to RA/Dec coordinates",
    defaultValues: { Inherited: true },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Telescope.SlewScopeToAltAz, NINA.Sequencer",
    name: "Slew to Alt/Az",
    category: CATEGORIES.TELESCOPE,
    icon: "compass",
    description: "Slew telescope to altitude/azimuth",
    defaultValues: { Altitude: 45, Azimuth: 180 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Telescope.ParkScope, NINA.Sequencer",
    name: "Park Scope",
    category: CATEGORIES.TELESCOPE,
    icon: "square-parking",
    description: "Park the telescope",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Telescope.UnparkScope, NINA.Sequencer",
    name: "Unpark Scope",
    category: CATEGORIES.TELESCOPE,
    icon: "square-parking-off",
    description: "Unpark the telescope",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Telescope.FindHome, NINA.Sequencer",
    name: "Find Home",
    category: CATEGORIES.TELESCOPE,
    icon: "home",
    description: "Find home position",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Telescope.SetTracking, NINA.Sequencer",
    name: "Set Tracking",
    category: CATEGORIES.TELESCOPE,
    icon: "target",
    description: "Set telescope tracking mode",
    defaultValues: { TrackingMode: 0 },
  },

  // Focuser
  {
    type: "NINA.Sequencer.SequenceItem.Focuser.MoveFocuserAbsolute, NINA.Sequencer",
    name: "Move Focuser (Absolute)",
    category: CATEGORIES.FOCUSER,
    icon: "focus",
    description: "Move focuser to absolute position",
    defaultValues: { Position: 5000 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Focuser.MoveFocuserRelative, NINA.Sequencer",
    name: "Move Focuser (Relative)",
    category: CATEGORIES.FOCUSER,
    icon: "move-vertical",
    description: "Move focuser by relative amount",
    defaultValues: { RelativePosition: 100 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Focuser.MoveFocuserByTemperature, NINA.Sequencer",
    name: "Move Focuser by Temperature",
    category: CATEGORIES.FOCUSER,
    icon: "thermometer",
    description: "Adjust focuser based on temperature",
    defaultValues: { Slope: 0, Intercept: 0 },
  },

  // Filter Wheel
  {
    type: "NINA.Sequencer.SequenceItem.FilterWheel.SwitchFilter, NINA.Sequencer",
    name: "Switch Filter",
    category: CATEGORIES.FILTER_WHEEL,
    icon: "disc",
    description: "Switch to a specific filter",
    defaultValues: { Filter: null },
  },

  // Guider
  {
    type: "NINA.Sequencer.SequenceItem.Guider.StartGuiding, NINA.Sequencer",
    name: "Start Guiding",
    category: CATEGORIES.GUIDER,
    icon: "crosshair",
    description: "Start autoguiding",
    defaultValues: { ForceCalibration: false },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Guider.StopGuiding, NINA.Sequencer",
    name: "Stop Guiding",
    category: CATEGORIES.GUIDER,
    icon: "circle-stop",
    description: "Stop autoguiding",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Guider.Dither, NINA.Sequencer",
    name: "Dither",
    category: CATEGORIES.GUIDER,
    icon: "shuffle",
    description: "Perform a dither",
    defaultValues: {},
  },

  // Autofocus
  {
    type: "NINA.Sequencer.SequenceItem.Autofocus.RunAutofocus, NINA.Sequencer",
    name: "Run Autofocus",
    category: CATEGORIES.AUTOFOCUS,
    icon: "scan",
    description: "Run autofocus routine",
    defaultValues: {},
  },

  // Platesolving
  {
    type: "NINA.Sequencer.SequenceItem.Platesolving.Center, NINA.Sequencer",
    name: "Center",
    category: CATEGORIES.PLATESOLVING,
    icon: "crosshair",
    description: "Center on target using plate solving",
    defaultValues: { Inherited: true },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Platesolving.CenterAndRotate, NINA.Sequencer",
    name: "Center and Rotate",
    category: CATEGORIES.PLATESOLVING,
    icon: "rotate-3d",
    description: "Center and rotate to target position angle",
    defaultValues: { Inherited: true, Rotation: 0 },
  },

  // Rotator
  {
    type: "NINA.Sequencer.SequenceItem.Rotator.MoveRotatorAbsolute, NINA.Sequencer",
    name: "Move Rotator (Absolute)",
    category: CATEGORIES.ROTATOR,
    icon: "rotate-cw",
    description: "Move rotator to absolute position",
    defaultValues: { Position: 0 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Rotator.MoveRotatorRelative, NINA.Sequencer",
    name: "Move Rotator (Relative)",
    category: CATEGORIES.ROTATOR,
    icon: "rotate-ccw",
    description: "Move rotator by relative amount",
    defaultValues: { RelativePosition: 0 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Rotator.MoveRotatorMechanical, NINA.Sequencer",
    name: "Move Rotator (Mechanical)",
    category: CATEGORIES.ROTATOR,
    icon: "cog",
    description: "Move rotator to mechanical position",
    defaultValues: { MechanicalPosition: 0 },
  },

  // Dome
  {
    type: "NINA.Sequencer.SequenceItem.Dome.OpenDomeShutter, NINA.Sequencer",
    name: "Open Dome Shutter",
    category: CATEGORIES.DOME,
    icon: "door-open",
    description: "Open the dome shutter",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Dome.CloseDomeShutter, NINA.Sequencer",
    name: "Close Dome Shutter",
    category: CATEGORIES.DOME,
    icon: "door-closed",
    description: "Close the dome shutter",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Dome.ParkDome, NINA.Sequencer",
    name: "Park Dome",
    category: CATEGORIES.DOME,
    icon: "square-parking",
    description: "Park the dome",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Dome.SynchronizeDome, NINA.Sequencer",
    name: "Synchronize Dome",
    category: CATEGORIES.DOME,
    icon: "refresh-cw",
    description: "Synchronize dome with telescope",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Dome.EnableDomeSynchronization, NINA.Sequencer",
    name: "Enable Dome Sync",
    category: CATEGORIES.DOME,
    icon: "link",
    description: "Enable dome synchronization",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Dome.DisableDomeSynchronization, NINA.Sequencer",
    name: "Disable Dome Sync",
    category: CATEGORIES.DOME,
    icon: "unlink",
    description: "Disable dome synchronization",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Dome.SlewDomeAbsolute, NINA.Sequencer",
    name: "Slew Dome",
    category: CATEGORIES.DOME,
    icon: "compass",
    description: "Slew dome to azimuth",
    defaultValues: { Azimuth: 0 },
  },

  // Flat Device
  {
    type: "NINA.Sequencer.SequenceItem.FlatDevice.SetBrightness, NINA.Sequencer",
    name: "Set Brightness",
    category: CATEGORIES.FLAT_DEVICE,
    icon: "sun",
    description: "Set flat panel brightness",
    defaultValues: { Brightness: 50 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.FlatDevice.ToggleLight, NINA.Sequencer",
    name: "Toggle Light",
    category: CATEGORIES.FLAT_DEVICE,
    icon: "lightbulb",
    description: "Toggle flat panel light",
    defaultValues: { OnOff: true },
  },
  {
    type: "NINA.Sequencer.SequenceItem.FlatDevice.OpenCover, NINA.Sequencer",
    name: "Open Cover",
    category: CATEGORIES.FLAT_DEVICE,
    icon: "box",
    description: "Open flat panel cover",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.FlatDevice.CloseCover, NINA.Sequencer",
    name: "Close Cover",
    category: CATEGORIES.FLAT_DEVICE,
    icon: "package",
    description: "Close flat panel cover",
    defaultValues: {},
  },

  // Safety Monitor
  {
    type: "NINA.Sequencer.SequenceItem.SafetyMonitor.WaitUntilSafe, NINA.Sequencer",
    name: "Wait Until Safe",
    category: CATEGORIES.SAFETY_MONITOR,
    icon: "shield-check",
    description: "Wait until safety monitor reports safe",
    defaultValues: {},
  },

  // Switch
  {
    type: "NINA.Sequencer.SequenceItem.Switch.SetSwitchValue, NINA.Sequencer",
    name: "Set Switch Value",
    category: CATEGORIES.SWITCH,
    icon: "toggle-right",
    description: "Set a switch value",
    defaultValues: { SwitchIndex: 0, Value: 0 },
  },

  // Utility
  {
    type: "NINA.Sequencer.SequenceItem.Utility.Annotation, NINA.Sequencer",
    name: "Annotation",
    category: CATEGORIES.UTILITY,
    icon: "message-square",
    description: "Add a comment/annotation",
    defaultValues: { Text: "" },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.MessageBox, NINA.Sequencer",
    name: "Message Box",
    category: CATEGORIES.UTILITY,
    icon: "message-circle",
    description: "Show a message box",
    defaultValues: { Text: "" },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.ExternalScript, NINA.Sequencer",
    name: "External Script",
    category: CATEGORIES.UTILITY,
    icon: "terminal",
    description: "Run an external script",
    defaultValues: { Script: "" },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.WaitForTime, NINA.Sequencer",
    name: "Wait For Time",
    category: CATEGORIES.UTILITY,
    icon: "clock",
    description: "Wait until a specific time",
    defaultValues: { Hours: 0, Minutes: 0, Seconds: 0 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.WaitForTimeSpan, NINA.Sequencer",
    name: "Wait For Duration",
    category: CATEGORIES.UTILITY,
    icon: "timer",
    description: "Wait for a duration",
    defaultValues: { Time: 60 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.WaitForAltitude, NINA.Sequencer",
    name: "Wait For Altitude",
    category: CATEGORIES.UTILITY,
    icon: "mountain",
    description: "Wait for target altitude",
    defaultValues: { TargetAltitude: 30, Comparator: ">=" },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.WaitForMoonAltitude, NINA.Sequencer",
    name: "Wait For Moon Altitude",
    category: CATEGORIES.UTILITY,
    icon: "moon",
    description: "Wait for moon altitude",
    defaultValues: { TargetAltitude: 0, Comparator: "<=" },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.WaitForSunAltitude, NINA.Sequencer",
    name: "Wait For Sun Altitude",
    category: CATEGORIES.UTILITY,
    icon: "sun",
    description: "Wait for sun altitude",
    defaultValues: { TargetAltitude: -12, Comparator: "<=" },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.WaitUntilAboveHorizon, NINA.Sequencer",
    name: "Wait Until Above Horizon",
    category: CATEGORIES.UTILITY,
    icon: "sunrise",
    description: "Wait until target is above horizon",
    defaultValues: { Offset: 0 },
  },
  {
    type: "NINA.Sequencer.SequenceItem.Utility.SaveSequence, NINA.Sequencer",
    name: "Save Sequence",
    category: CATEGORIES.UTILITY,
    icon: "save",
    description: "Save the sequence to file",
    defaultValues: { FilePath: "" },
  },

  // Connect
  {
    type: "NINA.Sequencer.SequenceItem.Connect.ConnectEquipment, NINA.Sequencer",
    name: "Connect Equipment",
    category: CATEGORIES.CONNECT,
    icon: "plug",
    description: "Connect all equipment",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.SequenceItem.Connect.DisconnectEquipment, NINA.Sequencer",
    name: "Disconnect Equipment",
    category: CATEGORIES.CONNECT,
    icon: "plug-zap",
    description: "Disconnect all equipment",
    defaultValues: {},
  },
];

// ============================================================================
// Condition Definitions
// ============================================================================

export const CONDITION_ITEMS: ItemDefinition[] = [
  {
    type: "NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer",
    name: "Loop",
    category: CATEGORIES.CONDITION,
    icon: "repeat",
    description: "Repeat for a number of iterations",
    defaultValues: { Iterations: 1, CompletedIterations: 0 },
  },
  {
    type: "NINA.Sequencer.Conditions.TimeCondition, NINA.Sequencer",
    name: "Loop Until Time",
    category: CATEGORIES.CONDITION,
    icon: "clock",
    description: "Loop until a specific time",
    defaultValues: { Hours: 0, Minutes: 0, Seconds: 0 },
  },
  {
    type: "NINA.Sequencer.Conditions.TimeSpanCondition, NINA.Sequencer",
    name: "Loop For Duration",
    category: CATEGORIES.CONDITION,
    icon: "timer",
    description: "Loop for a duration",
    defaultValues: { Hours: 0, Minutes: 0, Seconds: 0 },
  },
  {
    type: "NINA.Sequencer.Conditions.AltitudeCondition, NINA.Sequencer",
    name: "Loop While Altitude",
    category: CATEGORIES.CONDITION,
    icon: "mountain",
    description: "Loop while altitude condition is met",
    defaultValues: { TargetAltitude: 30, Comparator: ">=" },
  },
  {
    type: "NINA.Sequencer.Conditions.AboveHorizonCondition, NINA.Sequencer",
    name: "Loop While Above Horizon",
    category: CATEGORIES.CONDITION,
    icon: "sunrise",
    description: "Loop while target is above horizon",
    defaultValues: { Offset: 0 },
  },
  {
    type: "NINA.Sequencer.Conditions.MoonAltitudeCondition, NINA.Sequencer",
    name: "Loop While Moon Altitude",
    category: CATEGORIES.CONDITION,
    icon: "moon",
    description: "Loop while moon altitude condition is met",
    defaultValues: { TargetAltitude: 0, Comparator: "<=" },
  },
  {
    type: "NINA.Sequencer.Conditions.SunAltitudeCondition, NINA.Sequencer",
    name: "Loop While Sun Altitude",
    category: CATEGORIES.CONDITION,
    icon: "sun",
    description: "Loop while sun altitude condition is met",
    defaultValues: { TargetAltitude: -12, Comparator: "<=" },
  },
  {
    type: "NINA.Sequencer.Conditions.MoonIlluminationCondition, NINA.Sequencer",
    name: "Loop While Moon Illumination",
    category: CATEGORIES.CONDITION,
    icon: "circle",
    description: "Loop while moon illumination condition is met",
    defaultValues: { TargetIllumination: 50, Comparator: "<=" },
  },
  {
    type: "NINA.Sequencer.Conditions.SafetyMonitorCondition, NINA.Sequencer",
    name: "Loop While Safe",
    category: CATEGORIES.CONDITION,
    icon: "shield-check",
    description: "Loop while safety monitor reports safe",
    defaultValues: {},
  },
];

// ============================================================================
// Trigger Definitions
// ============================================================================

export const TRIGGER_ITEMS: ItemDefinition[] = [
  {
    type: "NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer",
    name: "Meridian Flip",
    category: CATEGORIES.TRIGGER,
    icon: "flip-horizontal",
    description: "Trigger meridian flip when needed",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.Trigger.Guider.DitherAfterExposures, NINA.Sequencer",
    name: "Dither After Exposures",
    category: CATEGORIES.TRIGGER,
    icon: "shuffle",
    description: "Dither after a number of exposures",
    defaultValues: { AfterExposures: 1 },
  },
  {
    type: "NINA.Sequencer.Trigger.Guider.RestoreGuiding, NINA.Sequencer",
    name: "Restore Guiding",
    category: CATEGORIES.TRIGGER,
    icon: "undo",
    description: "Restore guiding if stopped",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.Trigger.Autofocus.AutofocusAfterExposures, NINA.Sequencer",
    name: "Autofocus After Exposures",
    category: CATEGORIES.TRIGGER,
    icon: "scan",
    description: "Run autofocus after a number of exposures",
    defaultValues: { AfterExposures: 10 },
  },
  {
    type: "NINA.Sequencer.Trigger.Autofocus.AutofocusAfterFilterChange, NINA.Sequencer",
    name: "Autofocus After Filter Change",
    category: CATEGORIES.TRIGGER,
    icon: "disc",
    description: "Run autofocus after filter change",
    defaultValues: {},
  },
  {
    type: "NINA.Sequencer.Trigger.Autofocus.AutofocusAfterHFRIncreaseTrigger, NINA.Sequencer",
    name: "Autofocus After HFR Increase",
    category: CATEGORIES.TRIGGER,
    icon: "trending-up",
    description: "Run autofocus when HFR increases",
    defaultValues: { Amount: 10, SampleSize: 10 },
  },
  {
    type: "NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTemperatureChangeTrigger, NINA.Sequencer",
    name: "Autofocus After Temperature Change",
    category: CATEGORIES.TRIGGER,
    icon: "thermometer",
    description: "Run autofocus when temperature changes",
    defaultValues: { Amount: 2 },
  },
  {
    type: "NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTimeTrigger, NINA.Sequencer",
    name: "Autofocus After Time",
    category: CATEGORIES.TRIGGER,
    icon: "clock",
    description: "Run autofocus after time interval",
    defaultValues: { Amount: 60 },
  },
  {
    type: "NINA.Sequencer.Trigger.Platesolving.CenterAfterDriftTrigger, NINA.Sequencer",
    name: "Center After Drift",
    category: CATEGORIES.TRIGGER,
    icon: "crosshair",
    description: "Re-center when drift exceeds threshold",
    defaultValues: { DistanceArcMinutes: 5 },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getItemDefinition(type: string): ItemDefinition | undefined {
  return (
    SEQUENCE_ITEMS.find((item) => item.type === type) ||
    CONDITION_ITEMS.find((item) => item.type === type) ||
    TRIGGER_ITEMS.find((item) => item.type === type)
  );
}

export function getItemsByCategory(category: string): ItemDefinition[] {
  return SEQUENCE_ITEMS.filter((item) => item.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set<string>();
  SEQUENCE_ITEMS.forEach((item) => categories.add(item.category));
  return Array.from(categories);
}

export function isContainerType(type: string): boolean {
  return type.includes("Container") || type.includes("SmartExposure");
}

// ============================================================================
// Image Types
// ============================================================================

export const IMAGE_TYPES = [
  { value: ImageType.LIGHT, label: "Light" },
  { value: ImageType.DARK, label: "Dark" },
  { value: ImageType.BIAS, label: "Bias" },
  { value: ImageType.FLAT, label: "Flat" },
  { value: ImageType.SNAPSHOT, label: "Snapshot" },
];

// ============================================================================
// Error Behaviors
// ============================================================================

export const ERROR_BEHAVIORS = [
  {
    value: InstructionErrorBehavior.ContinueOnError,
    label: "Continue on Error",
  },
  { value: InstructionErrorBehavior.AbortOnError, label: "Abort on Error" },
  {
    value: InstructionErrorBehavior.SkipInstructionSetOnError,
    label: "Skip Instruction Set",
  },
  {
    value: InstructionErrorBehavior.SkipToSequenceEndInstructions,
    label: "Skip to End",
  },
];

// ============================================================================
// Execution Strategies
// ============================================================================

export const EXECUTION_STRATEGIES = [
  { value: ExecutionStrategyType.Sequential, label: "Sequential" },
  { value: ExecutionStrategyType.Parallel, label: "Parallel" },
];

// ============================================================================
// Comparators
// ============================================================================

export const COMPARATORS = [
  { value: ">=", label: "Greater or Equal (>=)" },
  { value: "<=", label: "Less or Equal (<=)" },
  { value: ">", label: "Greater (>)" },
  { value: "<", label: "Less (<)" },
  { value: "==", label: "Equal (==)" },
];

// ============================================================================
// Tracking Modes
// ============================================================================

export const TRACKING_MODES = [
  { value: 0, label: "Sidereal" },
  { value: 1, label: "Lunar" },
  { value: 2, label: "Solar" },
  { value: 3, label: "King" },
];
