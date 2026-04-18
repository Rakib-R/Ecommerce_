'use client'

import React, { useCallback, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search, Pencil, Trash, Plus, BarChart, Star, ChevronRight,
  Eye, Trash2, Loader2,
} from "lucide-react";
import Link from 'next/link';
import axiosInstance from '../../../utils/axiosInstance';
import { queryClient } from 'apps/utils/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import DeleteConfirmationModal from '../../../shared/components/modals/delete.confirmation.modal';

type ShowProductSchema = {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  category: string;
  slug: string;
  subCategory: string;
  stock: number;
  brand?: string;
  cashOnDelivery: boolean;
  regularPrice: number;
  tags: string[];
  videoUrl?: string;
  sale_price?: number;
  images: {
  colors?: string[];
  sizes?: string[];
  discountCodes?: string[];
    fileId: string;
    file_url: string;
    url?: string;
  }[];
  customProperties?: Record<string, any>;
  custom_specifications?: Record<string, any>;
  rating?: number;
}

const fetchProducts = async () => {
  const res = await axiosInstance.get('/product/api/get-shop-products');
  return res.data?.products || [];
};

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`);
} 

const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`);
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ShowProductSchema | null>(null);
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60,
  });

  // Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
      if (selectedProduct) {
        setDeletedProductIds(prev => new Set(prev).add(selectedProduct.id));
      }
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error("Failed to delete product:", error);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
      if (selectedProduct) {
        setDeletedProductIds(prev => {
          const next = new Set(prev);
          next.delete(selectedProduct.id);
          return next;
        });
      }
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error("Failed to restore product:", error);
    },
  });

  const openDeleteModal = useCallback((product: ShowProductSchema) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  }, []);
  
  const columns = useMemo(() => [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }: any) => {
        const imageUrl = row.original.images?.[0]?.url || row.original.images?.[0]?.file_url;
        return imageUrl ? (
          <Image
            src={imageUrl}
            alt={row.original.title || "product-image"}
            width={48}
            height={48}
            className="w-12 h-12 rounded-md object-cover"
            unoptimized
          />
        ) : (
          <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-400">No img</span>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }: any) => {
        const title = row.original.title;
        const truncatedTitle = title?.length > 25 ? `${title.substring(0, 25)}...` : title;
        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="hover:underline text-blue-400"
            title={title}>
            {truncatedTitle || "Untitled Product"}
          </Link>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => (
        <span className="font-medium">
          ${row.original.sale_price?.toFixed(2) || row.original.regularPrice?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }: any) => (
        <span className={row.original.stock < 10 ? "text-red-500 font-semibold" : "text-gray-300"}>
          {row.original.stock} left
        </span>
      ),
    },  
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <span className="text-gray-300">{row.original.category || "Uncategorized"}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Star className="text-yellow-500" size={18} fill="currentColor" />
          <span className="text-white ml-1">{(row.original.rating || 5).toFixed(1)}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }: any) => {
        const isDeleted = deletedProductIds.has(row.original.id);
        return (
          <div className="flex gap-3">
            <Link
              href={`/product/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition-colors">
              <Eye size={18} />
            </Link>
            <Link
              href={`/dashboard/edit-product/${row.original.id}`}
              className="text-green-400 hover:text-green-300 transition-colors">
              <Pencil size={18} />
            </Link>
            <button
              className="text-purple-400 hover:text-purple-300 transition-colors"
              onClick={() => {
                // TODO: Implement analytics
                console.log("View analytics for:", row.original.title);
              }}>
              <BarChart size={18} />
            </button>
            <button
              className="transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(row.original);
              }}>
              {isDeleted ? 
                <Trash2 size={18} className="text-green-500" /> : 
                <Trash size={18} className="text-red-500 hover:text-red-400" />
              }
            </button>
          </div>
        )
      }
    }
  ], [openDeleteModal, deletedProductIds]);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
  });

  // Error state
  if (error) {
    return (
      <main className="min-h-screen p-6 mx-2">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold mb-2">Error loading products</p>
            <p className="text-gray-400">Please try again later</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["shop-products"] })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 mx-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white font-semibold">Products</h2>
        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} />
            Add Product
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <Link 
          href="/dashboard" 
          className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <ChevronRight size={14} />
        <span className="text-white font-medium">All Products</span>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-900 p-2 rounded-md border border-gray-700 focus-within:border-blue-500 transition-colors">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search products by name, category..."
            className="w-full bg-transparent text-white outline-none"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 text-center text-white">
            <Loader2 className="animate-spin h-8 w-8 mb-3 text-blue-500" />
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <p className="text-gray-400 mb-4">No products found</p>
            <Link
              href="/dashboard/create-product"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus size={18} />
              Create Your First Product
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-white border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-700 bg-gray-800/50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-sm font-semibold text-gray-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                     </td>
                  ))}
                 </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={() => deleteMutation.mutate(selectedProduct.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct.id)}
          itemTitle={selectedProduct.title}
        />
      )}
    </main>
  );
}

export default ProductList;