'use client';

import { useState, useEffect } from 'react';
import { SupplementalInfoTemplate, SupplementalInfoFieldTemplate } from '../types/supplemental-info-template';
import { FieldType } from '../types/supplemental-info';

interface SupplementalInfoTemplateFormProps {
  template?: SupplementalInfoTemplate | null;
  onSubmit: (data: { name: string; description?: string; fields: Omit<SupplementalInfoFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[] }) => void;
  onCancel: () => void;
}

export default function SupplementalInfoTemplateForm({ template, onSubmit, onCancel }: SupplementalInfoTemplateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Omit<SupplementalInfoFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{ label: string; type: FieldType; usage?: string } | null>(null);

  useEffect(() => {
    // 名前は常に「補足情報」で固定
    setName('補足情報');
    if (template) {
      setDescription(template.description || '');
      setFields((template.fields || []).map(f => ({ label: f.label, type: f.type, usage: f.usage })));
    } else {
      setDescription('');
      setFields([]);
    }
    setEditingFieldIndex(null);
    setEditingField(null);
  }, [template]);

  const handleAddField = () => {
    setEditingField({ label: '', type: 'text', usage: '' });
    setEditingFieldIndex(null);
  };

  const handleEditField = (index: number) => {
    setEditingField({ ...fields[index] });
    setEditingFieldIndex(index);
  };

  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldSubmit = () => {
    if (!editingField || !editingField.label.trim()) {
      alert('ラベルを入力してください');
      return;
    }

    const newField = {
      label: editingField.label.trim(),
      type: editingField.type,
      usage: editingField.usage?.trim() || undefined,
    };

    if (editingFieldIndex !== null) {
      // 更新
      setFields(fields.map((f, i) => i === editingFieldIndex ? newField : f));
    } else {
      // 新規追加
      setFields([...fields, newField]);
    }

    setEditingField(null);
    setEditingFieldIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) {
      alert('フィールドを少なくとも1つ追加してください');
      return;
    }
    onSubmit({
      name: '補足情報', // 常に「補足情報」で固定
      description: description.trim() || undefined,
      fields,
    });
  };

  if (editingField !== null) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          {editingFieldIndex !== null ? 'フィールドを編集' : 'フィールドを追加'}
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); handleFieldSubmit(); }} className="space-y-4">
          <div>
            <label htmlFor="fieldLabel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              ラベル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fieldLabel"
              value={editingField.label}
              onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="ラベルを入力"
              required
            />
          </div>
          <div>
            <label htmlFor="fieldType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              タイプ <span className="text-red-500">*</span>
            </label>
            <select
              id="fieldType"
              value={editingField.type}
              onChange={(e) => setEditingField({ ...editingField, type: e.target.value as FieldType })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="text">テキストフィールド</option>
              <option value="file">ファイル</option>
            </select>
          </div>
          <div>
            <label htmlFor="fieldUsage" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              用途
            </label>
            <input
              type="text"
              id="fieldUsage"
              value={editingField.usage || ''}
              onChange={(e) => setEditingField({ ...editingField, usage: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="用途を入力（任意）"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setEditingField(null);
                setEditingFieldIndex(null);
              }}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {editingFieldIndex !== null ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          テンプレート名
        </label>
        <input
          type="text"
          id="name"
          value={name}
          readOnly
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          テンプレート名は「補足情報」で固定です
        </p>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          説明
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          placeholder="説明を入力（任意）"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">フィールド</h3>
          <button
            type="button"
            onClick={handleAddField}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            + フィールドを追加
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            フィールドがありません。フィールドを追加してください。
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={index}
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
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        用途: {field.usage}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditField(index)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('このフィールドを削除しますか？')) {
                          handleDeleteField(index);
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      削除
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
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          {template ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}

