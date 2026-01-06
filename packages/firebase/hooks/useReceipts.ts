import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadReceipt, getReceiptURLs, deleteReceipt } from '../services/storage';

/**
 * Hook for uploading receipt files
 */
export function useUploadReceipt() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId, expenseId, file }: { userId: string; expenseId: string; file: File }) => {
      setUploadProgress(0);
      const url = await uploadReceipt(userId, expenseId, file);
      setUploadProgress(100);
      return url;
    },
    onSuccess: (_, variables) => {
      // Invalidate receipt URLs query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['receiptURLs', variables.userId, variables.expenseId],
      });
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
}

/**
 * Hook for fetching receipt URLs and paths for an expense
 */
export function useReceiptURLs(userId: string | null, expenseId: string | null) {
  return useQuery({
    queryKey: ['receiptURLs', userId, expenseId],
    queryFn: () => {
      if (!userId || !expenseId) return [];
      return getReceiptURLs(userId, expenseId);
    },
    enabled: !!userId && !!expenseId,
  });
}

/**
 * Hook for deleting a receipt
 */
export function useDeleteReceipt() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (receiptPath: string) => deleteReceipt(receiptPath),
    onSuccess: () => {
      // Invalidate all receipt URLs queries
      queryClient.invalidateQueries({
        queryKey: ['receiptURLs'],
      });
    },
  });

  return mutation;
}
