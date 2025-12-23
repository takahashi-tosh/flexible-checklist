'use client';

import { useState, useEffect } from 'react';
import { EvaluationObject, ConclusionType, EvaluationObjectField } from '../types/evaluation-object';
import { FieldType } from '../types/supplemental-info';
import SupplementalInfoFieldForm from './SupplementalInfoFieldForm';

interface EvaluationObjectFormProps {
  evaluationObject?: EvaluationObject | null;
  onSubmit: (data: {
    conclusion?: ConclusionType;
    evaluationProcess?: string;
    detectedItems?: string;
    evaluationDate?: string;
    fields: EvaluationObjectField[];
  }) => void;
  onCancel: () => void;
}

export default function EvaluationObjectForm({ evaluationObject, onSubmit, onCancel }: EvaluationObjectFormProps) {
  const [conclusion, setConclusion] = useState<ConclusionType | ''>('');
  const [evaluationProcess, setEvaluationProcess] = useState('');
  const [detectedItems, setDetectedItems] = useState('');
  const [evaluationDate, setEvaluationDate] = useState('');
  const [fields, setFields] = useState<EvaluationObjectField[]>([]);
  const [editingField, setEditingField] = useState<EvaluationObjectField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);

  useEffect(() => {
    if (evaluationObject) {
      setConclusion(evaluationObject.conclusion || '');
      setEvaluationProcess(evaluationObject.evaluationProcess || '');
      setDetectedItems(evaluationObject.detectedItems || '');
      setEvaluationDate(evaluationObject.evaluationDate || '');
      setFields(evaluationObject.fields || []);
    } else {
      setConclusion('');
      setEvaluationProcess('');
      setDetectedItems('');
      setEvaluationDate('');
      setFields([]);
    }
    setEditingField(null);
    setShowFieldForm(false);
  }, [evaluationObject]);

  const handleAddField = () => {
    setEditingField(null);
    setShowFieldForm(true);
  };

  const handleEditField = (field: EvaluationObjectField) => {
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleFieldSubmit = (data: { label: string; type: FieldType; value?: string; usage?: string }) => {
    const now = new Date().toISOString();
    if (editingField) {
      // 更新
      setFields(fields.map(f =>
        f.id === editingField.id
          ? { ...f, ...data, updatedAt: now }
          : f
      ));
    } else {
      // 新規作成
      const newField: EvaluationObjectField = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setFields([...fields, newField]);
    }
    setShowFieldForm(false);
    setEditingField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      conclusion: conclusion || undefined,
      evaluationProcess: evaluationProcess.trim() || undefined,
      detectedItems: detectedItems.trim() || undefined,
      evaluationDate: evaluationDate || undefined,
      fields,
    });
  };

  const handleCancelFieldForm = () => {
    setShowFieldForm(false);
    setEditingField(null);
  };

  if (showFieldForm) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          {editingField ? 'フィールドを編集' : 'フィールドを追加'}
        </h3>
        <SupplementalInfoFieldForm
          field={editingField}
          onSubmit={handleFieldSubmit}
          onCancel={handleCancelFieldForm}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          結論
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center p-3 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="radio"
              name="conclusion"
              value="effective"
              checked={conclusion === 'effective'}
              onChange={(e) => setConclusion(e.target.value as ConclusionType)}
              className="mr-2"
            />
            <span className="text-sm text-zinc-900 dark:text-zinc-100">有効</span>
          </label>
          <label className="flex items-center p-3 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="radio"
              name="conclusion"
              value="effective_with_recommendations"
              checked={conclusion === 'effective_with_recommendations'}
              onChange={(e) => setConclusion(e.target.value as ConclusionType)}
              className="mr-2"
            />
            <span className="text-sm text-zinc-900 dark:text-zinc-100">有効(推奨事項有)</span>
          </label>
          <label className="flex items-center p-3 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="radio"
              name="conclusion"
              value="ineffective"
              checked={conclusion === 'ineffective'}
              onChange={(e) => setConclusion(e.target.value as ConclusionType)}
              className="mr-2"
            />
            <span className="text-sm text-zinc-900 dark:text-zinc-100">非有効</span>
          </label>
          <label className="flex items-center p-3 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <input
              type="radio"
              name="conclusion"
              value="pending"
              checked={conclusion === 'pending'}
              onChange={(e) => setConclusion(e.target.value as ConclusionType)}
              className="mr-2"
            />
            <span className="text-sm text-zinc-900 dark:text-zinc-100">保留</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="evaluationProcess" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          評価経緯
        </label>
        <textarea
          id="evaluationProcess"
          value={evaluationProcess}
          onChange={(e) => setEvaluationProcess(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          placeholder="評価経緯を入力（任意）"
        />
      </div>

      <div>
        <label htmlFor="detectedItems" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          検出事項
        </label>
        <textarea
          id="detectedItems"
          value={detectedItems}
          onChange={(e) => setDetectedItems(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
          placeholder="検出事項を入力（任意）"
        />
      </div>

      <div>
        <label htmlFor="evaluationDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          評価日
        </label>
        <input
          type="date"
          id="evaluationDate"
          value={evaluationDate}
          onChange={(e) => setEvaluationDate(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">追加フィールド</h3>
          <button
            type="button"
            onClick={handleAddField}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            + フィールドを追加
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm">
            フィールドがありません
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {field.type === 'file' ? 'ファイル' : 'テキストフィールド'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                      {field.label}
                    </h4>
                    {field.usage && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                        用途: {field.usage}
                      </p>
                    )}
                    {field.value && (
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">
                        {field.type === 'file' ? `ファイル: ${field.value}` : field.value}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditField(field)}
                      className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('このフィールドを削除しますか？')) {
                          handleDeleteField(field.id);
                        }
                      }}
                      className="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
          {evaluationObject ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}

