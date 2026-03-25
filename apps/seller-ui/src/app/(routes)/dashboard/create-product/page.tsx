'use client'

import dynamic from 'next/dynamic';

import { ChevronRight, Wand, X } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import ImagePlaceholder from '../../../shared/components/image-placeholderr';
import Input from 'packages/components/input';
import { ColorSelector } from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custon-specifications';
import CustomProperties from 'packages/components/custom-properties';
import { queryClient } from 'apps/utils/queryClient';
import { SizeSelector } from 'packages/components/size-selector';
import { convertFileToBase64 } from '../../../utils/convertFile2Base64' 

import Image from 'next/image';
import { AxiosError } from "axios";
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { enhancements } from '../../../utils/AI.enhancements';
import { useRouter } from 'next/navigation';

// Fix — explicitly grab the default export and type it
// At module level, outside your component
const RichTextEditor = dynamic(
  () => import('packages/components/rich-text-editor').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-40 w-full bg-zinc-800 animate-pulse rounded-md" />
  }
);

interface UploadedImage {
  fileId : string;
  file_url: string;
}
interface ProductFormData {
  title: string;
  description: string; // Short description
  detailed_description: string; // Rich text
  tags: string;
  warranty: string;
  slug: string;
  brand?: string;
  category: string;
  subCategory: string;
  cash_on_delivery: "yes" | "no";
  prepayment_confirmed?: boolean;
  video_url?: string;
  regularPrice: number;
  salePrice?: number;
  stock: number;
  images: (UploadedImage | null)[];
  colors?: string[]; // Assuming your ColorSelector returns an array
  sizes?: string[];  // Assuming your SizeSelector returns an array
  specifications?: any[]; 
  properties?: any[];
  discountCodes?: string[];
  starting_date: string; // or Date
  ending_date?: string;
}

const page = () => {

   const [openImageModal, setOpenImageModal] = useState(false);
   const [processing, setProcessing] = useState<boolean>(false);
   const [activeEffect, setActiveEffect] = useState<String | null>(null);
   const [pictureUploadLoader, setPictureUploadLoader] = useState<boolean>(false)
   const [selectedImage, setSelectedImage] = useState('');
   const [images, setImages] = useState<(UploadedImage | null)[]>([null])

  const { register,  control,  watch, setError ,setValue,  handleSubmit,formState: { errors, isDirty }} = 
        useForm<ProductFormData>({ reValidateMode: "onChange" ,defaultValues: {
         title: "",
        description: "",
        detailed_description: "",
        tags: "",
        warranty: "",
        slug: "",
        brand: "",
        category: "",
        subCategory: "",
        cash_on_delivery: "no",
        prepayment_confirmed: false,
        video_url: "",
        regularPrice: 0,
        salePrice: 0,
        stock: 1,
        images: [null],
        discountCodes: [],
        colors: [],
        specifications: [],
        properties: []
      }
  });
        
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        try {
          const res = await axiosInstance.get(`/product/api/get-categories`);
          return res.data;
        }  catch (error) {
            if (error instanceof AxiosError) {
              throw new Error(error.response?.data?.message || "Failed to fetch categories");
            }
            throw error;
          }
      },              
      staleTime: 1000 * 60 * 5,
      retry: 2,
    });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
      const res = await axiosInstance.get(`/product/api/get-discount-codes`);
        return res?.data?.discount_codes || [];
    },
  });

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};

    // FORM HOOK WATCH ATTRIBUTE
    const selectedCategory = watch("category");
    const selectedSubCategory = watch("subCategory");
    const regularPrice = watch('regularPrice')
    const cashOnDelivery = watch("cash_on_delivery");

    const subCategories = useMemo(() => {
        return categories ? subCategoriesData[selectedCategory] || [] : []
      },[selectedCategory, subCategoriesData])

    const onInvalid = (errors: any) => {
       Object.keys(errors).forEach((field) => {
      setError(field as any, {
        type: "manual",
        message: errors[field]?.message,
    });
  });
 };
    
  const { mutateAsync: createProduct, isPending } = useMutation({
      mutationFn: async (payload: any) => {
        const res = await axiosInstance.post('/product/api/create-product', payload);
        return res.data;
      },
    });

    const onSubmit = async (data: any) => {
    const payload = {
        ...data,
        cashOnDelivery: data.cash_on_delivery === "yes", 
        starting_date: new Date(data.starting_date),

      }
    try {
    await toast.promise(createProduct(payload), {
      loading: 'Saving product details...',
      success: 'Product created successfully! 🎉',
      error: (err) => err?.response?.data?.message || 'Failed to create product.',
    });
    
    queryClient.invalidateQueries({ queryKey: ['products'] });
    router.push('/dashboard/all-products');
  } catch (error : any) {
    // Handle field-specific errors if needed
    if (error.response?.data?.field) {
      setError(error.response.data.field as keyof ProductFormData, {
        type: "server",
        message: error.response.data.message,
      });
    }
  }
    };

    const applyTransformation = async (transformation: string) => {
      if (!selectedImage || processing) return;
      setProcessing(true);
      setActiveEffect(transformation);

    try {
      let source = selectedImage;
      if (selectedImage.includes("_next/image")) {
      const urlParams = new URLSearchParams(selectedImage.split('?')[1]);
      source = decodeURIComponent(urlParams.get('url') || "");
    }
      const baseUrl = source.split('?')[0];
      const transformedUrl = `${baseUrl}?tr=${transformation}`;

    setSelectedImage(transformedUrl);
    setActiveEffect(transformation);
    
  } catch (error) {
      console.error("AI Error:", error);
  } finally {
      setProcessing(false);
    }
  }

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadLoader(true);
    
    try {
        const fileName = await convertFileToBase64(file);    
        const response = await axiosInstance.post("/product/api/upload-product-image", { fileName });    
                 
        const uploadedImage: UploadedImage = {
          fileId: response.data.fileId,
          file_url: response.data.file_url
        };

        // Use the callback version of setImages to get the LATEST state
        setImages((prevImages) => {
          const updated = [...prevImages];
          updated[index] = uploadedImage;

          // Check if we need to add the next "plus" slot
          if (index === prevImages.length - 1 && updated.length < 8) {
            updated.push(null);
          }
          // Sync with the form immediately
          setValue("images", updated);
          return updated;
        });

    } catch (error) {
          console.error("Upload failed!", error);
          toast.error("One or more images failed to upload.");
    } finally {
      setPictureUploadLoader(false);
    }
};

    const handleRemoveImage = async (index: number) => {
      
    try{
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      
      if (imageToDelete && typeof imageToDelete === 'object'){
          await axiosInstance.delete('/product/api/delete-product-image', 
          {data: { fileId : imageToDelete.fileId} 
          });
      }
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
      
    }
    catch (error){
        console.log('Image Can"t be removed', error as string)
      }
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

       {/* BreadCrumbs */}   {/* BreadCrumbs */} {/* BreadCrumbs */}
      <main className="w-full flex gap-6 py-4 bg-black/90 ">

      {/* Left side Image upload section */}
      {/* Left side Image upload section */}
      <section className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
            setOpenImageModal={setOpenImageModal}
            size="765 x 850"
            small={false}
            index={0}
            images={images}
            pictureUploadLoader={pictureUploadLoader}
            onImageChange={handleImageChange}
            setSelectedImage={setSelectedImage}
            onRemove={handleRemoveImage}
            />
          )}

          <aside className="grid grid-cols-2 gap-3 mt-4">
          {images.slice(1).map((_, index) => (
            <ImagePlaceholder
              key={index}
              small
              index={index + 1}
              images={images}
              pictureUploadLoader={pictureUploadLoader}
              setOpenImageModal={setOpenImageModal}
              setSelectedImage={setSelectedImage}
              size="765 x 850"
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          ))}
        </aside>
        </section>

    {/* Right side - form inputs --------  --------   Right side - form inputs */} 
    {/* Right side - form inputs --------  --------   Right side - form inputs */} 

    <section className='flex gap-6 md:w-[65%] '>
      <aside className='flex flex-col gap-2 md:w-[57%]'>

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
                wordCount <= 100 ||
                `Description cannot exceed 100 words (Current: ${wordCount})`
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
            className={`p-2 bg-transparent border rounded-md text-white ${
              errors.slug ? "border-red-500" : "border-gray-600"
            }`}
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
          className="w-full border border-gray-700 outline-none bg-transparent p-2 rounded-md text-sm 
            focus:border-blue-500 transition-all">
          <option value="yes" className="bg-gray-900">Yes</option>
          <option value="no" className="bg-gray-900">No</option>
        </select>
          {errors.cash_on_delivery && (
            <p className="text-red-400 text-xs mt-1 italic">
              {errors.cash_on_delivery.message as string}
            </p>
        )}
      </div>
        {/* ------ PAYMENT OPTIONS -----  */}
        <div>
          {cashOnDelivery === "no" && (
          <div className="mt-4 p-3 border border-blue-500/30 bg-blue-500/5 rounded-md flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <input
              type="checkbox"
              id="prepayment_confirmed"
              {...register("prepayment_confirmed", { 
                required: "You must confirm prepayment if COD is disabled" 
              })}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="prepayment_confirmed" className="text-sm text-blue-200">
              I confirm that this product requires **Full Prepayment** via digital gateway.
            </label>
          </div>
        )}

        {errors.cash_on_delivery && (
          <p className="text-red-400 text-xs mt-1">{errors.cash_on_delivery.message as string}</p>
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
                className="w-full border outline-none border-gray-700 bg-zinc-900 text-white rounded-md p-2">
                  <option value="" disabled className="bg-transparent text-white">
                  {selectedCategory  ? "☑️ Select Category" : "Select a category"}
              </option>
                  {categories?.map((category: string) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-zinc-800">
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
                     ">
                    <option value="" disabled className="bg-transparent text-white">
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
                if (!value) return "Detailed description is required!";

                const plainText = value.replace(/<[^>]*>/g, ' ')
                .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>').replace(/&#?\w+;/g, ' ') .trim();

                const wordCount = plainText
                  .split(/\s+/)
                  .filter(Boolean).length; // Cleanest way to filter out empty strings

                return wordCount >= 100 || `Description must be at least 100 words! 
                  You need ${100 - wordCount} more words.`;
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
            {...register("regularPrice", {
              valueAsNumber: true,
              min: { value: 1, message: "Price must be at least 1" },
              validate: (value) => !isNaN(value) || "Only numbers are allowed",
            })}
          />
          {errors.regularPrice && (
            <p className="text-xs mt-1 text-red-500">
              {errors.regularPrice.message as string}
            </p>
        )}
      </div>
        <div className="mt-2">
          <Input
            label="Sale Price"
            placeholder="15"
            {...register("salePrice", {
              required: "Sale Price is required",
              valueAsNumber: true,
              min: { 
                value: 1, 
                message: "Sale Price must be at least 1" 
              },
              validate: (value) => {
                if (value && isNaN(value)) return "Only numbers are allowed";
                if (regularPrice && value) {
                  value >= regularPrice
                  return "Sale Price must be less than Regular Price";
                }
                return true;
              }
            })}
          />
          {errors.salePrice && (
            <p className="text-red-500 text-xs mt-1">
              {errors.salePrice.message as string}
            </p>
          )}
        </div>

        <div className="mt-2">
          <Input
            className='bg-transparent'
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

          {discountLoading ? (
            <p>Loading discount codes...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
          {discountCodes?.map((code: any) => {
              const isSelected = watch("discountCodes")?.includes(code.id);
              
              return (
                <button
                  key={code.id}
                  type="button" // Prevents accidental form submission
                  className={`px-3 py-1 rounded-md text-sm font-semibold border transition ${
                    isSelected 
                      ? "bg-blue-600 text-white border-blue-700" 
                      : "bg-gray-200 text-gray-800 border-gray-300"
                  }`}
                  onClick={() => {
                    const currentSelection = watch("discountCodes") || [];
                    const updatedSelection = isSelected
                      ? currentSelection.filter((id: string) => id !== code)
                      : [...currentSelection, code.id];
                    setValue("discountCodes", updatedSelection, { shouldDirty: true });
                  }}
                >
                  {code?.public_name} ({code?.discount_value}{code?.discount_type === "percentage" ? "%" : "$"})
                </button>
              );
            })}

            </div>
          )}
        </div>

       {openImageModal && (
          <section className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <aside className='bg-gray-800 p-6 rounded-lg w-full max-w-[500px] text-white shadow-2xl border border-gray-700'>
              
              {/* Header - Fixed layout */}
              <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h1 className="text-lg font-semibold">Enhance Product Image</h1>
                <button 
                  onClick={() => setOpenImageModal(false)}
                  className="p-1 bg-red-500 hover:bg-red-600 rounded-md transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden border border-gray-700 mb-6">
                  <Image
                    src={selectedImage}
                    alt="Preview"
                    fill
                    className={`object-contain transition-opacity duration-300 ${processing ? 'opacity-50' : 'opacity-100'}`}
                    priority
                  />
                  {processing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>

                {/* 3. AI Enhancements Section */}
                <div className="space-y-3">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    AI Enhancements
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {enhancements.map((item) => (
                      <button
                        key={item.effect}
                        disabled={processing}
                        onClick={() => applyTransformation(item.effect)}
                        className={`p-3 rounded-md flex items-center gap-3 transition-all text-sm border ${
                          activeEffect === item.effect
                            ? "bg-blue-600 border-blue-400 text-white shadow-lg"
                            : "bg-[#2a2d31] border-gray-700 text-gray-300 hover:bg-[#35393f]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Wand size={16} className={activeEffect === item.effect ? "text-white" : "text-gray-500"} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
            </div>
          </div>

              {/* Optional: Add a close button at the bottom for better UX */}
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setOpenImageModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </aside>
          </section> 
        )}
          <div className="mt-6 flex justify-end gap-3">
          {isDirty && (
           <>
             <button
              type="button"
              onClick={hanldeSaveDraft}
              className="px-4 py-2 bg-blue-600 text-white rounded-md transition-colors hover:bg-gray-600">
                  Save Draft
            </button>
             <button
              type="submit"
              onClick={handleSubmit(onSubmit, onInvalid)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md transition-colors hover:bg-gray-600">
                 {isPending ? "Creating..." : "Create"}
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