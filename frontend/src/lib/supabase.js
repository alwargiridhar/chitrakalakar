import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lurvhgzauuzwftfymjym.supabase.co';
const supabaseAnonKey = 'sb_publishable_YRUGm-45aY165zzIebAERw_QQsKtGYA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const BUCKETS = {
  AVATARS: 'avatars',
  ARTWORKS: 'artworks',
  EXHIBITIONS: 'exhibitions'
};

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} bucket - Bucket name (avatars, artworks, exhibitions)
 * @param {string} folder - Optional folder path within bucket
 * @returns {Promise<string>} Public URL of uploaded file
 */
export const uploadFile = async (file, bucket, folder = '') => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file: ' + error.message);
  }
};

/**
 * Delete file from Supabase Storage
 * @param {string} fileUrl - Public URL of file to delete
 * @param {string} bucket - Bucket name
 */
export const deleteFile = async (fileUrl, bucket) => {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split(`/${bucket}/`);
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

/**
 * Compress and optimize image before upload
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
