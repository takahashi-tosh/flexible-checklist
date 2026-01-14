'use client';

import { useState, useEffect } from 'react';
import { EvaluationItem } from '../types/evaluation-item';
import { getCategories } from '../lib/category-storage';
import { Category } from '../types/category';
import ControlContentList from './ControlContentList';
import { ControlContent } from '../types/control-content';
import { SupplementalInfo } from '../types/supplemental-info';
import { formatDateTime } from '../lib/date-format';

interface EvaluationItemListProps {
  items: EvaluationItem[];
  onEdit: (item: EvaluationItem) => void;
  onDelete: (id: string) => void;
  onCreate?: () => void;
  onAddControlContent?: (itemId: string) => void;
  onEditControlContent?: (itemId: string, controlContent: ControlContent) => void;
  onDeleteControlContent?: (itemId: string, controlContentId: string) => void;
  onEditSupplementalInfo?: (itemId: string) => void;
  onDeleteSupplementalInfo?: (itemId: string) => void;
}

function getCategoryLabel(categoryId: string | undefined, allCategories: Category[]): string | null {
  if (!categoryId) return null;
  const category = allCategories.find(c => c.id === categoryId);
  if (!category) return null;
  
  if (!category.parentId) {
    return category.label;
  }
  
  const parent = allCategories.find(c => c.id === category.parentId);
  return parent ? `${parent.label} > ${category.label}` : category.label;
}

export default function EvaluationItemList({ items, onEdit, onDelete, onCreate, onAddControlContent, onEditControlContent, onDeleteControlContent, onEditSupplementalInfo, onDeleteSupplementalInfo }: EvaluationItemListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedSupplementalInfo, setExpandedSupplementalInfo] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const toggleSupplementalInfo = (itemId: string) => {
    setExpandedSupplementalInfo(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (items.length === 0) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center py-12">
          <img 
            src="/guide.svg" 
            alt="評価項目作成ガイド" 
            className="w-full max-w-5xl"
          />
        </div>
        <div className='text-center py-12 text-zinc-500 dark:text-zinc-400'>
          評価項目がありません。
          {onCreate ? (
            <button
              onClick={onCreate}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-1 font-medium"
            >
              新規作成
            </button>
          ) : (
            <span className="ml-1">新規作成してください。</span>
          )}
        </div>

      </div>
      
    );
  }

  // 大項目（親大項目/中項目）ごとにグループ化
  const parentCategories = categories.filter(c => !c.parentId);
  const groupedItems: { [key: string]: { parent: Category | null; children: { [key: string]: { category: Category; items: EvaluationItem[] } }; uncategorizedItems: EvaluationItem[] } } = {};
  
  // 大項目/中項目なしのアイテム
  const uncategorizedItems = items.filter(item => !item.categoryId);
  
  // 親大項目/中項目ごとに整理
  parentCategories.forEach(parent => {
    groupedItems[parent.id] = {
      parent,
      children: {},
      uncategorizedItems: []
    };
    
    // 中項目（子大項目/中項目）を取得
    const childCategories = categories.filter(c => c.parentId === parent.id);
    
    childCategories.forEach(child => {
      groupedItems[parent.id].children[child.id] = {
        category: child,
        items: items.filter(item => item.categoryId === child.id)
      };
    });
    
    // 親大項目/中項目に直接紐づいているアイテム
    groupedItems[parent.id].uncategorizedItems = items.filter(item => item.categoryId === parent.id);
  });

  return (
    <div className="space-y-6">
      {/* 大項目/中項目なしのアイテム */}
      {uncategorizedItems.length > 0 && (
        <div>
          <div className="mb-3 flex items-start justify-start gap-1.5 self-stretch mt-8">
            <h3 className="flex-1 justify-center self-stretch text-xl font-semibold leading-[1.7] tracking-wider text-body">
              未分類
            </h3>
          </div>
          <div className="space-y-4">
            {uncategorizedItems.map((item) => (
              <div
                key={item.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
              >
                <ItemContent 
                  item={item}
                  categoryLabel={null}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onEditSupplementalInfo={onEditSupplementalInfo}
                  onDeleteSupplementalInfo={onDeleteSupplementalInfo}
                  onEditControlContent={onEditControlContent}
                  onDeleteControlContent={onDeleteControlContent}
                  onAddControlContent={onAddControlContent}
                  expandedSupplementalInfo={expandedSupplementalInfo}
                  toggleSupplementalInfo={toggleSupplementalInfo}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 大項目ごとのグループ */}
      {parentCategories.map((parent, parentIndex) => {
        const group = groupedItems[parent.id];
        const hasItems = group.uncategorizedItems.length > 0 || Object.values(group.children).some(child => child.items.length > 0);
        
        if (!hasItems) return null;

        return (
          <div key={parent.id}>
            {/* 大項目ヘッダー */}
            <div className="mb-3 flex items-start justify-start gap-1.5 self-stretch mt-8">
              <h2 id={`category-${parent.id}`} className="flex-1 justify-center self-stretch text-xl font-semibold leading-[1.7] tracking-wider text-body">
                {parentIndex + 1}. {parent.label}
              </h2>
            </div>

            {/* 大項目に直接紐づいている評価項目 */}
            {group.uncategorizedItems.length > 0 && (
              <div className="mb-6 space-y-4">
                {group.uncategorizedItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
                  >
                    <ItemContent 
                      item={item}
                      categoryLabel={null}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onEditSupplementalInfo={onEditSupplementalInfo}
                      onDeleteSupplementalInfo={onDeleteSupplementalInfo}
                      onEditControlContent={onEditControlContent}
                      onDeleteControlContent={onDeleteControlContent}
                      onAddControlContent={onAddControlContent}
                      expandedSupplementalInfo={expandedSupplementalInfo}
                      toggleSupplementalInfo={toggleSupplementalInfo}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 中項目ごとのグループ */}
            {Object.entries(group.children).map(([childId, childData], childIndex) => {
              if (childData.items.length === 0) return null;

              return (
                <div key={childId} className="mb-6">
                  {/* 中項目ヘッダー */}
                  <h3 id={`category-${childId}`} className="sticky top-[52px] z-10 text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-3 pb-1  scroll-mt-16">
                    {parentIndex + 1}.{childIndex + 1}. {childData.category.label}
                  </h3>

                  {/* 評価項目リスト */}
                  <div className="space-y-4">
                    {childData.items.map((item) => (
                      <div
                        key={item.id}
                        className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
                      >
                        <ItemContent 
                          item={item}
                          categoryLabel={null}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onEditSupplementalInfo={onEditSupplementalInfo}
                          onDeleteSupplementalInfo={onDeleteSupplementalInfo}
                          onEditControlContent={onEditControlContent}
                          onDeleteControlContent={onDeleteControlContent}
                          onAddControlContent={onAddControlContent}
                          expandedSupplementalInfo={expandedSupplementalInfo}
                          toggleSupplementalInfo={toggleSupplementalInfo}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// 評価項目の内容を表示するコンポーネント
interface ItemContentProps {
  item: EvaluationItem;
  categoryLabel: string | null;
  onEdit: (item: EvaluationItem) => void;
  onDelete: (id: string) => void;
  onEditSupplementalInfo?: (itemId: string) => void;
  onDeleteSupplementalInfo?: (itemId: string) => void;
  onEditControlContent?: (itemId: string, controlContent: ControlContent) => void;
  onDeleteControlContent?: (itemId: string, controlContentId: string) => void;
  onAddControlContent?: (itemId: string) => void;
  expandedSupplementalInfo: Set<string>;
  toggleSupplementalInfo: (itemId: string) => void;
}

function ItemContent({ 
  item, 
  categoryLabel,
  onEdit, 
  onDelete, 
  onEditSupplementalInfo, 
  onDeleteSupplementalInfo,
  onEditControlContent,
  onDeleteControlContent,
  onAddControlContent,
  expandedSupplementalInfo,
  toggleSupplementalInfo
}: ItemContentProps) {
  const [isHovering, setIsHovering] = useState(false);
  const hasControlContent = item.controlContents && item.controlContents.length > 0;
  const canAddControlContent = onAddControlContent && !hasControlContent;

  return (
    <div>
      <div className="flex-1">
        {categoryLabel && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded">
              {categoryLabel}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div 
            className={`flex items-center gap-2 flex-1 group ${canAddControlContent ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => canAddControlContent && onAddControlContent(item.id)}
          >
            {canAddControlContent && (
              <div
                className={`flex-shrink-0 p-1 text-blue-600 dark:text-blue-400 rounded transition-all ${
                  isHovering ? 'opacity-100' : 'opacity-0'
                }`}
                title="統制内容を追加"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {item.name}
            </h3>
          </div>
          <div className="flex gap-2">
            {(!item.supplementalInfo || !item.supplementalInfo.fields || item.supplementalInfo.fields.length === 0) && onEditSupplementalInfo && (
              <button
                onClick={() => onEditSupplementalInfo(item.id)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                + 補足情報を追加
              </button>
            )}
            <button
              onClick={() => onEdit(item)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="編集"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (confirm('この評価項目を削除しますか？')) {
                  onDelete(item.id);
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
        {/* {item.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
            {item.description}
          </p>
        )} */}
        
        {/* 補足情報 */}
        {item.supplementalInfo && item.supplementalInfo.fields && item.supplementalInfo.fields.length > 0 && (
          <div className="mt-1 mb-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">補足情報</h4>
              <div className="flex items-center gap-2">
                {onEditSupplementalInfo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSupplementalInfo(item.id);
                    }}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="編集"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDeleteSupplementalInfo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // アコーディオンの開閉を防ぐ
                      if (confirm('補足情報を削除しますか？')) {
                        onDeleteSupplementalInfo(item.id);
                      }
                    }}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="削除"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* コンテンツエリア: クリックで展開/折り畳み */}
            <div 
              onClick={() => toggleSupplementalInfo(item.id)}
              className={`relative cursor-pointer transition-all duration-300 ease-in-out overflow-hidden ${
                expandedSupplementalInfo.has(item.id) ? 'max-h-[2000px]' : 'max-h-[100px]'
              }`}
            >
              <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                {item.supplementalInfo.fields.map((field) => (
                  <div key={field.id} className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0 pb-2 last:pb-0">
                    <div className="mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                        {field.label}
                      </span>
                    </div>
                    {field.value ? (
                      <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {field.value}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">未入力</p>
                    )}
                  </div>
                ))}
              </div>

              {/* 閉じた状態の時のグラデーションカバーと「もっと見る」表示 */}
              {!expandedSupplementalInfo.has(item.id) && (
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-50 dark:from-zinc-800/80 to-transparent flex items-end justify-center pb-1">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    クリックで展開 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              )}
              
              {/* 展開時の「閉じる」表示（任意） */}
              {expandedSupplementalInfo.has(item.id) && (
                <div className="mt-2 flex justify-center">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    クリックで折りたたむ <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* <div className="text-xs text-zinc-400 dark:text-zinc-500">
          作成: {formatDateTime(item.createdAt)}
          {item.updatedAt !== item.createdAt && (
            <span className="ml-4">
              更新: {formatDateTime(item.updatedAt)}
            </span>
          )}
        </div> */}
        
        {/* 統制内容 */}
        {item.controlContents && item.controlContents.length > 0 && (
          <div className="mt-4
          ">
            <ControlContentList
              controlContents={item.controlContents}
              onEdit={(controlContent: ControlContent) => onEditControlContent?.(item.id, controlContent)}
              onDelete={(controlContentId: string) => onDeleteControlContent?.(item.id, controlContentId)}
              onAdd={() => onAddControlContent?.(item.id)}
            />
          </div>
        )}

      </div>
    </div>
  );
}

