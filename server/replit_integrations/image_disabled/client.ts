import { Buffer } from "node:buffer";

// Image AI disabled for local development

export async function generateImageBuffer(): Promise<Buffer> {
  throw new Error("Image AI is disabled in local development");
}

export async function editImages(): Promise<Buffer> {
  throw new Error("Image AI is disabled in local development");
}
