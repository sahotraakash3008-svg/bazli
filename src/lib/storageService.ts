import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageError
} from 'firebase/storage';
import { storage, auth } from './firebase';

/**
 * Clean and sanitize filename to prevent invalid characters in Firebase Storage paths.
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .slice(-80); // keep reasonable length
}

/**
 * Standard upload progress callback
 */
export type UploadProgressCallback = (percent: number, snapshotState?: string) => void;

export interface UploadResult {
  url: string;
  storagePath: string;
  fileName: string;
  size: number;
  contentType: string;
}

/**
 * Base utility to upload a file to Firebase Storage with progress tracking.
 */
export async function uploadFileToStorage(
  file: File | Blob,
  path: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  try {
    const storageRef = ref(storage, path);
    const contentType = (file as File).type || 'image/jpeg';
    
    const metadata = {
      contentType,
      customMetadata: {
        uploadedBy: auth.currentUser?.uid || 'anonymous',
        uploadedAt: new Date().toISOString(),
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) {
            onProgress(progress, snapshot.state);
          }
        },
        (error: StorageError) => {
          console.error('Firebase Storage Upload Error:', error);
          reject(new Error(`Storage upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              storagePath: path,
              fileName: (file as File).name || 'file',
              size: file.size,
              contentType,
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error initiating upload to storage:', error);
    throw error;
  }
}

/**
 * Upload a Product or Menu item image.
 * Path: products/{sellerId}/{timestamp}_{filename}
 */
export async function uploadProductImage(
  file: File,
  sellerId: string = 'general',
  onProgress?: UploadProgressCallback
): Promise<string> {
  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const path = `products/${sellerId}/${timestamp}_${cleanName}`;
  const result = await uploadFileToStorage(file, path, onProgress);
  return result.url;
}

/**
 * Upload a Restaurant / Merchant menu photo card.
 * Path: sellers/{sellerId}/menu_photos/{timestamp}_{filename}
 */
export async function uploadMenuCardPhoto(
  file: File,
  sellerId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const path = `sellers/${sellerId}/menu_photos/${timestamp}_${cleanName}`;
  const result = await uploadFileToStorage(file, path, onProgress);
  return result.url;
}

/**
 * Upload a Restaurant / Store banner cover photo or logo.
 * Path: sellers/{sellerId}/banners/{timestamp}_{filename}
 */
export async function uploadSellerBanner(
  file: File,
  sellerId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const path = `sellers/${sellerId}/banners/${timestamp}_${cleanName}`;
  const result = await uploadFileToStorage(file, path, onProgress);
  return result.url;
}

/**
 * Upload a Customer or User profile avatar.
 * Path: users/{userId}/profile/{timestamp}_{filename}
 */
export async function uploadUserProfileImage(
  file: File,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const path = `users/${userId}/profile/${timestamp}_${cleanName}`;
  const result = await uploadFileToStorage(file, path, onProgress);
  return result.url;
}

/**
 * Upload a Delivery Partner KYC document (Driving License, Aadhaar, RC).
 * Path: delivery_partners/{partnerId}/kyc/{docType}_{timestamp}_{filename}
 */
export async function uploadKycDocument(
  file: File,
  partnerId: string,
  docType: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const path = `delivery_partners/${partnerId}/kyc/${docType}_${timestamp}_${cleanName}`;
  const result = await uploadFileToStorage(file, path, onProgress);
  return result.url;
}

/**
 * Upload Admin & Platform CMS Banner or Category asset.
 * Path: cms/{category}/{timestamp}_{filename}
 */
export async function uploadCmsAsset(
  file: File,
  assetType: 'banners' | 'categories' | 'deals' | 'general' = 'general',
  onProgress?: UploadProgressCallback
): Promise<string> {
  const cleanName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const path = `cms/${assetType}/${timestamp}_${cleanName}`;
  const result = await uploadFileToStorage(file, path, onProgress);
  return result.url;
}

/**
 * Helper to delete a file from Firebase Storage if needed.
 */
export async function deleteStorageFileByUrl(fileUrl: string): Promise<boolean> {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.warn('Could not delete storage file:', error);
    return false;
  }
}
