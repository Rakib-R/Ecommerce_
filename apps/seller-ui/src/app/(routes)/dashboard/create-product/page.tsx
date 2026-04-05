'use client'

import dynamic from 'next/dynamic';

import { ChevronRight, Redo2, RotateCcw, Undo2, Wand, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import ImagePlaceholder from '../../../shared/components/image-placeholderr';
import Input from 'packages/components/input';
import { ColorSelector } from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custon-specifications';
import CustomProperties from 'packages/components/custom-properties';
import { queryClient } from 'apps/utils/queryClient';
import { SizeSelector } from 'packages/components/size-selector';
import Image from 'next/image';
import { AxiosError } from "axios";
import Link from 'next/link';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { enhancements } from '../../../configs/AI.enhancements';
import { useRouter } from 'next/navigation';
import { useImageManagement } from '../../../utils/useImageManagement';
import { useDraftStore } from '../../../store/useDraftStore';

  interface UploadedImage {
      fileId : string;
      file_url: string;
    }
    interface ProductFormData {
      title: string;
      short_description: string; // Short description
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
      properties?: any[];
      discountCodes?: string[];
      starting_date: string; // or Date
      ending_date?: string;
    }

    // Fix — explicitly grab the default export and type it
    const RichTextEditor = dynamic(
      () => import('packages/components/rich-text-editor').then(mod => mod.default),
      {
        ssr: false,
        loading: () => <div className="h-40 w-full bg-zinc-800 animate-pulse rounded-md" />
      }
    );


const page = () => {


  const methods = useForm<ProductFormData>({ reValidateMode: "onChange" ,defaultValues: {
          title: "",
          short_description: "",
          starting_date: '',
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
          images: [],
          discountCodes: [],
          colors: [],
          properties: []
        }
  });
   const { register,  control,  watch, setError ,setValue,  handleSubmit,formState: { errors, isDirty }} = methods
 
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

    // FORM HOOK ------------------WATCH --------------ATTRIBUTE
    const selectedCategory = watch("category");
    const selectedSubCategory = watch("subCategory");
    const regularPrice = watch('regularPrice')
    const cash_On_Delivery = watch("cash_on_delivery");
    const formImages = watch('images');


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

      toast.error("Please fix the errors before submitting");
      // ⁉⁉ ⚠ ⚠ ⚠ Scroll to first error ‼⁉ ⚠ ⚠ ⚠
      const firstErrorField = Object.keys(errors)[0];
      document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      });
    };
    
    const {
      images,
      openImageModal,
      processing,
      pictureUploadLoader,
      selectedImage,
      activeEffect,
      selectedImageIndex,

      // Actions
      handleImageChange,
      handleRemoveImage,
      openModal,
      closeModal,
      applyTransformation,
      undoTransformation,      
      redoTransformation,      
      resetTransformations,
      isTransformationActive,
      getActiveTransformations,
      
      // Setters
      setImages,
      setOpenImageModal,
      setSelectedImage,
    } = useImageManagement({
      maxImages: 8,
      formFieldName: "images"
    });

  const { mutateAsync: createProduct, isPending } = useMutation({
      mutationFn: async (payload: any) => {
        const res = await axiosInstance.post('/product/api/create-product', payload);
        return res.data;
      },
    });

   const onSubmit = async (data: any) => {
    
    const cleanImages = images.filter(Boolean); 
     if (cleanImages.length === 0) {
      toast.error("Please upload at least one product image!");
      return;
    }

    console.log("📦 Form Data:", data);
    console.log("🖼️ Images:", data.images);
    console.log("⚠️ Form Errors:", errors);

    const payload = {
      ...data,
      images: cleanImages,               
      cashOnDelivery: data.cash_on_delivery === "yes",
      starting_date: new Date().toISOString(),

    customProperties: Array.isArray(data.properties)        // ✅ array → record
      ? Object.fromEntries(data.properties.map((p: any) => [p.key, p.value]))
      : data.properties || {},

    custom_specifications: Array.isArray(data.custom_specifications) // ✅ array → record
      ? Object.fromEntries(data.custom_specifications.map((s: any) => [s.key, s.value]))
      : data.specifications || {},
  };

  try {
    await toast.promise(createProduct(payload), {
      loading: 'Saving product details...',
      success: 'Product created successfully! 🎉',
      error: (err) => err?.response?.data?.message || 'Failed to create product.',
    });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/dashboard/all-products');
   } catch (error: any) {
      if (error.response?.data?.field) {
      setError(error.response.data.field as keyof ProductFormData, {
        type: "server",
        message: error.response.data.message,
      });
    }
  }
};

  // ✅ Force sync images to form when they change
  useEffect(() => {
    const validImages = images.filter(img => img !== null);
    if (validImages.length > 0 || formImages?.length > 0) {
      setValue('images', validImages, { shouldDirty: true });
    }
  }, [images]);

  // ✅ Debug: log what's happening
  useEffect(() => {
    console.log('🖼️ Hook images:', images);
    console.log('🖼️ Form images:', formImages);
  }, [images, formImages]);


 const { saveDraft, getDraft, deleteDraft } = useDraftStore();
  const [draftId, setDraftId] = useState<string | null>(null);
  
    // Load draft on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const draftIdFromUrl = urlParams.get('draft');
    
    if (draftIdFromUrl) {
      const draft = getDraft(draftIdFromUrl);
      if (draft) {
        methods.reset(draft);
        setDraftId(draftIdFromUrl);
        toast.success('Draft loaded successfully');
      }
    }
  }, []);

  // Generate unique draft key
  const generateDraftKey = () => {
    return `product_draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };
  

  const handleSaveDraft = () => {
    const formData = methods.getValues();
    const key = draftId || generateDraftKey();
    
    // Don't save empty drafts
    if (!formData.title && !formData.short_description) {
      toast.error('Add at least a title or description before saving draft');
      return;
    }
    
    saveDraft(key, formData);
    setDraftId(key);
    
    // Update URL with draft ID
    const url = new URL(window.location.href);
    url.searchParams.set('draft', key);
    window.history.pushState({}, '', url.toString());
  };


  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const allDrafts = useDraftStore((state) => state.getAllDrafts());

  return (
<FormProvider {...methods}>  
  <form 
    className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    onSubmit={handleSubmit(onSubmit, onInvalid)}>

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
        {...register("title", { required: "Title is required",
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
          {...register("short_description", {
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
          {errors.short_description && (
          <p className="text-xs text-red-500 mt-1">
            {errors.short_description.message as string}
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
          {cash_On_Delivery === "no" && (
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
                  <option value="" disabled className=" text-white">
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
                  className="w-full border outline-none border-gray-700 bg-zinc-900 text-white rounded-md p-2">
                    <option value="" disabled className="bg-transparent text-white">
                      {selectedSubCategory ? "☑️ Select Sub-Category" : "Select a category first"}
                    </option>
                    {subCategories?.map((subCategory: string) => (
                      <option
                        key={subCategory}
                        value={subCategory}
                        className="bg-zinc-800">
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
      {/* RICH TEXT EDITOR  RICH TEXT EDITOR   */}  {/* RICH TEXT EDITOR  RICH TEXT EDITOR   */}  
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

                return wordCount >= 70 || `Description must be at least 70 words! 
                  You need ${70 - wordCount} more words.`;
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
              valueAsNumber: true,
              min: { 
                value: 1, 
                message: "Sale Price must be at least 1" 
              },
              validate: (value) => {
                if (value && isNaN(value)) return "Only numbers are allowed";
                if (regularPrice && value &&  value >= regularPrice) {
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

              const selectedDiscountCodes = watch("discountCodes") || [];
              const isSelected = selectedDiscountCodes.includes(code.id);
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
                      ? currentSelection.filter((id: string) => id !== code.id)
                      : [...currentSelection, code.id];
                    setValue("discountCodes", updatedSelection, { shouldDirty: true });
                  }}>
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
            
            {/* Header with Undo/Reset buttons */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
            <h1 className="text-lg font-semibold">Enhance Product Image</h1>
            <div className="flex gap-2">
              {/* Undo button */}
              <button 
                onClick={undoTransformation}  // ← Now works!
                disabled={processing}
                className="p-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-md transition-colors disabled:opacity-50"
                title="Undo last transformation">
                <Undo2 size={18} />
              </button>
              
              {/* Redo button (optional) */}
              <button 
                onClick={redoTransformation}  // ← Add if you want redo
                disabled={processing}
                className="p-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-md transition-colors disabled:opacity-50"
                title="Redo last transformation">
                <Redo2 size={18} />
              </button>
              
              {/* Reset button */}
              <button 
                onClick={resetTransformations}  // ← Now works!
                disabled={processing}
                className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors disabled:opacity-50"
                title="Reset to original">
                <RotateCcw size={18} />
              </button>
              
              {/* Close button */}
              <button 
                onClick={closeModal}
                className="p-1 bg-red-500 hover:bg-red-600 rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

            {/* Image Preview */}
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

            {/* AI Enhancements with Active State */}
            <div className="space-y-3">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                AI Enhancements
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {enhancements.map((item) => {
                  // Check if this transformation is currently active
                  const isActive = selectedImage.includes(`tr=`) && 
                    selectedImage.split('?tr=')[1]?.split(',').includes(item.effect);
                  
                  return (
                    <button
                      key={item.effect}
                      disabled={processing}
                      onClick={() => applyTransformation(item.effect)}
                      className={`p-3 rounded-md flex items-center gap-3 transition-all text-sm border ${
                        isActive
                          ? "bg-blue-600 border-blue-400 text-white shadow-lg"
                          : "bg-[#2a2d31] border-gray-700 text-gray-300 hover:bg-[#35393f]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <Wand size={16} className={isActive ? "text-white" : "text-gray-500"} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto text-xs bg-blue-500/30 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Active Transformations List */}
              {selectedImage.includes('?tr=') && (
                <div className="mt-4 p-3 bg-zinc-900/50 rounded-md">
                  <p className="text-xs text-gray-400 mb-2">Active Effects:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.split('?tr=')[1]?.split(',').map((effect, idx) => (
                      <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                        {effect.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
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

      {/* Header with Drafts button */}
        <div className="flex justify-between items-center">
          <h2 className="py-2 font-semibold font-Poppins text-white">Create Product</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowDraftsDialog(true)}
              className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              📋 Load Draft
            </button>
            {isDirty && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                💾 Save Draft
              </button>
            )}
          </div>
        </div>

        {/* Drafts Dialog */}
        {showDraftsDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Saved Drafts</h3>
                <button
                  onClick={() => setShowDraftsDialog(false)}
                  className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>
              
              {Object.keys(allDrafts).length === 0 ? (
                <p className="text-gray-400 text-center py-8">No drafts saved yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(allDrafts).map(([key, draft]: [string, any]) => (
                    <div key={key} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{draft.title || 'Untitled Product'}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Last saved: {new Date(draft.savedAt).toLocaleString()}
                          </p>
                          {draft.category && (
                            <p className="text-xs text-gray-500 mt-1">
                              Category: {draft.category}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              methods.reset(draft);
                              setDraftId(key);
                              setShowDraftsDialog(false);
                              toast.success('Draft loaded');
                            }}
                            className="px-3 py-1 bg-blue-600 rounded-md text-sm hover:bg-blue-700"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => {
                              deleteDraft(key);
                              if (draftId === key) setDraftId(null);
                            }}
                            className="px-3 py-1 bg-red-600 rounded-md text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {Object.keys(allDrafts).length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Delete all drafts?')) {
                      useDraftStore.getState().clearAllDrafts();
                      setDraftId(null);
                    }
                  }}
                  className="mt-4 w-full px-3 py-2 bg-red-600/50 text-red-300 rounded-md text-sm hover:bg-red-600"
                >
                  Delete All Drafts
                </button>
              )}
            </div>
          </div>
        )}


          <div className="mt-6 flex justify-end gap-3">
           <>
           {isDirty && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Draft
            </button>
          )}
            <button
                type="submit"
                disabled={isPending || pictureUploadLoader} // ✅ block submit while image uploading
                className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {pictureUploadLoader ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading image...
                  </>
                ) : isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
          </button>
           </>
        </div>
    </aside>

    </section>
   </main>

  </form>
  </FormProvider>
 
  );
}

export default page