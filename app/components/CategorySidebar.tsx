'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { getChildCategories, getCategories, updateCategory } from '../lib/category-storage';

interface CategorySidebarProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  refreshTrigger?: number;
  onSelectView?: (view: 'supplemental-info-templates' | 'control-content-templates' | 'categories') => void;
  currentView?: string;
}

export default function CategorySidebar({ selectedCategoryId, onSelectCategory, refreshTrigger, onSelectView, currentView }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => {
    const parents = getCategories().filter(cat => !cat.parentId);
    return new Set(parents.map(p => p.id));
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  useEffect(() => {
    // refreshTriggerが変更されたときのみカテゴリを再読み込み
    const updatedCategories = getCategories();
    setCategories(updatedCategories);
  }, [refreshTrigger]);

  const parentCategories = categories.filter(cat => !cat.parentId);

  const handleCategoryClick = (categoryId: string) => {
    if (editingCategoryId !== categoryId) {
      onSelectCategory(categoryId);
    }
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

  const handleCategoryEdit = (categoryId: string, currentLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategoryId(categoryId);
    setEditingLabel(currentLabel);
  };

  const handleCategoryUpdate = (categoryId: string) => {
    if (editingLabel.trim()) {
      updateCategory(categoryId, { label: editingLabel.trim() });
      setCategories(getCategories());
      setEditingCategoryId(null);
      setEditingLabel('');
    }
  };

  const handleCategoryCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategoryId(null);
    setEditingLabel('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCategoryUpdate(categoryId);
    } else if (e.key === 'Escape') {
      setEditingCategoryId(null);
      setEditingLabel('');
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" onClick={handleAllClick}>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">カスタムチェックリスト</h2>
        </div>
      </div>

      {/* <div className="p-2">
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
      </div> */}

      <div className="p-2">
        <div className="w-full flex items-center justify-between px-1 py-2 rounded-md text-sm transition-colors">
          <span className="text-gray-500 dark:text-gray-400">大項目/中項目</span>
          <button
            onClick={() => onSelectView?.('categories')}
            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="大項目/中項目を管理"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 階層的な大項目/中項目リスト */}
      <div className="px-2 pb-4">
        {parentCategories.map((parent, index) => {
          const children = getChildCategories(parent.id);
          const isExpanded = expandedParents.has(parent.id);
          
          return (
            <div key={parent.id} className="mb-2">
              {/* 大項目（親大項目/中項目） */}
              <div className="flex items-start gap-1">
                <button
                  onClick={() => toggleParent(parent.id)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors shrink-0"
                >
                  <svg 
                    className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {editingCategoryId === parent.id ? (
                  <div className="flex-1 flex items-center gap-1 bg-white dark:bg-zinc-800 rounded px-1">
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onBlur={() => handleCategoryUpdate(parent.id)}
                      onKeyDown={(e) => handleKeyDown(e, parent.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-1 py-1 text-sm font-bold border-2 border-blue-500 rounded focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleCategoryUpdate(parent.id)}
                      className="p-0.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="保存"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCategoryCancel}
                      className="p-0.5 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                      title="キャンセル"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleCategoryClick(parent.id)}
                    onMouseEnter={() => setHoveredCategoryId(parent.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    className={`flex-1 flex items-center gap-1 px-2 py-1 rounded text-sm font-bold cursor-pointer transition-colors ${
                      selectedCategoryId === parent.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex-1">
                      {index + 1}. {parent.label}
                    </span>
                    {hoveredCategoryId === parent.id && (
                      <button
                        onClick={(e) => handleCategoryEdit(parent.id, parent.label, e)}
                        className="p-0.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="編集"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 中項目（子大項目/中項目） */}
              {isExpanded && children.length > 0 && (
                <div className="ml-6 space-y-1 mt-1">
                  {children.map((child, childIndex) => (
                    editingCategoryId === child.id ? (
                      <div key={child.id} className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded px-1">
                        <input
                          type="text"
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          onBlur={() => handleCategoryUpdate(child.id)}
                          onKeyDown={(e) => handleKeyDown(e, child.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 px-2 py-1.5 text-sm font-bold border-2 border-blue-500 rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleCategoryUpdate(child.id)}
                          className="p-0.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="保存"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCategoryCancel}
                          className="p-0.5 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                          title="キャンセル"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div
                        key={child.id}
                        onClick={() => handleCategoryClick(child.id)}
                        onMouseEnter={() => setHoveredCategoryId(child.id)}
                        onMouseLeave={() => setHoveredCategoryId(null)}
                        className={`flex items-center gap-1 px-3 py-2 rounded text-sm cursor-pointer font-bold transition-colors ${
                          selectedCategoryId === child.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-400 dark:border-blue-500'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex-1">
                          {index + 1}.{childIndex + 1}. {child.label}
                        </span>
                        {hoveredCategoryId === child.id && (
                          <button
                            onClick={(e) => handleCategoryEdit(child.id, child.label, e)}
                            className="p-0.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="編集"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {parentCategories.length === 0 && (
          <div className="py-4 px-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            大項目/中項目がありません
          </div>
        )}
      </div>

      <div className="p-2">
        <div className="w-full text-left px-1 py-2 text-gray-500 dark:text-gray-400 rounded-md text-sm transition-colors">
          カスタムフォーム
        </div>
        <div className="space-y-1 mt-2">
          <button
            onClick={() => onSelectView?.('control-content-templates')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${
              currentView === 'control-content-templates'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span className="text-base shrink-0">📋</span>
            統制内容
          </button>
          <button
            onClick={() => onSelectView?.('supplemental-info-templates')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${
              currentView === 'supplemental-info-templates'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentView === 'supplemental-info-templates'
                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                : 'bg-gray-400 dark:bg-gray-500 text-white'
            }`}>
              i
            </div>
            補足情報
          </button>
        </div>
      </div>
    </div>
  );
}

