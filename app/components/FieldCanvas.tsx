'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ControlContentFieldTemplate } from '../types/control-content-template';
import { FieldType } from '../types/supplemental-info';
import { ConclusionType } from '../types/evaluation-object';

interface FieldCanvasProps {
  fields: Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[];
  expandedFields: Set<number>;
  onToggleExpand: (index: number) => void;
  onUpdateField: (index: number, updates: Partial<Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onRemoveField: (index: number) => void;
}

function SortableField({ 
  field, 
  index, 
  isExpanded,
  onToggleExpand,
  onUpdateField,
  onRemoveField 
}: {
  field: Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateField: (updates: Partial<Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onRemoveField: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `field-${index}`,
    data: { type: field.type, index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'text': return '📝';
      case 'file': return '📎';
      case 'evaluation': return '⭐';
      default: return '📄';
    }
  };

  const getFieldTypeLabel = (type: FieldType) => {
    switch (type) {
      case 'text': return 'テキストフィールド';
      case 'file': return 'ファイル';
      case 'evaluation': return '評価';
      default: return '不明';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800"
    >
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 flex-1">
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="cursor-move text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1"
            title="ドラッグして並び替え"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          <span className="text-2xl">{getFieldIcon(field.type)}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {getFieldTypeLabel(field.type)}
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
              {field.label || '未設定'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1"
          >
            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRemoveField}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              ラベル
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdateField({ label: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ラベルを入力"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              用途
            </label>
            <input
              type="text"
              value={field.usage || ''}
              onChange={(e) => onUpdateField({ usage: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="用途を入力（任意）"
            />
          </div>

          {field.type === 'evaluation' && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-3">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                評価のデフォルト値
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    結論
                  </label>
                  <select
                    value={field.evaluationDefaults?.conclusion || ''}
                    onChange={(e) => onUpdateField({
                      evaluationDefaults: {
                        ...field.evaluationDefaults,
                        conclusion: e.target.value as ConclusionType,
                      }
                    })}
                    className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    <option value="effective">有効</option>
                    <option value="effective_with_recommendations">有効(推奨事項有)</option>
                    <option value="ineffective">非有効</option>
                    <option value="pending">保留</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FieldCanvas({ fields, expandedFields, onToggleExpand, onUpdateField, onRemoveField }: FieldCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'field-canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-100 p-4 border-2 border-dashed rounded-lg transition-colors ${
        isOver
          ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
      }`}
    >
      {fields.length === 0 ? (
        <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">コンポーネントをドラッグして配置</p>
          </div>
        </div>
      ) : (
        <SortableContext items={fields.map((_, i) => `field-${i}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <SortableField
                key={`field-${index}`}
                field={field}
                index={index}
                isExpanded={expandedFields.has(index)}
                onToggleExpand={() => onToggleExpand(index)}
                onUpdateField={(updates) => onUpdateField(index, updates)}
                onRemoveField={() => onRemoveField(index)}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
