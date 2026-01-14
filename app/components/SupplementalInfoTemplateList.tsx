'use client';

import { SupplementalInfoTemplate } from '../types/supplemental-info-template';
import { formatDateTime } from '../lib/date-format';

interface SupplementalInfoTemplateListProps {
  templates: SupplementalInfoTemplate[];
  onEdit: (template: SupplementalInfoTemplate) => void;
  onDelete: (id: string) => void;
}

export default function SupplementalInfoTemplateList({ templates, onEdit, onDelete }: SupplementalInfoTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        評価項目の補足がありません。新規作成してください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {template.description}
                </p>
              )}
              <div className="mb-3">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  フィールド数: {template.fields?.length || 0}
                </span>
              </div>
              {template.fields && template.fields.length > 0 && (
                <div className="space-y-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                  {template.fields.map((field, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium">{field.label}</span>
                      <span className="text-zinc-500 dark:text-zinc-400 ml-2">
                        ({field.type === 'file' ? 'ファイル' : 'テキストフィールド'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">
                作成: {formatDateTime(template.createdAt)}
                {template.updatedAt !== template.createdAt && (
                  <span className="ml-4">
                    更新: {formatDateTime(template.updatedAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(template)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="編集"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

