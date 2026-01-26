'use client';

import { useState, useEffect } from 'react';
import { EvaluationItem } from '../types/evaluation-item';
import { getCategories } from '../lib/category-storage';
import { Category } from '../types/category';

interface EvaluationItemFormProps {
  item?: EvaluationItem | null;
  defaultCategoryId?: string;
  onSubmit: (data: { name: string; description?: string; categoryId?: string }) => void;
  onCancel: () => void;
}

export default function EvaluationItemForm({ item, defaultCategoryId, onSubmit, onCancel }: EvaluationItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setCategoryId(item.categoryId || '');
    } else {
      setName('');
      setDescription('');
      setCategoryId(defaultCategoryId || '');
    }
  }, [item, defaultCategoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('評価項目名を入力してください');
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
    });
  };

  const getCategoryLabel = (category: Category): string => {
    if (!category.parentId) {
      return category.label;
    }
    const parent = categories.find(c => c.id === category.parentId);
    return parent ? `${parent.label} > ${category.label}` : category.label;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          評価項目名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          placeholder="評価項目名を入力"
          required
        />
      </div>
      {/* <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          説明
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          placeholder="説明を入力（任意）"
        />
      </div> */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          大項目/中項目
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        >
          <option value="">なし</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {getCategoryLabel(cat)}
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
          {item?.id ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}

