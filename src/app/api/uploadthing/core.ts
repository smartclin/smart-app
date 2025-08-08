// src/uploadthing/router.ts
import { createUploadthing, type FileRouter } from "uploadthing/server";

// Initialize the Uploadthing server. This is the entry point for defining file routers.
const f = createUploadthing();

/**
 * Our main file router, which defines all the allowed file types and post-upload actions.
 * Each key in this object represents a distinct file uploader endpoint.
 */
export const ourFileRouter = {
  /**
   * Defines an endpoint for image uploads.
   * - `f({ image: { maxFileSize: '32MB' } })`: Configures the uploader to accept only images
   * with a maximum file size of 32 megabytes.
   * - `.onUploadComplete(async ({ metadata, file }) => {})`: This handler runs immediately
   * after a file is successfully uploaded to Uploadthing's servers. It's the ideal place
   * to perform backend logic, such as saving the file URL to a database.
   */
  imageUploader: f({ image: { maxFileSize: "32MB" } }).onUploadComplete(
    async ({ file }) => {
      // Log the file details to the console to confirm the upload was successful.
      // This is where you would typically save the file's URL to your database.
      console.log("Image upload complete! File details:", file);

      // You could also perform other actions here, such as:
      // const userId = metadata.userId; // Example: assuming you passed metadata
      // await db.image.create({
      //   data: {
      //     url: file.url,
      //     name: file.name,
      //     size: file.size,
      //     userId: userId,
      //   },
      // });

      // The `file` object contains a `url` property that you can use to reference the uploaded file.
      console.log("File URL:", file.ufsUrl);
    }
  ),

  /**
   * Another example endpoint for PDF uploads.
   * This demonstrates how to create a separate endpoint for different file types and sizes.
   */
  pdfUploader: f({ pdf: { maxFileSize: "16MB" } }).onUploadComplete(
    async ({ file }) => {
      console.log("PDF upload complete! File details:", file);
      console.log("PDF URL:", file.ufsUrl);
    }
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
