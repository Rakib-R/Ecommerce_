
'use client'

import { useStore } from '../../store/authStore'
import useUser from '../../hooks/useUser';
import React from 'react'
import { useLocationTracking } from '../../hooks/useLocationTracking';
import useDeviceTracking from '../../hooks/useDeviceTracking';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';

const WishlistPage = () => {
    const { user } = useUser();
    const addToCart = useStore((state: any) => state.addToCart);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    const wishlist = useStore((state: any) => state.wishlist);

    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    
    const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
        wishlist: state.wishlist.map((item: any) => 
        item.id === id 
            ? { ...item, quantity: (item.quantity ?? 1) + 1 } 
            : item
        )
    }))
    }
    const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
        wishlist: state.wishlist.map((item: any) => 
        item.id === id 
            ? { ...item, quantity: Math.max(1, (item.quantity ?? 1) - 1) } 
            : item
        )
    }))
    }
    const removeItem = (id: string) => {
        removeFromWishlist(id, user, location, deviceInfo);
    }
  return (
    <main className='w-full bg-white'>

        {/* Breadcrumb */}
    <div className='md:w-[80%] w-[95%] mx-auto min-h-screen my-8'>
        <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-4">Wishlist</h1>

        <Link href={"/"} className="text-[#55585b] hover:underline">
            Home
        </Link>
        <span className="inline-block p-[1.5px] mx-2 bg-[#a8acb0] rounded-full"></span>
        <span className="text-[#55585b]">
            {/* If wishlist is empty */}
            {wishlist.length === 0 ? (
            <div className="text-center text-lg">
                Your wishlist is empty! Start adding products.
            </div>
            ) : (
            <div className="flex flex-col gap-10 my-8">
               {/* Wishlist Items Table */}
                <table className="w-full border-collapse">
                <thead className="text-left bg-[#f1f3f4]">
                    <tr>
                    <th className="py-3 pl-4">Product</th>
                    <th className="py-3 text-left">Price</th>
                    <th className="py-3 text-left">Quantity</th>
                    <th className="py-3 text-left">Action</th>
                    <th className="py-3 text-left">Remove</th>
                    </tr>
                </thead>
                <tbody>
            {wishlist?.map((item: any) => (
            <tr key={item.id} className="border-b">
                <td className="flex items-center max-w-[200px] gap-3 py-4 ">
                <Image 
                    src={item.images?.[0]?.url} 
                    alt={item.title}
                    width={100}
                    height={100}
                    className="object-cover rounded"/>
                <span>{item.title}</span>
                </td>

                {/* SALE PRICE */}
                <td className="py-4 text-lg">
                    ${item?.sale_price?.toFixed(2)}
                </td>
                
                {/* QUANTITY  */}
                <td>
                <div className="flex justify-center items-center max-w-[120px] border border-gray-300 rounded-md overflow-hidden">
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                        onClick={() => 
                            decreaseQuantity(item.id) }>−</button>
                    <span className="py-1 text-center min-w-[40px]">{item.quantity}</span>
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                        onClick={() => increaseQuantity(item.id)}>+</button>
                </div>
                </td>
                {/* Add To Cart */}
                <td>
                <button className="bg-[#2295FF] cursor-pointer text-white px-5 py-2 rounded-md hover:bg-blue-600 transition"
                    onClick={() => {
                        addToCart(item, user, location, deviceInfo)
                    } }>
                    Add to cart
                </button>
                </td>

                {/* RemoveFrom WIshlist */}
                <td>
                <button className='flex justify-center left-1/2 bg-red-500 text-center'
                onClick={() => {
                    removeItem(item.id);
                }}>
                    <X size={22} />
                </button>
                </td>
             </tr>
                ))}
                </tbody>
                </table>
            </div>
            )}
        </span>
        </div>
    </main>
  )
}

export default WishlistPage
