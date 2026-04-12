import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import { SHOP_CATEGORIES as shopCategories } from "../../../utils/categories";
import { useSellerRegistrationStore } from "../../../store/useSellerRegistrationStore";
import axiosInstance from "../../../utils/axiosInstance";
import { convertFileToBase64 } from "../../../utils/convertFile2Base64";
import toast from "react-hot-toast";

interface ShopFormValues {
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website: string;
  category: string;
}

interface CreateShopProps {
  setActiveStep: (step: number) => void;
}

// Mirrors the FieldError component from SignUp
const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-red-600 mt-1 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={12} /> {message}
    </span>
  );
};

const CreateShop: React.FC<CreateShopProps> = ({ setActiveStep }) => {
  const { sellerId, step2Values, saveStep2Values, setActiveStep: storeSetStep } =
    useSellerRegistrationStore();

const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
const [avatarData, setAvatarData] = useState<{ file_id: string; file_url: string } | null>(null);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShopFormValues>({
    defaultValues: {
      name: step2Values.name ?? "",
      bio: step2Values.bio ?? "",
      address: step2Values.address ?? "",
      opening_hours: step2Values.opening_hours ?? "",
      website: step2Values.website ?? "",
      category: step2Values.category ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: step2Values.name ?? "",
      bio: step2Values.bio ?? "",
      address: step2Values.address ?? "",
      opening_hours: step2Values.opening_hours ?? "",
      website: step2Values.website ?? "",
      category: step2Values.category ?? "",
    });
  }, []);

  const shopCreateMutation = useMutation({
    mutationFn: async (data: ShopFormValues & { sellerId: string }) => {
      const response = await axiosInstance.post('/api/create-shop',
        {...data, avatarData}
      );
      return response.data;
    },
    onSuccess: () => {
      storeSetStep(3);
      setActiveStep(3);
    },
  });

  const onSubmit = (data: ShopFormValues) => {
    saveStep2Values(data);
    if (!sellerId) {
      console.error("sellerId missing — did step 1 complete properly?");
      return;
    }
    shopCreateMutation.mutate({ ...data, sellerId });
  };

  const countWords = (text: string) =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // Shared input class builder — mirrors SignUp's pattern
  const inputClass = (hasError: boolean) =>
    `w-full p-2.5 border rounded-lg outline-none transition-all text-sm
    ${hasError
      ? "border-red-500 ring-1 ring-red-100"
      : "border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`;

       const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
         const file = e.target.files?.[0];
         if (!file) return;
         try{
           const base64 = await convertFileToBase64(file)
           setAvatarPreview( base64 as string)
   
         const response =  await axiosInstance.post("/product/api/upload-shop-image", { 
             file: base64 
           });
           
            setAvatarData({
              file_id: response.data.file_id,
              file_url: response.data.file_url
            });
         }
         catch(error){  
             console.error('Upload failed:', error);
             toast.error('Failed to upload image');
         }
       };

  return (
    <div className="w-full flex justify-center">
      <section className="w-[90%] md:w-[520px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">

        {/* ── Animated progress bar ── */}
        {/* Step 2 of 3 = 66.67%. The bar animates in on mount via CSS. */}
        <div className="w-full h-1 bg-gray-100">
          <div
            className="h-full bg-blue-500 rounded-r-full transition-all duration-700 ease-out"
            style={{ width: "66.67%" }}
          />
        </div>

        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Setup Your Shop</h1>
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
              Step 2 of 3
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Tell customers a bit about your store.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-8">

         {/* // Shop AVataR */}         {/*  Shop AVataR */}   
               <div className='relative flex justify-center items-center mx-auto w-24 h-24'>
                <input 
                  type='file' 
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                />
                
                {/* Avatar Preview */}
                <div className='w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden border-4 border-white shadow-lg'>
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className='w-full h-full object-cover'
                    />
                  ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                  <svg className='w-12 h-12 text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                  )}
                </div>
                
                {/* Camera Icon Overlay */}
                <div className='absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md'>
                  <svg className='w-4 h-4 text-gray-600' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div> 

          {/* ── Shop  Name ── */}   {/* ── Shop  Name ── */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Shop Name
            </label>
            <input
              type="text"
              placeholder="e.g. Mona's Boutique"
              className={inputClass(!!errors.name)}
              {...register("name", { required: "Name is required" })}
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* ── Bio ── */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Bio{" "}
              <span className="font-normal text-gray-400 text-xs">(max 100 words)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe your shop in a few words…"
              className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm resize-none
                ${errors.bio
                  ? "border-red-500 ring-1 ring-red-100"
                  : "border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
              {...register("bio", {
                required: "Shop bio is required",
                validate: (value) =>
                  countWords(value) <= 100 || "Bio can't exceed 100 words",
              })}
            />
            <FieldError message={errors.bio?.message} />
          </div>

          {/* ── Address ── */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Address
            </label>
            <input
              type="text"
              placeholder="Manik Mia Avenue, Dhaka"
              className={inputClass(!!errors.address)}
              {...register("address", { required: "Address is required" })}
            />
            <FieldError message={errors.address?.message} />
          </div>

          {/* ── Opening Hours ── */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Opening Hours
            </label>
            <input
              type="text"
              placeholder="Mon–Fri 9AM – 6PM"
              className={inputClass(!!errors.opening_hours)}
              {...register("opening_hours", { required: "Opening hours are required" })}
            />
            <FieldError message={errors.opening_hours?.message} />
          </div>

          {/* ── Category ── */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Category
            </label>
            <select
              className={`${inputClass(!!errors.category)} bg-white`}
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select a category</option>
              {shopCategories.map((category) => (
                <option key={category.value} value={category.value} className="bg-gray-200">
                  {category.label}
                </option>
              ))}
            </select>
            <FieldError message={errors.category?.message} />
          </div>

          {/* ── Website (optional) ── */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Website{" "}
              <span className="font-normal text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              className={inputClass(!!errors.website)}
              {...register("website", {
                pattern: {
                  value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*\/?$/i,
                  message: "Please enter a valid website URL",
                },
              })}
            />
            <FieldError message={errors.website?.message} />
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={shopCreateMutation.isPending}
            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 mt-1"
          >
            {shopCreateMutation.isPending
              ? <><Loader2 className="animate-spin" size={18} /> Creating…</>
              : "Create Shop & Continue"}
          </button>

        </form>
      </section>
    </div>
  );
};

export default CreateShop;
