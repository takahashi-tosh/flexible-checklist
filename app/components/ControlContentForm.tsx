'use client';

import { useState, useEffect } from 'react';
import { ControlContent, ControlContentField } from '../types/control-content';
import { ControlContentTemplate } from '../types/control-content-template';
import { getControlContentTemplates } from '../lib/control-content-template-storage';
import { ConclusionType } from '../types/evaluation-object';
import { FieldType } from '../types/supplemental-info';

interface ControlContentFormProps {
  controlContent?: ControlContent | null;
  onSubmit: (data: { fields: ControlContentField[] }) => void;
  onCancel: () => void;
}

export default function ControlContentForm({ controlContent, onSubmit, onCancel }: ControlContentFormProps) {
  const [fields, setFields] = useState<ControlContentField[]>(controlContent?.fields || []);
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());
  const [templates, setTemplates] = useState<ControlContentTemplate[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    const loadedTemplates = getControlContentTemplates();
    setTemplates(loadedTemplates);
    
    if (controlContent) {
      // 既存の統制内容がある場合は、そのフィールドを設定
      const loadedFields = controlContent.fields || [];
      setFields(loadedFields);
      // デフォルトで全てのフィールドを展開
      setExpandedFields(new Set(loadedFields.map((_, index) => index)));
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
        // デフォルトで全てのフィールドを展開
        setExpandedFields(new Set(newFields.map((_, index) => index)));
        setShowTemplateSelector(false);
      } else if (loadedTemplates.length > 1) {
        // 複数ある場合は選択画面を表示
        setFields([]);
        setExpandedFields(new Set());
        setShowTemplateSelector(true);
      } else {
        // テンプレートがない場合
        setFields([]);
        setExpandedFields(new Set());
        setShowTemplateSelector(false);
      }
    }
  }, [controlContent]);

  const handleUpdateField = (index: number, updates: Partial<ControlContentField>) => {
    const now = new Date().toISOString();
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates, updatedAt: now } : f));
  };

  const toggleFieldExpand = (index: number) => {
    setExpandedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
    // デフォルトで全てのフィールドを展開
    setExpandedFields(new Set(newFields.map((_, index) => index)));
    setShowTemplateSelector(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) {
      alert('テンプレートを選択してください');
      return;
    }
    onSubmit({ fields });
  };

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
            <p className="text-sm mb-4">統制内容管理画面でテンプレートを作成してください。</p>
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
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {field.type === 'file' ? 'ファイル' : field.type === 'evaluation' ? '評価' : 'テキストフィールド'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {field.label}
                    </div>
                    {field.usage && (
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        用途: {field.usage}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFieldExpand(index)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    {expandedFields.has(index) ? '▲' : '▼'}
                  </button>
                </div>

                {expandedFields.has(index) && (
                  <div className="space-y-3 pt-3 border-t border-zinc-300 dark:border-zinc-700">
                    {field.type === 'text' && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          値
                        </label>
                        <textarea
                          value={field.value || ''}
                          onChange={(e) => handleUpdateField(index, { value: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="値を入力"
                        />
                      </div>
                    )}

                    {field.type === 'file' && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          ファイル情報
                        </label>
                        <textarea
                          value={field.value || ''}
                          onChange={(e) => handleUpdateField(index, { value: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="ファイル名やパスを入力"
                        />
                      </div>
                    )}

                    {field.type === 'evaluation' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">結論</label>
                          <div className="flex flex-wrap gap-3">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`evaluationConclusion-${index}`}
                                value="effective"
                                checked={(field.evaluationValue?.conclusion || '') === 'effective'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationValue: {
                                    ...field.evaluationValue,
                                    conclusion: 'effective',
                                  },
                                })}
                                className="form-radio h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2 text-xs text-zinc-900 dark:text-zinc-100">有効</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`evaluationConclusion-${index}`}
                                value="effective_with_recommendations"
                                checked={(field.evaluationValue?.conclusion || '') === 'effective_with_recommendations'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationValue: {
                                    ...field.evaluationValue,
                                    conclusion: 'effective_with_recommendations',
                                  },
                                })}
                                className="form-radio h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2 text-xs text-zinc-900 dark:text-zinc-100">有効(推奨事項有)</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`evaluationConclusion-${index}`}
                                value="ineffective"
                                checked={(field.evaluationValue?.conclusion || '') === 'ineffective'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationValue: {
                                    ...field.evaluationValue,
                                    conclusion: 'ineffective',
                                  },
                                })}
                                className="form-radio h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2 text-xs text-zinc-900 dark:text-zinc-100">非有効</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`evaluationConclusion-${index}`}
                                value="pending"
                                checked={(field.evaluationValue?.conclusion || '') === 'pending'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationValue: {
                                    ...field.evaluationValue,
                                    conclusion: 'pending',
                                  },
                                })}
                                className="form-radio h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2 text-xs text-zinc-900 dark:text-zinc-100">保留</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            評価経緯
                          </label>
                          <textarea
                            value={field.evaluationValue?.evaluationProcess || ''}
                            onChange={(e) => handleUpdateField(index, {
                              evaluationValue: {
                                ...field.evaluationValue,
                                evaluationProcess: e.target.value,
                              },
                            })}
                            rows={3}
                            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="評価経緯を入力"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            検出事項
                          </label>
                          <textarea
                            value={field.evaluationValue?.detectedItems || ''}
                            onChange={(e) => handleUpdateField(index, {
                              evaluationValue: {
                                ...field.evaluationValue,
                                detectedItems: e.target.value,
                              },
                            })}
                            rows={3}
                            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="検出事項を入力"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            評価日
                          </label>
                          <input
                            type="date"
                            value={field.evaluationValue?.evaluationDate || ''}
                            onChange={(e) => handleUpdateField(index, {
                              evaluationValue: {
                                ...field.evaluationValue,
                                evaluationDate: e.target.value,
                              },
                            })}
                            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

