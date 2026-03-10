import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  size?: string;
  small?: boolean;
  openImageModal?: boolean;
  onImageChange?: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  images: any,
  pictureUploadLoader: boolean,
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
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];

    if (file) {
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Image too large. Max size is ${maxSizeMB}MB`);
        event.target.value = ""; // reset input
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      onImageChange?.(file, index!);
    }
  };

  return (
    <div
      className={`relative ${small ? "h-[180px]" : "h-[400px]"} w-full bg-zinc-900 cursor-pointer 
       border border-gray-600 flex rounded-lg items-center`}
    >
      <input
        type="file"
        accept="image/*"
        id={`image-upload-${index}`}
        onChange={handleImageChange}
        className="hidden"
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            disabled={pictureUploadLoader}
            className="absolute bg-red-500/80 text-white top-3 right-3 p-1 rounded shadow-lg"
            onClick={() => onRemove?.(index!)}
          >
            <X size={12} /> 
          </button>

      {images[index]?.file_url && (
          <button
            type="button"
            disabled={pictureUploadLoader}
            className="absolute top-3 right-16 p-2 !rounded bg-blue-500 cursor-pointer shadow-lg"
            onClick={() => {
              setOpenImageModal?.(true)
              setSelectedImage(images[index].file_url)
                }}>
              <WandSparkles size={16} />
            <span>Open</span>
          </button>
      )}
        </>
      ) : ( 
        <label 
        htmlFor={`image-upload-${index}`}
        className="absolute p-2 top-3 right-3 bg-slate-700 !rounded shadow-lg cursor-pointer">
          <Pencil size={16}/>
        </label>
      )}

      {imagePreview ? (
        <Image 
          src={imagePreview}
          width={400}
          height={400}
          sizes="(max-width: 768px) 100vw, 33vw"
          alt='uploaded'
          className="w-full h-full object-cover rounded-lg" />
      ) : (
        <div className="w-full flex flex-col items-center">
          <p className={`text-white ${small ? "text-xl" : "text-4xl"} 
                  font-semibold`}>
              {size}          
          </p>
          <p className={`text-white  ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>
            Please chose an image <br />according to the expected ratio
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePlaceholder;