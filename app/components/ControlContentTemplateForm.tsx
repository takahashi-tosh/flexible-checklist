'use client';

import { useState, useEffect } from 'react';
import { ControlContentTemplate, ControlContentFieldTemplate } from '../types/control-content-template';
import { FieldType } from '../types/supplemental-info';
import { DndContext, DragEndEvent, DragOverlay, closestCenter, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import FieldTypePalette from './FieldTypePalette';
import FieldCanvas from './FieldCanvas';

interface ControlContentTemplateFormProps {
  template?: ControlContentTemplate | null;
  onSubmit: (data: { name: string; description?: string; fields: Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[] }) => void;
  onCancel: () => void;
}

export default function ControlContentTemplateForm({ template, onSubmit, onCancel }: ControlContentTemplateFormProps) {
  const [name] = useState('統制内容');
  const [description, setDescription] = useState(template?.description || '');
  const [fields, setFields] = useState<Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>[]>(
    template?.fields?.map(f => ({ 
      label: f.label, 
      type: f.type, 
      usage: f.usage,
      evaluationDefaults: f.evaluationDefaults,
    })) || []
  );
  const [expandedFields, setExpandedFields] = useState<Set<number>>(
    new Set(template?.fields?.map((_, index) => index) || [])
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      // eslint-disable-next-line react-compiler/react-compiler
      setDescription(template.description || '');
      const loadedFields = (template.fields || []).map(f => ({ 
        label: f.label, 
        type: f.type, 
        usage: f.usage,
        evaluationDefaults: f.evaluationDefaults,
      }));
      // eslint-disable-next-line react-compiler/react-compiler
      setFields(loadedFields);
      // eslint-disable-next-line react-compiler/react-compiler
      setExpandedFields(new Set(loadedFields.map((_, index) => index)));
    }
  }, [template]);

  const handleAddField = (type: FieldType) => {
    const newField: Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      label: '',
      type,
      usage: undefined,
      evaluationDefaults: type === 'evaluation' ? {} : undefined,
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    // 新規追加したフィールドを展開状態にする
    setExpandedFields(prev => new Set([...prev, fields.length]));
  };

  const handleUpdateField = (index: number, updates: Partial<Omit<ControlContentFieldTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setFields(fields.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    const newExpandedFields = new Set(expandedFields);
    newExpandedFields.delete(index);
    setExpandedFields(newExpandedFields);
  };

  const handleToggleExpand = (index: number) => {
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    // パレットからキャンバスへのドロップ
    if (active.data.current?.source === 'palette' && over.id === 'field-canvas') {
      const fieldType = active.data.current.type as FieldType;
      handleAddField(fieldType);
      return;
    }

    // キャンバス内での並び替え
    if (active.id !== over.id && typeof active.data.current?.index === 'number' && typeof over.data.current?.index === 'number') {
      const oldIndex = active.data.current.index;
      const newIndex = over.data.current.index;
      setFields(arrayMove(fields, oldIndex, newIndex));
    }
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
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="grid grid-cols-12 gap-6">
          {/* 左側: コンポーネントパレット */}
          <div className="col-span-3">
            <FieldTypePalette />
          </div>

          {/* 右側: キャンバス */}
          <div className="col-span-9">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              フィールド構成
            </h3>
            <FieldCanvas
              fields={fields}
              expandedFields={expandedFields}
              onToggleExpand={handleToggleExpand}
              onUpdateField={handleUpdateField}
              onRemoveField={handleRemoveField}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
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

      <DragOverlay>
        {activeDragId ? (
          <div className="p-4 border-2 border-blue-400 dark:border-blue-500 rounded-lg bg-white dark:bg-zinc-900 shadow-lg opacity-90">
            ドラッグ中...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

