'use client';

import { EvaluationObject } from '../types/evaluation-object';

interface EvaluationObjectListProps {
  evaluationObjects: EvaluationObject[];
  onEdit: (evaluationObject: EvaluationObject) => void;
  onDelete: (id: string) => void;
}

const getConclusionLabel = (conclusion?: string): string => {
  switch (conclusion) {
    case 'effective':
      return '有効';
    case 'effective_with_recommendations':
      return '有効(推奨事項有)';
    case 'ineffective':
      return '非有効';
    case 'pending':
      return '保留';
    default:
      return '未選択';
  }
};

export default function EvaluationObjectList({ evaluationObjects, onEdit, onDelete }: EvaluationObjectListProps) {
  if (evaluationObjects.length === 0) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        評価オブジェクトがありません
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {evaluationObjects.map((evaluationObject) => (
        <div
          key={evaluationObject.id}
          className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">評価オブジェクト</h4>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(evaluationObject)}
                className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                編集
              </button>
              <button
                onClick={() => {
                  if (confirm('この評価オブジェクトを削除しますか？')) {
                    onDelete(evaluationObject.id);
                  }
                }}
                className="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                削除
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {evaluationObject.conclusion && (
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">結論:</span>
                <p className="text-zinc-900 dark:text-zinc-100 mt-1">{getConclusionLabel(evaluationObject.conclusion)}</p>
              </div>
            )}
            {evaluationObject.evaluationProcess && (
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">評価経緯:</span>
                <p className="text-zinc-900 dark:text-zinc-100 mt-1 whitespace-pre-wrap">{evaluationObject.evaluationProcess}</p>
              </div>
            )}
            {evaluationObject.detectedItems && (
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">検出事項:</span>
                <p className="text-zinc-900 dark:text-zinc-100 mt-1 whitespace-pre-wrap">{evaluationObject.detectedItems}</p>
              </div>
            )}
            {evaluationObject.evaluationDate && (
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">評価日:</span>
                <p className="text-zinc-900 dark:text-zinc-100 mt-1">{evaluationObject.evaluationDate}</p>
              </div>
            )}
            {evaluationObject.fields && evaluationObject.fields.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-2">追加フィールド:</span>
                <div className="space-y-2">
                  {evaluationObject.fields.map((field) => (
                    <div key={field.id} className="bg-zinc-50 dark:bg-zinc-800 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {field.type === 'file' ? 'ファイル' : 'テキストフィールド'}
                        </span>
                        {field.usage && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            （用途: {field.usage}）
                          </span>
                        )}
                      </div>
                      <div className="mb-1">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{field.label}:</span>
                      </div>
                      {field.value ? (
                        <p className="text-xs text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                          {field.value}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">未入力</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

