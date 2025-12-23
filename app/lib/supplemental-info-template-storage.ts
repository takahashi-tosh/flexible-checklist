import { SupplementalInfoTemplate } from '../types/supplemental-info-template';

const STORAGE_KEY = 'supplemental-info-templates';

export function getSupplementalInfoTemplates(): SupplementalInfoTemplate[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const templates: SupplementalInfoTemplate[] = stored ? JSON.parse(stored) : [];
    // 既存データの互換性: fieldsプロパティがない場合は空配列を設定
    return templates.map(template => ({
      ...template,
      fields: template.fields || [],
    }));
  } catch {
    return [];
  }
}

export function saveSupplementalInfoTemplates(templates: SupplementalInfoTemplate[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save supplemental info templates:', error);
  }
}

export function createSupplementalInfoTemplate(template: {
  name: string;
  description?: string;
  fields: Omit<import('../types/supplemental-info-template').SupplementalInfoFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[];
}): SupplementalInfoTemplate {
  const now = new Date().toISOString();
  const newTemplate: SupplementalInfoTemplate = {
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
  
  const templates = getSupplementalInfoTemplates();
  templates.push(newTemplate);
  saveSupplementalInfoTemplates(templates);
  
  return newTemplate;
}

export function updateSupplementalInfoTemplate(id: string, updates: {
  name?: string;
  description?: string;
  fields?: Omit<import('../types/supplemental-info-template').SupplementalInfoFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[];
}): SupplementalInfoTemplate | null {
  const templates = getSupplementalInfoTemplates();
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
  
  saveSupplementalInfoTemplates(templates);
  return templates[index];
}

export function deleteSupplementalInfoTemplate(id: string): boolean {
  const templates = getSupplementalInfoTemplates();
  const filtered = templates.filter(template => template.id !== id);
  
  if (filtered.length === templates.length) {
    return false;
  }
  
  saveSupplementalInfoTemplates(filtered);
  return true;
}

export function getSupplementalInfoTemplateById(id: string): SupplementalInfoTemplate | null {
  const templates = getSupplementalInfoTemplates();
  return templates.find(template => template.id === id) || null;
}

