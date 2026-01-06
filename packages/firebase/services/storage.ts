import { storage } from '../config';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

/**
 * Upload a receipt image to Firebase Storage
 * @param userId - User ID
 * @param expenseId - Expense ID
 * @param file - Image file to upload
 * @returns Promise with download URL
 */
export async function uploadReceipt(
  userId: string,
  expenseId: string,
  file: File
): Promise<string> {
  try {
    // Create a reference with timestamp to ensure unique filenames
    const timestamp = Date.now();
    const filename = `${file.name.split('.')[0]}_${timestamp}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `expenses/${userId}/${expenseId}/${filename}`);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get and return the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw new Error('Failed to upload receipt. Please try again.');
  }
}

/**
 * Get all receipt URLs and paths for an expense
 * @param userId - User ID
 * @param expenseId - Expense ID
 * @returns Promise with array of {url, path} objects
 */
export async function getReceiptURLs(
  userId: string,
  expenseId: string
): Promise<Array<{ url: string; path: string }>> {
  try {
    const folderRef = ref(storage, `expenses/${userId}/${expenseId}`);
    const result = await listAll(folderRef);

    const receipts: Array<{ url: string; path: string }> = [];
    for (const fileRef of result.items) {
      const url = await getDownloadURL(fileRef);
      receipts.push({
        url,
        path: fileRef.fullPath,
      });
    }

    return receipts;
  } catch (error) {
    console.error('Error fetching receipt URLs:', error);
    return [];
  }
}

/**
 * Delete a receipt image from Firebase Storage
 * @param receiptPath - Full path to the receipt file in storage
 * @returns Promise<void>
 */
export async function deleteReceipt(receiptPath: string): Promise<void> {
  try {
    const storageRef = ref(storage, receiptPath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw new Error('Failed to delete receipt. Please try again.');
  }
}

/**
 * Delete all receipts for an expense
 * @param userId - User ID
 * @param expenseId - Expense ID
 * @returns Promise<void>
 */
export async function deleteAllReceipts(
  userId: string,
  expenseId: string
): Promise<void> {
  try {
    const folderRef = ref(storage, `expenses/${userId}/${expenseId}`);
    const result = await listAll(folderRef);

    // Delete all files in the folder
    for (const fileRef of result.items) {
      await deleteObject(fileRef);
    }
  } catch (error) {
    console.error('Error deleting receipts:', error);
    throw new Error('Failed to delete receipts. Please try again.');
  }
}
