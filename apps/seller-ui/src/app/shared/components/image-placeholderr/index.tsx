'use client'

import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  size?: string;
  small?: boolean;
  openImageModal?: boolean;
  onImageChange?: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  images: any;
  pictureUploadLoader: boolean;
  setSelectedImage: (e: string) => void;
  setOpenImageModal?: (openImageModal: boolean) => void;
  index: number;
}

const ImagePlaceholder = ({
    size,
    small,
    onImageChange,
    onRemove,
    defaultImage = null,
    index,
    pictureUploadLoader,
    images,
    setSelectedImage,
    setOpenImageModal,
  }: Props) => {

  // Use the actual uploaded URL from props, not local state
  const imageUrl = images[index]?.file_url || defaultImage;
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Cleanup local preview on unmount or when image changes
  useEffect(() => {
    return () => {
      if (localPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  // Show local preview while uploading, then switch to server URL
  const displayImage = localPreview || imageUrl;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Image too large. Max size is ${maxSizeMB}MB`);
        event.target.value = "";
        return;
      }
      
      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setLocalPreview(previewUrl);
      onImageChange?.(file, index);
    }
  };

  // Clear local preview when upload completes
  useEffect(() => {
    if (imageUrl && localPreview) {
      // Upload completed - clean up local preview
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  }, [imageUrl]);

  return (
    <div
      className={`relative ${small ? "h-[180px]" : "h-[400px]"} w-full bg-zinc-900 cursor-pointer 
       border border-gray-600 flex rounded-lg items-center overflow-hidden`}>
      
      <input
        type="file"
        accept="image/*"
        id={`image-upload-${index}`}
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Loading overlay */}
      {pictureUploadLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Action buttons - only show when image exists and not loading */}
      {displayImage && !pictureUploadLoader && (
        <>
          <button
            type="button"
            className="absolute bg-red-500/80 text-white top-3 right-3 p-1 rounded shadow-lg z-20 hover:bg-red-600 transition"
            onClick={() => onRemove?.(index)}>
            <X size={12} /> 
          </button>

          <button
            type="button"
            className="absolute top-3 right-12 p-1 rounded bg-blue-500 cursor-pointer shadow-lg z-20 hover:bg-blue-600 transition flex items-center gap-1 text-xs"
            onClick={() => {
              setOpenImageModal?.(true);
              setSelectedImage(displayImage);
            }}>
            <WandSparkles size={12} />
            <span>Edit</span>
          </button>
        </>
      )}

      {/* Upload button - only show when no image */}
      {!displayImage && !pictureUploadLoader && (
        <label 
          htmlFor={`image-upload-${index}`}
          className="absolute p-2 top-3 right-3 bg-slate-700 rounded shadow-lg cursor-pointer hover:bg-slate-600 transition z-20">
          <Pencil size={16}/>
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
          alt='uploaded'
          className="w-full h-full object-cover" />
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
            className="mt-4 p-2 bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 transition">
            Upload Image
          </label>
        </div>
      )}
    </div>
  );
};

export default ImagePlaceholder;