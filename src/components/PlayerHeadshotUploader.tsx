import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Cropper, { Area } from "react-easy-crop";
import { createCroppedSquareJpeg, readFileAsDataUrl } from "@/utils/imageUtils";

type PlayerHeadshotUploaderProps = {
  imageUrl: string;
  onCroppedBlobChange: (blob: Blob | null) => void;
  onError: (message: string) => void;
};

const PlayerHeadshotUploader: React.FC<PlayerHeadshotUploaderProps> = ({
  imageUrl,
  onCroppedBlobChange,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [sourceImageDataUrl, setSourceImageDataUrl] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAreaPixels, setCropAreaPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);

  const previewUrl = useMemo(
    () => localPreviewUrl || imageUrl,
    [localPreviewUrl, imageUrl]
  );

  const handlePhotoFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Please upload an image file.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setSourceImageDataUrl(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropAreaPixels(null);
      setCropDialogOpen(true);
    } catch {
      onError("Failed to read image file.");
    } finally {
      event.target.value = "";
    }
  };

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCropAreaPixels(areaPixels);
  }, []);

  const applyCrop = async () => {
    if (!cropAreaPixels || !sourceImageDataUrl) return;
    setCropping(true);
    try {
      const blob = await createCroppedSquareJpeg(
        sourceImageDataUrl,
        {
          x: Math.round(cropAreaPixels.x),
          y: Math.round(cropAreaPixels.y),
          width: Math.round(cropAreaPixels.width),
          height: Math.round(cropAreaPixels.height),
        },
        512,
        450 * 1024
      );
      const nextPreview = URL.createObjectURL(blob);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
      setLocalPreviewUrl(nextPreview);
      onCroppedBlobChange(blob);
      setCropDialogOpen(false);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Image processing failed.");
    } finally {
      setCropping(false);
    }
  };

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  return (
    <>
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Headshot</DialogTitle>
            <DialogDescription>
              Crop your image to a square. We will auto-resize and compress it.
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-[360px] bg-black rounded-md overflow-hidden">
            {sourceImageDataUrl ? (
              <Cropper
                image={sourceImageDataUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Zoom</p>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0] ?? 1)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCropDialogOpen(false)}
              disabled={cropping}
            >
              Cancel
            </Button>
            <Button onClick={applyCrop} disabled={cropping}>
              {cropping ? "Processing..." : "Use crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <label className="text-sm font-medium">Headshot (square)</label>
        <div className="mt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-28 h-28 rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Headshot preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500 text-center px-2">No image</span>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoFileSelected}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload and crop
            </Button>
            <p className="text-xs text-gray-500">
              Output is forced to square and optimized before upload.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerHeadshotUploader;
