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

  useEffect(() => {
    setTemplates(getSupplementalInfoTemplates());
    // 既存の補足情報がない場合は、テンプレート選択画面を表示
    if (!supplementalInfo?.fields || supplementalInfo.fields.length === 0) {
      setShowTemplateSelector(true);
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
          usage: fieldTemplate.usage,
          updatedAt: now,
        };
      } else {
        // 新規フィールド
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
    setFields(newFields);
    setShowTemplateSelector(false);
  };

  const handleEditField = (field: SupplementalInfoField) => {
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleFieldSubmit = (data: { label: string; type: 'file' | 'text' | 'evaluation'; value?: string; usage?: string }) => {
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
            <p className="text-sm mb-4">補足情報テンプレート管理画面でテンプレートを作成してください。</p>
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
            {fields.map((field) => (
              <div
                key={field.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {field.type === 'file' ? 'ファイル' : 'テキストフィールド'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      {field.label}
                    </h4>
                    {field.usage && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                        用途: {field.usage}
                      </p>
                    )}
                    {field.value ? (
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">
                        {field.type === 'file' ? `ファイル: ${field.value}` : field.value}
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-400 dark:text-zinc-500">未入力</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditField(field)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      値を編集
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

