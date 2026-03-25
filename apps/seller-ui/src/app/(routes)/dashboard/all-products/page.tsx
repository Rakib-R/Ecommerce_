
'use client'

import React, { useCallback, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search, Pencil, Trash, Plus,BarChart,Star,ChevronRight,
  Eye,
  Trash2,
} from "lucide-react";
import Link from 'next/link';
import axiosInstance from '../../../utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import DeleteConfirmationModal from '../../../shared/components/modals/delete.confirmation.modal';

type CreateProductPayload = {
  title: string
  description: string
  detailed_description: string
  category: string
  slug: string
  subCategory: string
  brand?: string
  regularPrice: number
  sale_price?: number
  stock: number
  videoUrl?: string
  cashOnDelivery: string
  tags: string[]
  colors?: string[]
  sizes?: string[]
  discountCodes?: string[]
  images: {
    fileId: string
    file_url: string
  }[]
  customProperties?: Record<string, any>
  custom_specifications?: Record<string, any>
}

const fetchProducts = async () => {
  const res = await axiosInstance.get(`/product/api/get-shop-products`);
  return res.data?.products;
};

const deleteProduct = async(productId : string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`)
} 

const restoreProduct = async (productId: string) => {
    await axiosInstance.put(`/product/api/restore-product/${productId}`);
};


const ProductList = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [rowSelection, setRowSelection] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());

    const queryClient = useQueryClient();
    const { data: products , isLoading } = useQuery({
      queryKey: ["shop-products"],
      queryFn: async () => {
      const data = await fetchProducts();
      return data;
      },
      staleTime: 1000 * 60,
  });
    // Delete Product Mutation
    const deleteMutation = useMutation({
      mutationFn: deleteProduct,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shop-products"] });
        setShowDeleteModal(false);
         setDeletedProductIds(prev => new Set(prev).add(selectedProduct.id));
      },
    });

     const restoreMutation = useMutation({
      mutationFn: restoreProduct,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shop-products"] });
        setShowDeleteModal(false);
        setDeletedProductIds(prev => {
          const next = new Set(prev);
          next.delete(selectedProduct.id);
          return next;
        });

      },
    });

    const openDeleteModal = useCallback((product: CreateProductPayload) => {
      setSelectedProduct(product);
      setShowDeleteModal(true);
  }, []);
    
    const columns = useMemo(() => [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }: any) => { 

      const imageUrl = row.original.images?.[0]?.url;
      console.log('seller-ui all-products Image URL:', imageUrl); // Debug
      return imageUrl ? (

        <Image
          src={row.original.images?.[0]?.url}
          alt="product-image"
          width={48}
          height={48}
          className="w-12 h-12 rounded-md object-cover"
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

        const truncatedTitle =
          title.length > 25 ? `${title.substring(0, 25)}...` : title;
        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="hover:underline"
            title={title}>
            {truncatedTitle}
          </Link>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => (
        <span>${row.original.sale_price}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }: any) => (
      <span
        className={row.original.stock < 10 ? "text-red-500" : "text-white"}
      >
        {row.original.stock} left
      </span>
    ),
  },  
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
        <Star fill='#fdeo47'size={18}/>
        <span className="text-white ml-1"> {row.original.rating || 5} </span>
      </div>
      ),
     },
     {
      header: "Actions",
      cell: ({ row }: any) => { 

      const isDeleted = deletedProductIds.has(row.original.id);
      console.log("---- isDeleted Product------ ", isDeleted);

      return (
      <div className="flex gap-3">
        <Link
          href={`/product/${row.original.id}`}
          className="text-blue-400 hover:text-blue-300 transition">
          <Eye size={18} />
        </Link>
        <Link
          href={`/product/edit/${row.original.id}`}
          className="text-green-400 hover:text-green-300 transition">
          <Pencil size={18} />
      </Link>
      <button
        className="text-green-400 hover:text-green-300 transition"
        // onClick={() => openAnalytics(row.original)}
      >
        <BarChart size={18} />
      </button>

      <button
        className="text-red-400 hover:text-red-300 transition"
        onClick={(e) => 
        {  
        console.log("Delete button clicked for:", row.original.title); 
        e.stopPropagation();
        openDeleteModal(row.original)
      }}>
        {isDeleted ? <Trash2 size={18} color='green'/> : <Trash size={18} color='red'/>}
      </button>
    </div>
    )
  }
}

  ], [openDeleteModal, deletedProductIds])

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: {
          globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

      return (
      <main className="min-h-screen p-6 mx-2">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-white">Products</h2>
          <Link
            href="/dashboard/create-product"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        {/* //Bread Crumbs */}
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <Link 
            href="/dashboard" 
            className="hover:text-white transition-colors cursor-pointer">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <span className="text-white font-medium">
            All Products
          </span>
        </div>

    {/* Search Bar */}
      <div className="flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        {isLoading ? (
          <div className="p-10 text-center text-white">
            Loading products...
          </div>
        ) : (
          <table className="w-full text-left text-white border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-700 bg-gray-800/50">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-sm font-semibold">
                      {header.isPlaceholder
                        ? null: flexRender(
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

        {showDeleteModal && (
          <DeleteConfirmationModal
            product={selectedProduct}  
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
            itemTitle={selectedProduct}
          />
        )}
        
      </div>
</main>
  );
}

export default ProductList

