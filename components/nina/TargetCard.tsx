'use client';

import { memo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Copy,
  CopyPlus,
  Trash2,
  RotateCcw,
  MoreVertical,
  Target,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  SimpleTarget,
  SequenceEntityStatus,
  formatRA,
  formatDec,
  formatDuration,
} from '@/lib/nina/simple-sequence-types';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface TargetCardProps {
  target: SimpleTarget;
  isSelected: boolean;
  isActive: boolean;
  index: number;
  totalTargets: number;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReset: () => void;
  onCopyExposuresToAll?: () => void;
}

export const TargetCard = memo(function TargetCard({
  target,
  isSelected,
  isActive,
  index,
  totalTargets,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onReset,
  onCopyExposuresToAll,
}: TargetCardProps) {
  const { t } = useI18n();

  // Calculate progress
  const totalExposures = target.exposures.reduce((sum, e) => sum + e.totalCount, 0);
  const completedExposures = target.exposures.reduce((sum, e) => sum + e.progressCount, 0);
  const progressPercent = totalExposures > 0 ? (completedExposures / totalExposures) * 100 : 0;

  // Status badge color
  const getStatusColor = (status: SequenceEntityStatus) => {
    switch (status) {
      case SequenceEntityStatus.RUNNING:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case SequenceEntityStatus.FINISHED:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case SequenceEntityStatus.FAILED:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case SequenceEntityStatus.SKIPPED:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case SequenceEntityStatus.DISABLED:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative rounded-lg border transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm shadow-emerald-500/10'
          : 'border-border hover:border-muted-foreground/30 bg-card hover:bg-muted/30',
        isActive && 'ring-2 ring-blue-500/30'
      )}
    >
      {/* Progress bar at top */}
      {progressPercent > 0 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="p-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Index badge */}
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-medium shrink-0">
              {index + 1}
            </div>
            
            {/* Target info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium truncate">{target.targetName}</h4>
                {target.status !== SequenceEntityStatus.CREATED && (
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getStatusColor(target.status))}>
                    {target.status.toLowerCase()}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {formatRA(target.coordinates)} / {formatDec(target.coordinates)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t.editor.moveUp}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                  disabled={index === totalTargets - 1}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t.editor.moveDown}</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t.common.duplicate}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t.simple?.resetProgress || 'Reset Progress'}
                </DropdownMenuItem>
                {onCopyExposuresToAll && (
                  <DropdownMenuItem onClick={onCopyExposuresToAll}>
                    <CopyPlus className="w-4 h-4 mr-2" />
                    {t.simple?.copyExposuresToAll || 'Copy Exposures to All'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {target.exposures.length} {t.simple?.exposures || 'exposures'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            PA {target.positionAngle.toFixed(1)}°
          </span>
          {target.estimatedDuration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(target.estimatedDuration)}
            </span>
          )}
        </div>

        {/* Progress row (if any progress) */}
        {completedExposures > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Progress value={progressPercent} className="h-1.5 flex-1" />
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
              {completedExposures}/{totalExposures}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
