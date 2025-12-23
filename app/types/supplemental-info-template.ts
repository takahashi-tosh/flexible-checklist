import { FieldType } from './supplemental-info';

export interface SupplementalInfoFieldTemplate {
  id: string;
  label: string; // ラベル
  type: FieldType; // ファイル or テキスト
  usage?: string; // 用途
  createdAt: string;
  updatedAt: string;
}

export interface SupplementalInfoTemplate {
  id: string;
  name: string; // テンプレート名
  description?: string; // 説明
  fields: SupplementalInfoFieldTemplate[]; // フィールドテンプレートの配列
  createdAt: string;
  updatedAt: string;
}

