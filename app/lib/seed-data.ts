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
  "evaluationItems": [
    {
      "name": "決算・財務報告の基礎となる方針や業務の手順が整備され、文書化されている",
      "categoryId": "a36c089c-1608-4e33-8261-c1d18fe42933",
      "controlContents": [
        {
          "fields": [
            {
              "label": "規程・マニュアル等",
              "type": "file"
            },
            {
              "label": "【整備】証憑・資料",
              "type": "file"
            },
            {
              "label": "整備評価",
              "type": "evaluation",
              "evaluationValue": {
                "evaluationMethods": ["質問", "閲覧"],
                "conclusion": "effective",
                "evaluationProcess": "整備評価として〇〇が実施されたこと",
                "responsiblePerson": "三点太郎",
                "evaluationDate": "2026-01-01",
                "detectedItems": "なし"
              }
            },
            {
              "label": "【運用】証憑・資料",
              "type": "file"
            },
            {
              "label": "運用評価",
              "type": "evaluation",
              "evaluationValue": {
                "evaluationMethods": ["質問", "閲覧"],
                "conclusion": "effective",
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
      ],
      "supplementalInfo": {
        "fields": [
          {
            "label": "達成すべきポイント",
            "type": "text"
          },
          {
            "label": "具体的チェック項目",
            "type": "text"
          },
          {
            "label": "自社の内部統制手続",
            "type": "text"
          },
          {
            "label": "関連資料",
            "type": "text"
          }
        ]
      }
    },
    {
      "name": "決算・財務報告の基礎となる方針や業務の手順が整備され、文書化されている",
      "categoryId": "c6a1d804-5c4d-4dc8-a007-e637bafd829d",
      "controlContents": [
        {
          "fields": [
            {
              "label": "規程・マニュアル等",
              "type": "file"
            },
            {
              "label": "【整備】証憑・資料",
              "type": "file"
            },
            {
              "label": "整備評価",
              "type": "evaluation",
              "evaluationValue": {
                "conclusion": "effective"
              }
            },
            {
              "label": "【運用】証憑・資料",
              "type": "file"
            },
            {
              "label": "運用評価",
              "type": "evaluation",
              "evaluationValue": {
                "conclusion": "effective"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "決算・財務報告の基礎となる方針や業務の手順が適切に更新されている",
      "categoryId": "a36c089c-1608-4e33-8261-c1d18fe42933"
    },
    {
      "name": "提出会社の決算・財務報告の基礎となる方針や業務手順が、連結子会社と整合している",
      "categoryId": "a36c089c-1608-4e33-8261-c1d18fe42933",
      "controlContents": []
    },
    {
      "name": "提出会社の決算・財務報告の基礎となる勘定科目体系が整備され、かつ、連結子会社と整合している",
      "categoryId": "a36c089c-1608-4e33-8261-c1d18fe42933"
    },
    {
      "name": "決算・財務報告プロセス関わる人材のスキルが定義されている。",
      "categoryId": "015f47c5-80ba-4f4a-a0f7-72d5acf287ef"
    },
    {
      "name": "必要な知識を持ったものが採用され、かつ適切に教育を実施している",
      "categoryId": "015f47c5-80ba-4f4a-a0f7-72d5acf287ef"
    },
    {
      "name": "決算・財務報告プロセスで行う役割と責任が明確になっている",
      "categoryId": "015f47c5-80ba-4f4a-a0f7-72d5acf287ef"
    },
    {
      "name": "会社に影響を与える会計処理基準がすべて識別されている",
      "categoryId": "28e01e93-bdb9-4a52-87e1-bf7e757b2ab7"
    },
    {
      "name": "会社の会計方針が明確になっている。また、会計方針の採用・変更に関するプロセスが明確となっている",
      "categoryId": "28e01e93-bdb9-4a52-87e1-bf7e757b2ab7"
    },
    {
      "name": "採用している会計方針が伝達され、原則として会計基準は統一されている",
      "categoryId": "28e01e93-bdb9-4a52-87e1-bf7e757b2ab7"
    },
    {
      "name": "決算・財務報告に影響を与える情報の伝達方法が確立されている",
      "categoryId": "cba9d0f8-4512-403f-8a13-f4fa955b1dbb"
    },
    {
      "name": "日常の会計処理（仕訳）を適切に決算へ反映される仕組みが確立されている",
      "categoryId": "aefebae4-294a-4869-b90e-775e7aecfcf4"
    },
    {
      "name": "決算・財務報告プロセスに係る例外的な処理を行う場合の手続が確立されている",
      "categoryId": "e2024801-b225-4981-a552-420deae657f8"
    },
    {
      "name": "関連当事者との取引は漏れなく把握され、正確に集計されている",
      "categoryId": "d385c0e8-845f-4c36-9960-cb192e5c85ea"
    },
    {
      "name": "決算に必要な情報源が漏れなく識別・収集され、分析されている",
      "categoryId": "e6d889c9-6207-47e5-8cd0-022393433d02"
    },
    {
      "name": "決算において必要な照合作業が適切かつ正確に実施される",
      "categoryId": "72244ead-e318-439e-998a-e37b88f23e40"
    },
    {
      "name": "決算において必要な分析資料が適切かつ正確に作成される",
      "categoryId": "72244ead-e318-439e-998a-e37b88f23e40"
    },
    {
      "name": "主要な勘定科目について、決算作業プロセスが明確にされている",
      "categoryId": "ef1f6e41-5980-4918-a451-876e927a0bc8"
    },
    {
      "name": "すべての子会社・関連会社が識別され、適切に連結の範囲及び持分法の範囲に含まれる",
      "categoryId": "af37f388-d08a-4916-99e0-1bb8f7507a01"
    },
    {
      "name": "連結子会社・持分法適用会社の決算は連結パッケージに正確に反映している",
      "categoryId": "af37f388-d08a-4916-99e0-1bb8f7507a01"
    },
    {
      "name": "連結会社間の取引は適切に識別され消去される",
      "categoryId": "af37f388-d08a-4916-99e0-1bb8f7507a01"
    },
    {
      "name": "財務諸表は総勘定元帳のデータから適切にグルーピングされて作成される",
      "categoryId": "159ceb57-ae7b-491f-86b6-8842193b029f"
    },
    {
      "name": "総勘定元帳には有効な仕訳のみが漏れなく反映される",
      "categoryId": "d61b3b93-8e2a-4b31-9267-ca50990204aa"
    },
    {
      "name": "開示において必要な情報・資料が適切に識別され収集される",
      "categoryId": "ebb0bcca-f7ca-4dd9-9c5b-4cc7e6275058"
    },
    {
      "name": "識別した情報から適切に開示情報を作成する体制が整備されている",
      "categoryId": "ebb0bcca-f7ca-4dd9-9c5b-4cc7e6275058"
    },
    {
      "name": "開示チェックリストを利用して開示情報が開示基準に準拠して適切に記載され、レビューされる",
      "categoryId": "ebb0bcca-f7ca-4dd9-9c5b-4cc7e6275058"
    },
    {
      "name": "有価証券報告書作成にあたり、会計基準等表示・開示に関する重要な問題が検討されている",
      "categoryId": "7dd70cc7-563e-4957-8d88-36d29bcf1fcd"
    },
    {
      "name": "有価証券報告書は提出前に適切なレビューを受け、承認される",
      "categoryId": "7dd70cc7-563e-4957-8d88-36d29bcf1fcd"
    }
  ],
  "categories": [
    {
      "id": "fa714393-5cd3-4365-8b0b-0fece31d2d9c",
      "label": "決算・財務報告プロセスの確立"
    },
    {
      "id": "a36c089c-1608-4e33-8261-c1d18fe42933",
      "label": "決算・財務報告プロセスに関する規程・マニュアルの整備",
      "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
    },
    {
      "id": "015f47c5-80ba-4f4a-a0f7-72d5acf287ef",
      "label": "決算・財務報告プロセスに関する役割・責任・スキル",
      "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
    },
    {
      "id": "28e01e93-bdb9-4a52-87e1-bf7e757b2ab7",
      "label": "会計方針の選択",
      "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
    },
    {
      "id": "cba9d0f8-4512-403f-8a13-f4fa955b1dbb",
      "label": "決算・財務報告に関する情報の伝達",
      "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
    },
    {
      "id": "aefebae4-294a-4869-b90e-775e7aecfcf4",
      "label": "会計伝票審査の取扱い",
      "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
    },
    {
      "id": "e2024801-b225-4981-a552-420deae657f8",
      "label": "例外的な処理の取扱い",
      "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
    },
    {
      "id": "d385c0e8-845f-4c36-9960-cb192e5c85ea",
      "label": "関連当事者および取引の把握",
      "parentId": "fa714393-5cd3-4365-8b0b-0fece31d2d9c"
    },
    {
      "id": "9632f059-2f0e-4f73-8470-931ef89fa9b6",
      "label": "単体決算体制の整備"
    },
    {
      "id": "e6d889c9-6207-47e5-8cd0-022393433d02",
      "label": "決算に必要な情報の特定",
      "parentId": "9632f059-2f0e-4f73-8470-931ef89fa9b6"
    },
    {
      "id": "72244ead-e318-439e-998a-e37b88f23e40",
      "label": "決算数値の検証",
      "parentId": "9632f059-2f0e-4f73-8470-931ef89fa9b6"
    },
    {
      "id": "ef1f6e41-5980-4918-a451-876e927a0bc8",
      "label": "勘定科目別の決算・財務報告プロセス",
      "parentId": "9632f059-2f0e-4f73-8470-931ef89fa9b6"
    },
    {
      "id": "d07880ea-486b-4e3c-8330-1d4842052e05",
      "label": "連結決算体制の整備"
    },
    {
      "id": "af37f388-d08a-4916-99e0-1bb8f7507a01",
      "label": "連結決算プロセス",
      "parentId": "d07880ea-486b-4e3c-8330-1d4842052e05"
    },
    {
      "id": "159ceb57-ae7b-491f-86b6-8842193b029f",
      "label": "勘定科目の組替",
      "parentId": "d07880ea-486b-4e3c-8330-1d4842052e05"
    },
    {
      "id": "d61b3b93-8e2a-4b31-9267-ca50990204aa",
      "label": "決算修正仕訳の入力",
      "parentId": "d07880ea-486b-4e3c-8330-1d4842052e05"
    },
    {
      "id": "f8ebd373-529d-4566-9c33-0329bf4a98de",
      "label": "開示体制の整備"
    },
    {
      "id": "ebb0bcca-f7ca-4dd9-9c5b-4cc7e6275058",
      "label": "財務諸表上の開示（注記を含む）にかかる体制の整備",
      "parentId": "f8ebd373-529d-4566-9c33-0329bf4a98de"
    },
    {
      "id": "7dd70cc7-563e-4957-8d88-36d29bcf1fcd",
      "label": "提出資料（有価証券報告書）のレビュー及び承認",
      "parentId": "f8ebd373-529d-4566-9c33-0329bf4a98de"
    }
  ],
  "controlContentTemplates": [
    {
      "name": "統制内容",
      "fields": [
        {
          "label": "規程・マニュアル等",
          "type": "file"
        },
        {
          "label": "【整備】証憑・資料",
          "type": "file"
        },
        {
          "label": "整備評価",
          "type": "evaluation",
          "evaluationDefaults": {}
        },
        {
          "label": "【運用】証憑・資料",
          "type": "file"
        },
        {
          "label": "運用評価",
          "type": "evaluation",
          "evaluationDefaults": {}
        }
      ]
    }
  ],
  "supplementalInfoTemplates": [
    {
      "name": "補足情報",
      "description": "評価項目における評価水準の参考になる情報をまとめる",
      "fields": [
        {
          "label": "達成すべきポイント",
          "type": "text"
        },
        {
          "label": "具体的チェック項目",
          "type": "text"
        },
        {
          "label": "自社の内部統制手続",
          "type": "text"
        },
        {
          "label": "関連資料",
          "type": "text"
        }
      ]
    }
  ]
};
