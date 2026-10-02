'use client'

import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  size?: string;
  small?: boolean;
  index: number;
  images: any[];
  // Per-slot loading — pass the Set, not a single boolean
  loadingIndexes: Set<number>;
  setSelectedImage: (url: string) => void;
  setOpenImageModal?: (open: boolean) => void;
  onImageChange?: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  // ✅ Hook's openModal so selectedImageIndex is set correctly
  onOpenModal?: (index: number) => void;
  defaultImage?: string | null;
}

const ImagePlaceholder = ({
  size,
  small,
  index,
  images,
  loadingIndexes,
  setSelectedImage,
  setOpenImageModal,
  onImageChange,
  onRemove,
  onOpenModal,
  defaultImage = null,
}: Props) => {

  // Server URL from the images array at this slot
  const imageUrl: string | null = images[index]?.file_url || defaultImage || null;

  // Local blob preview — shown immediately while upload is in progress
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Only this slot's loading state
  const isLoading = loadingIndexes.has(index);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (localPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  // Once the server URL arrives, discard the local blob preview
  useEffect(() => {
    if (imageUrl && localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  }, [imageUrl]); // intentionally omitting localPreview — we only want this to fire when imageUrl changes

  // What to display: blob preview during upload, server URL after
  const displayImage = localPreview || imageUrl;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image too large. Max size is ${maxSizeMB}MB`);
      event.target.value = "";
      return;
    }

    // Show local preview immediately for snappy UX
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    onImageChange?.(file, index);

    // Reset input so the same file can be re-selected if needed
    event.target.value = "";
  };

  const handleEditClick = () => {
    if (!imageUrl) return;
    // ✅ Use hook's openModal — sets selectedImageIndex correctly
    // so undo/redo/transform all work
    if (onOpenModal) {
      onOpenModal(index);
    } else {
      // Fallback if onOpenModal not provided
      setOpenImageModal?.(true);
      setSelectedImage(imageUrl); // ✅ always server URL, never blob
    }
  };

  return (
    <div
      className={`relative ${small ? "h-[180px]" : "h-[400px]"} w-full bg-zinc-900 cursor-pointer 
        border border-gray-600 flex rounded-lg items-center overflow-hidden`}>
      <input
        type="file"
        accept="image/*"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ✅ Per-slot loading overlay — only THIS slot freezes during upload */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      )}

      {/* Action buttons — visible when image exists and slot is not loading */}
      {displayImage && !isLoading && (
        <>
          {/* Remove */}
          <button
            type="button"
            className="absolute bg-red-500/80 text-white top-3 right-3 p-1 rounded shadow-lg z-20 hover:bg-red-600 transition"
            onClick={() => onRemove?.(index)}
          >
            <X size={12} />
          </button>

          {/* Edit / AI transform — only makes sense once server URL exists */}
          {imageUrl && (
            <button
              type="button"
              className="absolute top-3 right-12 p-1 rounded bg-blue-500 cursor-pointer shadow-lg z-20 hover:bg-blue-600 transition flex items-center gap-1 text-xs"
              onClick={handleEditClick}
            >
              <WandSparkles size={12} />
              <span>Edit</span>
            </button>
          )}

          {/* Re-upload pencil — allows changing an existing image (rule 3) */}
          <label
            htmlFor={`image-upload-${index}`}
            className="absolute bottom-3 right-3 p-1.5 bg-slate-700/80 rounded shadow-lg cursor-pointer hover:bg-slate-600 transition z-20"
            title="Change image"
          >
            <Pencil size={14} />
          </label>
        </>
      )}

      {/* Upload button — only when slot is empty and not loading */}
      {!displayImage && !isLoading && (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute p-2 top-3 right-3 bg-slate-700 rounded shadow-lg cursor-pointer hover:bg-slate-600 transition z-20"
        >
          <Pencil size={16} />
        </label>
      )}

      {/* Image display */}
      {displayImage ? (
        <Image
          src={displayImage}
          width={400}
          height={400}
          sizes="(max-width: 512px) 100vw, 33vw"
          loading="lazy"
          alt="uploaded product"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full flex flex-col items-center p-4">
          <p className={`text-white ${small ? "text-lg" : "text-2xl"} font-semibold`}>
            {size}
          </p>
          <p className={`text-white ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>
            Please choose an image <br />according to the expected ratio
          </p>
          <label
            htmlFor={`image-upload-${index}`}
            className="mt-4 p-2 bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 transition"
          >
            Upload Image
          </label>
        </div>
      )}
    </div>
  );
};

export default ImagePlaceholder;
