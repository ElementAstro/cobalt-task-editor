/**
 * Template management with Tauri/browser fallback
 */

import { isTauri, invoke } from './platform';
import type { SimpleSequence, SimpleTarget, SimpleExposure } from '../nina/simple-sequence-types';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isBuiltin: boolean;
}

export interface SimpleSequenceTemplate {
  metadata: TemplateMetadata;
  sequence: SimpleSequence;
}

export interface TargetTemplate {
  metadata: TemplateMetadata;
  target: SimpleTarget;
}

export interface ExposureSetTemplate {
  metadata: TemplateMetadata;
  exposures: SimpleExposure[];
}

const TEMPLATES_KEY = 'cobalt-templates';

/**
 * Get templates from localStorage (browser fallback)
 */
function getLocalTemplates<T>(type: string): T[] {
  const data = localStorage.getItem(`${TEMPLATES_KEY}-${type}`);
  return data ? JSON.parse(data) : [];
}

/**
 * Save templates to localStorage (browser fallback)
 */
function saveLocalTemplates<T>(type: string, templates: T[]): void {
  localStorage.setItem(`${TEMPLATES_KEY}-${type}`, JSON.stringify(templates));
}

/**
 * Save simple sequence as template
 */
export async function saveSequenceTemplate(
  name: string,
  description: string,
  category: string,
  tags: string[],
  sequence: SimpleSequence
): Promise<TemplateMetadata> {
  if (isTauri()) {
    return invoke<TemplateMetadata>('save_sequence_template', {
      name, description, category, tags, sequence
    });
  }
  
  // Browser fallback
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const metadata: TemplateMetadata = {
    id, name, description, category,
    createdAt: now, updatedAt: now,
    tags, isBuiltin: false
  };
  
  const template: SimpleSequenceTemplate = { metadata, sequence };
  const templates = getLocalTemplates<SimpleSequenceTemplate>('sequence');
  templates.push(template);
  saveLocalTemplates('sequence', templates);
  
  return metadata;
}

/**
 * Load simple sequence template
 */
export async function loadSequenceTemplate(id: string): Promise<SimpleSequenceTemplate | null> {
  if (isTauri()) {
    try {
      return await invoke<SimpleSequenceTemplate>('load_sequence_template', { id });
    } catch {
      return null;
    }
  }
  
  const templates = getLocalTemplates<SimpleSequenceTemplate>('sequence');
  return templates.find(t => t.metadata.id === id) || null;
}

/**
 * List simple sequence templates
 */
export async function listSequenceTemplates(): Promise<TemplateMetadata[]> {
  if (isTauri()) {
    return invoke<TemplateMetadata[]>('list_sequence_templates');
  }
  
  const templates = getLocalTemplates<SimpleSequenceTemplate>('sequence');
  return templates.map(t => t.metadata);
}

/**
 * Delete simple sequence template
 */
export async function deleteSequenceTemplate(id: string): Promise<void> {
  if (isTauri()) {
    return invoke<void>('delete_sequence_template', { id });
  }
  
  const templates = getLocalTemplates<SimpleSequenceTemplate>('sequence');
  const filtered = templates.filter(t => t.metadata.id !== id);
  saveLocalTemplates('sequence', filtered);
}

/**
 * Save target as template
 */
export async function saveTargetTemplate(
  name: string,
  description: string,
  tags: string[],
  target: SimpleTarget
): Promise<TemplateMetadata> {
  if (isTauri()) {
    return invoke<TemplateMetadata>('save_target_template', {
      name, description, tags, target
    });
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const metadata: TemplateMetadata = {
    id, name, description, category: 'target',
    createdAt: now, updatedAt: now,
    tags, isBuiltin: false
  };
  
  const template: TargetTemplate = { metadata, target };
  const templates = getLocalTemplates<TargetTemplate>('target');
  templates.push(template);
  saveLocalTemplates('target', templates);
  
  return metadata;
}

/**
 * Load target template
 */
export async function loadTargetTemplate(id: string): Promise<TargetTemplate | null> {
  if (isTauri()) {
    try {
      return await invoke<TargetTemplate>('load_target_template', { id });
    } catch {
      return null;
    }
  }
  
  const templates = getLocalTemplates<TargetTemplate>('target');
  return templates.find(t => t.metadata.id === id) || null;
}

/**
 * List target templates
 */
export async function listTargetTemplates(): Promise<TemplateMetadata[]> {
  if (isTauri()) {
    return invoke<TemplateMetadata[]>('list_target_templates');
  }
  
  const templates = getLocalTemplates<TargetTemplate>('target');
  return templates.map(t => t.metadata);
}

/**
 * Save exposure set as template
 */
export async function saveExposureTemplate(
  name: string,
  description: string,
  tags: string[],
  exposures: SimpleExposure[]
): Promise<TemplateMetadata> {
  if (isTauri()) {
    return invoke<TemplateMetadata>('save_exposure_template', {
      name, description, tags, exposures
    });
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const metadata: TemplateMetadata = {
    id, name, description, category: 'exposure',
    createdAt: now, updatedAt: now,
    tags, isBuiltin: false
  };
  
  const template: ExposureSetTemplate = { metadata, exposures };
  const templates = getLocalTemplates<ExposureSetTemplate>('exposure');
  templates.push(template);
  saveLocalTemplates('exposure', templates);
  
  return metadata;
}

/**
 * Load exposure set template
 */
export async function loadExposureTemplate(id: string): Promise<ExposureSetTemplate | null> {
  if (isTauri()) {
    try {
      return await invoke<ExposureSetTemplate>('load_exposure_template', { id });
    } catch {
      return null;
    }
  }
  
  const templates = getLocalTemplates<ExposureSetTemplate>('exposure');
  return templates.find(t => t.metadata.id === id) || null;
}

/**
 * List exposure set templates
 */
export async function listExposureTemplates(): Promise<TemplateMetadata[]> {
  if (isTauri()) {
    return invoke<TemplateMetadata[]>('list_exposure_templates');
  }
  
  const templates = getLocalTemplates<ExposureSetTemplate>('exposure');
  return templates.map(t => t.metadata);
}

/**
 * Apply target template (returns new target with new ID)
 */
export async function applyTargetTemplate(id: string): Promise<SimpleTarget | null> {
  if (isTauri()) {
    try {
      return await invoke<SimpleTarget>('apply_target_template', { id });
    } catch {
      return null;
    }
  }
  
  const template = await loadTargetTemplate(id);
  if (!template) return null;
  
  const target = { ...template.target };
  target.id = crypto.randomUUID();
  target.exposures = target.exposures.map(e => ({
    ...e,
    id: crypto.randomUUID(),
    progressCount: 0,
  }));
  
  return target;
}

/**
 * Apply exposure set template (returns new exposures with new IDs)
 */
export async function applyExposureTemplate(id: string): Promise<SimpleExposure[] | null> {
  if (isTauri()) {
    try {
      return await invoke<SimpleExposure[]>('apply_exposure_template', { id });
    } catch {
      return null;
    }
  }
  
  const template = await loadExposureTemplate(id);
  if (!template) return null;
  
  return template.exposures.map(e => ({
    ...e,
    id: crypto.randomUUID(),
    progressCount: 0,
  }));
}
