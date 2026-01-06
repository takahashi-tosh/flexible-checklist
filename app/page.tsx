'use client';

import { useState, useEffect } from 'react';
import { EvaluationItem } from './types/evaluation-item';
import { Category } from './types/category';
import { getEvaluationItems, createEvaluationItem, updateEvaluationItem, deleteEvaluationItem, initializeSampleData } from './lib/storage';
import { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById } from './lib/category-storage';
import { sampleEvaluationItems } from './lib/sample-data';
import EvaluationItemList from './components/EvaluationItemList';
import EvaluationItemForm from './components/EvaluationItemForm';
import CategoryList from './components/CategoryList';
import CategoryForm from './components/CategoryForm';
import CategorySidebar from './components/CategorySidebar';
import CategorySettingsForm from './components/CategorySettingsForm';
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
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<EvaluationItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingControlContent, setEditingControlContent] = useState<ControlContent | null>(null);
  const [editingControlContentItemId, setEditingControlContentItemId] = useState<string | null>(null);
  const [editingSupplementalInfoItemId, setEditingSupplementalInfoItemId] = useState<string | null>(null);
  const [supplementalInfoTemplates, setSupplementalInfoTemplates] = useState<SupplementalInfoTemplate[]>([]);
  const [editingSupplementalInfoTemplate, setEditingSupplementalInfoTemplate] = useState<SupplementalInfoTemplate | null>(null);
  const [controlContentTemplates, setControlContentTemplates] = useState<ControlContentTemplate[]>([]);
  const [editingControlContentTemplate, setEditingControlContentTemplate] = useState<ControlContentTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showControlContentForm, setShowControlContentForm] = useState(false);
  const [showSupplementalInfoForm, setShowSupplementalInfoForm] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  useEffect(() => {
    setItems(getEvaluationItems());
    setCategories(getCategories());
    const supplementalTemplates = getSupplementalInfoTemplates();
    setSupplementalInfoTemplates(supplementalTemplates);
    const controlTemplates = getControlContentTemplates();
    setControlContentTemplates(controlTemplates);
  }, []);

  // 補足情報テンプレートビューに切り替えたときに、テンプレートが存在する場合は自動的に編集モードで表示
  useEffect(() => {
    if (viewMode === 'supplemental-info-templates' && !showForm) {
      const templates = getSupplementalInfoTemplates();
      if (templates.length > 0) {
        setEditingSupplementalInfoTemplate(templates[0]);
        setShowForm(true);
      }
    }
  }, [viewMode]);

  // カテゴリが変更されたときにサイドバーを更新
  useEffect(() => {
    if (viewMode === 'items') {
      setCategories(getCategories());
    }
  }, [viewMode]);

  // 選択されたカテゴリに基づいて評価項目をフィルタリング
  const filteredItems = selectedCategoryId
    ? items.filter(item => item.categoryId === selectedCategoryId)
    : items;

  // 選択されたカテゴリの情報を取得
  const selectedCategory = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;

  const handleCreate = (data: { name: string; description?: string; categoryId?: string }) => {
    createEvaluationItem(data);
    setItems(getEvaluationItems());
    // カテゴリが変更された場合はサイドバーを更新
    if (data.categoryId) {
      setSidebarRefreshTrigger(prev => prev + 1);
    }
    setShowForm(false);
  };

  const handleUpdate = (data: { name: string; description?: string; categoryId?: string }) => {
    if (editingItem) {
      updateEvaluationItem(editingItem.id, data);
      setItems(getEvaluationItems());
      // カテゴリが変更された場合はサイドバーを更新
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
    // 削除されたカテゴリが選択されていた場合は選択を解除
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
          usage: fieldTemplate.usage,
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
          usage: fieldTemplate.usage,
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
      alert('補足情報テンプレートがありません。先にテンプレートを作成してください。');
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
      setControlContentTemplates(getControlContentTemplates());
      setEditingControlContentTemplate(null);
      setShowForm(false);
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
      setSupplementalInfoTemplates(getSupplementalInfoTemplates());
      setEditingSupplementalInfoTemplate(null);
      setShowForm(false);
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

  const handleNewClick = () => {
    setEditingItem(null);
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleInitializeSampleData = () => {
    if (confirm('サンプルデータで初期化しますか？既存のデータはすべて削除されます。')) {
      initializeSampleData(sampleEvaluationItems);
      setItems(getEvaluationItems());
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* サイドバー */}
      {viewMode === 'items' && (
        <CategorySidebar
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          refreshTrigger={sidebarRefreshTrigger}
        />
      )}

      {/* メインコンテンツ */}
      <main className={`flex-1 overflow-y-auto overflow-x-auto ${viewMode === 'items' ? 'ml-80' : ''}`}>
        <div className={`${viewMode === 'items' ? 'min-w-fit' : 'max-w-6xl mx-auto'} px-4 py-8 sm:px-6 lg:px-8`}>
          {/* ヘッダー */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => {
                  setViewMode('items');
                  setShowForm(false);
                  setEditingItem(null);
                  setEditingCategory(null);
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'items'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                評価項目
              </button>
              <button
                onClick={() => {
                  setViewMode('categories');
                  setShowForm(false);
                  setEditingItem(null);
                  setEditingCategory(null);
                  setEditingSupplementalInfoTemplate(null);
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'categories'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                カテゴリ管理
              </button>
              <button
                onClick={() => {
                  setViewMode('supplemental-info-templates');
                  setEditingItem(null);
                  setEditingCategory(null);
                  const templates = getSupplementalInfoTemplates();
                  setSupplementalInfoTemplates(templates);
                  // テンプレートが存在する場合は自動的に編集モードで表示
                  if (templates.length > 0) {
                    setEditingSupplementalInfoTemplate(templates[0]);
                    setShowForm(true);
                  } else {
                    setEditingSupplementalInfoTemplate(null);
                    setShowForm(false);
                  }
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'supplemental-info-templates'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                補足情報テンプレート
              </button>
              <button
                onClick={() => {
                  setViewMode('control-content-templates');
                  setEditingItem(null);
                  setEditingCategory(null);
                  const templates = getControlContentTemplates();
                  setControlContentTemplates(templates);
                  // テンプレートが存在する場合は自動的に編集モードで表示
                  if (templates.length > 0) {
                    setEditingControlContentTemplate(templates[0]);
                    setShowForm(true);
                  } else {
                    setEditingControlContentTemplate(null);
                    setShowForm(false);
                  }
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'control-content-templates'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                統制内容テンプレート
              </button>
            </div>
            {viewMode === 'items' && !showForm && !showControlContentForm && !showSupplementalInfoForm && (
              <div className="flex gap-2">
                <button
                  onClick={handleInitializeSampleData}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  サンプルデータを読み込む
                </button>
                <button
                  onClick={handleNewClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  新規作成
                </button>
        </div>
            )}
            {viewMode === 'categories' && !showForm && (
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
            )}
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
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 min-w-fit">
              {selectedCategory && (
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {selectedCategory.label}
                  </h1>
                  {selectedCategory.content && (
                    <p className="text-zinc-600 dark:text-zinc-400">{selectedCategory.content}</p>
                  )}
                </div>
              )}
              {!selectedCategory && (
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                  評価項目リスト
                </h1>
              )}

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingItem ? '評価項目を編集' : '評価項目を新規作成'}
                  </h2>
                  <EvaluationItemForm
                    item={editingItem}
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
                <EvaluationItemList
                  items={filteredItems}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddControlContent={handleAddControlContent}
                  onEditControlContent={handleEditControlContent}
                  onDeleteControlContent={handleDeleteControlContent}
                  onEditSupplementalInfo={handleEditSupplementalInfo}
                  onDeleteSupplementalInfo={handleDeleteSupplementalInfo}
                />
              )}
            </div>
          )}

          {/* カテゴリ管理ビュー */}
          {viewMode === 'categories' && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                カテゴリ管理
              </h1>

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingCategory ? 'カテゴリを編集' : 'カテゴリを新規作成'}
                  </h2>
                  <CategoryForm
                    category={editingCategory}
                    onSubmit={editingCategory ? handleCategoryUpdate : handleCategoryCreate}
                    onCancel={handleCancel}
                  />
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <CategorySettingsForm
                      onUpdate={() => {
                        setSidebarRefreshTrigger(prev => prev + 1);
                      }}
                    />
                  </div>
                  <CategoryList
                    categories={categories}
                    onEdit={handleCategoryEdit}
                    onDelete={handleCategoryDelete}
                  />
                </>
              )}
            </div>
          )}

          {/* 補足情報テンプレート管理ビュー */}
          {viewMode === 'supplemental-info-templates' && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                補足情報テンプレート管理
              </h1>

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingSupplementalInfoTemplate ? 'テンプレートを編集' : 'テンプレートを新規作成'}
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
                  補足情報テンプレートがありません。新規作成してください。
                </div>
              )}
            </div>
          )}

          {/* 統制内容テンプレート管理ビュー */}
          {viewMode === 'control-content-templates' && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
                統制内容テンプレート管理
              </h1>

              {showForm ? (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    {editingControlContentTemplate ? 'テンプレートを編集' : 'テンプレートを新規作成'}
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
