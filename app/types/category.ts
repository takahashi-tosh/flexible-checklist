export interface Category {
  id: string;
  label: string; // ラベル項目（カテゴリ名）
  content?: string; // 内容
  parentId?: string; // 親カテゴリID（undefinedの場合は親カテゴリ）
  createdAt: string;
  updatedAt: string;
}

