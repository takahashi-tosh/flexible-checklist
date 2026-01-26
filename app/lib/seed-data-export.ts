import { getEvaluationItems } from './storage';
import { getCategories } from './category-storage';
import { getControlContentTemplates } from './control-content-template-storage';
import { getSupplementalInfoTemplates } from './supplemental-info-template-storage';
import { SeedData, SeedControlContentField, SeedControlContentTemplateField } from './seed-data';

/**
 * 現在のlocalStorageのデータをSeedData形式に変換してエクスポートする
 * id, createdAt, updatedAtなどのメタデータを除外してJSON文字列として返す
 */
export function exportCurrentDataAsSeedData(): string {
  const evaluationItems = getEvaluationItems();
  const categories = getCategories();
  const controlContentTemplates = getControlContentTemplates();
  const supplementalInfoTemplates = getSupplementalInfoTemplates();

  const seedData: SeedData = {
    evaluationItems: evaluationItems.map(item => ({
      name: item.name,
      categoryId: item.categoryId,
      controlContents: item.controlContents?.map(cc => ({
        fields: cc.fields.map(field => {
          // 基本フィールド情報
          const baseField: Partial<SeedControlContentField> = {
            label: field.label,
            type: field.type,
          };

          // typeに応じて追加フィールドを含める
          if (field.type === 'text' && field.value !== undefined) {
            baseField.value = field.value;
          } else if (field.type === 'evaluation' && field.evaluationValue !== undefined) {
            baseField.evaluationValue = field.evaluationValue;
          } else if (field.type === 'file' && field.value !== undefined) {
            baseField.value = field.value;
          }

          return baseField as SeedControlContentField;
        }),
      })),
      supplementalInfo: item.supplementalInfo ? {
        fields: item.supplementalInfo.fields.map(field => ({
          label: field.label,
          type: field.type,
          value: field.value,
        })),
        createdAt: item.supplementalInfo.createdAt,
        updatedAt: item.supplementalInfo.updatedAt,
      } : undefined,
    })),
    categories: categories.map(cat => ({
      id: cat.id, // カテゴリのIDは参照のために保持
      label: cat.label,
      parentId: cat.parentId,
    })),
    controlContentTemplates: controlContentTemplates.map(template => ({
      name: template.name,
      description: template.description,
      fields: template.fields.map(field => {
        const baseField: Partial<SeedControlContentTemplateField> = {
          label: field.label,
          type: field.type,
        };

        // evaluationDefaultsがあれば含める
        if (field.type === 'evaluation' && field.evaluationDefaults !== undefined) {
          baseField.evaluationDefaults = field.evaluationDefaults;
        }

        return baseField as SeedControlContentTemplateField;
      }),
    })),
    supplementalInfoTemplates: supplementalInfoTemplates.map(template => ({
      name: template.name,
      description: template.description,
      fields: template.fields.map(field => ({
        label: field.label,
        type: field.type,
      })),
    })),
  };

  return JSON.stringify(seedData, null, 2);
}

/**
 * 現在のデータをコンソールに出力する（開発用）
 */
export function logCurrentDataAsSeedData(): void {
  console.log('=== Current Data as Seed Data ===');
  console.log(exportCurrentDataAsSeedData());
}

/**
 * 現在のデータをクリップボードにコピーする
 */
export async function copyCurrentDataToClipboard(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    console.error('Clipboard API is not available');
    return;
  }

  try {
    const seedDataString = exportCurrentDataAsSeedData();
    await navigator.clipboard.writeText(seedDataString);
    console.log('Seed data copied to clipboard!');
    alert('シードデータがクリップボードにコピーされました！');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    alert('クリップボードへのコピーに失敗しました');
  }
}

/**
 * 現在のデータをダウンロード可能なJSONファイルとして保存する
 */
export function downloadCurrentDataAsSeedData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const seedDataString = exportCurrentDataAsSeedData();
  const blob = new Blob([seedDataString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `seed-data-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
