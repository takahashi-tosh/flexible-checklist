import { Category } from '../types/category';

const STORAGE_KEY = 'categories';

export function getCategories(): Category[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories:', error);
  }
}

export function getParentCategories(): Category[] {
  return getCategories().filter(cat => !cat.parentId);
}

export function getChildCategories(parentId: string): Category[] {
  return getCategories().filter(cat => cat.parentId === parentId);
}

export function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const categories = getCategories();
  categories.push(newCategory);
  saveCategories(categories);
  
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
  const categories = getCategories();
  const index = categories.findIndex(cat => cat.id === id);
  
  if (index === -1) {
    return null;
  }
  
  categories[index] = {
    ...categories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveCategories(categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  
  // 子カテゴリも削除
  const childCategories = getChildCategories(id);
  const allIdsToDelete = [id, ...childCategories.map(c => c.id)];
  
  const filtered = categories.filter(cat => !allIdsToDelete.includes(cat.id));
  
  if (filtered.length === categories.length) {
    return false;
  }
  
  saveCategories(filtered);
  return true;
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find(cat => cat.id === id);
}

