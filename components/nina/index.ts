// NINA Sequence Editor Components

// ============================================================================
// Main Editor Components
// ============================================================================

// Advanced Editor
export { SequenceEditor } from "./SequenceEditor";
export { SequenceTree } from "./SequenceTree";
export { SequenceToolbox } from "./SequenceToolbox";
export { PropertyPanel } from "./PropertyPanel";
export { OnboardingTour, TourHelpButton } from "./OnboardingTour";
export { WorkflowView } from "./WorkflowView";

// Simple Editor
export { SimpleSequenceEditor } from "./SimpleSequenceEditor";
export { TargetCard } from "./TargetCard";
export { ExposureTable } from "./ExposureTable";
export { StartEndOptions } from "./StartEndOptions";

// ============================================================================
// Sub-module Exports (Organized by Feature)
// ============================================================================

// Simple Editor sub-components
export * from "./simple";

// Workflow View sub-components (React Flow nodes)
export {
  SequenceItemNode as WorkflowSequenceItemNode,
  ContainerNode as WorkflowContainerNode,
  ConditionNode as WorkflowConditionNode,
  TriggerNode as WorkflowTriggerNode,
  AreaStartNode,
  AreaEndNode,
  WorkflowControls,
  WorkflowContextMenu,
  WorkflowShortcutsDialog,
  WorkflowInfoPanel,
} from "./workflow";
export type { ContextMenuState } from "./workflow";

// Editor sub-components
export * from "./editor";

// Tree sub-components (Tree view nodes)
export {
  StatusIcon,
  ItemIcon,
  getItemIcon,
  DropIndicator,
  ConditionNode as TreeConditionNode,
  TriggerNode as TreeTriggerNode,
  SequenceItemNode as TreeSequenceItemNode,
} from "./tree";
export type { SequenceItemNodeProps as TreeSequenceItemNodeProps } from "./tree";

// Property sub-components
export * from "./property";

// Toolbox sub-components
export * from "./toolbox";

// Exposure sub-components
export * from "./exposure";

// Template components
export * from "./template";

// Common/shared components
export * from "./common";

// Tabs
export { SequenceTabs } from "./SequenceTabs";

// Language
export { LanguageSelector } from "./LanguageSelector";

// Template
export { TemplateSelector } from "./TemplateSelector";
