export interface Category {
  id: string;
  label: string; // ラベル項目（区分/観点名）
  content?: string; // 内容
  parentId?: string; // 区分ID（undefinedの場合は区分）
  createdAt: string;
  updatedAt: string;
}

