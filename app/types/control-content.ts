import { EvaluationObject } from './evaluation-object';
import { FieldType } from './supplemental-info';
import { ConclusionType } from './evaluation-object';

export interface ControlContentField {
  id: string;
  label: string; // ラベル
  type: FieldType; // ファイル or テキスト or 評価
  value?: string; // 値（ファイルの場合はファイル名、テキストの場合はテキスト）
  usage?: string; // 用途
  // 評価フィールドの場合の値
  evaluationValue?: {
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

export interface ControlContent {
  id: string;
  fields: ControlContentField[]; // フィールドの配列
  evaluationObjects?: EvaluationObject[]; // 評価オブジェクトの配列
  createdAt: string;
  updatedAt: string;
}

