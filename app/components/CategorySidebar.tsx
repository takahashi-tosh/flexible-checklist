'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { getChildCategories, getCategories } from '../lib/category-storage';
import { getParentColumnLabel, getChildColumnLabel } from '../lib/category-settings';

interface CategorySidebarProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  refreshTrigger?: number;
  onSelectView?: (view: 'supplemental-info-templates' | 'control-content-templates' | 'categories') => void;
  currentView?: string;
}

export default function CategorySidebar({ selectedCategoryId, onSelectCategory, refreshTrigger, onSelectView, currentView }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCategories(getCategories());
    // 初期状態で全ての区分を展開
    const parents = getCategories().filter(cat => !cat.parentId);
    setExpandedParents(new Set(parents.map(p => p.id)));
  }, [refreshTrigger]);

  const parentCategories = categories.filter(cat => !cat.parentId);

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
  };

  const handleAllClick = () => {
    onSelectCategory(null);
  };

  const toggleParent = (parentId: string) => {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
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

      <div className="p-2">
        <div className="w-full flex items-center justify-between px-1 py-2 rounded-md text-sm transition-colors">
          <span className="font-bold">区分/観点</span>
          <button
            onClick={() => onSelectView?.('categories')}
            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="カテゴリを管理"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 区分ラベル */}
      <div className="px-4 py-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded inline-block">
            区分
          </div>
        </div>
      </div>

      {/* 階層的なカテゴリリスト */}
      <div className="px-2 pb-4">
        {parentCategories.map((parent, index) => {
          const children = getChildCategories(parent.id);
          const isExpanded = expandedParents.has(parent.id);
          
          return (
            <div key={parent.id} className="mb-2">
              {/* 区分（親カテゴリ） */}
              <div className="flex items-start gap-1">
                <button
                  onClick={() => toggleParent(parent.id)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors flex-shrink-0"
                >
                  <svg 
                    className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div
                  onClick={() => handleCategoryClick(parent.id)}
                  className={`flex-1 px-2 py-1 rounded text-sm font-medium cursor-pointer transition-colors ${
                    selectedCategoryId === parent.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {index + 1}. {parent.label}
                </div>
              </div>

              {/* 観点ラベル（子カテゴリがある場合のみ） */}
              {isExpanded && children.length > 0 && (
                <div className="ml-6 mt-2 mb-1">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded inline-block">
                    観点
                  </div>
                </div>
              )}

              {/* 観点（子カテゴリ） */}
              {isExpanded && children.length > 0 && (
                <div className="ml-6 space-y-1 mt-1">
                  {children.map((child, childIndex) => (
                    <div
                      key={child.id}
                      onClick={() => handleCategoryClick(child.id)}
                      className={`px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
                        selectedCategoryId === child.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-400 dark:border-blue-500'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {index + 1}.{childIndex + 1}. {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {parentCategories.length === 0 && (
          <div className="py-4 px-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            カテゴリがありません
          </div>
        )}
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

