import * as XLSX from 'xlsx';
import { getEvaluationItems } from './storage';
import { getCategories } from './category-storage';

/**
 * 評価項目のデータをExcel形式でエクスポートする
 */
export function exportToExcel(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const evaluationItems = getEvaluationItems();
  const categories = getCategories();

  // カテゴリマップを作成
  const categoryMap = new Map<string, Category>();
  categories.forEach(cat => {
    categoryMap.set(cat.id, cat);
  });

  // 大項目と中項目を取得
  const parentCategories = categories.filter(cat => !cat.parentId);
  
  // すべての列名を収集
  const allColumnNames = new Set<string>(['大項目', '中項目']);
  
  // 補足情報のフィールド名を収集
  const supplementalFieldNames = new Set<string>();
  evaluationItems.forEach((item) => {
    if (item.supplementalInfo && item.supplementalInfo.fields.length > 0) {
      item.supplementalInfo.fields.forEach((field) => {
        supplementalFieldNames.add(field.label);
        allColumnNames.add(`補足 - ${field.label}`);
      });
    }
  });
  
  // 統制内容のフィールド名を収集
  const controlContentFieldNames = new Set<string>();
  evaluationItems.forEach((item) => {
    if (item.controlContents && item.controlContents.length > 0) {
      item.controlContents.forEach((controlContent) => {
        controlContent.fields.forEach((field) => {
          if (field.type === 'evaluation') {
            controlContentFieldNames.add(`${field.label} - 評価方法`);
            controlContentFieldNames.add(`${field.label} - 結論`);
            controlContentFieldNames.add(`${field.label} - 評価経緯`);
            controlContentFieldNames.add(`${field.label} - 検出事項`);
            controlContentFieldNames.add(`${field.label} - 評価日`);
            controlContentFieldNames.add(`${field.label} - 責任者`);
            allColumnNames.add(`${field.label} - 評価方法`);
            allColumnNames.add(`${field.label} - 結論`);
            allColumnNames.add(`${field.label} - 評価経緯`);
            allColumnNames.add(`${field.label} - 検出事項`);
            allColumnNames.add(`${field.label} - 評価日`);
            allColumnNames.add(`${field.label} - 責任者`);
          } else {
            controlContentFieldNames.add(field.label);
            allColumnNames.add(field.label);
          }
        });
      });
    }
  });
  
  // 列の順序を定義: 大項目、中項目、補足情報、評価項目名、統制内容No、統制内容フィールド
  const columnOrder = [
    '大項目',
    '中項目',
    ...Array.from(supplementalFieldNames).map(name => `補足 - ${name}`),
    '評価項目名',
    '統制内容No',
    ...Array.from(controlContentFieldNames)
  ];
  
  // Excel用のデータを準備（カテゴリごとにグループ化）
  const rows: any[] = [];
  let rowNumber = 1;

  parentCategories.forEach((parentCategory) => {
    const childCategories = categories.filter(cat => cat.parentId === parentCategory.id);
    
    // 中項目がない場合（大項目に直接紐づく評価項目）
    const directItems = evaluationItems.filter(item => item.categoryId === parentCategory.id);
    
    if (directItems.length > 0) {
      directItems.forEach((item) => {
        // 補足情報の行
        if (item.supplementalInfo && item.supplementalInfo.fields.length > 0) {
          const supplementalRow: any = {
            '大項目': parentCategory.label,
            '中項目': '',
            '評価項目名': `【補足情報】${item.name}`,
            '統制内容No': '',
          };
          
          item.supplementalInfo.fields.forEach((field) => {
            supplementalRow[`補足 - ${field.label}`] = field.value || '';
          });
          
          rows.push(supplementalRow);
        }
        
        // 評価項目の行（統制内容がない場合）
        if (!item.controlContents || item.controlContents.length === 0) {
          const row: any = {
            '大項目': parentCategory.label,
            '中項目': '',
            '評価項目名': item.name,
            '統制内容No': '',
          };
          rows.push(row);
        }
        
        // 統制内容の行
        if (item.controlContents && item.controlContents.length > 0) {
          item.controlContents.forEach((controlContent, ccIndex) => {
            const row: any = {
              '大項目': parentCategory.label,
              '中項目': '',
              '評価項目名': item.name,
              '統制内容No': ccIndex + 1,
            };

            // 統制内容のフィールドを追加
            controlContent.fields.forEach((field) => {
              if (field.type === 'evaluation') {
                const evalValue = field.evaluationValue;
                row[`${field.label} - 評価方法`] = evalValue?.evaluationMethods?.join('、') || '';
                row[`${field.label} - 結論`] = evalValue?.conclusion === 'effective' ? '有効' :
                  evalValue?.conclusion === 'effective_with_recommendations' ? '有効(推奨事項有)' :
                  evalValue?.conclusion === 'ineffective' ? '非有効' :
                  evalValue?.conclusion === 'pending' ? '保留' : '';
                row[`${field.label} - 評価経緯`] = evalValue?.evaluationProcess || '';
                row[`${field.label} - 検出事項`] = evalValue?.detectedItems || '';
                row[`${field.label} - 評価日`] = evalValue?.evaluationDate ? new Date(evalValue.evaluationDate).toLocaleDateString('ja-JP') : '';
                row[`${field.label} - 責任者`] = evalValue?.responsiblePerson || '';
              } else {
                row[field.label] = field.value || '';
              }
            });

            rows.push(row);
          });
        }
      });
    }
    
    // 中項目ごとに処理
    childCategories.forEach((childCategory) => {
      const childItems = evaluationItems.filter(item => item.categoryId === childCategory.id);
      
      if (childItems.length > 0) {
        childItems.forEach((item) => {
          // 補足情報の行
          if (item.supplementalInfo && item.supplementalInfo.fields.length > 0) {
            const supplementalRow: any = {
              '大項目': parentCategory.label,
              '中項目': childCategory.label,
              '評価項目名': `【補足情報】${item.name}`,
              '統制内容No': '',
            };
            
            item.supplementalInfo.fields.forEach((field) => {
              supplementalRow[`補足 - ${field.label}`] = field.value || '';
            });
            
            rows.push(supplementalRow);
          }
          
          // 評価項目の行（統制内容がない場合）
          if (!item.controlContents || item.controlContents.length === 0) {
            const row: any = {
              '大項目': parentCategory.label,
              '中項目': childCategory.label,
              '評価項目名': item.name,
              '統制内容No': '',
            };
            rows.push(row);
          }
          
          // 統制内容の行
          if (item.controlContents && item.controlContents.length > 0) {
            item.controlContents.forEach((controlContent, ccIndex) => {
              const row: any = {
                '大項目': parentCategory.label,
                '中項目': childCategory.label,
                '評価項目名': item.name,
                '統制内容No': ccIndex + 1,
              };

              // 統制内容のフィールドを追加
              controlContent.fields.forEach((field) => {
                if (field.type === 'evaluation') {
                  const evalValue = field.evaluationValue;
                  row[`${field.label} - 評価方法`] = evalValue?.evaluationMethods?.join('、') || '';
                  row[`${field.label} - 結論`] = evalValue?.conclusion === 'effective' ? '有効' :
                    evalValue?.conclusion === 'effective_with_recommendations' ? '有効(推奨事項有)' :
                    evalValue?.conclusion === 'ineffective' ? '非有効' :
                    evalValue?.conclusion === 'pending' ? '保留' : '';
                  row[`${field.label} - 評価経緯`] = evalValue?.evaluationProcess || '';
                  row[`${field.label} - 検出事項`] = evalValue?.detectedItems || '';
                  row[`${field.label} - 評価日`] = evalValue?.evaluationDate ? new Date(evalValue.evaluationDate).toLocaleDateString('ja-JP') : '';
                  row[`${field.label} - 責任者`] = evalValue?.responsiblePerson || '';
                } else {
                  row[field.label] = field.value || '';
                }
              });

              rows.push(row);
            });
          }
        });
      }
    });
  });
  
  // カテゴリに紐づかない評価項目
  const uncategorizedItems = evaluationItems.filter(item => !item.categoryId);
  if (uncategorizedItems.length > 0) {
    uncategorizedItems.forEach((item) => {
      // 補足情報の行
      if (item.supplementalInfo && item.supplementalInfo.fields.length > 0) {
        const supplementalRow: any = {
          '大項目': '',
          '中項目': '',
          '評価項目名': `【補足情報】${item.name}`,
          '統制内容No': '',
        };
        
        item.supplementalInfo.fields.forEach((field) => {
          supplementalRow[`補足 - ${field.label}`] = field.value || '';
        });
        
        rows.push(supplementalRow);
      }
      
      // 評価項目の行（統制内容がない場合）
      if (!item.controlContents || item.controlContents.length === 0) {
        const row: any = {
          '大項目': '',
          '中項目': '',
          '評価項目名': item.name,
          '統制内容No': '',
        };
        rows.push(row);
      }
      
      // 統制内容の行
      if (item.controlContents && item.controlContents.length > 0) {
        item.controlContents.forEach((controlContent, ccIndex) => {
          const row: any = {
            '大項目': '',
            '中項目': '',
            '評価項目名': item.name,
            '統制内容No': ccIndex + 1,
          };

          // 統制内容のフィールドを追加
          controlContent.fields.forEach((field) => {
            if (field.type === 'evaluation') {
              const evalValue = field.evaluationValue;
              row[`${field.label} - 評価方法`] = evalValue?.evaluationMethods?.join('、') || '';
              row[`${field.label} - 結論`] = evalValue?.conclusion === 'effective' ? '有効' :
                evalValue?.conclusion === 'effective_with_recommendations' ? '有効(推奨事項有)' :
                evalValue?.conclusion === 'ineffective' ? '非有効' :
                evalValue?.conclusion === 'pending' ? '保留' : '';
              row[`${field.label} - 評価経緯`] = evalValue?.evaluationProcess || '';
              row[`${field.label} - 検出事項`] = evalValue?.detectedItems || '';
              row[`${field.label} - 評価日`] = evalValue?.evaluationDate ? new Date(evalValue.evaluationDate).toLocaleDateString('ja-JP') : '';
              row[`${field.label} - 責任者`] = evalValue?.responsiblePerson || '';
            } else {
              row[field.label] = field.value || '';
            }
          });

          rows.push(row);
        });
      }
    });
  }

  // ワークブックを作成
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: columnOrder });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '評価項目一覧');

  // 列幅を調整（列名の長さに応じて動的に設定）
  const colWidths = columnOrder.map((colName) => {
    if (colName === '大項目') return { wch: 20 };
    if (colName === '中項目') return { wch: 20 };
    if (colName === '評価項目名') return { wch: 40 };
    if (colName === '統制内容No') return { wch: 10 };
    // 補足情報の列
    if (colName.startsWith('補足 - ')) return { wch: 25 };
    // その他の列は列名の長さ + 余白を考慮
    return { wch: Math.max(15, Math.min(colName.length + 5, 30)) };
  });
  
  worksheet['!cols'] = colWidths;

  // ファイルをダウンロード
  const fileName = `評価項目一覧_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

interface Category {
  id: string;
  label: string;
  parentId?: string;
}
