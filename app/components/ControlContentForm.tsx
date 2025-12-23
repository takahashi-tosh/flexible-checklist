'use client';

import { useState, useEffect } from 'react';
import { ControlContent, ControlContentField } from '../types/control-content';
import { ControlContentTemplate } from '../types/control-content-template';
import { getControlContentTemplates } from '../lib/control-content-template-storage';
import SupplementalInfoFieldForm from './SupplementalInfoFieldForm';
import { ConclusionType } from '../types/evaluation-object';

interface ControlContentFormProps {
  controlContent?: ControlContent | null;
  onSubmit: (data: { fields: ControlContentField[] }) => void;
  onCancel: () => void;
}

export default function ControlContentForm({ controlContent, onSubmit, onCancel }: ControlContentFormProps) {
  const [fields, setFields] = useState<ControlContentField[]>(controlContent?.fields || []);
  const [editingField, setEditingField] = useState<ControlContentField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [templates, setTemplates] = useState<ControlContentTemplate[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  // 評価フィールド編集用の状態
  const [evaluationConclusion, setEvaluationConclusion] = useState<ConclusionType | undefined>(undefined);
  const [evaluationProcess, setEvaluationProcess] = useState('');
  const [evaluationDetectedItems, setEvaluationDetectedItems] = useState('');
  const [evaluationDate, setEvaluationDate] = useState('');

  useEffect(() => {
    const loadedTemplates = getControlContentTemplates();
    setTemplates(loadedTemplates);
    
    if (controlContent) {
      // 既存の統制内容がある場合は、そのフィールドを設定
      setFields(controlContent.fields || []);
      setShowTemplateSelector(false);
    } else {
      // 新規作成の場合
      if (loadedTemplates.length === 1) {
        // テンプレートが1つしかない場合は自動的に適用
        const template = loadedTemplates[0];
        const now = new Date().toISOString();
        const newFields: ControlContentField[] = (template.fields || []).map(fieldTemplate => {
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
        setFields(newFields);
        setShowTemplateSelector(false);
      } else if (loadedTemplates.length > 1) {
        // 複数ある場合は選択画面を表示
        setFields([]);
        setShowTemplateSelector(true);
      } else {
        // テンプレートがない場合
        setFields([]);
        setShowTemplateSelector(false);
      }
    }
    setEditingField(null);
    setShowFieldForm(false);
  }, [controlContent]);

  const handleSelectTemplate = (template: ControlContentTemplate) => {
    const now = new Date().toISOString();
    // 既存のフィールドの値を保持するために、ラベルとタイプでマッチング
    const existingFieldsMap = new Map<string, ControlContentField>();
    fields.forEach(field => {
      const key = `${field.label}_${field.type}`;
      existingFieldsMap.set(key, field);
    });

    const newFields: ControlContentField[] = (template.fields || []).map(fieldTemplate => {
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
      }
    });
    setFields(newFields);
    setShowTemplateSelector(false);
  };

  const handleEditField = (field: ControlContentField) => {
    setEditingField(field);
    if (field.type === 'evaluation') {
      setEvaluationConclusion(field.evaluationValue?.conclusion);
      setEvaluationProcess(field.evaluationValue?.evaluationProcess || '');
      setEvaluationDetectedItems(field.evaluationValue?.detectedItems || '');
      setEvaluationDate(field.evaluationValue?.evaluationDate || '');
    }
    setShowFieldForm(true);
  };

  const handleFieldSubmit = (data: { label: string; type: 'file' | 'text' | 'evaluation'; value?: string; usage?: string; evaluationValue?: { conclusion?: ConclusionType; evaluationProcess?: string; detectedItems?: string; evaluationDate?: string } }) => {
    const now = new Date().toISOString();
    if (editingField) {
      // 値のみ更新（ラベル、タイプ、用途はテンプレートから変更不可）
      if (editingField.type === 'evaluation') {
        setFields(fields.map(f =>
          f.id === editingField.id
            ? { ...f, evaluationValue: data.evaluationValue, updatedAt: now }
            : f
        ));
      } else {
        setFields(fields.map(f =>
          f.id === editingField.id
            ? { ...f, value: data.value, updatedAt: now }
            : f
        ));
      }
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

  if (showFieldForm && editingField) {
    if (editingField.type === 'evaluation') {
      // 評価フィールド専用のフォーム
      const handleEvaluationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFieldSubmit({
          label: editingField.label,
          type: 'evaluation',
          evaluationValue: {
            conclusion: evaluationConclusion,
            evaluationProcess: evaluationProcess.trim() || undefined,
            detectedItems: evaluationDetectedItems.trim() || undefined,
            evaluationDate: evaluationDate || undefined,
          },
        });
      };

      return (
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            {editingField.label} の値を編集
          </h3>
          <form onSubmit={handleEvaluationSubmit} className="space-y-4">
            {/* 結論 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">結論</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="conclusion"
                    value="effective"
                    checked={evaluationConclusion === 'effective'}
                    onChange={() => setEvaluationConclusion('effective')}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-zinc-900 dark:text-zinc-100">有効</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="conclusion"
                    value="effective_with_recommendations"
                    checked={evaluationConclusion === 'effective_with_recommendations'}
                    onChange={() => setEvaluationConclusion('effective_with_recommendations')}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-zinc-900 dark:text-zinc-100">有効(推奨事項有)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="conclusion"
                    value="ineffective"
                    checked={evaluationConclusion === 'ineffective'}
                    onChange={() => setEvaluationConclusion('ineffective')}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-zinc-900 dark:text-zinc-100">非有効</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="conclusion"
                    value="pending"
                    checked={evaluationConclusion === 'pending'}
                    onChange={() => setEvaluationConclusion('pending')}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-zinc-900 dark:text-zinc-100">保留</span>
                </label>
              </div>
            </div>

            {/* 評価経緯 */}
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

            {/* 検出事項 */}
            <div>
              <label htmlFor="detectedItems" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                検出事項
              </label>
              <textarea
                id="detectedItems"
                value={evaluationDetectedItems}
                onChange={(e) => setEvaluationDetectedItems(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                placeholder="検出事項を入力（任意）"
              />
            </div>

            {/* 評価日 */}
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

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancelFieldForm}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      );
    } else {
      // 通常のフィールド（ファイル・テキスト）
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
            <p className="text-sm mb-4">統制内容テンプレート管理画面でテンプレートを作成してください。</p>
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
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">統制内容フィールド</h3>
          {templates.length > 1 && (
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border border-green-600 dark:border-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              テンプレートを再選択
            </button>
          )}
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
                        {field.type === 'file' ? 'ファイル' : field.type === 'evaluation' ? '評価' : 'テキストフィールド'}
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
                    {field.type === 'evaluation' ? (
                      <div className="space-y-1">
                        {field.evaluationValue?.conclusion && (
                          <p className="text-sm text-zinc-900 dark:text-zinc-100">
                            結論: {field.evaluationValue.conclusion === 'effective' ? '有効' :
                                   field.evaluationValue.conclusion === 'effective_with_recommendations' ? '有効(推奨事項有)' :
                                   field.evaluationValue.conclusion === 'ineffective' ? '非有効' :
                                   field.evaluationValue.conclusion === 'pending' ? '保留' : ''}
                          </p>
                        )}
                        {field.evaluationValue?.evaluationProcess && (
                          <p className="text-sm text-zinc-900 dark:text-zinc-100">
                            評価経緯: {field.evaluationValue.evaluationProcess.substring(0, 50)}{field.evaluationValue.evaluationProcess.length > 50 ? '...' : ''}
                          </p>
                        )}
                        {field.evaluationValue?.detectedItems && (
                          <p className="text-sm text-zinc-900 dark:text-zinc-100">
                            検出事項: {field.evaluationValue.detectedItems.substring(0, 50)}{field.evaluationValue.detectedItems.length > 50 ? '...' : ''}
                          </p>
                        )}
                        {field.evaluationValue?.evaluationDate && (
                          <p className="text-sm text-zinc-900 dark:text-zinc-100">
                            評価日: {new Date(field.evaluationValue.evaluationDate).toLocaleDateString('ja-JP')}
                          </p>
                        )}
                        {!field.evaluationValue?.conclusion && !field.evaluationValue?.evaluationProcess && !field.evaluationValue?.detectedItems && !field.evaluationValue?.evaluationDate && (
                          <p className="text-sm text-zinc-400 dark:text-zinc-500">未入力</p>
                        )}
                      </div>
                    ) : field.value ? (
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
          {controlContent ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}

