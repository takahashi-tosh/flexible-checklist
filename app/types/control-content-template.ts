import { FieldType } from './supplemental-info';
import { ConclusionType } from './evaluation-object';

export interface ControlContentFieldTemplate {
  id: string;
  label: string; // ラベル
  type: FieldType; // ファイル or テキスト or 評価
  usage?: string; // 用途
  // 評価フィールドの場合のデフォルト値
  evaluationDefaults?: {
    evaluationMethods?: string[]; // 評価方法（質問・閲覧・再実施）
    conclusion?: ConclusionType;
    evaluationProcess?: string;
    detectedItems?: string;
    evaluationDate?: string;
    responsiblePerson?: string; // 担当者
  };
  createdAt: string;
  updatedAt: string;
}

export interface ControlContentTemplate {
  id: string;
  name: string; // テンプレート名（「統制内容」で固定）
  description?: string; // 説明
  fields: ControlContentFieldTemplate[]; // フィールドテンプレートの配列
  createdAt: string;
  updatedAt: string;
}

