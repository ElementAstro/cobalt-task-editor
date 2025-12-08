"use client";

import { Play, CheckCircle, XCircle, Clock, Ban } from "lucide-react";
import type { SequenceEntityStatus } from "@/lib/nina/types";

interface StatusIconProps {
  status: SequenceEntityStatus;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const baseClass = className || "w-3 h-3";

  switch (status) {
    case "RUNNING":
      return <Play className={`${baseClass} text-blue-400 animate-pulse`} />;
    case "FINISHED":
      return <CheckCircle className={`${baseClass} text-green-400`} />;
    case "FAILED":
      return <XCircle className={`${baseClass} text-red-400`} />;
    case "SKIPPED":
      return <Clock className={`${baseClass} text-yellow-400`} />;
    case "DISABLED":
      return <Ban className={`${baseClass} text-zinc-500`} />;
    default:
      return null;
  }
}
