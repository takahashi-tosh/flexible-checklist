import { SupplementalInfoTemplate } from '../types/supplemental-info-template';
import { getEvaluationItems, updateEvaluationItem } from './storage';

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
  const updatedTemplate: SupplementalInfoTemplate = {
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
  
  templates[index] = updatedTemplate;
  saveSupplementalInfoTemplates(templates);
  
  // フィールドが更新された場合、既存の補足情報にも反映
  if (updates.fields) {
    syncSupplementalInfoToTemplate(updatedTemplate);
  }
  
  return templates[index];
}

// テンプレートの変更を既存の補足情報に反映する
function syncSupplementalInfoToTemplate(template: SupplementalInfoTemplate): void {
  const items = getEvaluationItems();
  const now = new Date().toISOString();
  
  items.forEach(item => {
    if (!item.supplementalInfo || !item.supplementalInfo.fields) {
      return;
    }
    
    // テンプレートのフィールドと既存のフィールドを比較
    const templateFieldLabels = template.fields.map(f => f.label);
    const existingFieldLabels = item.supplementalInfo.fields.map(f => f.label);
    
    // フィールドの追加・削除が必要かチェック
    const needsSync = 
      templateFieldLabels.length !== existingFieldLabels.length ||
      !templateFieldLabels.every(label => existingFieldLabels.includes(label));
    
    if (!needsSync) {
      return;
    }
    
    // 既存のフィールドをマップに変換（labelをキーとして保持）
    const existingFieldsMap = new Map(
      item.supplementalInfo.fields.map(field => [field.label, field])
    );
    
    // テンプレートに基づいて新しいフィールド配列を作成
    const newFields = template.fields.map(templateField => {
      const existingField = existingFieldsMap.get(templateField.label);
      
      if (existingField) {
        // 既存のフィールドがある場合は、データを保持してtypeを更新
        return {
          ...existingField,
          type: templateField.type,
          updatedAt: now,
        };
      } else {
        // 新しいフィールドの場合は、テンプレートから作成
        return {
          id: crypto.randomUUID(),
          label: templateField.label,
          type: templateField.type,
          value: undefined,
          createdAt: now,
          updatedAt: now,
        };
      }
    });
    
    const updatedSupplementalInfo = {
      ...item.supplementalInfo,
      fields: newFields,
    };
    
    updateEvaluationItem(item.id, { supplementalInfo: updatedSupplementalInfo });
  });
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

