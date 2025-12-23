import { FieldType } from './supplemental-info';

export type ConclusionType = 'effective' | 'effective_with_recommendations' | 'ineffective' | 'pending';

export interface EvaluationObjectField {
  id: string;
  label: string; // ラベル
  type: FieldType; // ファイル or テキスト
  value?: string; // 値（ファイルの場合はファイル名、テキストの場合はテキスト）
  usage?: string; // 用途
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationObject {
  id: string;
  conclusion?: ConclusionType; // 結論
  evaluationProcess?: string; // 評価経緯
  detectedItems?: string; // 検出事項
  evaluationDate?: string; // 評価日（YYYY-MM-DD形式）
  fields: EvaluationObjectField[]; // 追加フィールド（ファイル・テキストフィールド）
  createdAt: string;
  updatedAt: string;
}

