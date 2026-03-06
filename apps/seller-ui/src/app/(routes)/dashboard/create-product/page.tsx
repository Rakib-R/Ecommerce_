'use client'

import dynamic from 'next/dynamic';

import { ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import ImagePlaceholder from '../../../shared/components/image-placeholderr';
import Input from 'packages/components/input';
import { ColorSelector } from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custon-specifications';
import CustomProperties from 'packages/components/custom-properties';
import { SizeSelector } from 'packages/components/size-selector';

import { Controller, ControllerFieldState, ControllerRenderProps, FieldValues, useForm, UseFormStateReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axiosInstance';
import Link from 'next/link';

const page = () => {

   const [openImageModal, setOpenImageModal] = useState(false);
   const [loading, setLoading] = useState(false);
   const [imageList, setImageList] = useState<any[]>([]);
   const [isChanged, setIsChanged] = useState(true);
   const [images, setImages] = useState<(File | null)[]>([null])

  const { register,  control,  watch, setValue,  handleSubmit,formState: { errors },} = useForm();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        throw new Error("Failed to fetch categories");
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const RichTextEditor = useMemo(() => dynamic(
  () => import('packages/components/rich-text-editor'),
  { 
    ssr: false,
    loading: () => <div className="h-40 w-full bg-zinc-800 animate-pulse rounded-md" /> 
  }),[]);
  
  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const selectedSubCategory = watch("SubCategory");
  const regularPrice = watch("regularPrice");
  
  const subCategories = useMemo(() => {
      return categories ? subCategoriesData[selectedCategory] || [] : []
    },[selectedCategory, subCategoriesData])


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
    const hanldeSaveDraft = () =>{

    }
  
   return (
  <form 
    className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    onSubmit={handleSubmit(onSubmit)}>

    <h2 className="py-2 font-semibold font-Poppins text-white"> Create Product</h2>
    <div className="flex items-center gap-2 text-gray-400">
      <Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">
            <span className="cursor-pointer">Dashboard</span>
        </Link>
      <ChevronRight size={20} className='opacity-[0.8]'/>
      <span>Create Products</span>
    </div>

      {/* Content Layout */}
      <main className="w-full flex gap-6 py-4 bg-black/90 ">
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
      <section className='flex gap-4 md:w-[65%] '>
        <aside className='flex flex-col gap-2 w-full mr-8 md:w-3/5 md:mr-0'>

      {/* TITLE */}
      <Input 
        label="Product Title"
        placeholder="Product title"
        {...register("title", {   required: "Title is required",
        })}/>

        {errors.title && (
        <p className="text-xs text-red-500 mt-1">
          {errors.title.message as string}
        </p>
      )}
      <div className='mt-2 '>
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
          <p className="text-xs text-red-500 mt-1">
            {errors.description.message as string}
          </p>
        )}
      </div>

        {/* TAGS */}
      <div className="mt-2 w-full">
        <Input
          label="Tags *"
          placeholder="apple, flagship"
          {...register("tags", {
            required: "Separate related product tags with a comma",
          })}
        />
        {errors.tags && (
          <p className="text-xs text-red-500 mt-1">
            {errors.tags.message as string}
          </p>
        )}
      </div>  

      {/* WARRENTY */}
      <div className="mt-2">
        <Input
          label="Warranty Year / No Warranty *"
          {...register("warranty", {
            required: "Warranty is required",
          })}
        />

        {errors.warranty && (
          <p className="text-xs mt-1 text-red-500">
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
          <label htmlFor="brand">Brand</label>
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

          {/* CASH ON DELIVERY */}
       <div className="mt-2">
      <label className="block mb-1 font-semibold text-gray-200">
        Cash On Delivery *
      </label>
      <select
        {...register("cash_on_delivery", {
          required: "Cash on Delivery is required",
        })}
        className="w-full border border-gray-700 outline-none bg-transparent p-2 rounded-md text-sm focus:border-blue-500 transition-all"
      >
        <option value="yes" className="bg-gray-900">Yes</option>
        <option value="no" className="bg-gray-900">No</option>
      </select>
      {errors.cash_on_delivery && (
        <p className="text-red-400 text-xs mt-1 italic">
          {errors.cash_on_delivery.message as string}
        </p>
      )}
      </div>
  </aside>
    
  <aside className='flex-1 flex flex-col gap-4'>
      <div>
        <label className="block mb-1 font-semibold text-gray-200">
          Category *
        </label>
        {isLoading ? (
          <p className='text-gray-500'>Loading categories...</p>
        ) : isError ? (
          <p className='text-red-400'>Failed to load categories</p>
        ) : (
        <Controller
            name="category"
            control={control}
            defaultValue="" 
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full border outline-none border-gray-700 bg-zinc-900 text-white rounded-md p-2
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all
                        [&>option]:bg-zinc-900 [&>option]:text-white"
              >
            <option value="" disabled className="bg-zinc-900 text-white">
                {selectedCategory  ? "☑️ Select Category" : "Select a category"}
              </option>
                  {categories?.map((category: string) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-zinc-800"
                    >
                      {category}
                    </option>
                  ))}
              </select>
            )}/>
        )}
              {errors.category && (
                  <p className="text-xs mt-1">
              {errors.category.message as string}
              </p>
            )}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-200">
            Sub-Category *
          </label>
          {isLoading ? (
            <p className='text-gray-500'>Loading subCategories...</p>
          ) : isError ? (
            <p className='text-red-400'>Failed to load subCategory</p>
          ) : (
          <Controller
              name="subCategory"
              control={control}
              defaultValue="" 
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full border outline-none border-gray-700 bg-zinc-900 text-white rounded-md p-2
                      focus:border-blue-500 transition-all
                      [&>option]:bg-zinc-900 [&>option]:text-white"
                        >
                    <option value="" disabled className="bg-zinc-900 text-white">
                      {selectedSubCategory ? "☑️ Select Sub-Category" : "Select a category first"}
                    </option>
                    {subCategories?.map((subCategory: string) => (
                      <option
                        key={subCategory}
                        value={subCategory}
                        className="bg-zinc-800"
                      >
                        {subCategory}
                      </option>
                    ))}
                </select>
              )}/>
          )}
            {errors.category && (
                <p className="text-xs mt-1">
            {errors.category.message as string}
            </p>
          )}
        </div>
            {/* RICH TEXT EDITOR  RICH TEXT EDITOR   */} {/* RICH TEXT EDITOR  RICH TEXT EDITOR   */}  
          <div>
          <label className="block font-semibold mb-1">
            Detailed Description * (Min words)
          </label>

          <Controller
            name="detailed_description"
            control={control}
            rules={{
              required: "Detailed description is required!",
              validate: (value: string) => {
                const wordCount = value
                  ?.trim()
                  ?.split(/\s+/)
                  ?.filter((word: string) => word).length || 0;

                return (
                  wordCount >= 100 || "Description must be at least 100 words!"
                );
              }
            }}
            render={({ field }) => (
              <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              />
            )}
          />
          {errors.detailed_description && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.detailed_description?.message as React.ReactNode}
            </p>
          )}
        </div>
            {/* VIDEO EMBEDDED */}
          <div className="mt-2">
            <Input
              label="Video URL"
              placeholder="https://www.youtube.com/embed/xyz123"
              {...register("video_url", {
                pattern: {
                  value: /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                  message: "Invalid YouTube embed URL! Use format: https://www.youtube.com/embed/ID"
                }
              })}
            />
            {errors.video_url && (
              <p className="text-red-500 text-xs mt-1">
                {errors.video_url.message as React.ReactNode} 
              </p>
            )}
        </div>
            
        <div className="mt-2">
          <Input
            label="Regular Price"
            {...register("regular_price", {
              valueAsNumber: true,
              min: { value: 1, message: "Price must be at least 1" },
              validate: (value) => !isNaN(value) || "Only numbers are allowed",
            })}
          />
          {errors.regular_price && (
            <p className="text-xs mt-1">
              {errors.regular_price.message as string}
            </p>
        )}
      </div>
        <div className="mt-2">
          <Input
            label="Sale Price"
            placeholder="15"
            {...register("sale_price", {
              required: "Sale Price is required",
              valueAsNumber: true,
              min: { 
                value: 1, 
                message: "Sale Price must be at least 1" 
              },
              validate: (value) => {
                if (isNaN(value)) return "Only numbers are allowed";
                if (regularPrice && value >= regularPrice) {
                  return "Sale Price must be less than Regular Price";
                }
                return true;
              }
            })}
          />
          {errors.sale_price && (
            <p className="text-red-500 text-xs mt-1">
              {errors.sale_price.message as string}
            </p>
          )}
        </div>

        <div className="mt-2">
          <Input
            label="Stock"
            {...register("stock", {
              required: "Stock is required!",
              valueAsNumber: true,
              min: {
                value: 1,
                message: "Stock must be at least 1"
              },
              max: {
                value: 1000,
                message: "Stock cannot exceed 1000"
              },
              validate: (value) => {
                if (isNaN(value)) return "Only numbers are allowed!";
                if (!Number.isInteger(value)) return "Stock must be a whole number!";
                return true;
              }
            })}
          />
          {errors.stock && (
            <p className="text-red-500 text-xs mt-1">
              {errors.stock.message as string}
            </p>
          )}
        </div>

        <div className='mt-2'>
          <SizeSelector control={control} errors={errors}/>
        </div>

        <div className="mt-3">
          <label className="font-semibold block mb-2">
            Select Discount Codes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
        </div>
            <div className="mt-6 flex justify-end gap-3">
          {isChanged && (
           <>
             <button
              type="button"
              onClick={hanldeSaveDraft}
              className="px-4 py-2 bg-blue-600 text-white rounded-md transition-colors hover:bg-gray-600"
            >
              Save Draft
            </button>
             <button
              type="button"
              onClick={hanldeSaveDraft}
              className="px-4 py-2 bg-gray-500 text-white rounded-md transition-colors hover:bg-gray-600"
            >
              Create
            </button>
           </>
          )}
        </div>
    </aside>

    </section>
  
   </main>
  </form>
 
    );
}

export default page