"use client";

import {
  Box,
  Camera,
  Focus,
  Disc,
  Crosshair,
  Scan,
  RotateCw,
  RotateCcw,
  Home as HomeIcon,
  Sun,
  Moon,
  Shield,
  ToggleRight,
  Plug,
  Repeat,
  Clock,
  Timer,
  Mountain,
  Sunrise,
  Thermometer,
  Snowflake,
  Flame,
  Usb,
  Sparkles,
  Compass,
  ParkingSquare,
  ParkingSquareOff,
  Target,
  MoveVertical,
  CircleStop,
  Shuffle,
  Rotate3d,
  Cog,
  DoorOpen,
  DoorClosed,
  RefreshCw,
  Link,
  Unlink,
  Lightbulb,
  Package,
  MessageSquare,
  MessageCircle,
  Terminal,
  Save,
  PlugZap,
  Circle,
  FlipHorizontal,
  Undo,
  TrendingUp,
  Zap,
  Star,
  GitBranch,
  ListOrdered,
  Settings,
  Images,
} from "lucide-react";

// Icon mapping - comprehensive mapping for all NINA sequence item types
export const iconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  // Containers
  "list-ordered": ListOrdered,
  "git-branch": GitBranch,
  star: Star,

  // Camera
  "thermometer-snowflake": Snowflake,
  "thermometer-sun": Thermometer,
  settings: Settings,
  flame: Flame,
  usb: Usb,
  camera: Camera,

  // Imaging
  images: Images,
  sparkles: Sparkles,

  // Telescope
  compass: Compass,
  "square-parking": ParkingSquare,
  "square-parking-off": ParkingSquareOff,
  home: HomeIcon,
  target: Target,

  // Focuser
  focus: Focus,
  "move-vertical": MoveVertical,
  thermometer: Thermometer,

  // Filter Wheel
  disc: Disc,

  // Guider
  crosshair: Crosshair,
  "circle-stop": CircleStop,
  shuffle: Shuffle,

  // Autofocus
  scan: Scan,

  // Platesolving
  "rotate-3d": Rotate3d,

  // Rotator
  "rotate-cw": RotateCw,
  "rotate-ccw": RotateCcw,
  cog: Cog,

  // Dome
  "door-open": DoorOpen,
  "door-closed": DoorClosed,
  "refresh-cw": RefreshCw,

  // Connection
  link: Link,
  unlink: Unlink,
  plug: Plug,
  "plug-zap": PlugZap,

  // Flat Device
  sun: Sun,
  lightbulb: Lightbulb,
  box: Box,
  package: Package,

  // Safety
  "shield-check": Shield,

  // Switch
  "toggle-right": ToggleRight,

  // Utility
  "message-square": MessageSquare,
  "message-circle": MessageCircle,
  terminal: Terminal,
  clock: Clock,
  timer: Timer,
  mountain: Mountain,
  moon: Moon,
  sunrise: Sunrise,
  save: Save,

  // Conditions
  repeat: Repeat,
  circle: Circle,

  // Triggers
  "flip-horizontal": FlipHorizontal,
  undo: Undo,
  "trending-up": TrendingUp,
  zap: Zap,
};

export function getIcon(
  iconName?: string,
): React.ComponentType<{ className?: string }> {
  if (!iconName) return Box;
  return iconMap[iconName] || Box;
}
