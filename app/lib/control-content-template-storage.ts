import { ControlContentTemplate } from '../types/control-content-template';

const STORAGE_KEY = 'control-content-templates';

export function getControlContentTemplates(): ControlContentTemplate[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const templates: ControlContentTemplate[] = stored ? JSON.parse(stored) : [];
    // 既存データの互換性: fieldsプロパティがない場合は空配列を設定
    return templates.map(template => ({
      ...template,
      fields: template.fields || [],
    }));
  } catch {
    return [];
  }
}

export function saveControlContentTemplates(templates: ControlContentTemplate[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save control content templates:', error);
  }
}

export function createControlContentTemplate(template: {
  name: string;
  description?: string;
  fields: Omit<import('../types/control-content-template').ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[];
}): ControlContentTemplate {
  const now = new Date().toISOString();
  const newTemplate: ControlContentTemplate = {
    ...template,
    fields: template.fields.map(field => ({
      ...field,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    })),
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  
  const templates = getControlContentTemplates();
  templates.push(newTemplate);
  saveControlContentTemplates(templates);
  
  return newTemplate;
}

export function updateControlContentTemplate(id: string, updates: {
  name?: string;
  description?: string;
  fields?: Omit<import('../types/control-content-template').ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[];
}): ControlContentTemplate | null {
  const templates = getControlContentTemplates();
  const index = templates.findIndex(template => template.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const now = new Date().toISOString();
  templates[index] = {
    ...templates[index],
    ...updates,
    fields: updates.fields ? updates.fields.map(field => ({
      ...field,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    })) : templates[index].fields,
    updatedAt: now,
  };
  
  saveControlContentTemplates(templates);
  return templates[index];
}

export function deleteControlContentTemplate(id: string): boolean {
  const templates = getControlContentTemplates();
  const filtered = templates.filter(template => template.id !== id);
  
  if (filtered.length === templates.length) {
    return false;
  }
  
  saveControlContentTemplates(filtered);
  return true;
}

export function getControlContentTemplateById(id: string): ControlContentTemplate | null {
  const templates = getControlContentTemplates();
  return templates.find(template => template.id === id) || null;
}

