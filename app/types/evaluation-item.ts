import { ControlContent } from './control-content';
import { SupplementalInfo } from './supplemental-info';

export interface EvaluationItem {
  id: string;
  name: string;
  description?: string;
  categoryId?: string; // 大項目/中項目ID
  controlContents?: ControlContent[]; // 統制内容
  supplementalInfo?: SupplementalInfo; // 補足情報（MAX1個まで）
  createdAt: string;
  updatedAt: string;
}

