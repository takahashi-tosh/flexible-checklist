'use client';

import { useState, useEffect } from 'react';
import { SupplementalInfoField, FieldType } from '../types/supplemental-info';

interface SupplementalInfoFieldFormProps {
  field?: SupplementalInfoField | null;
  onSubmit: (data: { label: string; type: FieldType; value?: string }) => void;
  onCancel: () => void;
  valueOnly?: boolean; // 値のみ編集可能にするか
}

export default function SupplementalInfoFieldForm({ field, onSubmit, onCancel, valueOnly = false }: SupplementalInfoFieldFormProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [value, setValue] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (field) {
      setLabel(field.label);
      setType(field.type);
      setValue(field.value || '');
      setFile(null);
    } else {
      setLabel('');
      setType('text');
      setValue('');
      setFile(null);
    }
  }, [field]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValue(selectedFile.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueOnly && !label.trim()) {
      alert('ラベルを入力してください');
      return;
    }
    
    const finalValue = type === 'file' && file ? file.name : value.trim();
    onSubmit({
      label: label.trim(),
      type,
      value: finalValue || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!valueOnly && (
        <>
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              ラベル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="ラベルを入力"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              タイプ <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as FieldType);
                setValue('');
                setFile(null);
              }}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="text">テキストフィールド</option>
              <option value="file">ファイル</option>
            </select>
          </div>
        </>
      )}
      {valueOnly && (
        <>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              ラベル
            </label>
            <div className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              {label}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              タイプ
            </label>
            <div className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              {type === 'file' ? 'ファイル' : 'テキストフィールド'}
            </div>
          </div>
        </>
      )}
      {type === 'file' ? (
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            ファイル
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          {value && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              選択されたファイル: {value}
            </p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            テキスト
          </label>
          <textarea
            id="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
            placeholder="テキストを入力（任意）"
          />
        </div>
      )}
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
          {field ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}

