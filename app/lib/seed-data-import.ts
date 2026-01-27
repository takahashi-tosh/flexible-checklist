import { seedData, SeedData } from './seed-data';
import { saveEvaluationItems } from './storage';
import { saveCategories } from './category-storage';
import { saveControlContentTemplates } from './control-content-template-storage';
import { saveSupplementalInfoTemplates } from './supplemental-info-template-storage';
import { EvaluationItem } from '../types/evaluation-item';
import { Category } from '../types/category';
import { ControlContentTemplate } from '../types/control-content-template';
import { SupplementalInfoTemplate } from '../types/supplemental-info-template';

/**
 * seedデータをインポートして、localStorageに保存する（汎用版）
 */
export function importSeedDataFromObject(data: SeedData): void {
  const now = new Date().toISOString();
  
  // カテゴリのインポート（IDマッピングを作成）
  const categoryIdMap = new Map<string, string>();
  const categories: Category[] = data.categories.map(cat => {
    const existingId = cat.id; // seedデータに既存IDがある場合
    const newId = existingId || crypto.randomUUID();
    
    // 既存IDがある場合はマッピングに追加（自分自身へのマッピング）
    if (existingId) {
      categoryIdMap.set(existingId, newId);
    }
    
    return {
      ...cat,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
  });
  
  // parentIdを新しいIDに置き換え（既にマッピングにある場合のみ）
  const updatedCategories = categories.map(cat => {
    if (cat.parentId && categoryIdMap.has(cat.parentId)) {
      return {
        ...cat,
        parentId: categoryIdMap.get(cat.parentId),
      };
    }
    return cat;
  });
  
  saveCategories(updatedCategories);
  
  // 統制内容テンプレートのインポート
  const controlContentTemplates: ControlContentTemplate[] = data.controlContentTemplates.map(template => ({
    ...template,
    id: crypto.randomUUID(),
    fields: template.fields.map(field => ({
      ...field,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    })),
    createdAt: now,
    updatedAt: now,
  }));
  
  saveControlContentTemplates(controlContentTemplates);
  
  // 補足情報テンプレートのインポート
  const supplementalInfoTemplates: SupplementalInfoTemplate[] = data.supplementalInfoTemplates.map(template => ({
    ...template,
    id: crypto.randomUUID(),
    fields: template.fields.map(field => ({
      ...field,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    })),
    createdAt: now,
    updatedAt: now,
  }));
  
  saveSupplementalInfoTemplates(supplementalInfoTemplates);
  
  // 評価項目のインポート（categoryIdを新しいIDに置き換え）
  const evaluationItems: EvaluationItem[] = data.evaluationItems.map(item => {
    const newCategoryId = item.categoryId && categoryIdMap.has(item.categoryId) 
      ? categoryIdMap.get(item.categoryId)
      : item.categoryId;
    
    return {
      ...item,
      id: crypto.randomUUID(),
      categoryId: newCategoryId,
      controlContents: item.controlContents?.map(cc => ({
        ...cc,
        id: crypto.randomUUID(),
        fields: cc.fields.map(field => ({
          ...field,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        })),
        createdAt: now,
        updatedAt: now,
      })),
      supplementalInfo: item.supplementalInfo ? {
        ...item.supplementalInfo,
        fields: item.supplementalInfo.fields.map(field => ({
          ...field,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        })),
      } : undefined,
      createdAt: now,
      updatedAt: now,
    };
  });
  
  saveEvaluationItems(evaluationItems);
}

/**
 * seedデータをインポートして、localStorageに保存する（seed-data.tsから）
 */
export function importSeedData(): void {
  importSeedDataFromObject(seedData);
}

/**
 * JSON文字列からseedデータをインポートして、localStorageに保存する
 * @param jsonString JSON文字列
 * @throws {Error} JSONのパースエラーまたはデータ形式エラー
 */
export function importSeedDataFromJson(jsonString: string): void {
  try {
    const parsed = JSON.parse(jsonString);
    
    // 基本的なバリデーション
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('無効なJSON形式です');
    }
    
    // SeedData型の基本的な構造チェック
    if (!Array.isArray(parsed.evaluationItems)) {
      throw new Error('evaluationItemsが配列ではありません');
    }
    if (!Array.isArray(parsed.categories)) {
      throw new Error('categoriesが配列ではありません');
    }
    if (!Array.isArray(parsed.controlContentTemplates)) {
      throw new Error('controlContentTemplatesが配列ではありません');
    }
    if (!Array.isArray(parsed.supplementalInfoTemplates)) {
      throw new Error('supplementalInfoTemplatesが配列ではありません');
    }
    
    importSeedDataFromObject(parsed as SeedData);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSONのパースエラー: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 現在のデータをすべてクリアする
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('evaluation-items');
  localStorage.removeItem('categories');
  localStorage.removeItem('control-content-templates');
  localStorage.removeItem('supplemental-info-templates');
}

/**
 * seedデータをクリアしてからインポートする
 */
export function resetAndImportSeedData(): void {
  clearAllData();
  importSeedData();
}

/**
 * JSON文字列からseedデータをクリアしてからインポートする
 * @param jsonString JSON文字列
 * @throws {Error} JSONのパースエラーまたはデータ形式エラー
 */
export function resetAndImportSeedDataFromJson(jsonString: string): void {
  clearAllData();
  importSeedDataFromJson(jsonString);
}
