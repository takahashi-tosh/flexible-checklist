'use client';

import { useDraggable } from '@dnd-kit/core';
import { FieldType } from '../types/supplemental-info';

const fieldTypes = [
  { type: 'text' as FieldType, label: 'テキストフィールド', icon: '📝', description: 'テキスト入力欄' },
  { type: 'file' as FieldType, label: 'ファイル', icon: '📎', description: 'ファイル情報' },
];

function DraggableFieldType({ type, label, icon, description }: typeof fieldTypes[0]) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: 'palette' },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-move"
    >
      <div className="text-3xl mb-2 text-center">{icon}</div>
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 text-center mb-1">
        {label}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
        {description}
      </div>
    </div>
  );
}

export default function SupplementalInfoFieldTypePalette() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
        コンポーネント
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {fieldTypes.map((fieldType) => (
          <DraggableFieldType key={fieldType.type} {...fieldType} />
        ))}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 p-2 bg-zinc-50 dark:bg-zinc-800 rounded">
        💡 ドラッグしてキャンバスに配置してください
      </div>
    </div>
  );
}
