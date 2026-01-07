'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { getChildCategories, getCategories } from '../lib/category-storage';
import { getParentColumnLabel, getChildColumnLabel } from '../lib/category-settings';

interface CategorySidebarProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  refreshTrigger?: number;
  onSelectView?: (view: 'supplemental-info-templates' | 'control-content-templates') => void;
  currentView?: string;
}

export default function CategorySidebar({ selectedCategoryId, onSelectCategory, refreshTrigger, onSelectView, currentView }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(getCategories());
  }, [refreshTrigger]);

  const parentCategories = categories.filter(cat => !cat.parentId);
  
  // 親カテゴリとその子カテゴリをペアで整理
  const tableData: Array<{
    parentId: string;
    parentLabel: string;
    children: Array<{ id: string; label: string }>;
  }> = [];
  
  parentCategories.forEach((parent) => {
    const children = getChildCategories(parent.id);
    tableData.push({
      parentId: parent.id,
      parentLabel: parent.label,
      children: children.map(child => ({ id: child.id, label: child.label })),
    });
  });

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
  };

  const handleAllClick = () => {
    onSelectCategory(null);
  };

  return (
    <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">smoove poc</h2>
        </div>
      </div>

      <div className="p-2">
        <div className="w-full text-left font-bold px-1 py-2 rounded-md text-sm transition-colors">
          評価項目
        </div>
      </div>
      
      <div className="p-2">
        <button
          onClick={handleAllClick}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedCategoryId === null
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          すべての評価項目
        </button>
      </div>

      <div className="px-2 pb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="text-left py-2 px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-700">
                {getParentColumnLabel()}
              </th>
              <th className="text-left py-2 px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {getChildColumnLabel()}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => {
              const maxRows = Math.max(1, row.children.length);
              
              // 子カテゴリがない場合
              if (row.children.length === 0) {
                return (
                  <tr
                    key={row.parentId}
                    className={`border-b border-zinc-100 dark:border-zinc-800 transition-colors ${
                      selectedCategoryId === row.parentId
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <td
                      className="py-2 px-2 text-sm font-semibold border-r border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      onClick={() => handleCategoryClick(row.parentId)}
                    >
                      {row.parentLabel}
                    </td>
                    <td className="py-2 px-2 text-sm text-zinc-400 dark:text-zinc-500">
                      -
                    </td>
                  </tr>
                );
              }
              
              // 子カテゴリがある場合
              return row.children.map((child, childIndex) => (
                <tr
                  key={`${row.parentId}-${child.id}-${childIndex}`}
                  className={`border-b border-zinc-100 dark:border-zinc-800 transition-colors ${
                    selectedCategoryId === row.parentId || selectedCategoryId === child.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {childIndex === 0 && (
                    <td
                      rowSpan={maxRows}
                      className={`py-2 px-2 text-sm font-semibold border-r border-zinc-200 dark:border-zinc-700 cursor-pointer ${
                        selectedCategoryId === row.parentId
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                      onClick={() => handleCategoryClick(row.parentId)}
                    >
                      {row.parentLabel}
                    </td>
                  )}
                  <td
                    className={`py-2 px-2 text-sm cursor-pointer ${
                      selectedCategoryId === child.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                    onClick={() => handleCategoryClick(child.id)}
                  >
                    {child.label}
                  </td>
                </tr>
              ));
            })}
            {tableData.length === 0 && (
              <tr>
                <td colSpan={2} className="py-4 px-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  カテゴリがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-2">
        <div className="w-full text-left px-1 py-2 font-bold rounded-md text-sm transition-colors">
          カスタムフォーム
        </div>
        <div className="space-y-1 mt-2">
          <button
            onClick={() => onSelectView?.('supplemental-info-templates')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'supplemental-info-templates'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            評価項目の補足
          </button>
          <button
            onClick={() => onSelectView?.('control-content-templates')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'control-content-templates'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            統制内容
          </button>
        </div>
      </div>
    </div>
  );
}

