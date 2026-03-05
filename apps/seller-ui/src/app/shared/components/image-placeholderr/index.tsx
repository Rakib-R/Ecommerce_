import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

interface Props {
  size?: string;
  small?: boolean;
  openImageModal?: boolean;
  onImageChange?: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  setOpenImageModal?: (openImageModal: boolean) => void;
  index?: number;
}

const ImagePlaceholder = ({
  size,
  small,
  onImageChange,
  onRemove,
  defaultImage = null,
  index,
  setOpenImageModal,
}: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange?.(file, index!);
    }
  };

  return (
    <div
      className={`relative ${small ? "h-[180px]" : "h-[300px]"} w-full bg-slate-900 cursor-pointer 
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
            className="absolute top-3 right-3 p-2 rounded shadow-lg"
            onClick={() => onRemove?.(index!)}
          >
            <X size={16} /> 
          </button>

          <button
            type="button"
            className="absolute top-3 right-16 p-2 !rounded bg-blue-500 cursor-pointer shadow-lg"
            onClick={() => setOpenImageModal?.(true)}>
              <WandSparkles size={16} />
            <span>Open</span>
            
          </button>
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
        alt='uploaded'
        className="w-full h-full object-cover rounded-lg" />
      ) : (
        <div className="w-full flex flex-col items-center">
          <p className={`text-gray-400 ${small ? "text-xl" : "text-4xl"} 
                  font-semibold`}>
              {size}          
          </p>
          <p className={`text-gray-500  ${small ? "text-sm" : "text-lg"} pt-2 text-center`}>
            Please chose an image <br />according to the expected ratio
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePlaceholder;