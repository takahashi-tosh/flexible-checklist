export type FieldType = 'file' | 'text' | 'evaluation';

export interface SupplementalInfoField {
  id: string;
  label: string; // ラベル
  type: FieldType; // ファイル or テキスト
  value?: string; // 値（ファイルの場合はファイル名、テキストの場合はテキスト）
  usage?: string; // 用途
  createdAt: string;
  updatedAt: string;
}

export interface SupplementalInfo {
  fields: SupplementalInfoField[]; // フィールドの配列
  createdAt: string;
  updatedAt: string;
}

