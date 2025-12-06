/**
 * Logging with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  category: string;
  message: string;
  details?: Record<string, unknown>;
}

const LOG_BUFFER: LogEntry[] = [];
const MAX_BUFFER_SIZE = 500;

/**
 * Add log entry to buffer
 */
function addToBuffer(entry: LogEntry): void {
  LOG_BUFFER.push(entry);
  if (LOG_BUFFER.length > MAX_BUFFER_SIZE) {
    LOG_BUFFER.shift();
  }
}

/**
 * Log debug message
 */
export async function logDebug(category: string, message: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('log_debug', { category, message });
  }
  
  console.debug(`[${category}]`, message);
  addToBuffer({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'debug',
    category,
    message,
  });
}

/**
 * Log info message
 */
export async function logInfo(category: string, message: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('log_info', { category, message });
  }
  
  console.info(`[${category}]`, message);
  addToBuffer({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'info',
    category,
    message,
  });
}

/**
 * Log warning message
 */
export async function logWarning(category: string, message: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('log_warning', { category, message });
  }
  
  console.warn(`[${category}]`, message);
  addToBuffer({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'warning',
    category,
    message,
  });
}

/**
 * Log error message
 */
export async function logError(category: string, message: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('log_error', { category, message });
  }
  
  console.error(`[${category}]`, message);
  addToBuffer({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level: 'error',
    category,
    message,
  });
}

/**
 * Log with details
 */
export async function logWithDetails(
  level: 'debug' | 'info' | 'warning' | 'error',
  category: string,
  message: string,
  details: Record<string, unknown>
): Promise<void> {
  if (isTauri()) {
    return invoke<void>('log_with_details', { level, category, message, details });
  }
  
  const logFn = level === 'error' ? console.error 
    : level === 'warning' ? console.warn 
    : level === 'debug' ? console.debug 
    : console.info;
  
  logFn(`[${category}]`, message, details);
  addToBuffer({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
  });
}

/**
 * Log operation
 */
export async function logOperation(
  operation: string,
  target: string,
  success: boolean,
  error?: string
): Promise<void> {
  if (isTauri()) {
    return invoke<void>('log_operation', { operation, target, success, error });
  }
  
  const level = success ? 'info' : 'error';
  const message = success 
    ? `${operation} completed: ${target}`
    : `${operation} failed: ${target} - ${error || 'Unknown error'}`;
  
  await logWithDetails(level, 'operation', message, {
    operation,
    target,
    success,
    error,
  });
}

/**
 * Get recent logs
 */
export async function getRecentLogs(
  count: number = 100,
  levelFilter?: 'debug' | 'info' | 'warning' | 'error'
): Promise<LogEntry[]> {
  if (isTauri()) {
    return invoke<LogEntry[]>('get_recent_logs', { count, levelFilter });
  }
  
  let logs = [...LOG_BUFFER].reverse();
  
  if (levelFilter) {
    logs = logs.filter(l => l.level === levelFilter);
  }
  
  return logs.slice(0, count);
}

/**
 * Get logs by category
 */
export async function getLogsByCategory(
  category: string,
  count: number = 100
): Promise<LogEntry[]> {
  if (isTauri()) {
    return invoke<LogEntry[]>('get_logs_by_category', { category, count });
  }
  
  return LOG_BUFFER
    .filter(l => l.category === category)
    .reverse()
    .slice(0, count);
}

/**
 * Clear log buffer
 */
export async function clearLogBuffer(): Promise<void> {
  if (isTauri()) {
    return invoke<void>('clear_log_buffer');
  }
  
  LOG_BUFFER.length = 0;
}

/**
 * Flush logs to file (Tauri only)
 */
export async function flushLogs(): Promise<number> {
  if (isTauri()) {
    return invoke<number>('flush_logs');
  }
  return 0;
}

/**
 * Read log file (Tauri only)
 */
export async function readLogFile(date: string): Promise<string> {
  if (isTauri()) {
    return invoke<string>('read_log_file', { date });
  }
  return '';
}

/**
 * List log files (Tauri only)
 */
export async function listLogFiles(): Promise<string[]> {
  if (isTauri()) {
    return invoke<string[]>('list_log_files');
  }
  return [];
}
