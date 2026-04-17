'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Ratings from '../../../utils/Ratings'
import { Eye, Heart, ShoppingBag } from 'lucide-react'

import ProductDetailsCard from './productViews'
import ProductDetails_experimental from './ProductViews_experimental'

import { useStore } from '../../../store/authStore'
import useUser from '../../../hooks/useUser'
import { useLocationTracking } from '../../../hooks/useLocationTracking'
import useDeviceTracking from '../../../hooks/useDeviceTracking'


const ProductCard = ({product, isEvent} : {product: any, isEvent?: boolean}) => { 

const [timeLeft, setTimeLeft] = useState("")
const [open, setOpen] = useState(false)

const addToCart = useStore((state: any) => state.addToCart)
const removeToCart = useStore((state: any) => state.removeFromCart)
const addToWishlist = useStore((state: any) => state.addToWishlist)
const removeFromWishlist = useStore((state: any) => state.removeFromWishlist)
const wishlist = useStore((state : any) => state.wishlist)
const isWishlisted = wishlist?.some((item : any) => item.id === product.id)

  const cart = useStore((state : any) => state.cart)
  const isInCart = cart?.some((item : any) => item.id === product.id)
  const setModalOpen = useStore((state) => state.setModalOpen)

  const {user} = useUser() 
  const location = useLocationTracking()
  const deviceInfo = useDeviceTracking()

  // HEADER TURNING OFF MECHANISM
useEffect(() => {
    setModalOpen(open)           // ← syncs local `open` state → global store
    document.body.classList.toggle('overflow-hidden', open)
    return () => {
      setModalOpen(false)      
      document.body.classList.remove('overflow-hidden')
    }
  }, [open])

// Fix: Only run timer for event products with ending_date
useEffect(() => {
  // Only run if it's an event AND has ending_date
  if (!isEvent || !product?.ending_date) {
    setTimeLeft(""); 
    return;
  }

  const interval = setInterval(() => {
    const endTime = new Date(product?.ending_date).getTime();
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) {
      setTimeLeft("Expired");
      clearInterval(interval);
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    }
  }, 1000);

  return () => clearInterval(interval);
}, [isEvent, product?.ending_date]);


  // If no product data, don't render
  if (!product) {
    console.log("No product data provided");
    return null;
  }

return(
  <div className='relative w-full min-h-[320px] bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow'>
    {/* OFFER Badge - Only for events */}
    {isEvent && (
      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md z-10">
        OFFER
      </div>
    )}

    {/* Limited Stock Badge */}
    {product?.stock <= 5 && product?.stock > 0 && (
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-orange-500 text-white px-2 py-1 rounded text-sm">
          Only {product.stock} left
        </div>
      </div>
    )}

    {/* Product Image */}
    <Link href={`/product/${product?.slug || product?.id}`}>
      <div className="relative w-full h-[150px] overflow-hidden rounded-t-lg">
        <Image
          src={product?.images?.[0]?.url || "/placeholder.webp"} // Add a placeholder in your public folder
          alt={product?.title || "Product image"}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            // If image fails to load, set to placeholder
            e.currentTarget.src = "/placeholder.webp";
          }}
        />
          {/* Action Icons - Moved to bottom for better UX */}
    <aside className='absolute bottom-3 right-2 flex gap-2'>
      <button 
        className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        aria-label="Add to wishlist">
        <Heart 
          onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();  
            isWishlisted ? removeFromWishlist(product.id, user, location, deviceInfo) : 
            addToWishlist({...product, quantity: 1}, user, location,deviceInfo)}}
            stroke={isWishlisted ? 'red' : "#4B5563"}
            className='cursor-pointer hover:scale-110 transition-transform' 
            size={16}
            fill={isWishlisted ? 'red' : 'transparent'}
        />
      </button>

      <button 
        className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        aria-label="Quick view"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();      
          setOpen(!open)}
          }>
        <Eye className="cursor-pointer hover:scale-110 transition-transform" size={16}/>
      </button>
      
        <button 
          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();  
            isInCart ? removeToCart(product.id, user, location, deviceInfo) :
              addToCart({...product, quantity : 1}, user, location, deviceInfo)
          }}>
          <ShoppingBag className="cursor-pointer hover:scale-110 transition-transform" size={16}/>
        </button>
    </aside>
      </div>
    </Link>

    {/* Shop Name */}
    {product?.Shop?.name && (
      <Link
        href={`/shop/${product?.Shop?.id}`}
        className="block text-sm font-medium mt-2 px-2 hover:text-blue-600 transition-colors">
        {product.Shop.name}
      </Link>
    )}

    {/* Product Title */}
    <Link href={`/product/${product?.slug || product?.id}`}>
      <h3 className="font-semibold px-2 line-clamp-2 hover:text-blue-600 transition-colors">
        {product?.title || "Untitled Product"}
      </h3>
    </Link>

    {/* Ratings */}
    <div className='mt-2 px-2'>
      <Ratings rating={product?.ratings || 0}/>
    </div>

    {/* Price and Actions Section */}
    <section className="mt-3 flex justify-between items-start px-2 pb-3">
      <div className="flex flex-col">

        <div className="flex items-center gap-2">
        {product.salePrice ? 
        <>
          <span className="text-lg font-bold text-gray-900">
            ${product?.salePrice?.toFixed(2) || '0.00'}
          </span>
          {product?.regularPrice && product?.regularPrice > product?.salePrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.regularPrice.toFixed(2)}
            </span>
          )}
          </> :  
          <span className="text-lg font-bold text-gray-900">
            ${product?.regularPrice?.toFixed(2) || '0.00'}
          </span>
          }
        
        </div>
        <span className="text-xs text-green-600 font-medium">
          {product?.totalSales || 0} sold
        </span>
      </div>

      {/* Timer - Only for events */}
      {isEvent && timeLeft && (
        <div className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
          {timeLeft}
        </div>
      )}
    </section>


    {/* Product Details Modal */}
    {open && (
      <ProductDetails_experimental data={product} setOpen={setOpen} />
    )}
  </div>
  )
}

export default ProductCard