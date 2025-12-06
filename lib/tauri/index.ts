/**
 * Tauri API wrapper for cross-platform compatibility
 * 
 * This module provides a unified API that works in both web and desktop environments.
 * In desktop mode, it uses Tauri's native capabilities.
 * In web mode, it falls back to browser APIs.
 */

export * from './platform';
export * from './file';
export * from './sequence';
export * from './settings';
export * from './calculator';
export * from './dialog';
export * from './hooks';
export * from './clipboard';
export * from './template';
export * from './backup';
export * from './log';
export * from './nina';
export * from './astronomy';
export * from './import';
export * from './export';
export * from './optimizer';
