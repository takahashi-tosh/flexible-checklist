'use client';

import { useState, useEffect } from 'react';
import { ControlContentTemplate, ControlContentFieldTemplate } from '../types/control-content-template';
import { FieldType } from '../types/supplemental-info';
import { ConclusionType } from '../types/evaluation-object';

interface ControlContentTemplateFormProps {
  template?: ControlContentTemplate | null;
  onSubmit: (data: { name: string; description?: string; fields: Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[] }) => void;
  onCancel: () => void;
}

export default function ControlContentTemplateForm({ template, onSubmit, onCancel }: ControlContentTemplateFormProps) {
  const [name, setName] = useState('統制内容');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());

  useEffect(() => {
    // 名前は常に「統制内容」で固定
    setName('統制内容');
    if (template) {
      setDescription(template.description || '');
      const loadedFields = (template.fields || []).map(f => ({ 
        label: f.label, 
        type: f.type, 
        usage: f.usage,
        evaluationDefaults: f.evaluationDefaults,
      }));
      setFields(loadedFields);
      // デフォルトで全てのフィールドを展開
      setExpandedFields(new Set(loadedFields.map((_, index) => index)));
    } else {
      setDescription('');
      setFields([]);
      setExpandedFields(new Set());
    }
  }, [template]);

  const handleAddField = () => {
    const newField: Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      label: '新規フィールド',
      type: 'text',
      usage: '',
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    // 新規追加したフィールドを展開状態にする
    setExpandedFields(prev => new Set([...prev, fields.length]));
  };

  const handleUpdateField = (index: number, updates: Partial<Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleMoveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setFields(newFields);
  };

  const handleMoveFieldDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFields(newFields);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) {
      alert('フィールドを少なくとも1つ追加してください');
      return;
    }
    // 空のラベルがないかチェック
    if (fields.some(f => !f.label.trim())) {
      alert('すべてのフィールドにラベルを入力してください');
      return;
    }
    onSubmit({
      name: '統制内容', // 常に「統制内容」で固定
      description: description.trim() || undefined,
      fields,
    });
  };

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
          テンプレート名は「統制内容」で固定です
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
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {field.type === 'file' ? 'ファイル' : field.type === 'evaluation' ? '評価' : 'テキストフィールド'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm font-semibold border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ラベル"
                    />
                  </div>
                  <div className="flex gap-2 ml-4 items-center">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveFieldUp(index)}
                        disabled={index === 0}
                        className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="上に移動"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveFieldDown(index)}
                        disabled={index === fields.length - 1}
                        className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="下に移動"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFieldExpand(index)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      {expandedFields.has(index) ? '▲' : '▼'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('このフィールドを削除しますか？')) {
                          handleDeleteField(index);
                          if (expandedFields.has(index)) {
                            setExpandedFields(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(index);
                              return newSet;
                            });
                          }
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>

                {expandedFields.has(index) && (
                  <div className="space-y-3 pt-3 border-t border-zinc-300 dark:border-zinc-700">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        タイプ
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const newType = e.target.value as FieldType;
                          handleUpdateField(index, { 
                            type: newType,
                            evaluationDefaults: newType === 'evaluation' ? (field.evaluationDefaults || {}) : undefined,
                          });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">テキストフィールド</option>
                        <option value="file">ファイル</option>
                        <option value="evaluation">評価</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        用途
                      </label>
                      <input
                        type="text"
                        value={field.usage || ''}
                        onChange={(e) => handleUpdateField(index, { usage: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="用途を入力（任意）"
                      />
                    </div>

                    {field.type === 'evaluation' && (
                      <div className="space-y-3 border-t border-zinc-300 dark:border-zinc-700 pt-3">
                        <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">評価フィールドのデフォルト値</h5>
                        
                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">結論</label>
                          <div className="flex flex-wrap gap-3">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`evaluationConclusion-${index}`}
                                value="effective"
                                checked={(field.evaluationDefaults?.conclusion || '') === 'effective'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationDefaults: {
                                    ...field.evaluationDefaults,
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
                                checked={(field.evaluationDefaults?.conclusion || '') === 'effective_with_recommendations'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationDefaults: {
                                    ...field.evaluationDefaults,
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
                                checked={(field.evaluationDefaults?.conclusion || '') === 'ineffective'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationDefaults: {
                                    ...field.evaluationDefaults,
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
                                checked={(field.evaluationDefaults?.conclusion || '') === 'pending'}
                                onChange={() => handleUpdateField(index, {
                                  evaluationDefaults: {
                                    ...field.evaluationDefaults,
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
                            評価経緯（デフォルト値）
                          </label>
                          <textarea
                            value={field.evaluationDefaults?.evaluationProcess || ''}
                            onChange={(e) => handleUpdateField(index, {
                              evaluationDefaults: {
                                ...field.evaluationDefaults,
                                evaluationProcess: e.target.value,
                              },
                            })}
                            rows={3}
                            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="評価経緯のデフォルト値（任意）"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            検出事項（デフォルト値）
                          </label>
                          <textarea
                            value={field.evaluationDefaults?.detectedItems || ''}
                            onChange={(e) => handleUpdateField(index, {
                              evaluationDefaults: {
                                ...field.evaluationDefaults,
                                detectedItems: e.target.value,
                              },
                            })}
                            rows={3}
                            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="検出事項のデフォルト値（任意）"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            評価日（デフォルト値）
                          </label>
                          <input
                            type="date"
                            value={field.evaluationDefaults?.evaluationDate || ''}
                            onChange={(e) => handleUpdateField(index, {
                              evaluationDefaults: {
                                ...field.evaluationDefaults,
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
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          {template ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}

