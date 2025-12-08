"use client";

import {
  Box,
  Camera,
  Star,
  Telescope,
  Focus,
  Crosshair,
  Disc,
  RotateCw,
  Sun,
  Moon,
  Shield,
  Plug,
  MessageSquare,
  Terminal,
  Timer,
  Mountain,
  Home,
  Scan,
} from "lucide-react";

export function getItemIcon(type: string) {
  if (type.includes("DeepSkyObject"))
    return <Star className="w-4 h-4 text-yellow-400" />;
  if (type.includes("Sequential"))
    return <Box className="w-4 h-4 text-blue-400" />;
  if (type.includes("Parallel"))
    return <Box className="w-4 h-4 text-purple-400" />;
  if (type.includes("Cool") || type.includes("Warm"))
    return <Sun className="w-4 h-4 text-orange-400" />;
  if (type.includes("Exposure"))
    return <Camera className="w-4 h-4 text-green-400" />;
  if (type.includes("Slew") || type.includes("Park") || type.includes("Unpark"))
    return <Telescope className="w-4 h-4 text-cyan-400" />;
  if (type.includes("Focuser") || type.includes("Autofocus"))
    return <Focus className="w-4 h-4 text-indigo-400" />;
  if (type.includes("Filter"))
    return <Disc className="w-4 h-4 text-pink-400" />;
  if (
    type.includes("Guider") ||
    type.includes("Dither") ||
    type.includes("Center")
  )
    return <Crosshair className="w-4 h-4 text-red-400" />;
  if (type.includes("Rotator"))
    return <RotateCw className="w-4 h-4 text-teal-400" />;
  if (type.includes("Dome")) return <Home className="w-4 h-4 text-amber-400" />;
  if (
    type.includes("Flat") ||
    type.includes("Brightness") ||
    type.includes("Light")
  )
    return <Sun className="w-4 h-4 text-yellow-300" />;
  if (type.includes("Safety"))
    return <Shield className="w-4 h-4 text-emerald-400" />;
  if (type.includes("Switch"))
    return <Plug className="w-4 h-4 text-slate-400" />;
  if (type.includes("Annotation") || type.includes("Message"))
    return <MessageSquare className="w-4 h-4 text-blue-300" />;
  if (type.includes("Script"))
    return <Terminal className="w-4 h-4 text-lime-400" />;
  if (type.includes("Wait") && type.includes("Time"))
    return <Timer className="w-4 h-4 text-orange-300" />;
  if (type.includes("Wait") && type.includes("Altitude"))
    return <Mountain className="w-4 h-4 text-stone-400" />;
  if (type.includes("Moon")) return <Moon className="w-4 h-4 text-slate-300" />;
  if (type.includes("Sun")) return <Sun className="w-4 h-4 text-amber-300" />;
  if (type.includes("Connect") || type.includes("Disconnect"))
    return <Plug className="w-4 h-4 text-green-300" />;
  if (type.includes("Platesolving") || type.includes("Scan"))
    return <Scan className="w-4 h-4 text-violet-400" />;
  return <Box className="w-4 h-4 text-zinc-400" />;
}

interface ItemIconProps {
  type: string;
}

export function ItemIcon({ type }: ItemIconProps) {
  return getItemIcon(type);
}
