import { ControlContentTemplate } from '../types/control-content-template';
import { getEvaluationItems, updateEvaluationItem } from './storage';

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
  const updatedTemplate: ControlContentTemplate = {
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
  saveControlContentTemplates(templates);
  
  // フィールドが更新された場合、既存の統制内容にも反映
  if (updates.fields) {
    syncControlContentToTemplate(updatedTemplate);
  }
  
  return templates[index];
}

// テンプレートの変更を既存の統制内容に反映する
function syncControlContentToTemplate(template: ControlContentTemplate): void {
  const items = getEvaluationItems();
  const now = new Date().toISOString();
  
  items.forEach(item => {
    if (!item.controlContents || item.controlContents.length === 0) {
      return;
    }
    
    let hasChanges = false;
    const updatedControlContents = item.controlContents.map(cc => {
      // テンプレートのフィールドと既存のフィールドを比較
      const templateFieldLabels = template.fields.map(f => f.label);
      const existingFieldLabels = cc.fields.map(f => f.label);
      
      // フィールドの追加・削除が必要かチェック
      const needsSync = 
        templateFieldLabels.length !== existingFieldLabels.length ||
        !templateFieldLabels.every(label => existingFieldLabels.includes(label));
      
      if (!needsSync) {
        return cc;
      }
      
      hasChanges = true;
      
      // 既存のフィールドをマップに変換（labelをキーとして保持）
      const existingFieldsMap = new Map(
        cc.fields.map(field => [field.label, field])
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
            evaluationValue: templateField.type === 'evaluation' ? {
              ...templateField.evaluationDefaults,
            } : undefined,
            createdAt: now,
            updatedAt: now,
          };
        }
      });
      
      return {
        ...cc,
        fields: newFields,
        updatedAt: now,
      };
    });
    
    if (hasChanges) {
      updateEvaluationItem(item.id, { controlContents: updatedControlContents });
    }
  });
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

