import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  getCategoryByName,
  initializeDefaultCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '../services/categories';

const CATEGORIES_QUERY_KEY = 'categories';

/**
 * Query hook for fetching all categories
 */
export const useCategories = (userId: string | null) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, userId],
    queryFn: () => (userId ? getCategories(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes - categories change less frequently
  });
};

/**
 * Query hook for fetching category by name
 */
export const useCategoryByName = (userId: string | null, name: string) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, userId, 'byName', name],
    queryFn: () => (userId ? getCategoryByName(userId, name) : Promise.resolve(null)),
    enabled: !!userId && !!name,
    staleTime: 15 * 60 * 1000,
  });
};

/**
 * Mutation hook for initializing default categories
 */
export const useInitializeDefaultCategories = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => initializeDefaultCategories(userId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, userId] });
    },
  });
};

/**
 * Mutation hook for adding a new category
 */
export const useAddCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateCategoryInput) => addCategory(userId, categoryData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, userId] });
    },
  });
};

/**
 * Mutation hook for updating a category
 */
export const useUpdateCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, updates }: { categoryId: string; updates: UpdateCategoryInput }) =>
      updateCategory(userId, categoryId, updates),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, userId] });
    },
  });
};

/**
 * Mutation hook for deleting a category
 */
export const useDeleteCategory = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(userId, categoryId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, userId] });
    },
  });
};
