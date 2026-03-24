type CropPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};
import type { SupabaseClient } from "@supabase/supabase-js";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = src;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert image to blob."));
        return;
      }
      resolve(blob);
    }, type, quality);
  });

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

export const createCroppedSquareJpeg = async (
  sourceDataUrl: string,
  cropPixels: CropPixels,
  outputSize = 512,
  maxBytes = 450 * 1024
): Promise<Blob> => {
  const image = await loadImage(sourceDataUrl);

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = Math.max(1, Math.round(cropPixels.width));
  sourceCanvas.height = Math.max(1, Math.round(cropPixels.height));
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) {
    throw new Error("Failed to initialize crop canvas.");
  }

  sourceContext.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputSize;
  outputCanvas.height = outputSize;
  const outputContext = outputCanvas.getContext("2d");
  if (!outputContext) {
    throw new Error("Failed to initialize output canvas.");
  }

  outputContext.drawImage(
    sourceCanvas,
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height,
    0,
    0,
    outputSize,
    outputSize
  );

  const qualities = [0.92, 0.86, 0.8, 0.72, 0.64];
  let result = await canvasToBlob(outputCanvas, "image/jpeg", qualities[0]);

  for (let index = 1; index < qualities.length && result.size > maxBytes; index += 1) {
    result = await canvasToBlob(outputCanvas, "image/jpeg", qualities[index]);
  }

  return result;
};

export const uploadPlayerHeadshot = async (
  supabase: SupabaseClient,
  userId: string,
  imageBlob: Blob
): Promise<string> => {
  const bucket = "player-headshots";
  const filePath = `${userId}/headshot-${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, imageBlob, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};
