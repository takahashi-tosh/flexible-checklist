'use client';

import { useState } from 'react';
import { ControlContent, ControlContentField } from '../types/control-content';

interface ControlContentListProps {
  controlContents: ControlContent[];
  onEdit: (controlContent: ControlContent) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
}

export default function ControlContentList({ controlContents, onEdit, onDelete, onAdd }: ControlContentListProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  if (controlContents.length === 0) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        統制内容がありません
      </div>
    );
  }

  // 1. ヘッダーと幅の計算（最初のデータに基づき計算、または固定の定義が必要）
  // すべての行でフィールド構成が同じであることを前提としています
  const sampleFields = controlContents[0].fields || [];
  const calculateWidth = (type: string) => {
    if (type === 'evaluation') return 300;
    if (type === 'file') return 200;
    return 450;
  };

  const actionColumnWidth = 100; // 操作列の幅
  const tableWidth = sampleFields.reduce((sum, field) => sum + calculateWidth(field.type), 0) + actionColumnWidth;

  return (
    <div className="bg-white dark:bg-zinc-900 overflow-x-auto">
      <table className="w-full table-fixed border-collapse" style={{ minWidth: `${tableWidth}px` }}>
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            {sampleFields.map((field, index) => (
              <th
                key={field.id}
                className="px-4 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700"
                style={{ width: `${calculateWidth(field.type)}px` }}
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">📋</span>
                    <span>統制内容 / {field.label}</span>
                  </span>
                ) : (
                  field.label
                )}
              </th>
            ))}
            {/* 操作列のヘッダー */}
            <th className="px-4 py-2 text-right text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700" style={{ width: `${actionColumnWidth}px` }}>
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {controlContents.map((controlContent) => (
            <tr 
              key={controlContent.id} 
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
              onMouseEnter={() => setHoveredRowId(controlContent.id)}
              onMouseLeave={() => setHoveredRowId(null)}
              onClick={() => onEdit(controlContent)}
            >
              {controlContent.fields.map((field, fieldIndex) => (
                <td
                  key={field.id}
                  className="px-4 py-4 text-sm text-zinc-900 dark:text-zinc-100 align-top relative"
                >
                  {fieldIndex === 0 && onAdd && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                      }}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 -translate-x-1/2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm ${
                        hoveredRowId === controlContent.id ? 'opacity-100' : 'opacity-0'
                      }`}
                      title="統制内容を追加"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                  {field.type === 'evaluation' ? (
                    <div className="space-y-1">
                      {field.evaluationValue?.evaluationMethods && field.evaluationValue.evaluationMethods.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">評価方法: </span>
                          <span className="text-sm">{field.evaluationValue.evaluationMethods.join('、')}</span>
                        </div>
                      )}
                      {field.evaluationValue?.conclusion && (
                        <div>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">結論: </span>
                          <span className="text-sm">
                            {field.evaluationValue.conclusion === 'effective' ? '有効' :
                             field.evaluationValue.conclusion === 'effective_with_recommendations' ? '有効(推奨事項有)' :
                             field.evaluationValue.conclusion === 'ineffective' ? '非有効' :
                             field.evaluationValue.conclusion === 'pending' ? '保留' : ''}
                          </span>
                        </div>
                      )}
                      {field.evaluationValue?.evaluationProcess && (
                        <div>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">評価経緯: </span>
                          <p className="text-sm whitespace-pre-wrap mt-1">{field.evaluationValue.evaluationProcess}</p>
                        </div>
                      )}
                      {field.evaluationValue?.detectedItems && (
                        <div>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">検出事項: </span>
                          <p className="text-sm whitespace-pre-wrap mt-1">{field.evaluationValue.detectedItems}</p>
                        </div>
                      )}
                      {field.evaluationValue?.evaluationDate && (
                        <div>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">評価日: </span>
                          <span className="text-sm">{new Date(field.evaluationValue.evaluationDate).toLocaleDateString('ja-JP')}</span>
                        </div>
                      )}
                      {!field.evaluationValue?.conclusion && !field.evaluationValue?.evaluationProcess && !field.evaluationValue?.detectedItems && !field.evaluationValue?.evaluationDate && (
                        <span className="text-sm text-zinc-400 dark:text-zinc-500">未入力</span>
                      )}
                    </div>
                  ) : field.value ? (
                    <span className="text-sm whitespace-pre-wrap">{field.value}</span>
                  ) : (
                    <span className="text-sm text-zinc-400 dark:text-zinc-500">未入力</span>
                  )}
                </td>
              ))}
              
              {/* 操作ボタン列 */}
              <td className="px-4 py-4 text-right align-top">
                <div className="flex gap-2 justify-end">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirm('この統制内容を削除しますか？') && onDelete(controlContent.id);
                    }}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="削除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
