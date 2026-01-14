import { EvaluationItem } from '../types/evaluation-item';
import { Category } from '../types/category';
import { ControlContentTemplate } from '../types/control-content-template';
import { SupplementalInfoTemplate } from '../types/supplemental-info-template';

// seedデータ用の型定義（id, createdAt, updatedAtを持たないフィールド）
type SeedControlContentField = Omit<import('../types/control-content').ControlContentField, 'id' | 'createdAt' | 'updatedAt'>;
type SeedControlContent = Omit<import('../types/control-content').ControlContent, 'id' | 'createdAt' | 'updatedAt' | 'fields'> & {
  fields: SeedControlContentField[];
};
type SeedSupplementalInfoField = Omit<import('../types/supplemental-info').SupplementalInfoField, 'id' | 'createdAt' | 'updatedAt'>;
type SeedSupplementalInfo = Omit<import('../types/supplemental-info').SupplementalInfo, 'fields'> & {
  fields: SeedSupplementalInfoField[];
};
type SeedControlContentFieldTemplate = Omit<import('../types/control-content-template').ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>;
type SeedSupplementalInfoFieldTemplate = Omit<import('../types/supplemental-info-template').SupplementalInfoFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>;

export interface SeedData {
  evaluationItems: (Omit<EvaluationItem, 'id' | 'createdAt' | 'updatedAt' | 'controlContents' | 'supplementalInfo'> & {
    id?: string;
    controlContents?: SeedControlContent[];
    supplementalInfo?: SeedSupplementalInfo;
  })[];
  categories: (Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { id?: string })[];
  controlContentTemplates: (Omit<ControlContentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'fields'> & {
    fields: SeedControlContentFieldTemplate[];
  })[];
  supplementalInfoTemplates: (Omit<SupplementalInfoTemplate, 'id' | 'createdAt' | 'updatedAt' | 'fields'> & {
    fields: SeedSupplementalInfoFieldTemplate[];
  })[];
}

export const seedData: SeedData = {
  evaluationItems: [
  {
    "name": "決算・財務報告の基礎となる方針や業務の手順が整備され、文書化されている",
    "categoryId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c",
    "controlContents": [
      {
        "fields": [
          {
            "label": "整備評価",
            "type": "evaluation",
            "evaluationValue": {
              "conclusion": "effective",
              "evaluationProcess": "整備評価として〇〇が実施されたこと",
              "responsiblePerson": "三点太郎",
              "evaluationDate": "2026-01-01",
              "detectedItems": "なし"
            }
          },
          {
            "label": "運用評価",
            "type": "evaluation",
            "evaluationValue": {
              "responsiblePerson": "三点太郎",
              "evaluationDate": "2026-01-01",
              "detectedItems": "なし",
              "evaluationProcess": "運用評価として〇〇が実施されたこと"
            }
          },
          {
            "label": "証憑",
            "type": "file"
          }
        ]
      }
    ]
  },
  {
    "name": "決算・財務報告の基礎となる方針や業務の手順が整備され、文書化されている",
    "controlContents": [
      {
        "fields": [
          {
            "label": "整備評価",
            "type": "evaluation",
            "evaluationValue": {
              "conclusion": "effective"
            }
          },
          {
            "label": "運用評価",
            "type": "evaluation",
            "evaluationValue": {
              "conclusion": "effective"
            }
          },
          {
            "label": "証憑",
            "type": "file"
          }
        ]
      }
    ],
    "categoryId": "c6a1d804-5c4d-4dc8-a007-e637bafd829d"
  }
],
  categories: [
  {
    "id": "fa714393-5cd3-4365-8b0b-0fece31d2d9c",
    "label": "決算・財務報告プロセスの確立"
  },
  {
    "label": "決算・財務報告プロセスに関する規程・マニュアルの整備",
    "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
  },
  {
    "label": "決算・財務報告プロセスに関する役割・責任・スキル",
    "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
  },

],
  controlContentTemplates: [
  {
    "name": "統制内容",
    "fields": [
      {
        "label": "整備評価",
        "type": "evaluation",
        "evaluationDefaults": {}
      },
      {
        "label": "運用評価",
        "type": "evaluation",
        "evaluationDefaults": {}
      },
      {
        "label": "証憑",
        "type": "file"
      }
    ]
  }
],
  supplementalInfoTemplates: [
  {
    "name": "補足情報",
    "description": "評価項目における評価水準の参考になる情報をまとめる",
    "fields": [
      {
        "label": "達成すべきポイント",
        "type": "text"
      }
    ]
  }
]
};
