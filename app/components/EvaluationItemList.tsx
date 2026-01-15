'use client';

import { useState } from 'react';
import { EvaluationItem } from '../types/evaluation-item';
import { getCategories, updateCategory } from '../lib/category-storage';
import { Category } from '../types/category';
import ControlContentList from './ControlContentList';
import { ControlContent } from '../types/control-content';

interface EvaluationItemListProps {
  items: EvaluationItem[];
  onEdit: (item: EvaluationItem) => void;
  onDelete: (id: string) => void;
  onCreate?: (categoryId?: string) => void;
  onAddControlContent?: (itemId: string) => void;
  onEditControlContent?: (itemId: string, controlContent: ControlContent) => void;
  onDeleteControlContent?: (itemId: string, controlContentId: string) => void;
  onEditSupplementalInfo?: (itemId: string) => void;
  onDeleteSupplementalInfo?: (itemId: string) => void;
}

export default function EvaluationItemList({ items, onEdit, onDelete, onCreate, onAddControlContent, onEditControlContent, onDeleteControlContent, onEditSupplementalInfo, onDeleteSupplementalInfo }: EvaluationItemListProps) {
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  const handleCategoryEdit = (categoryId: string, currentLabel: string) => {
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

  const handleCategoryCancel = () => {
    setEditingCategoryId(null);
    setEditingLabel('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCategoryUpdate(categoryId);
    } else if (e.key === 'Escape') {
      handleCategoryCancel();
    }
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
              onClick={() => onCreate()}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-1 font-medium"
            >
              新たに追加する
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
            <div className="mb-3 flex items-center gap-1.5 self-stretch mt-8 group">
              {editingCategoryId === parent.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={() => handleCategoryUpdate(parent.id)}
                    onKeyDown={(e) => handleKeyDown(e, parent.id)}
                    className="flex-1 text-xl font-semibold leading-[1.7] tracking-wider px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleCategoryUpdate(parent.id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="保存"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCategoryCancel}
                    className="p-1 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    title="キャンセル"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <h2 id={`category-${parent.id}`} className="text-xl font-semibold leading-[1.7] tracking-wider text-body">
                    {parentIndex + 1}. {parent.label}
                  </h2>
                  <button
                    onClick={() => handleCategoryEdit(parent.id, parent.label)}
                    className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="編集"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* 大項目に直接紐づいている評価項目 */}
            {group.uncategorizedItems.length > 0 && (
              <div className="mb-6 space-y-8">
                {group.uncategorizedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    categoryLabel={null}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onEditSupplementalInfo={onEditSupplementalInfo}
                    onDeleteSupplementalInfo={onDeleteSupplementalInfo}
                    onEditControlContent={onEditControlContent}
                    onDeleteControlContent={onDeleteControlContent}
                    onAddControlContent={onAddControlContent}
                    onCreate={onCreate}
                  />
                ))}
              </div>
            )}

            {/* 中項目ごとのグループ */}
            {Object.entries(group.children).map(([childId, childData], childIndex) => {
              if (childData.items.length === 0) return null;

              return (
                <div key={childId} className="mb-6">
                  {/* 中項目ヘッダー */}
                  {editingCategoryId === childId ? (
                    <div className="sticky top-13 z-10 mb-3 pb-1 scroll-mt-16 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={() => handleCategoryUpdate(childId)}
                        onKeyDown={(e) => handleKeyDown(e, childId)}
                        className="flex-1 text-lg font-semibold px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleCategoryUpdate(childId)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="保存"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleCategoryCancel}
                        className="p-1 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        title="キャンセル"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="sticky top-13 z-10 mb-3 pb-1 scroll-mt-16 flex items-center gap-2 group">
                      <h3 id={`category-${childId}`} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {parentIndex + 1}.{childIndex + 1}. {childData.category.label}
                      </h3>
                      <button
                        onClick={() => handleCategoryEdit(childId, childData.category.label)}
                        className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="編集"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* 評価項目リスト */}
                  <div className="space-y-8">
                    {childData.items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        categoryLabel={null}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onEditSupplementalInfo={onEditSupplementalInfo}
                        onDeleteSupplementalInfo={onDeleteSupplementalInfo}
                        onEditControlContent={onEditControlContent}
                        onDeleteControlContent={onDeleteControlContent}
                        onAddControlContent={onAddControlContent}
                        onCreate={onCreate}
                      />
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

// カードをラップするコンポーネント（ホバー時に下部にボタンを表示）
interface ItemCardProps {
  item: EvaluationItem;
  categoryLabel: string | null;
  onEdit: (item: EvaluationItem) => void;
  onDelete: (id: string) => void;
  onEditSupplementalInfo?: (itemId: string) => void;
  onDeleteSupplementalInfo?: (itemId: string) => void;
  onEditControlContent?: (itemId: string, controlContent: ControlContent) => void;
  onDeleteControlContent?: (itemId: string, controlContentId: string) => void;
  onAddControlContent?: (itemId: string) => void;
  onCreate?: (categoryId?: string) => void;
}

function ItemCard({ 
  item,
  categoryLabel,
  onEdit, 
  onDelete, 
  onEditSupplementalInfo, 
  onDeleteSupplementalInfo,
  onEditControlContent,
  onDeleteControlContent,
  onAddControlContent,
  onCreate
}: ItemCardProps) {
  const [isCardHovering, setIsCardHovering] = useState(false);

  return (
    <div 
      className="relative group mb-4"
      onMouseEnter={() => setIsCardHovering(true)}
      onMouseLeave={() => setIsCardHovering(false)}
    >
      <div
        className="border-b pb-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      >
        <ItemContent 
          item={item}
          categoryLabel={categoryLabel}
          onEdit={onEdit}
          onDelete={onDelete}
          onEditSupplementalInfo={onEditSupplementalInfo}
          onDeleteSupplementalInfo={onDeleteSupplementalInfo}
          onEditControlContent={onEditControlContent}
          onDeleteControlContent={onDeleteControlContent}
          onAddControlContent={onAddControlContent}
        />
      </div>
      
      {/* ホバー時に表示される「評価項目を追加」ボタン */}
      {onCreate && isCardHovering && (
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => onCreate(item.categoryId)}
            className="px-4 py-1.5 bg-gray-600 dark:bg-gray-500 text-white text-sm font-medium rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
            title="評価項目を追加"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>評価項目を追加</span>
          </button>
        </div>
      )}
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
  onAddControlContent
}: ItemContentProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isSupplementalInfoHovering, setIsSupplementalInfoHovering] = useState(false);
  const hasControlContent = item.controlContents && item.controlContents.length > 0;
  const canAddControlContent = onAddControlContent && !hasControlContent;
  const hasSupplementalInfo = item.supplementalInfo && item.supplementalInfo.fields && item.supplementalInfo.fields.length > 0;

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
                className={`shrink-0 p-1 text-blue-600 dark:text-blue-400 rounded transition-all ${
                  isHovering ? 'opacity-100' : 'opacity-0'
                }`}
                title="統制内容を追加"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {item.name}
            </h3>
            
            {/* 補足情報アイコン */}
            {hasSupplementalInfo && (
              <div 
                className="relative shrink-0"
                onMouseEnter={() => setIsSupplementalInfoHovering(true)}
                onMouseLeave={() => setIsSupplementalInfoHovering(false)}
              >
                <div className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-500 text-white flex items-center justify-center text-xs font-bold cursor-help">
                  i
                </div>
                
                {/* ツールチップ */}
                {isSupplementalInfoHovering && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 p-4 animate-fadeIn">
                    <div className="absolute -top-2 left-3 w-4 h-4 bg-white dark:bg-zinc-800 border-l border-t border-zinc-200 dark:border-zinc-700 transform rotate-45"></div>
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        補足情報
                      </h4>
                      <div className="flex items-center gap-1">
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
                              e.stopPropagation();
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
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {item.supplementalInfo?.fields.map((field) => (
                        <div key={field.id} className="border-b border-zinc-100 dark:border-zinc-700 last:border-b-0 pb-2 last:pb-0">
                          <div className="mb-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                              {field.label}
                            </span>
                          </div>
                          {field.value ? (
                            <p className="text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                              {field.value}
                            </p>
                          ) : (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">未入力</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!hasSupplementalInfo && onEditSupplementalInfo && (
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

