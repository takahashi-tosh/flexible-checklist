const SETTINGS_KEY = 'category-settings';

export interface CategorySettings {
  parentColumnLabel?: string; // 区分列の表示ラベル（例：「6つのこうもく」）
  childColumnLabel?: string; // 観点列の表示ラベル（例：「4つの項目」）
}

export function getCategorySettings(): CategorySettings {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveCategorySettings(settings: CategorySettings): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save category settings:', error);
  }
}

export function getParentColumnLabel(): string {
  const settings = getCategorySettings();
  return settings.parentColumnLabel || '区分';
}

export function setParentColumnLabel(label: string): void {
  const settings = getCategorySettings();
  settings.parentColumnLabel = label.trim() || undefined;
  saveCategorySettings(settings);
}

export function getChildColumnLabel(): string {
  const settings = getCategorySettings();
  return settings.childColumnLabel || '観点';
}

export function setChildColumnLabel(label: string): void {
  const settings = getCategorySettings();
  settings.childColumnLabel = label.trim() || undefined;
  saveCategorySettings(settings);
}

// 後方互換性のための関数（削除予定）
export function getParentLabel(): string {
  return '区分';
}

export function getChildLabel(): string {
  return '観点';
}

