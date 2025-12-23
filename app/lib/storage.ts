import { EvaluationItem } from '../types/evaluation-item';
import { ControlContent } from '../types/control-content';

const STORAGE_KEY = 'evaluation-items';

export function getEvaluationItems(): EvaluationItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const items: EvaluationItem[] = stored ? JSON.parse(stored) : [];
    
    // 既存データの互換性処理
    return items.map(item => {
      let updatedItem = { ...item };

      // 補足情報のフィールドにcreatedAtとupdatedAtがない場合は追加
      if (updatedItem.supplementalInfo?.fields) {
        const normalizedFields = updatedItem.supplementalInfo.fields.map(field => {
          if (!field.createdAt || !field.updatedAt) {
            const now = new Date().toISOString();
            return {
              ...field,
              createdAt: field.createdAt || now,
              updatedAt: field.updatedAt || now,
            };
          }
          return field;
        });
        updatedItem = {
          ...updatedItem,
          supplementalInfo: {
            ...updatedItem.supplementalInfo,
            fields: normalizedFields,
          },
        };
      }

      // 統制内容の旧形式（content、reviewer、propertyType）をフィールド配列に変換
      if (updatedItem.controlContents) {
        const now = new Date().toISOString();
        updatedItem = {
          ...updatedItem,
          controlContents: updatedItem.controlContents.map(cc => {
            // 既にfieldsがある場合はそのまま返す
            if (cc.fields && Array.isArray(cc.fields)) {
              // フィールドにcreatedAtとupdatedAtがない場合は追加
              const normalizedFields = cc.fields.map(field => {
                if (!field.createdAt || !field.updatedAt) {
                  return {
                    ...field,
                    createdAt: field.createdAt || now,
                    updatedAt: field.updatedAt || now,
                  };
                }
                return field;
              });
              return {
                ...cc,
                fields: normalizedFields,
              };
            }

            // 旧形式の場合はフィールド配列に変換
            const fields: import('../types/control-content').ControlContentField[] = [];
            if ((cc as any).content) {
              fields.push({
                id: crypto.randomUUID(),
                label: '内容',
                type: 'text',
                value: (cc as any).content,
                createdAt: now,
                updatedAt: now,
              });
            }
            if ((cc as any).reviewer) {
              fields.push({
                id: crypto.randomUUID(),
                label: '査閲者',
                type: 'text',
                value: (cc as any).reviewer,
                createdAt: now,
                updatedAt: now,
              });
            }
            if ((cc as any).propertyType) {
              fields.push({
                id: crypto.randomUUID(),
                label: 'プロパティ',
                type: 'text',
                value: (cc as any).propertyType === 'evaluation' ? '評価' : (cc as any).propertyType === 'file' ? 'ファイル' : 'テキストフィールド',
                createdAt: now,
                updatedAt: now,
              });
            }

            return {
              ...cc,
              fields: fields.length > 0 ? fields : [],
              // 旧形式のフィールドを削除
              content: undefined,
              reviewer: undefined,
              propertyType: undefined,
            } as ControlContent;
          }),
        };
      }

      return updatedItem;
    });
  } catch {
    return [];
  }
}

export function saveEvaluationItems(items: EvaluationItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save evaluation items:', error);
  }
}

export function createEvaluationItem(item: Omit<EvaluationItem, 'id' | 'createdAt' | 'updatedAt'>): EvaluationItem {
  const newItem: EvaluationItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const items = getEvaluationItems();
  items.push(newItem);
  saveEvaluationItems(items);
  
  return newItem;
}

export function updateEvaluationItem(id: string, updates: Partial<Omit<EvaluationItem, 'id' | 'createdAt'>>): EvaluationItem | null {
  const items = getEvaluationItems();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveEvaluationItems(items);
  return items[index];
}

export function deleteEvaluationItem(id: string): boolean {
  const items = getEvaluationItems();
  const filtered = items.filter(item => item.id !== id);
  
  if (filtered.length === items.length) {
    return false;
  }
  
  saveEvaluationItems(filtered);
  return true;
}

export function initializeSampleData(sampleItems: Omit<EvaluationItem, 'id' | 'createdAt' | 'updatedAt'>[]): void {
  const now = new Date().toISOString();
  const items: EvaluationItem[] = sampleItems.map(item => ({
    ...item,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }));
  saveEvaluationItems(items);
}

