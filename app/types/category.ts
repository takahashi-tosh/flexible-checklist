export interface Category {
  id: string;
  label: string; // ラベル項目（大項目/中項目名）
  content?: string; // 内容
  parentId?: string; // 大項目ID（undefinedの場合は大項目）
  createdAt: string;
  updatedAt: string;
}

