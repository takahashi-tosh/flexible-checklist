import { ControlContent } from './control-content';
import { SupplementalInfo } from './supplemental-info';

export interface EvaluationItem {
  id: string;
  name: string;
  description?: string;
  categoryId?: string; // 区分/観点ID
  controlContents?: ControlContent[]; // 統制内容
  supplementalInfo?: SupplementalInfo; // 補足情報（MAX1個まで）
  createdAt: string;
  updatedAt: string;
}

