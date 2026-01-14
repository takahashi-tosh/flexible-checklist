'use client';

import { useState, useEffect } from 'react';
import { EvaluationItem } from './types/evaluation-item';
import { Category } from './types/category';
import { getEvaluationItems, createEvaluationItem, updateEvaluationItem, deleteEvaluationItem } from './lib/storage';
import { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById } from './lib/category-storage';
import { resetAndImportSeedData } from './lib/seed-data-import';
import EvaluationItemList from './components/EvaluationItemList';
import EvaluationItemForm from './components/EvaluationItemForm';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import CategorySidebar from './components/CategorySidebar';
import ControlContentForm from './components/ControlContentForm';
import SupplementalInfoBuilder from './components/SupplementalInfoBuilder';
import SupplementalInfoTemplateList from './components/SupplementalInfoTemplateList';
import SupplementalInfoTemplateForm from './components/SupplementalInfoTemplateForm';
import ControlContentTemplateList from './components/ControlContentTemplateList';
import ControlContentTemplateForm from './components/ControlContentTemplateForm';
import { ControlContent } from './types/control-content';
import { SupplementalInfo, SupplementalInfoField } from './types/supplemental-info';
import { SupplementalInfoTemplate } from './types/supplemental-info-template';
import { ControlContentTemplate } from './types/control-content-template';
import { getSupplementalInfoTemplates, createSupplementalInfoTemplate, updateSupplementalInfoTemplate, deleteSupplementalInfoTemplate } from './lib/supplemental-info-template-storage';
import { getControlContentTemplates, createControlContentTemplate, updateControlContentTemplate, deleteControlContentTemplate } from './lib/control-content-template-storage';

type ViewMode = 'items' | 'categories' | 'supplemental-info-templates' | 'control-content-templates';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('items');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [items, setItems] = useState<EvaluationItem[]>(() => getEvaluationItems());
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [editingItem, setEditingItem] = useState<EvaluationItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingControlContent, setEditingControlContent] = useState<ControlContent | null>(null);
  const [editingControlContentItemId, setEditingControlContentItemId] = useState<string | null>(null);
  const [editingSupplementalInfoItemId, setEditingSupplementalInfoItemId] = useState<string | null>(null);
  const [supplementalInfoTemplates, setSupplementalInfoTemplates] = useState<SupplementalInfoTemplate[]>(() => getSupplementalInfoTemplates());
  const [editingSupplementalInfoTemplate, setEditingSupplementalInfoTemplate] = useState<SupplementalInfoTemplate | null>(null);
  const [controlContentTemplates, setControlContentTemplates] = useState<ControlContentTemplate[]>(() => getControlContentTemplates());
  const [editingControlContentTemplate, setEditingControlContentTemplate] = useState<ControlContentTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showControlContentForm, setShowControlContentForm] = useState(false);
  const [showSupplementalInfoForm, setShowSupplementalInfoForm] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>(undefined);

  // 補足情報ビューに切り替えたときに、テンプレートが存在する場合は自動的に編集モードで表示
  useEffect(() => {
    if (viewMode === 'supplemental-info-templates' && !showForm && !editingSupplementalInfoTemplate) {
      const templates = getSupplementalInfoTemplates();
      if (templates.length > 0) {
        setEditingSupplementalInfoTemplate(templates[0]);
        setShowForm(true);
      }
    }
  }, [viewMode, showForm, editingSupplementalInfoTemplate]);

  // 選択された大項目/中項目の情報を取得
  const selectedCategory = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;

  const handleCreate = (data: { name: string; description?: string; categoryId?: string }) => {
    createEvaluationItem(data);
    setItems(getEvaluationItems());
    // 大項目/中項目が変更された場合はサイドバーを更新
    if (data.categoryId) {
      setSidebarRefreshTrigger(prev => prev + 1);
    }
    setShowForm(false);
  };

  const handleUpdate = (data: { name: string; description?: string; categoryId?: string }) => {
    if (editingItem) {
      updateEvaluationItem(editingItem.id, data);
      setItems(getEvaluationItems());
      // 大項目/中項目が変更された場合はサイドバーを更新
      if (data.categoryId !== editingItem.categoryId) {
        setSidebarRefreshTrigger(prev => prev + 1);
      }
      setEditingItem(null);
      setShowForm(false);
    }
  };

  const handleCategoryCreate = (data: { label: string; content?: string; parentId?: string }) => {
    createCategory(data);
    setCategories(getCategories());
    setSidebarRefreshTrigger(prev => prev + 1);
    setShowForm(false);
  };

  const handleCategoryUpdate = (data: { label: string; content?: string; parentId?: string }) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
      setCategories(getCategories());
      setSidebarRefreshTrigger(prev => prev + 1);
      setEditingCategory(null);
      setShowForm(false);
    }
  };

  const handleEdit = (item: EvaluationItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteEvaluationItem(id);
    setItems(getEvaluationItems());
    if (editingItem?.id === id) {
      setEditingItem(null);
      setShowForm(false);
    }
  };

  const handleCategoryDelete = (id: string) => {
    deleteCategory(id);
    setCategories(getCategories());
    setSidebarRefreshTrigger(prev => prev + 1);
    if (editingCategory?.id === id) {
      setEditingCategory(null);
      setShowForm(false);
    }
    // 削除された大項目/中項目が選択されていた場合は選択を解除
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditingCategory(null);
    setEditingSupplementalInfoTemplate(null);
    setEditingControlContentTemplate(null);
    setShowForm(false);
    setEditingControlContent(null);
    setEditingControlContentItemId(null);
    setShowControlContentForm(false);
    setEditingSupplementalInfoItemId(null);
    setShowSupplementalInfoForm(false);
  };

  const handleAddControlContent = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // テンプレートを取得
    const templates = getControlContentTemplates();
    if (templates.length === 0) {
      alert('統制内容テンプレートがありません。先にテンプレートを作成してください。');
      return;
    }

    // テンプレートからデータを作成（1つしかない場合はそれを使用）
    const template = templates[0];
    const now = new Date().toISOString();
    const newFields: import('./types/control-content').ControlContentField[] = (template.fields || []).map(fieldTemplate => {
      if (fieldTemplate.type === 'evaluation') {
        return {
          id: crypto.randomUUID(),
          label: fieldTemplate.label,
          type: fieldTemplate.type,
          evaluationValue: fieldTemplate.evaluationDefaults ? {
            conclusion: fieldTemplate.evaluationDefaults.conclusion,
            evaluationProcess: fieldTemplate.evaluationDefaults.evaluationProcess,
            detectedItems: fieldTemplate.evaluationDefaults.detectedItems,
            evaluationDate: fieldTemplate.evaluationDefaults.evaluationDate,
          } : undefined,
          createdAt: now,
          updatedAt: now,
        };
      } else {
        return {
          id: crypto.randomUUID(),
          label: fieldTemplate.label,
          type: fieldTemplate.type,
          value: undefined,
          createdAt: now,
          updatedAt: now,
        };
      }
    });

    // データを作成して保存
    const newControlContent: ControlContent = {
      fields: newFields,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedControlContents = [...(item.controlContents || []), newControlContent];
    updateEvaluationItem(itemId, { controlContents: updatedControlContents });
    setItems(getEvaluationItems());
  };

  const handleEditControlContent = (itemId: string, controlContent: ControlContent) => {
    setEditingControlContentItemId(itemId);
    setEditingControlContent(controlContent);
    setShowControlContentForm(true);
  };

  const handleCreateControlContent = (data: { fields: import('./types/control-content').ControlContentField[] }) => {
    // handleAddControlContentで既にデータを作成しているため、ここでは更新のみ
    if (!editingControlContentItemId || !editingControlContent) return;
    
    const item = items.find(i => i.id === editingControlContentItemId);
    if (!item) return;

    const updatedControlContents = (item.controlContents || []).map(cc =>
      cc.id === editingControlContent.id
        ? { ...cc, fields: data.fields, updatedAt: new Date().toISOString() }
        : cc
    );

    updateEvaluationItem(editingControlContentItemId, { controlContents: updatedControlContents });
    setItems(getEvaluationItems());
    setShowControlContentForm(false);
    setEditingControlContent(null);
    setEditingControlContentItemId(null);
  };

  const handleUpdateControlContent = (data: { fields: import('./types/control-content').ControlContentField[] }) => {
    if (!editingControlContentItemId || !editingControlContent) return;
    
    const item = items.find(i => i.id === editingControlContentItemId);
    if (!item) return;

    const updatedControlContents = (item.controlContents || []).map(cc =>
      cc.id === editingControlContent.id
        ? { ...cc, fields: data.fields, updatedAt: new Date().toISOString() }
        : cc
    );

    updateEvaluationItem(editingControlContentItemId, { controlContents: updatedControlContents });
    setItems(getEvaluationItems());
    setShowControlContentForm(false);
    setEditingControlContent(null);
    setEditingControlContentItemId(null);
  };

  const handleDeleteControlContent = (itemId: string, controlContentId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const updatedControlContents = (item.controlContents || []).filter(cc => cc.id !== controlContentId);
    updateEvaluationItem(itemId, { controlContents: updatedControlContents });
    setItems(getEvaluationItems());
  };


  const handleEditSupplementalInfo = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // 既に補足情報がある場合は編集モードで開く
    if (item.supplementalInfo) {
      setEditingSupplementalInfoItemId(itemId);
      setShowSupplementalInfoForm(true);
      return;
    }

    // テンプレートを取得
    const templates = getSupplementalInfoTemplates();
    if (templates.length === 0) {
      alert('補足情報がありません。先にテンプレートを作成してください。');
      return;
    }

    // テンプレートからデータを作成（1つしかない場合はそれを使用）
    const template = templates[0];
    const now = new Date().toISOString();
    const newFields: SupplementalInfoField[] = (template.fields || []).map(fieldTemplate => ({
      id: crypto.randomUUID(),
      label: fieldTemplate.label,
      type: fieldTemplate.type,
      value: undefined,
      createdAt: now,
      updatedAt: now,
    }));

    // データを作成して保存
    const newSupplementalInfo: SupplementalInfo = {
      fields: newFields,
      createdAt: now,
      updatedAt: now,
    };

    updateEvaluationItem(itemId, { supplementalInfo: newSupplementalInfo });
    setItems(getEvaluationItems());
  };

  const handleCreateOrUpdateSupplementalInfo = (data: { fields: SupplementalInfoField[] }) => {
    if (!editingSupplementalInfoItemId) return;
    
    const item = items.find(i => i.id === editingSupplementalInfoItemId);
    if (!item) return;

    const now = new Date().toISOString();
    let supplementalInfo: SupplementalInfo;

    if (item.supplementalInfo) {
      // 既存の補足情報を更新
      supplementalInfo = {
        ...item.supplementalInfo,
        fields: data.fields,
        updatedAt: now,
      };
    } else {
      // 新しい補足情報を作成
      supplementalInfo = {
        fields: data.fields,
        createdAt: now,
        updatedAt: now,
      };
    }

    updateEvaluationItem(editingSupplementalInfoItemId, { supplementalInfo });
    setItems(getEvaluationItems());
    setShowSupplementalInfoForm(false);
    setEditingSupplementalInfoItemId(null);
  };

  const handleDeleteSupplementalInfo = (itemId: string) => {
    updateEvaluationItem(itemId, { supplementalInfo: undefined });
    setItems(getEvaluationItems());
  };

  const handleControlContentTemplateCreate = (data: {
    name: string;
    description?: string;
    fields: Omit<import('./types/control-content-template').ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[];
  }) => {
    createControlContentTemplate(data);
    setControlContentTemplates(getControlContentTemplates());
    setShowForm(false);
    setEditingControlContentTemplate(null);
  };

  const handleControlContentTemplateUpdate = (data: {
    name: string;
    description?: string;
    fields: Omit<import('./types/control-content-template').ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[];
  }) => {
    if (editingControlContentTemplate) {
      updateControlContentTemplate(editingControlContentTemplate.id, data);
      // ページを強制的にリロード（キャッシュをクリア）
      window.location.reload();
    }
  };

  const handleControlContentTemplateEdit = (template: ControlContentTemplate) => {
    setEditingControlContentTemplate(template);
    setShowForm(true);
  };

  const handleControlContentTemplateDelete = (id: string) => {
    deleteControlContentTemplate(id);
    setControlContentTemplates(getControlContentTemplates());
    if (editingControlContentTemplate?.id === id) {
      setEditingControlContentTemplate(null);
      setShowForm(false);
    }
  };

  const handleSupplementalInfoTemplateCreate = (data: { name: string; description?: string; fields: Omit<import('./types/supplemental-info-template').SupplementalInfoFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[] }) => {
    createSupplementalInfoTemplate(data);
    setSupplementalInfoTemplates(getSupplementalInfoTemplates());
    setShowForm(false);
    setEditingSupplementalInfoTemplate(null);
  };

  const handleSupplementalInfoTemplateUpdate = (data: { name: string; description?: string; fields: Omit<import('./types/supplemental-info-template').SupplementalInfoFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[] }) => {
    if (editingSupplementalInfoTemplate) {
      updateSupplementalInfoTemplate(editingSupplementalInfoTemplate.id, data);
      // ページを強制的にリロード（キャッシュをクリア）
      window.location.reload();
    }
  };

  const handleSupplementalInfoTemplateEdit = (template: SupplementalInfoTemplate) => {
    setEditingSupplementalInfoTemplate(template);
    setShowForm(true);
  };

  const handleSupplementalInfoTemplateDelete = (id: string) => {
    deleteSupplementalInfoTemplate(id);
    setSupplementalInfoTemplates(getSupplementalInfoTemplates());
    if (editingSupplementalInfoTemplate?.id === id) {
      setEditingSupplementalInfoTemplate(null);
      setShowForm(false);
    }
  };

  const handleNewClick = (categoryId?: string) => {
    setEditingItem(null);
    setEditingCategory(null);
    setDefaultCategoryId(categoryId);
    setShowForm(true);
  };

  const handleResetAllData = () => {
    if (confirm('すべてのデータをリセットしますか？この操作は取り消せません。')) {
      // すべてのlocalStorageをクリア
      localStorage.removeItem('evaluation-items');
      localStorage.removeItem('categories');
      localStorage.removeItem('control-content-templates');
      localStorage.removeItem('supplemental-info-templates');
      // すべてのデータを再読み込み
      setItems(getEvaluationItems());
      setCategories(getCategories());
      setSupplementalInfoTemplates(getSupplementalInfoTemplates());
      setControlContentTemplates(getControlContentTemplates());
      setSelectedCategoryId(null);
      setSidebarRefreshTrigger(prev => prev + 1);
      alert('すべてのデータをリセットしました');
    }
  };

  const handleImportSeedData = () => {
    if (confirm('seedデータをインポートしますか？既存のデータはすべて削除されます。')) {
      resetAndImportSeedData();
      // ページを強制的にリロード（キャッシュをクリア）
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* サイドバー */}
      <CategorySidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(categoryId) => {
          setSelectedCategoryId(categoryId);
          // 大項目/中項目を選択したら評価項目ビューに切り替えてスクロール
          if (viewMode !== 'items') {
            setViewMode('items');
            setShowForm(false);
            setEditingItem(null);
            setEditingCategory(null);
            setEditingSupplementalInfoTemplate(null);
            setEditingControlContentTemplate(null);
            setShowControlContentForm(false);
            setShowSupplementalInfoForm(false);
          }
          
          // 大項目/中項目が選択されている場合、該当する見出しにスクロール
          if (categoryId) {
            // DOMの更新後にスクロール処理を実行
            setTimeout(() => {
              const element = document.getElementById(`category-${categoryId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }
        }}
        refreshTrigger={sidebarRefreshTrigger}
        onSelectView={(view) => {
          setViewMode(view);
          setEditingItem(null);
          setEditingCategory(null);
          if (view === 'categories') {
            // 大項目/中項目管理ビューに遷移
            setShowForm(false);
            setEditingSupplementalInfoTemplate(null);
            setEditingControlContentTemplate(null);
          } else if (view === 'supplemental-info-templates') {
            const templates = getSupplementalInfoTemplates();
            setSupplementalInfoTemplates(templates);
            if (templates.length > 0) {
              setEditingSupplementalInfoTemplate(templates[0]);
              setShowForm(true);
            } else {
              setEditingSupplementalInfoTemplate(null);
              setShowForm(false);
            }
          } else if (view === 'control-content-templates') {
            const templates = getControlContentTemplates();
            setControlContentTemplates(templates);
            if (templates.length > 0) {
              setEditingControlContentTemplate(templates[0]);
              setShowForm(true);
            } else {
              setEditingControlContentTemplate(null);
              setShowForm(false);
            }
          }
        }}
        currentView={viewMode}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto overflow-x-auto ml-80">
        <div className={`${viewMode === 'items' ? 'min-w-fit h-full' : 'max-w-6xl mx-auto'}`}>
          {/* ヘッダー */}
          <div className="flex justify-between items-center">
            {viewMode === 'supplemental-info-templates' && !showForm && supplementalInfoTemplates.length === 0 && (
              <button
                onClick={() => {
                  setEditingSupplementalInfoTemplate(null);
                  setEditingCategory(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                新規作成
              </button>
            )}
            {viewMode === 'control-content-templates' && !showForm && controlContentTemplates.length === 0 && (
              <button
                onClick={() => {
                  setEditingControlContentTemplate(null);
                  setEditingCategory(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                新規作成
              </button>
            )}
          </div>

          {/* 評価項目ビュー */}
          {viewMode === 'items' && (
            <div className="bg-white dark:bg-zinc-900 p-8 sm:p-8 min-w-fit h-full">
              {selectedCategory && (
                <div className="">
                  <div className="flex justify-between items-start">
                  </div>
                  {selectedCategory.content && (
                    <p className="text-zinc-600 dark:text-zinc-400">{selectedCategory.content}</p>
                  )}
                </div>
              )}
              {!selectedCategory && (
                <div className="flex justify-between items-center">
                </div>
              )}

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingItem ? '評価項目を編集' : '評価項目を新規作成'}
                  </h2>
                  <EvaluationItemForm
                    item={editingItem}
                    defaultCategoryId={defaultCategoryId}
                    onSubmit={editingItem ? handleUpdate : handleCreate}
                    onCancel={handleCancel}
                  />
                </div>
              ) : showControlContentForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingControlContent ? '統制内容を編集' : '統制内容を新規作成'}
                  </h2>
                  <ControlContentForm
                    controlContent={editingControlContent}
                    onSubmit={editingControlContent ? handleUpdateControlContent : handleCreateControlContent}
                    onCancel={handleCancel}
                  />
                </div>
              ) : showSupplementalInfoForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    補足情報{editingSupplementalInfoItemId && items.find(i => i.id === editingSupplementalInfoItemId)?.supplementalInfo ? 'を編集' : 'を新規作成'}
                  </h2>
                  <SupplementalInfoBuilder
                    supplementalInfo={editingSupplementalInfoItemId ? items.find(i => i.id === editingSupplementalInfoItemId)?.supplementalInfo : null}
                    onSubmit={handleCreateOrUpdateSupplementalInfo}
                    onCancel={handleCancel}
                  />
                </div>
              ) : (
                <>
                  <EvaluationItemList
                    items={items}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleNewClick}
                    onAddControlContent={handleAddControlContent}
                    onEditControlContent={handleEditControlContent}
                    onDeleteControlContent={handleDeleteControlContent}
                    onEditSupplementalInfo={handleEditSupplementalInfo}
                    onDeleteSupplementalInfo={handleDeleteSupplementalInfo}
                  />
                  {/* フローティングボタン */}
                  <button
                    onClick={handleResetAllData}
                    className="fixed bottom-8 right-90 px-6 py-3 bg-gray-100 dark:bg-gray-200 text-white rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-100 transition-all hover:scale-105 flex items-center gap-2 z-50 font-medium"
                    title="データをリセット"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="gray" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className='text-gray-500'>データをリセット</span>
                  </button>
                  <button
                    onClick={handleImportSeedData}
                    className="fixed bottom-8 right-10 px-6 py-3 bg-gray-100 dark:bg-gray-200 text-white rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-all hover:scale-105 flex items-center gap-2 z-50 font-medium"
                    title="seedデータをインポート"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="gray" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className='text-gray-500'>サンプル(FCRP)をインポート</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* 大項目/中項目管理ビュー */}
          {viewMode === 'categories' && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  大項目/中項目
                </h1>
                <div className="flex gap-2">
                  {!showForm && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setEditingSupplementalInfoTemplate(null);
                          setShowForm(true);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                      >
                        新規作成
                      </button>
                    </>
                  )}
                </div>
              </div>

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingCategory ? '大項目/中項目を編集' : '大項目/中項目を新規作成'}
                  </h2>
                  <CategoryForm
                    category={editingCategory}
                    onSubmit={editingCategory ? handleCategoryUpdate : handleCategoryCreate}
                    onCancel={handleCancel}
                  />
                </div>
              ) : (
                <>
                  {/* <div className="mb-6">
                    <CategorySettingsForm
                      onUpdate={() => {
                        setSidebarRefreshTrigger(prev => prev + 1);
                      }}
                    />
                  </div> */}
                  <CategoryList
                    categories={categories}
                    onEdit={handleCategoryEdit}
                    onDelete={handleCategoryDelete}
                  />
                </>
              )}
            </div>
          )}

          {/* 補足情報管理ビュー */}
          {viewMode === 'supplemental-info-templates' && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                補足情報管理
              </h1>

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingSupplementalInfoTemplate ? 'フォームをカスタマイズ' : 'フォームをカスタマイズ'}
                  </h2>
                  <SupplementalInfoTemplateForm
                    template={editingSupplementalInfoTemplate}
                    onSubmit={editingSupplementalInfoTemplate ? handleSupplementalInfoTemplateUpdate : handleSupplementalInfoTemplateCreate}
                    onCancel={handleCancel}
                  />
                </div>
              ) : supplementalInfoTemplates.length > 0 ? (
                <div>
                  <SupplementalInfoTemplateList
                    templates={supplementalInfoTemplates}
                    onEdit={handleSupplementalInfoTemplateEdit}
                    onDelete={handleSupplementalInfoTemplateDelete}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  補足情報がありません。新規作成してください。
                </div>
              )}
            </div>
          )}

          {/* 統制内容テンプレート管理ビュー */}
          {viewMode === 'control-content-templates' && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                統制内容管理
              </h1>

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingControlContentTemplate ? 'フォームをカスタマイズ' : 'フォームをカスタマイズ'}
                  </h2>
                  <ControlContentTemplateForm
                    template={editingControlContentTemplate}
                    onSubmit={editingControlContentTemplate ? handleControlContentTemplateUpdate : handleControlContentTemplateCreate}
                    onCancel={handleCancel}
                  />
                </div>
              ) : controlContentTemplates.length > 0 ? (
                <div>
                  <ControlContentTemplateList
                    templates={controlContentTemplates}
                    onEdit={handleControlContentTemplateEdit}
                    onDelete={handleControlContentTemplateDelete}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  統制内容テンプレートがありません。新規作成してください。
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
