
'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import Input from "packages/components/input";
import { AxiosError } from "axios";
import DeleteDiscountCodeModal from "../../../shared/components/modals/delete-discount-codes";
import axiosInstance from "../../../utils/axiosInstance";

interface DiscountFormValues {
  public_name: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  discountCode: string;
}

const Page = () => {

  const [showModal, setShowModal] = useState<Boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<Boolean>(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();

  const queryClient = useQueryClient();

 const { data: discountCodes = [], isLoading } = useQuery({
  queryKey: ["shop-discounts"],
  queryFn: async () => {
    const res = await axiosInstance.get("/product/api/get-discount-codes");
    return res?.data?.discount_codes || [];
  },
});

  const handleDeleteClick = async(discount: any) => {
    setSelectedDiscount(discount);
    setShowModal(true);
  }

  const onSubmit = (data: any) => {
  if (discountCodes.length >= 8) {
    toast.error("You can only create up to 8 discount codes.");
    return;
  }
  createDiscountCodeMutation.mutate(data);
};  

const {
  register, handleSubmit, control, reset, watch, formState: { errors }, } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: 0,
      discountCode: "",
    },
});
    const [isFocused, setIsFocused] = useState(false);
  const publicName = watch("public_name");

  // Dynamic class based on focus OR has value
  const inputClass = isFocused || publicName
    ? "bg-white text-black"
    : "bg-transparent text-white";

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: DiscountFormValues) => {
      await axiosInstance.post("/product/api/create-discount-code", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId: string) => {
      await axiosInstance.post(`/product/api/delete-discount-code/${discountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowModal(false);
    },
  });
    return (
    <main className="min-h-screen p-8">
      <section className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white font-semibold">
          Discount Codes
        </h2>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>Create Discount</span>
        </button>
      </section>
      
      {/* Breadcrumbs */}
    <div className="flex items-center gap-2 text-sm text-white mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">
            Dashboard
        </Link>
        <ChevronRight size={14} />
        <span className="text-white font-medium">Discount Codes</span>
    </div>
      
      <div className="mt-8 p-3 bg-[#1a1c1e] rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>

        {isLoading ? (
      <p className="text-gray-400 text-center">Loading discounts ...</p>
    ) : (
      <table className="w-full text-white">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Code</th>
            <th className="p-3 text-left">Value</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
        {discountCodes?.map((discount: any) => (
          <tr
            key={discount?.id}
            className="border-b border-gray-800 hover:bg-gray-800 transition"
          >
            <td className="p-3">{discount?.public_name}</td>
            <td className="p-3 capitalize">
              {discount.discountType === "percentage"
                ? "Percentage (%)"
                : "Flat ($)"}
            </td>

            <td className="p-3">
            {discount.discountType === "percentage"
              ? `${discount.discountValue}%`
              : `$${discount.discountValue}`}
          </td>
          <td className="p-3">
            {discount.discountCode}
          </td>
          <td className="p-3">
            <button
              onClick={() => handleDeleteClick(discount)}
              className="text-red-400 hover:text-red-300 transition"
            >
              <Trash size={18} />
            </button>
          </td>
          </tr>
        ))}
      </tbody>
      </table>
    )}
        {!isLoading && discountCodes?.length === 0 && (
        <p className="text-gray-400 w-full pt-5 block text-center">
          No Discount Codes Available!
        </p>  
      )}
      </div>
      {/* DISCOUNT MODAL */}  {/* DISCOUNT MODAL */}  {/* DISCOUNT MODAL */}   

              {showModal && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-4 rounded-lg w-[450px] shadow-lg">
                      <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                        <h3 className="text-xl text-white">Create Discount Code</h3>

                        <button
                          onClick={() => setShowModal(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={22} />
                        </button>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">

                        {/* Title */}
                        <Input
                          label="Title (Public Name)"
                          className={`${isFocused ? "text-black/90 bg-white" : "bg-transparent text-white"}`}
                          {...register("public_name", { required: "Title is required" })}

                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                              setIsFocused(false);
                            }}/>

                        {errors.public_name && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.public_name.message}
                          </p>
                        )}

                        {/* Discount Type */}
                        <div className="mt-2">
                          <label className="text-sm text-gray-400">Discount Type</label>
                          <Controller 
                            control={control}
                            name="discountType"
                          render={({field}) => ( 
                              <select
                              {...register("discountType")}
                              className="w-full bg-gray-800 text-white p-2 rounded-lg mt-1">
                              <option value="percentage">Percentage (%)</option>
                              <option value="flat">Flat ($)</option>
                            </select>
                              )}/>
                        </div>

                        {/* Discount Value */}
                        <div className="mt-2">
                          <Input
                              label="Discount Value"
                              type="number"
                              min={1}
                              {...register("discountValue", { 
                                required: "Value is required",
                                min: { value: 1, message: "Value must be at least 1" }
                              })}
                            />
                        </div>

                          {/* Discount Code */}
                        <div className="mt-4">
                          <Input
                            label="Discount Code"
                            {...register("discountCode", { 
                              required: "Discount Code is required" 
                            })}
                          />
                          </div>
                        <button type="submit" className="flex items-center justify-center gap-2 w-full mt-4 p-3 bg-blue-600
                        hover:bg-blue-700 rounded-lg font-semibold"
                        disabled={createDiscountCodeMutation.isPending}>

                          <Plus size={18}/>
                          {createDiscountCodeMutation?.isPending ? "Creating ... " : "Create"}
                        </button>
                        {
                          createDiscountCodeMutation.isError &&
                          (
                            <p className="text-sm mt-2">
                              {
                                (createDiscountCodeMutation.error as AxiosError<{
                                  message: string;
                                }>)?.response?.data?.message || "Something went wrong"
                              }
                            </p>
                          )
                        }
                      </form>
                    </div>
                  </div>
              )}

              {showDeleteModal && selectedDiscount && (
              <DeleteDiscountCodeModal
                discount={selectedDiscount}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount?.id)}
                />
              )}

  </main>
  );
};

export default Page;