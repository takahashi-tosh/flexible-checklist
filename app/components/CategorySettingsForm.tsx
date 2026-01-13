'use client';

import { useState, useEffect } from 'react';
import { getParentColumnLabel, setParentColumnLabel, getChildColumnLabel, setChildColumnLabel } from '../lib/category-settings';

interface CategorySettingsFormProps {
  onUpdate?: () => void;
}

export default function CategorySettingsForm({ onUpdate }: CategorySettingsFormProps) {
  const [parentColumnLabel, setParentColumnLabelValue] = useState('');
  const [childColumnLabel, setChildColumnLabelValue] = useState('');

  useEffect(() => {
    setParentColumnLabelValue(getParentColumnLabel());
    setChildColumnLabelValue(getChildColumnLabel());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParentColumnLabel(parentColumnLabel);
    setChildColumnLabel(childColumnLabel);
    if (onUpdate) {
      onUpdate();
    }
    alert('設定を保存しました');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        大項目/中項目表示設定
      </h3>
      <div>
        <label htmlFor="parentColumnLabel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          大項目列の表示ラベル
        </label>
        <input
          type="text"
          id="parentColumnLabel"
          value={parentColumnLabel}
          onChange={(e) => setParentColumnLabelValue(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          placeholder="例：6つのこうもく（空欄の場合は「大項目」と表示）"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          サイドバーのテーブルの左列ヘッダーに表示されるラベルを設定できます
        </p>
      </div>
      <div>
        <label htmlFor="childColumnLabel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          中項目列の表示ラベル
        </label>
        <input
          type="text"
          id="childColumnLabel"
          value={childColumnLabel}
          onChange={(e) => setChildColumnLabelValue(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          placeholder="例：4つの項目（空欄の場合は「中項目」と表示）"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          サイドバーのテーブルの右列ヘッダーに表示されるラベルを設定できます
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
      </div>
    </form>
  );
}

