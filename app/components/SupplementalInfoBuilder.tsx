'use client';

import { useState, useEffect } from 'react';
import { SupplementalInfo, SupplementalInfoField } from '../types/supplemental-info';
import { SupplementalInfoTemplate } from '../types/supplemental-info-template';
import { getSupplementalInfoTemplates } from '../lib/supplemental-info-template-storage';
import SupplementalInfoFieldForm from './SupplementalInfoFieldForm';

interface SupplementalInfoBuilderProps {
  supplementalInfo?: SupplementalInfo | null;
  onSubmit: (data: { fields: SupplementalInfoField[] }) => void;
  onCancel: () => void;
}

export default function SupplementalInfoBuilder({ supplementalInfo, onSubmit, onCancel }: SupplementalInfoBuilderProps) {
  const [fields, setFields] = useState<SupplementalInfoField[]>(supplementalInfo?.fields || []);
  const [editingField, setEditingField] = useState<SupplementalInfoField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [templates, setTemplates] = useState<SupplementalInfoTemplate[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [fileMap, setFileMap] = useState<Map<string, File>>(new Map());

  useEffect(() => {
    setTemplates(getSupplementalInfoTemplates());
    // 既存の補足情報がない場合は、テンプレート選択画面を表示
    if (!supplementalInfo?.fields || supplementalInfo.fields.length === 0) {
      setShowTemplateSelector(true);
    } else {
      // すべてのフィールドを展開状態にする
      setExpandedFields(new Set(supplementalInfo.fields.map(f => f.id)));
    }
  }, [supplementalInfo]);

  const handleSelectTemplate = (template: SupplementalInfoTemplate) => {
    const now = new Date().toISOString();
    // 既存のフィールドの値を保持するために、ラベルとタイプでマッチング
    const existingFieldsMap = new Map<string, SupplementalInfoField>();
    fields.forEach(field => {
      const key = `${field.label}_${field.type}`;
      existingFieldsMap.set(key, field);
    });

    const newFields: SupplementalInfoField[] = (template.fields || []).map(fieldTemplate => {
      const key = `${fieldTemplate.label}_${fieldTemplate.type}`;
      const existingField = existingFieldsMap.get(key);
      
      if (existingField) {
        // 既存のフィールドがある場合は、値を保持
        return {
          ...existingField,
          label: fieldTemplate.label,
          type: fieldTemplate.type,
          updatedAt: now,
        };
      } else {
        // 新規フィールド
        return {
          id: crypto.randomUUID(),
          label: fieldTemplate.label,
          type: fieldTemplate.type,
          value: undefined,
          createdAt: now,
          updatedAt: now,
        };
    // すべてのフィールドを展開状態にする
    setExpandedFields(new Set(newFields.map(f => f.id)));
      }
    });
    setFields(newFields);
    setShowTemplateSelector(false);
  };

  const handleEditField = (field: SupplementalInfoField) => {
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleToggleExpand = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const handleFieldValueChange = (fieldId: string, value: string | undefined) => {
    const now = new Date().toISOString();
    setFields(fields.map(f =>
      f.id === fieldId
        ? { ...f, value, updatedAt: now }
        : f
    ));
  };

  const handleFieldSubmit = (data: { label: string; type: 'file' | 'text' | 'evaluation'; value?: string }) => {
    const now = new Date().toISOString();
    if (editingField) {
      // 値のみ更新（ラベル、タイプ、用途はテンプレートから変更不可）
      setFields(fields.map(f =>
        f.id === editingField.id
          ? { ...f, value: data.value, updatedAt: now }
          : f
      ));
    }
    setShowFieldForm(false);
    setEditingField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) {
      alert('テンプレートを選択してください');
      return;
    }
    onSubmit({ fields });
  };

  const handleCancelFieldForm = () => {
    setShowFieldForm(false);
    setEditingField(null);
  };

  if (showFieldForm) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          フィールドの値を編集
        </h3>
        <SupplementalInfoFieldForm
          field={editingField}
          onSubmit={handleFieldSubmit}
          onCancel={handleCancelFieldForm}
          valueOnly={true}
        />
      </div>
    );
  }

  if (showTemplateSelector) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">テンプレートを選択 <span className="text-red-500">*</span></h3>
          <button
            type="button"
            onClick={() => {
              if (fields.length === 0) {
                // フィールドが空の場合は、前の画面に戻る
                onCancel();
              } else {
                // フィールドがある場合は、テンプレート選択を閉じる
                setShowTemplateSelector(false);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            キャンセル
          </button>
        </div>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="mb-4">テンプレートがありません。</p>
            <p className="text-sm mb-4">補足情報管理画面でテンプレートを作成してください。</p>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              戻る
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {template.name}
                </h4>
                {template.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                    {template.description}
                  </p>
                )}
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  フィールド数: {template.fields.length}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">補足情報フィールド</h3>
          <button
            type="button"
            onClick={() => setShowTemplateSelector(true)}
            className="px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border border-green-600 dark:border-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            テンプレートを再選択
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            テンプレートを選択してください。
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => {
              const isExpanded = expandedFields.has(field.id);
              return (
                <div
                  key={field.id}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800"
                >
                  <div className="flex justify-between items-start p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {field.type === 'file' ? '📎 ファイル' : field.type === 'evaluation' ? '⭐ 評価' : '📝 テキストフィールド'}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                        {field.label}
                      </h4>
                      {!isExpanded && (
                        field.value ? (
                          <p className="text-sm text-zinc-900 dark:text-zinc-100">
                            {field.type === 'file' ? `ファイル: ${field.value}` : field.value}
                          </p>
                        ) : (
                          <p className="text-sm text-zinc-400 dark:text-zinc-500">未入力</p>
                        )
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(field.id)}
                        className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1"
                        title={isExpanded ? '閉じる' : '編集する'}
                      >
                        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        値
                      </label>
                      {field.type === 'text' && (
                        <textarea
                          value={field.value || ''}
                          onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                          placeholder="テキストを入力"
                        />
                      )}
                      {field.type === 'file' && (
                        <div>
                          <input
                            type="file"
                            onChange={(e) => {
                              const selectedFile = e.target.files?.[0];
                              if (selectedFile) {
                                setFileMap(prev => new Map(prev).set(field.id, selectedFile));
                                handleFieldValueChange(field.id, selectedFile.name);
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {field.value && (
                            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                              選択されたファイル: {field.value}
                              {fileMap.get(field.id) && ` (${(fileMap.get(field.id)!.size / 1024).toFixed(2)} KB)`}
                            </p>
                          )}
                        </div>
                      )}
                      {field.type === 'evaluation' && (
                        <input
                          type="text"
                          value={field.value || ''}
                          onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="評価を入力"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
          disabled={fields.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存
        </button>
      </div>
    </form>
  );
}

