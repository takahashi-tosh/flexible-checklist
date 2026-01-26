'use client';

import { useState } from 'react';
import { 
  exportCurrentDataAsSeedData, 
  copyCurrentDataToClipboard, 
  downloadCurrentDataAsSeedData,
  logCurrentDataAsSeedData
} from '../lib/seed-data-export';

export function SeedDataExporter() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<string>('');

  const handlePreview = () => {
    const data = exportCurrentDataAsSeedData();
    setPreviewData(data);
    setShowPreview(true);
  };

  const handleCopy = async () => {
    await copyCurrentDataToClipboard();
  };

  const handleDownload = () => {
    downloadCurrentDataAsSeedData();
  };

  const handleLog = () => {
    logCurrentDataAsSeedData();
    alert('コンソールにシードデータを出力しました');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">シードデータエクスポート</h2>
      <p className="text-sm text-gray-600 mb-4">
        現在入力されているデータをseed-data形式でエクスポートします。
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          プレビュー表示
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          クリップボードにコピー
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          JSONファイルをダウンロード
        </button>
        <button
          onClick={handleLog}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          コンソールに出力
        </button>
      </div>

      {showPreview && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">プレビュー:</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              閉じる
            </button>
          </div>
          <pre className="bg-gray-50 p-4 rounded border overflow-auto max-h-96 text-xs">
            {previewData}
          </pre>
          <div className="mt-2 text-sm text-gray-600">
            <p>このJSONをコピーして、seed-data.tsファイルの該当部分に貼り付けてください。</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold text-sm mb-2">使い方:</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>「プレビュー表示」でデータを確認</li>
          <li>「クリップボードにコピー」でデータをコピー</li>
          <li>app/lib/seed-data.ts ファイルを開く</li>
          <li>seedData定数の内容を貼り付けて置き換える</li>
          <li>ファイルを保存</li>
        </ol>
      </div>
    </div>
  );
}
