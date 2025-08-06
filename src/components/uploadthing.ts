import { generateUploadButton, generateUploadDropzone } from '@uploadthing/react'

// Import the UploadthingFileRouter value from your core.ts
// and then use 'typeof' to get its type.
import type { UploadthingFileRouter } from '@/app/api/uploadthing/core'

export const UploadButton = generateUploadButton<typeof UploadthingFileRouter>()
export const UploadDropzone = generateUploadDropzone<typeof UploadthingFileRouter>()
