
"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import axiosInstance from "@user-ui/utils/axios";
import { countries } from "@user-ui/configs/countries";
import { Plus, Trash2, MapPin, X } from "lucide-react";
import './../../user-ui.css';


interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormData {
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: string;
}

interface AddressesResponse {
  addresses: Address[];
}

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      zip: "",
      country: "Bangladesh",
      isDefault: "false",
    },
  });

useEffect(() => {
  const root = document.documentElement; // Targets <html>

  if (showModal) {
    root.classList.add('no-scroll');
  } else {
    root.classList.remove('no-scroll');
  }

  return () => {
    root.classList.remove('no-scroll');
  };
}, [showModal]);


  // Get addresses
  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  // Create address mutation
  const { mutate: createAddress, isPending: isCreating } = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const res = await axiosInstance.post("/api/add-addresses", {
        ...data,
        isDefault: data.isDefault === "true",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      setShowModal(false);
      reset();
    },
  });

  // Delete address mutation
  const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/delete-address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
  });

  const onSubmit = (data: AddressFormData) => {
    createAddress(data);
  };

  
  return (
    <main className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg">Saved Addresses</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {/* Addresses List */}
      {isLoading ? (
        <p className="text-gray-500">Loading addresses...</p>
      ) : !addresses || addresses.length === 0 ? (
        <p className="text-gray-500">No saved addresses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className="border rounded-md p-4 relative"
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  Default
                </span>
              )}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{address.label}</p>
                  <p className="text-gray-600">{address.name}</p>
                  <p className="text-gray-600">{address.street}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.zip}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => deleteAddress(address.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Address</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <select
                  {...register("label", { required: "Label is required" })}
                  className="w-full border rounded-md px-3 py-2">
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
                {errors.label && (
                  <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                <input
                  {...register("street", { required: "Street is required" })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="123 Main St"
                />
                {errors.street && (
                  <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    {...register("city", { required: "City is required" })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Dhaka"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <input
                    {...register("zip", { required: "ZIP is required" })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="1200"
                  />
                  {errors.zip && (
                    <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <select
                  {...register("country", { required: "Country is required" })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register("isDefault")}
                    value="true"
                    className="rounded"
                  />
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ShippingAddressSection;