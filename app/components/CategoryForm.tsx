'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { getParentCategories } from '../lib/category-storage';

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: { label: string; content?: string; parentId?: string }) => void;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  useEffect(() => {
    setParentCategories(getParentCategories());
  }, [category]);

  useEffect(() => {
    if (category) {
      setLabel(category.label);
      setContent(category.content || '');
      setParentId(category.parentId || '');
    } else {
      setLabel('');
      setContent('');
      setParentId('');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      alert('ラベル項目を入力してください');
      return;
    }
    onSubmit({
      label: label.trim(),
      content: content.trim() || undefined,
      parentId: parentId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          ラベル項目 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          placeholder="カテゴリ名を入力"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          placeholder="内容を入力（任意）"
        />
      </div>
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          親カテゴリ
        </label>
        <select
          id="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option value="">なし（親カテゴリ）</option>
          {parentCategories
            .filter(cat => !category || cat.id !== category.id)
            .map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          {category ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}

