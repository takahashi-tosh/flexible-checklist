'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ControlContent } from '../types/control-content';

const COL_WIDTHS_STORAGE_KEY = 'control-content-col-widths-v1';
const COL_WIDTHS_UPDATED_EVENT = 'control-content-col-widths-updated';

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

  // すべての行でフィールド構成が同じであることを前提としています
  const sampleFields = controlContents[0].fields || [];

  const getMinWidthPx = (type: string): number => {
    if (type === 'evaluation') return 300;
    if (type === 'file') return 200;
    return 100;
  };

  const colKeys = useMemo(() => {
    const keys = sampleFields.map((f) => `${f.type}:${f.label}`);
    keys.push('action');
    return keys;
  }, [sampleFields]);

  const loadStoredWidths = (): Record<string, number> => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(COL_WIDTHS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed as Record<string, number>;
    } catch {
      return {};
    }
  };

  const saveStoredWidths = (widths: Record<string, number>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(COL_WIDTHS_STORAGE_KEY, JSON.stringify(widths));
      // 同一タブ内の他コンポーネントへ即時反映させる
      window.dispatchEvent(new CustomEvent(COL_WIDTHS_UPDATED_EVENT));
    } catch {
      // ignore
    }
  };

  const defaultColWidths = useMemo(() => {
    const stored = loadStoredWidths();
    const widths: number[] = sampleFields.map((f) => {
      const key = `${f.type}:${f.label}`;
      const storedWidth = stored[key];
      return typeof storedWidth === 'number' ? storedWidth : getMinWidthPx(f.type);
    });
    // 操作列（固定だけど、将来のために保存値があれば反映）
    const actionStored = stored.action;
    widths.push(typeof actionStored === 'number' ? actionStored : 100);
    return widths;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleFields.length]);

  const [colWidths, setColWidths] = useState<number[]>(defaultColWidths);

  // フィールド数が変わった場合は、既存幅を可能な範囲で維持しつつ再初期化
  useEffect(() => {
    setColWidths((prev) => {
      if (prev.length === defaultColWidths.length) return prev;
      const next = [...defaultColWidths];
      const minLen = Math.min(prev.length, next.length);
      for (let i = 0; i < minLen; i++) {
        next[i] = prev[i] ?? next[i];
      }
      return next;
    });
  }, [defaultColWidths]);

  // 列幅変更をlocalStorageに保存（別の統制内容テーブルにも反映できるように）
  useEffect(() => {
    const stored = loadStoredWidths();
    const next: Record<string, number> = { ...stored };
    for (let i = 0; i < colKeys.length; i++) {
      const key = colKeys[i];
      const w = colWidths[i];
      if (typeof w === 'number') {
        next[key] = w;
      }
    }
    saveStoredWidths(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colKeys, colWidths]);

  // 他の統制内容テーブルで列幅が変更されたら、このテーブルにも即時反映
  useEffect(() => {
    const applyFromStorage = () => {
      const stored = loadStoredWidths();
      setColWidths((prev) => {
        const next = [...prev];
        for (let i = 0; i < colKeys.length; i++) {
          const key = colKeys[i];
          const storedWidth = stored[key];
          if (typeof storedWidth !== 'number') continue;

          // 操作列は固定扱い（ただし保存値があるなら反映はする）
          const isActionCol = i === sampleFields.length;
          if (isActionCol) {
            next[i] = storedWidth;
            continue;
          }

          const minWidth = getMinWidthPx(sampleFields[i]?.type || 'text');
          next[i] = Math.max(minWidth, Math.min(storedWidth, 1200));
        }

        const changed = next.length !== prev.length || next.some((v, idx) => v !== prev[idx]);
        return changed ? next : prev;
      });
    };

    const handleUpdated = () => applyFromStorage();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === COL_WIDTHS_STORAGE_KEY) {
        applyFromStorage();
      }
    };

    window.addEventListener(COL_WIDTHS_UPDATED_EVENT, handleUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(COL_WIDTHS_UPDATED_EVENT, handleUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [colKeys, sampleFields]);

  const dragRef = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const startWidth = colWidths[colIndex] ?? 0;
    dragRef.current = {
      colIndex,
      startX: e.clientX,
      startWidth,
    };

    // グローバルに追従（テーブル外にカーソルが出ても継続）
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = e.clientX - drag.startX;
    const idx = drag.colIndex;

    const isActionCol = idx === sampleFields.length;
    if (isActionCol) return; // 操作列は固定

    const minWidth = getMinWidthPx(sampleFields[idx]?.type || 'text');
    const nextWidth = Math.max(minWidth, Math.min(drag.startWidth + delta, 1200));
    setColWidths((prev) => {
      const next = [...prev];
      next[idx] = nextWidth;
      return next;
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  // 念のためunmount時にイベントを解除
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableMinWidth = colWidths.reduce((sum, w) => sum + w, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 overflow-x-auto">
      <table className="w-full table-fixed border-collapse" style={{ minWidth: `${tableMinWidth}px` }}>
        <colgroup>
          {sampleFields.map((field, index) => (
            <col key={`${index}-${field.label}`} style={{ width: `${colWidths[index] ?? getMinWidthPx(field.type)}px` }} />
          ))}
          <col style={{ width: `${colWidths[sampleFields.length] ?? 100}px` }} />
        </colgroup>
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            {sampleFields.map((field, index) => (
              <th
                key={`${index}-${field.label}`}
                className="px-4 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 relative select-none"
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">📋</span>
                    <span>統制内容 / {field.label}</span>
                  </span>
                ) : (
                  field.label
                )}
                {/* リサイズハンドル */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, index)}
                  className="absolute right-0 top-0 h-full w-2 cursor-col-resize group"
                  title="ドラッグして列幅を変更"
                >
                  <div className="absolute right-0 top-0 h-full w-px bg-transparent group-hover:bg-blue-400" />
                </div>
              </th>
            ))}
            {/* 操作列のヘッダー */}
            <th className="px-4 py-2 text-right text-xs font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 relative select-none">
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
                  {/* NOTE: テーブルの列幅はヘッダーのドラッグで変更 */}
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
