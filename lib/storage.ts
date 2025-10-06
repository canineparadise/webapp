import { supabase } from './supabase'

/**
 * Storage utility functions for uploading files to Supabase Storage
 */

interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

/**
 * Upload a dog photo to public storage
 * @param userId - The user's ID (for folder organization)
 * @param file - The image file to upload
 * @param dogId - Optional dog ID for naming convention
 * @returns Upload result with URL or error
 */
export async function uploadDogPhoto(
  userId: string,
  file: File,
  dogId?: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.',
      }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = dogId
      ? `${dogId}_${timestamp}.${fileExt}`
      : `${timestamp}.${fileExt}`

    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('dog-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload photo',
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('dog-photos').getPublicUrl(data.path)

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    }
  } catch (error: any) {
    console.error('Unexpected upload error:', error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Upload a vaccination certificate to private storage
 * @param userId - The user's ID (for folder organization)
 * @param file - The PDF or image file to upload
 * @param dogId - The dog's ID this certificate belongs to
 * @returns Upload result with URL or error
 */
export async function uploadVaccinationCertificate(
  userId: string,
  file: File,
  dogId: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a PDF or image file.',
      }
    }

    // Validate file size (max 10MB for documents)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 10MB.',
      }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `vaccination_${dogId}_${timestamp}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage (private bucket)
    const { data, error } = await supabase.storage
      .from('vaccination-docs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload vaccination certificate',
      }
    }

    // Get authenticated URL (private bucket)
    const { data: urlData } = await supabase.storage
      .from('vaccination-docs')
      .createSignedUrl(data.path, 31536000) // 1 year expiry

    return {
      success: true,
      url: urlData?.signedUrl || '',
      path: data.path,
    }
  } catch (error: any) {
    console.error('Unexpected upload error:', error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Upload a medical record to private storage
 * @param userId - The user's ID (for folder organization)
 * @param file - The PDF or image file to upload
 * @param dogId - The dog's ID this record belongs to
 * @param documentType - Type of document (medical_record, insurance, etc.)
 * @returns Upload result with URL or error
 */
export async function uploadMedicalRecord(
  userId: string,
  file: File,
  dogId: string,
  documentType: string = 'medical_record'
): Promise<UploadResult> {
  try {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ]
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a PDF or image file.',
      }
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 10MB.',
      }
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${documentType}_${dogId}_${timestamp}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage (private bucket)
    const { data, error } = await supabase.storage
      .from('medical-records')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload medical record',
      }
    }

    // Get authenticated URL (private bucket)
    const { data: urlData } = await supabase.storage
      .from('medical-records')
      .createSignedUrl(data.path, 31536000) // 1 year expiry

    return {
      success: true,
      url: urlData?.signedUrl || '',
      path: data.path,
    }
  } catch (error: any) {
    console.error('Unexpected upload error:', error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Delete a file from storage
 * @param bucket - The storage bucket name
 * @param path - The file path to delete
 * @returns Success or error
 */
export async function deleteFile(
  bucket: 'dog-photos' | 'vaccination-docs' | 'medical-records',
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete file',
      }
    }

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Get a signed URL for a private file
 * @param bucket - The storage bucket name
 * @param path - The file path
 * @param expiresIn - Expiry time in seconds (default 1 hour)
 * @returns Signed URL or error
 */
export async function getSignedUrl(
  bucket: 'vaccination-docs' | 'medical-records',
  path: string,
  expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return {
        error: error.message || 'Failed to get signed URL',
      }
    }

    return { url: data.signedUrl }
  } catch (error: any) {
    return {
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate image dimensions (optional check)
 * @param file - Image file to check
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @returns Promise resolving to true if valid
 */
export function validateImageDimensions(
  file: File,
  maxWidth: number = 2000,
  maxHeight: number = 2000
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img.width <= maxWidth && img.height <= maxHeight)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      resolve(false)
    }
    img.src = URL.createObjectURL(file)
  })
}
