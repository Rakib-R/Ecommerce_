'use client'

import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import ImagePlaceholder from '../../../shared/components/image-placeholderr';
import Input from 'packages/components/input';
import { ColorSelector } from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custon-specifications';
import CustomProperties from 'packages/components/custom-properties';

const page = () => {

   const [openImageModal, setOpenImageModal] = useState(false);
   const [loading, setLoading] = useState(false);
   const [imageList, setImageList] = useState<any[]>([]);
   const [isChanged, setIsChanged] = useState(false);
   const [images, setImages] = useState<(File | null)[]>([null])

  const { register,  control,  watch, setValue,  handleSubmit,formState: { errors },} = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    };

   const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;
    
    if (index >= images.length && images.length < 1) {
    const updatedImages = [...images];
    updatedImages.push(null);
    setImages(updatedImages);
    setValue("images", updatedImages)
}
  };
    const handleRemoveImage = (index: number) => {
      setImages((prevImages) => {
        const updatedImages = [...prevImages];

        if (index >= updatedImages.length) {
          return updatedImages;
        }
        if (index === 0) {
          updatedImages[0] = null;
        } else {
          updatedImages.splice(index, 1);
        }

      if (!updatedImages.includes(null) && updatedImages.length < 1) {
        updatedImages.push(null);
      }
        setValue("images", updatedImages);
        return updatedImages;
      });
};
  
   return (
  <form 
    className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    onSubmit={handleSubmit(onSubmit)}>

    <h2 className="py-2 font-semibold font-Poppins text-white"> Create Product</h2>
    <div className="flex items-center gap-2 text-gray-400">
      <span className="cursor-pointer">Dashboard</span>
      <ChevronRight size={20} className='opacity-[0.8]'/>
      <span>Create Products</span>
    </div>

      {/* Content Layout */}
      <main className="w-full flex gap-6 py-4 bg-black/90">
      {/* Left side Image upload section */}
          <section className="md:w-[35%]">
            {images?.length > 0 && (
              <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
              />
            )}

              <aside className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                key={index}
                small
                index={index + 1}
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </aside>
      </section>

        {/* Right side - form inputs --------  --------   Right side - form inputs */} 
      <section className='md:w-[65%]'>
        <aside className="w-full flex gap-6">
        <div className='w-2/4'>

        {/* TITLE */}
            <Input 
              label="Product Title"
              placeholder="Product title"
              {...register("title", {   required: "Title is required",
              })}/>

            {errors.title && (
            <p className="text-xs mt-1">
              {errors.title.message as string}
            </p>
          )}
        <div className='mt-2'>

          {/* DESCRIPTION */}
          <Input
            type="textarea"
            rows={7}
            cols={10}
            label="Short Description * (Max 150 words)"
            placeholder="Enter product description for quick view"
            {...register("description", {
              required: "Description is required",
              validate: (value) => {
                const wordCount = value.trim().split(/\s+/).length;
                return (
                  wordCount <= 150 ||
                  `Description cannot exceed 150 words (Current: ${wordCount})`
                );
              },
            })}
          />
            {errors.description && (
            <p className="text-xs mt-1">
              {errors.description.message as string}
            </p>
          )}

            {/* TAGS */}
          <div className="mt-2">
            <Input
              label="Tags *"
              placeholder="apple, flagship"
              {...register("tags", {
                required: "Separate related product tags with a comma",
              })}
            />
            {errors.tags && (
              <p className="text-xs">
                {errors.tags.message as string}
              </p>
            )}
          </div>

            {/* WARRENTY */}
          <div className="mt-2">
            <Input
              label="Warranty Year / No Warranty"
              {...register("warranty", {
                required: "Warranty is required",
              })}
            />

            {errors.warranty && (
              <p className="text-xs mt-1">
                {errors.warranty.message as string}
              </p>
            )}
          </div>

              {/* SLUGS */}
          <div className="mt-2">
              <Input
              label='Slug *'
                placeholder="product_slug"
                {...register("slug", {
                  required: "Slug is required!",
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: "Invalid slug format! Use only lowercase letters, numbers, and hyphens",
                  },
                  minLength: {
                    value: 3,
                    message: "Slug must be at least 3 characters long.",
                  },
                  maxLength: {
                    value: 50,
                    message: "Slug must be at most 50 characters long.",
                  },
                })}
              />
                  {errors.slug && (
              <p className="text-xs mt-1">
                {errors.slug.message as string}
              </p>
            )}
            </div>

            {/* BRAND */}
          <div className='mt-2'>
            <Input
              placeholder="Apple"
              {...register("brand")}
            />
            {errors.brand && (
              <p className="text-red-500 text-xs mt-1">
                {errors.brand.message as string}
              </p>
            )}
          </div>

          {/* COLORSELECTOR */}
          <div className='mt-2'>
            <ColorSelector control={control} errors={errors}/>
          </div>

          {/* CUSTOM SPECIFICATIONS */}
          <div className='mt-2'>
            <CustomSpecifications control={control} errors={errors}/>
          </div>
          
          {/* CUSTOM _ PROPERTIES */}
        <div className='mt-2'>
          <CustomProperties control={control} errors={errors}/>
        </div>

          </div>
        </div>
      </aside>
    </section>
   </main>

  </form>
 
    );
}

export default page