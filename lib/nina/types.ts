// NINA Sequence Editor - Type Definitions
// Based on N.I.N.A. (Nighttime Imaging 'N' Astronomy) Sequencer

// ============================================================================
// Enums
// ============================================================================

export type SequenceEntityStatus = 
  | 'CREATED'
  | 'RUNNING'
  | 'FINISHED'
  | 'FAILED'
  | 'SKIPPED'
  | 'DISABLED';

export enum InstructionErrorBehavior {
  ContinueOnError = 'ContinueOnError',
  AbortOnError = 'AbortOnError',
  SkipInstructionSetOnError = 'SkipInstructionSetOnError',
  SkipToSequenceEndInstructions = 'SkipToSequenceEndInstructions',
}

export enum ExecutionStrategyType {
  Sequential = 'Sequential',
  Parallel = 'Parallel',
}

export enum ImageType {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  BIAS = 'BIAS',
  FLAT = 'FLAT',
  SNAPSHOT = 'SNAPSHOT',
}

// ============================================================================
// Base Interfaces
// ============================================================================

export interface ISequenceEntity {
  $id: string;
  $type: string;
  Name: string | null;
  Description?: string;
  Category?: string;
  Status?: SequenceEntityStatus;
  Parent?: { $ref: string } | null;
}

export interface ISequenceItem extends ISequenceEntity {
  ErrorBehavior?: InstructionErrorBehavior;
  Attempts?: number;
}

export interface ISequenceCondition extends ISequenceEntity {
  AllowMultiplePerSet?: boolean;
}

export interface ISequenceTrigger extends ISequenceEntity {
  AllowMultiplePerSet?: boolean;
  TriggerRunner?: ISequenceContainer;
}

// ============================================================================
// Execution Strategy
// ============================================================================

export interface IExecutionStrategy {
  $type: string;
}

export interface SequentialStrategy extends IExecutionStrategy {
  $type: 'NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer';
}

export interface ParallelStrategy extends IExecutionStrategy {
  $type: 'NINA.Sequencer.Container.ExecutionStrategy.ParallelStrategy, NINA.Sequencer';
}

// ============================================================================
// Containers
// ============================================================================

export interface ISequenceContainer extends ISequenceItem {
  Strategy: IExecutionStrategy;
  Items: {
    $id: string;
    $type: string;
    $values: ISequenceItem[];
  };
  Conditions: {
    $id: string;
    $type: string;
    $values: ISequenceCondition[];
  };
  Triggers: {
    $id: string;
    $type: string;
    $values: ISequenceTrigger[];
  };
  IsExpanded?: boolean;
}

export interface ISequentialContainer extends ISequenceContainer {
  $type: 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer';
}

export interface IParallelContainer extends ISequenceContainer {
  $type: 'NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer';
}

export interface ISequenceRootContainer extends ISequenceContainer {
  $type: 'NINA.Sequencer.Container.SequenceRootContainer, NINA.Sequencer';
  SequenceTitle?: string;
}

// ============================================================================
// Coordinates & Target
// ============================================================================

export interface InputCoordinates {
  $id: string;
  $type: 'NINA.Astrometry.InputCoordinates, NINA.Astrometry';
  RAHours: number;
  RAMinutes: number;
  RASeconds: number;
  DecDegrees: number;
  DecMinutes: number;
  DecSeconds: number;
  NegativeDec?: boolean;
}

export interface InputTarget {
  $id: string;
  $type: 'NINA.Astrometry.InputTarget, NINA.Astrometry';
  Expanded?: boolean;
  TargetName: string;
  PositionAngle?: number;
  Rotation?: number;
  InputCoordinates: InputCoordinates;
}

export interface IDeepSkyObjectContainer extends ISequenceContainer {
  $type: 'NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer';
  Target: InputTarget;
  ExposureInfoListExpanded?: boolean;
  ExposureInfoList?: ExposureInfo[];
}

export interface ExposureInfo {
  Filter: string;
  ExposureTime: number;
  Gain: number;
  Offset: number;
  ImageType: string;
  BinningX: number;
  BinningY: number;
  ROI: number;
  Count: number;
}

// ============================================================================
// Binning Mode
// ============================================================================

export interface BinningMode {
  $id?: string;
  $type: 'NINA.Core.Model.Equipment.BinningMode, NINA.Core';
  X: number;
  Y: number;
}

// ============================================================================
// Sequence Items - Camera
// ============================================================================

export interface ICoolCamera extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Camera.CoolCamera, NINA.Sequencer';
  Temperature: number;
  Duration: number;
}

export interface IWarmCamera extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Camera.WarmCamera, NINA.Sequencer';
  Duration: number;
}

export interface ISetReadoutMode extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Camera.SetReadoutMode, NINA.Sequencer';
  Mode: number;
}

export interface IDewHeater extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Camera.DewHeater, NINA.Sequencer';
  OnOff: boolean;
}

export interface ISetUSBLimit extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Camera.SetUSBLimit, NINA.Sequencer';
  USBLimit: number;
}

// ============================================================================
// Sequence Items - Imaging
// ============================================================================

export interface ITakeExposure extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Imaging.TakeExposure, NINA.Sequencer';
  ExposureTime: number;
  Gain: number;
  Offset: number;
  Binning: BinningMode;
  ImageType: string;
  ExposureCount: number;
}

export interface ITakeManyExposures extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Imaging.TakeManyExposures, NINA.Sequencer';
  ExposureTime: number;
  Gain: number;
  Offset: number;
  Binning: BinningMode;
  ImageType: string;
  ExposureCount: number;
  TotalExposureCount: number;
}

export interface ISmartExposure extends ISequenceContainer {
  $type: 'NINA.Sequencer.SequenceItem.Imaging.SmartExposure, NINA.Sequencer';
}

// ============================================================================
// Sequence Items - Telescope
// ============================================================================

export interface ISlewScopeToRaDec extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Telescope.SlewScopeToRaDec, NINA.Sequencer';
  Coordinates?: InputCoordinates;
  Inherited?: boolean;
}

export interface ISlewScopeToAltAz extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Telescope.SlewScopeToAltAz, NINA.Sequencer';
  Altitude: number;
  Azimuth: number;
}

export interface IParkScope extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Telescope.ParkScope, NINA.Sequencer';
}

export interface IUnparkScope extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Telescope.UnparkScope, NINA.Sequencer';
}

export interface IFindHome extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Telescope.FindHome, NINA.Sequencer';
}

export interface ISetTracking extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Telescope.SetTracking, NINA.Sequencer';
  TrackingMode: number;
}

// ============================================================================
// Sequence Items - Focuser
// ============================================================================

export interface IMoveFocuserAbsolute extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserAbsolute, NINA.Sequencer';
  Position: number;
}

export interface IMoveFocuserRelative extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserRelative, NINA.Sequencer';
  RelativePosition: number;
}

export interface IMoveFocuserByTemperature extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Focuser.MoveFocuserByTemperature, NINA.Sequencer';
  Slope: number;
  Intercept: number;
}

// ============================================================================
// Sequence Items - Filter Wheel
// ============================================================================

export interface ISwitchFilter extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.FilterWheel.SwitchFilter, NINA.Sequencer';
  Filter: FilterInfo | null;
}

export interface FilterInfo {
  $id?: string;
  $type?: string;
  Name: string;
  Position?: number;
  FocusOffset?: number;
  AutoFocusExposureTime?: number;
}

// ============================================================================
// Sequence Items - Guider
// ============================================================================

export interface IStartGuiding extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Guider.StartGuiding, NINA.Sequencer';
  ForceCalibration?: boolean;
}

export interface IStopGuiding extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Guider.StopGuiding, NINA.Sequencer';
}

export interface IDither extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Guider.Dither, NINA.Sequencer';
}

// ============================================================================
// Sequence Items - Autofocus
// ============================================================================

export interface IRunAutofocus extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Autofocus.RunAutofocus, NINA.Sequencer';
}

// ============================================================================
// Sequence Items - Platesolving
// ============================================================================

export interface ICenter extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Platesolving.Center, NINA.Sequencer';
  Coordinates?: InputCoordinates;
  Inherited?: boolean;
}

export interface ICenterAndRotate extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Platesolving.CenterAndRotate, NINA.Sequencer';
  Coordinates?: InputCoordinates;
  Rotation?: number;
  Inherited?: boolean;
}

// ============================================================================
// Sequence Items - Rotator
// ============================================================================

export interface IMoveRotatorAbsolute extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorAbsolute, NINA.Sequencer';
  Position: number;
}

export interface IMoveRotatorRelative extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorRelative, NINA.Sequencer';
  RelativePosition: number;
}

export interface IMoveRotatorMechanical extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Rotator.MoveRotatorMechanical, NINA.Sequencer';
  MechanicalPosition: number;
}

// ============================================================================
// Sequence Items - Dome
// ============================================================================

export interface IOpenDomeShutter extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Dome.OpenDomeShutter, NINA.Sequencer';
}

export interface ICloseDomeShutter extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Dome.CloseDomeShutter, NINA.Sequencer';
}

export interface IParkDome extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Dome.ParkDome, NINA.Sequencer';
}

export interface ISynchronizeDome extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Dome.SynchronizeDome, NINA.Sequencer';
}

export interface IEnableDomeSynchronization extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Dome.EnableDomeSynchronization, NINA.Sequencer';
}

export interface IDisableDomeSynchronization extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Dome.DisableDomeSynchronization, NINA.Sequencer';
}

export interface ISlewDomeAbsolute extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Dome.SlewDomeAbsolute, NINA.Sequencer';
  Azimuth: number;
}

// ============================================================================
// Sequence Items - Flat Device
// ============================================================================

export interface ISetBrightness extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.FlatDevice.SetBrightness, NINA.Sequencer';
  Brightness: number;
}

export interface IToggleLight extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.FlatDevice.ToggleLight, NINA.Sequencer';
  OnOff: boolean;
}

export interface IOpenCover extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.FlatDevice.OpenCover, NINA.Sequencer';
}

export interface ICloseCover extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.FlatDevice.CloseCover, NINA.Sequencer';
}

// ============================================================================
// Sequence Items - Safety Monitor
// ============================================================================

export interface IWaitUntilSafe extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.SafetyMonitor.WaitUntilSafe, NINA.Sequencer';
}

// ============================================================================
// Sequence Items - Switch
// ============================================================================

export interface ISetSwitchValue extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Switch.SetSwitchValue, NINA.Sequencer';
  SwitchIndex: number;
  Value: number;
}

// ============================================================================
// Sequence Items - Utility
// ============================================================================

export interface IAnnotation extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.Annotation, NINA.Sequencer';
  Text: string;
}

export interface IMessageBox extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.MessageBox, NINA.Sequencer';
  Text: string;
}

export interface IExternalScript extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.ExternalScript, NINA.Sequencer';
  Script: string;
}

export interface IWaitForTime extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.WaitForTime, NINA.Sequencer';
  Hours: number;
  Minutes: number;
  Seconds: number;
  SelectedProvider?: IDateTimeProvider;
}

export interface IWaitForTimeSpan extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.WaitForTimeSpan, NINA.Sequencer';
  Time: number;
}

export interface IWaitForAltitude extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.WaitForAltitude, NINA.Sequencer';
  Coordinates?: InputCoordinates;
  TargetAltitude: number;
  Comparator: string;
}

export interface IWaitForMoonAltitude extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.WaitForMoonAltitude, NINA.Sequencer';
  TargetAltitude: number;
  Comparator: string;
}

export interface IWaitForSunAltitude extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.WaitForSunAltitude, NINA.Sequencer';
  TargetAltitude: number;
  Comparator: string;
}

export interface IWaitUntilAboveHorizon extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.WaitUntilAboveHorizon, NINA.Sequencer';
  Coordinates?: InputCoordinates;
  Offset: number;
}

export interface ISaveSequence extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Utility.SaveSequence, NINA.Sequencer';
  FilePath: string;
}

// ============================================================================
// Sequence Items - Connect
// ============================================================================

export interface IConnectEquipment extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Connect.ConnectEquipment, NINA.Sequencer';
}

export interface IDisconnectEquipment extends ISequenceItem {
  $type: 'NINA.Sequencer.SequenceItem.Connect.DisconnectEquipment, NINA.Sequencer';
}

// ============================================================================
// Conditions
// ============================================================================

export interface ILoopCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.LoopCondition, NINA.Sequencer';
  Iterations: number;
  CompletedIterations: number;
}

export interface ITimeCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.TimeCondition, NINA.Sequencer';
  Hours: number;
  Minutes: number;
  Seconds: number;
  SelectedProvider?: IDateTimeProvider;
}

export interface ITimeSpanCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.TimeSpanCondition, NINA.Sequencer';
  Hours: number;
  Minutes: number;
  Seconds: number;
}

export interface IAltitudeCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.AltitudeCondition, NINA.Sequencer';
  Coordinates?: InputCoordinates;
  TargetAltitude: number;
  Comparator: string;
}

export interface IAboveHorizonCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.AboveHorizonCondition, NINA.Sequencer';
  Coordinates?: InputCoordinates;
  Offset: number;
}

export interface IMoonAltitudeCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.MoonAltitudeCondition, NINA.Sequencer';
  TargetAltitude: number;
  Comparator: string;
}

export interface ISunAltitudeCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.SunAltitudeCondition, NINA.Sequencer';
  TargetAltitude: number;
  Comparator: string;
}

export interface IMoonIlluminationCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.MoonIlluminationCondition, NINA.Sequencer';
  TargetIllumination: number;
  Comparator: string;
}

export interface ISafetyMonitorCondition extends ISequenceCondition {
  $type: 'NINA.Sequencer.Conditions.SafetyMonitorCondition, NINA.Sequencer';
}

// ============================================================================
// Triggers
// ============================================================================

export interface IMeridianFlipTrigger extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.MeridianFlip.MeridianFlipTrigger, NINA.Sequencer';
}

export interface IDitherAfterExposures extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Guider.DitherAfterExposures, NINA.Sequencer';
  AfterExposures: number;
}

export interface IRestoreGuiding extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Guider.RestoreGuiding, NINA.Sequencer';
}

export interface IAutofocusAfterExposures extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterExposures, NINA.Sequencer';
  AfterExposures: number;
}

export interface IAutofocusAfterFilterChange extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterFilterChange, NINA.Sequencer';
}

export interface IAutofocusAfterHFRIncreaseTrigger extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterHFRIncreaseTrigger, NINA.Sequencer';
  Amount: number;
  SampleSize: number;
}

export interface IAutofocusAfterTemperatureChangeTrigger extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTemperatureChangeTrigger, NINA.Sequencer';
  Amount: number;
}

export interface IAutofocusAfterTimeTrigger extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Autofocus.AutofocusAfterTimeTrigger, NINA.Sequencer';
  Amount: number;
}

export interface ICenterAfterDriftTrigger extends ISequenceTrigger {
  $type: 'NINA.Sequencer.Trigger.Platesolving.CenterAfterDriftTrigger, NINA.Sequencer';
  DistanceArcMinutes: number;
}

// ============================================================================
// DateTime Providers
// ============================================================================

export interface IDateTimeProvider {
  $type: string;
  Name?: string;
}

// ============================================================================
// Editor-specific Types (not serialized to NINA format)
// ============================================================================

export interface EditorSequenceItem {
  id: string;
  type: string;
  name: string;
  category: string;
  icon?: string;
  description?: string;
  status: SequenceEntityStatus;
  isExpanded?: boolean;
  data: Record<string, unknown>;
  items?: EditorSequenceItem[];
  conditions?: EditorCondition[];
  triggers?: EditorTrigger[];
}

export interface EditorCondition {
  id: string;
  type: string;
  name: string;
  category: string;
  icon?: string;
  data: Record<string, unknown>;
}

export interface EditorTrigger {
  id: string;
  type: string;
  name: string;
  category: string;
  icon?: string;
  data: Record<string, unknown>;
  triggerItems?: EditorSequenceItem[];
}

export interface EditorTarget {
  name: string;
  ra: { hours: number; minutes: number; seconds: number };
  dec: { degrees: number; minutes: number; seconds: number; negative: boolean };
  rotation: number;
}

export interface EditorSequence {
  id: string;
  title: string;
  startItems: EditorSequenceItem[];
  targetItems: EditorSequenceItem[];
  endItems: EditorSequenceItem[];
  globalTriggers: EditorTrigger[];
}

// ============================================================================
// Type Guards
// ============================================================================

export function isSequenceContainer(item: ISequenceItem): item is ISequenceContainer {
  return 'Items' in item && 'Strategy' in item;
}

export function isDeepSkyObjectContainer(item: ISequenceItem): item is IDeepSkyObjectContainer {
  return item.$type === 'NINA.Sequencer.Container.DeepSkyObjectContainer, NINA.Sequencer';
}

export function isSequentialContainer(item: ISequenceItem): item is ISequentialContainer {
  return item.$type === 'NINA.Sequencer.Container.SequentialContainer, NINA.Sequencer';
}

export function isParallelContainer(item: ISequenceItem): item is IParallelContainer {
  return item.$type === 'NINA.Sequencer.Container.ParallelContainer, NINA.Sequencer';
}
