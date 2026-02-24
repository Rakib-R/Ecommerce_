import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { SHOP_CATEGORIES as shopCategories } from "../../../utils/categories";

// 1. Define your form structure
interface ShopFormValues {
  name: string;
  bio: string;
  address: string,
  opening_hours:string,
  website: string,
  category:[]
}

interface CreateShopProps {
  sellerId: string;
  setActiveStep: (step: number) => void;
}

const CreateShop: React.FC<CreateShopProps> = ({ sellerId, setActiveStep }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShopFormValues>();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: ShopFormValues & { sellerId: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URI}/create-shop`,
        data 
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = (data: ShopFormValues) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };
  const countWords = (text: string) => text. trim().split(/\s+/).length;

  return (
    <main className="flex flex-col gap-8">
        <h2 className="font-semibold text-2xl">Setup New Shop</h2>
      <form onSubmit={handleSubmit(onSubmit)}
        className="w-[30vw]">
        <div className="py-4">
          <label className="text-gray-700 mb-1 block">Name *</label>
          <input
            type="text"
            placeholder="Shop name"
            className="w-full p-2 border border-gray-300 outline-none rounded-md mb-1"
            {...register("name", {
              required: "Name is required",
            })}
          />

          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
        <div>
        <label className="text-gray-700 mb-1 block">
            Bio (Max 100 words)*
        </label>
        <textarea
            rows={2}
            placeholder="Shop bio"
            className="w-full p-2 border border-gray-300 outline-none rounded-md mb-1 resize-none"
            {...register("bio", {
            required: "Shop bio is required",
            validate: (value) => countWords(value) >= 100 || "Bio can't exceed 100 words",
            })}/>

        {errors.bio && (
            <p className="text-red-500 text-sm"> {String(errors.bio.message)} </p>
        )}

        <div>
        <label className="text-gray-700 mb-1 block">
            Address *
        </label>

        <input
            type="text"
            placeholder="Manik Mia Avenue, Dhaka"
            className="w-full p-2 border border-gray-300 outline-none rounded-md mb-1"
            {...register("address", {
            required: "Opening hours are required",
            })}/>

        {errors.address && (
            <p className="text-red-500 text-sm">
            {String(errors.address.message)}
            </p>
        )}
        </div><div>
        <label className="text-gray-700 mb-1 block">
            Opening Hours *
        </label>

        <input
            type="text"
            placeholder="Mon–Fri 9AM - 6PM"
            className="w-full p-2 border border-gray-300 outline-none rounded-md mb-1"
            {...register("opening_hours", {
            required: "Opening hours are required",
            })} />
            {errors.opening_hours && (
                <p className="text-red-500 text-sm">
                {String(errors.opening_hours.message)}
                </p>
            )}
            </div>
        </div>
      
        <div>
        <label className="text-gray-700 mb-1 block">
            Category *
        </label>

        <select
        className="w-full p-2 border border-gray-300 outline-none rounded-md mb-1"
        {...register("category", { required: "Category is required" })}>
        <option value="">Select a category</option>
        {shopCategories.map((category) => (
        <option key={category.value} value={category.value}>
            {category.label}
        </option>
            ))}
        </select>

        {errors.category && (
            <p className="text-red-500 text-sm">
            {String(errors.category.message)}
            </p>
        )}
        </div>

        <div>
        <label className="text-gray-700 mb-1 block">
            Website
        </label>
        <input
            type="text"
            placeholder="https://example.com"
            className="w-full p-2 border border-gray-300 outline-none rounded-md mb-1"
            {...register("website", {
            pattern: {
                value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*\/?$/i,
                message: "Please enter a valid website URL",
            },})}  />

        {errors.website && (
            <p className="text-red-500 text-sm">
            {String(errors.website.message)}
            </p>
        )}
        </div>

          <button 
          type="submit" 
          disabled={shopCreateMutation.isPending}
          className="mt-4 bg-blue-500 text-white p-2 rounded-lg">
          {shopCreateMutation.isPending ? "Creating..." : "Create Shop"}
        </button>
      </form>
    </main>
  );
};

export default CreateShop;