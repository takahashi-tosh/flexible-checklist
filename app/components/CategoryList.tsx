'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { getChildCategories, getCategories } from '../lib/category-storage';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const [allCategories, setAllCategories] = useState<Category[]>(categories);

  useEffect(() => {
    setAllCategories(getCategories());
  }, [categories]);

  if (allCategories.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        区分/観点がありません。新規作成してください。
      </div>
    );
  }

  const parentCategories = allCategories.filter(cat => !cat.parentId);
  const childCategoriesMap = new Map<string, Category[]>();
  
  parentCategories.forEach(parent => {
    const children = getChildCategories(parent.id);
    if (children.length > 0) {
      childCategoriesMap.set(parent.id, children);
    }
  });

  return (
    <div className="space-y-4">
      {parentCategories.map((parent) => {
        const children = childCategoriesMap.get(parent.id) || [];
        return (
          <div key={parent.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            {/* 区分 */}
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      評価項目
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {parent.label}
                  </h3>
                  {parent.content && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                      {parent.content}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onEdit(parent)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="編集"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('この区分と観点をすべて削除しますか？')) {
                        onDelete(parent.id);
                      }
                    }}
                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 観点 */}
            {children.length > 0 && (
              <div className="bg-white dark:bg-zinc-900">
                {children.map((child) => (
                  <div key={child.id} className="p-4 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                    <div className="flex justify-between items-start pl-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            評価項目
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                          {child.label}
                        </h4>
                        {child.content && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                            {child.content}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => onEdit(child)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="編集"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('この区分/観点を削除しますか？')) {
                              onDelete(child.id);
                            }
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="削除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

