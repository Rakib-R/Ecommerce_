'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Ratings from 'src/app/utils/Ratings'
import { MapPin, MessageCircle, X, ShoppingCart, Shield, RotateCcw, Truck, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useUser from '@user-ui/hooks/useUser'
import { useStore } from '@user-ui/store/authStore'
import { useLocationTracking } from '@user-ui/hooks/useLocationTracking'
import useDeviceTracking from '@user-ui/hooks/useDeviceTracking'
import type { Store, Product } from '@user-ui/store/authStore'

const ProductDetailsCard = ({ data, setOpen }: { data: any; setOpen: (open: boolean) => void }) => {
    const [activeImage, setActiveImage] = useState(0)
    const router = useRouter()
    const [isSelected, setIsSelected] = useState(data?.colors?.[0] || '')
    const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || '')
    const [quantity, setQuantity] = useState(1)

    const addToCart     = useStore((state: Store) => state.addToCart)
    const addToWishlist = useStore((state: Store) => state.addToWishlist)
    const wishlist      = useStore((state: Store) => state.wishlist)
    const isWishlisted  = wishlist?.some((item: Product) => item.id === data.id)
    const cart          = useStore((state: Store) => state.cart)
    const isInCart      = cart?.some((item: Product) => item.id === data.id)

    const { user }   = useUser()
    const location   = useLocationTracking()
    const deviceInfo = useDeviceTracking()

    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)

    if (!data) return null
    
    const discountPct = (() => {
        const regular = data?.regularPrice;
        const sale = data?.salePrice;
        if (!regular || !sale || regular <= sale) return 0;
        return Math.round(((regular - sale) / regular) * 100);
    })();

    console.log('discoutnPct', discountPct)

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Outfit:wght@300;400;500;600&display=swap');
                .pdp-font  { font-family: 'Outfit', sans-serif; }
                // .pdp-serif { font-family: 'Instrument Serif', serif; }
                @keyframes pdp-slide-up {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .pdp-card { animation: pdp-slide-up .28s cubic-bezier(.16,1,.3,1) both; }
                @keyframes pdp-pulse { 0%,100%{opacity:1} 50%{opacity:.25} }
                .pdp-dot   { animation: pdp-pulse 1.8s infinite; }
            `}</style>

            {/*
                OVERLAY
                - overflow-y-auto on the overlay itself so the modal is always scrollable
                  when viewport height is short — nothing ever gets cut off
            */}
            <div
                className="pdp-font fixed inset-0 z-[500] overflow-y-auto bg-black/40 backdrop-blur-sm"
                onClick={() => setOpen(false)}>
                {/* py-6 gives top/bottom breathing room on small screens */}
                <div className="flex min-h-full items-start sm:items-center justify-center p-3 sm:p-5 py-6">

                <div
                    className="pdp-card relative w-full max-w-[900px] bg-white rounded-2xl shadow-xl overflow-hidden
                                flex flex-col md:flex-row"
                    onClick={(e) => e.stopPropagation()}>

                    {/* ── Close button ── */}
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center
                                    rounded-full bg-white border border-gray-200 text-gray-400
                                    hover:text-gray-700 hover:border-gray-300 transition shadow-sm">
                        <X size={14} />
                    </button>

                        {/* 
                            LEFT PANEL — images
                            
                        */}
                        <div className="w-full md:w-[42%] flex-shrink-0 bg-emerald-50 p-5 flex flex-col gap-4">

                            {/* Main image */}
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-emerald-100/80">
                                <Image
                                    src={data?.images?.[activeImage]?.url || '/placeholder.webp'}
                                    alt={data?.title || 'Product'}
                                    fill
                                    className="object-contain p-6"
                                    sizes="(max-width: 768px) 100vw, 42vw"
                                    onError={(e) => { e.currentTarget.src = '/placeholder.webp' }}
                                    unoptimized={process.env.NODE_ENV === 'development'}
                            />
                            {data?.salePrice && discountPct > 0 ? (
                                <div className="absolute top-3 left-3 bg-emerald-600 text-white
                                                text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                                    -{discountPct}%
                                </div>
                            ) : <></>}

                            {data.sizes && (
                                data.sizes.map((size : any)=> {
                                    <span className='bg-black'>{size}</span>
                                })
                            )}
                        </div>

                        {/* Thumbnails */}
                        {data?.images?.length > 1 && (
                            <div className="flex gap-2 flex-wrap">
                                {data.images.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all bg-white
                                            ${activeImage === i
                                                ? 'border-emerald-500 scale-105 shadow-sm'
                                                : 'border-gray-200 hover:border-emerald-300'}`}>
                                        <Image
                                            src={img?.url || '/placeholder.webp'}
                                            alt={`thumb-${i}`}
                                            fill className="object-cover" sizes="56px"
                                            onError={(e) => { e.currentTarget.src = '/placeholder.webp' }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trust badges */}
                        <div className="mt-auto pt-4 font-semibold border-t border-emerald-100 grid grid-cols-3 gap-2">
                            {[
                                { Icon: Shield,    text: 'Secure Pay'    },
                                { Icon: RotateCcw, text: 'Free Returns'  },
                                { Icon: Truck,     text: 'Fast Shipping' },
                            ].map(({ Icon, text }) => (
                                <div key={text} className="flex flex-col items-center gap-1 text-center">
                                    <div className="w-8 h-8 rounded-full bg-white border border-emerald-100 flex items-center justify-center">
                                        <Icon size={14} className="text-emerald-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 leading-tight">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/*
                        RIGHT PANEL — product info
                   */}
                    <div className="flex-1 flex flex-col p-5 sm:p-6 min-w-0">

                        {/* Shop row */}
                        <div className="flex items-center justify-between gap-2 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative w-9 h-9 flex-shrink-0 rounded-full overflow-hidden border-2 border-emerald-200">
                                    <Image
                                        src={data?.Shop?.avatar || '/default-shop.jpg'}
                                        alt="Shop" fill className="object-cover" sizes="36px"
                                        onError={(e) => { e.currentTarget.src = '/default-shop.jpg' }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <Link
                                        href={`/shop/${data?.Shop?.id}`}
                                        className="text-[13px] font-semibold text-gray-800 hover:text-emerald-700 transition block truncate">
                                        {data?.Shop?.name || 'Shop Name'}
                                    </Link>
                                    <div className="mt-0.5">
                                        <Ratings rating={data?.Shop?.ratings || 0} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                        <MapPin size={10} />
                                        <span className="truncate">{data?.Shop?.address || 'Location unavailable'}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/inbox?shopId=${data?.Shop?.id}`)}
                                className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium
                                            bg-emerald-50 text-emerald-700 border border-emerald-200
                                            hover:bg-emerald-100 transition">
                                <MessageCircle size={12} />
                                Chat Seller
                            </button>
                        </div>

                    {/* Title */}
                    <h2 className="pdp-serif text-[1.6rem] leading-snug text-gray-900 mt-4">
                        {data?.title || 'Product Title'}
                    </h2>

                    {/* In-stock badge */}
                    {data?.stock > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 w-fit
                                        text-[11px] font-medium text-emerald-700
                                        bg-emerald-50 border border-emerald-200
                                        px-2.5 py-1 rounded-full">
                            <span className="pdp-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock · {data.stock} units left
                        </div>
                    )}

                        {/* ── Description — legible, full contrast ── */}
                        <p className="mt-3 text-[13.5px] font-semibold text-gray-600 leading-[1.75]">
                            {data?.short_description || data?.description || 'No description available.'}
                        </p>

                        {/* Price row */}
                        <div className="flex items-baseline gap-2.5 mt-4 flex-wrap">
                            { data.salePrice ? 
                            <> 
                                <span className="pdp-serif text-[2rem] leading-none text-emerald-700 font-semibold">
                                    ${data?.salePrice?.toFixed(2)}
                                </span>
                                {data?.regularPrice > data?.salePrice && (
                                  <>
                                      <span className="text-[15px] text-gray-400 line-through">
                                        ${data.regularPrice.toFixed(2)}
                                    </span>

                                      <span className="text-[11px] font-semibold text-emerald-700
                                                    bg-emerald-50 border border-emerald-200
                                                    px-2 py-0.5 rounded-full">
                                    Save {discountPct}%
                                </span>
                                  </>
                                )}
                            </> :
                            <span className="pdp-serif text-[2rem] leading-none text-emerald-700 font-semibold">
                                ${data?.regularPrice?.toFixed(2) ?? '0.00'}
                            </span>

                            }
                       
                        </div>

                        <hr className="my-4 border-gray-100" />

                        {/* Size */}
                        {data?.sizes?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Size</p>
                                <div className="flex gap-2 flex-wrap">
                                    {data.sizes.map((size: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setIsSizeSelected(size)}
                                            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium border transition-all
                                                ${isSizeSelected === size
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'}`}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color */}
                        {data?.colors?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Color</p>
                                <div className="flex gap-2 flex-wrap">
                                    {data.colors.map((color: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setIsSelected(color)}
                                            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium border transition-all
                                                ${isSelected === color
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'}`}>
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <hr className="border-gray-100" />

                            {/* Qty + actions */}
                            <div className="mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Quantity</p>
                                <div className="flex items-center gap-2.5 flex-wrap">

                                    {/* Stepper */}
                                    <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(p => Math.max(1, p - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500
                                                       hover:bg-emerald-50 hover:text-emerald-700 transition font-light text-xl"
                                        >−</button>
                                        <span className="w-10 h-10 flex items-center justify-center text-[14px] font-semibold text-gray-800 border-x border-gray-200">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(p => p + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500
                                                       hover:bg-emerald-50 hover:text-emerald-700 transition font-light text-xl"
                                        >+</button>
                                    </div>

                                    {/* Wishlist */}
                                    <button
                                        onClick={() => addToWishlist(
                                            { ...data, quantity, selectedOptions: { color: isSelected, size: isSizeSelected } },
                                            user, location?.country ?? '', deviceInfo
                                        )}
                                        className={`w-10 h-10 flex-shrink-0 rounded-xl border flex items-center justify-center transition-all
                                            ${isWishlisted
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-200'}`}>
                                        <Heart
                                            size={16}
                                            fill={isWishlisted ? '#ef4444' : 'transparent'}
                                            color={isWishlisted ? '#ef4444' : '#9ca3af'}
                                        />
                                    </button>

                                    {/* Add to cart */}
                                    <button
                                        disabled={isInCart}
                                        onClick={() => {
                                            if (!location) return
                                            addToCart(
                                                { ...data, quantity, selectedOptions: { color: isSelected, size: isSizeSelected } },
                                                user, location.country, deviceInfo
                                            )
                                        }}
                                        className={`flex-1 min-w-[100px] h-10 flex items-center justify-center gap-2
                                                rounded-xl text-[13px] font-semibold transition-all
                                        ${isInCart
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[.98] text-white shadow-sm shadow-emerald-100'}`}>
                                        <ShoppingCart size={14} />
                                        {isInCart ? 'Added to Cart' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>

                            {/* Delivery */}
                            <div className="mt-4 flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                <Truck size={14} className="text-emerald-600 flex-shrink-0" />
                                <span className="text-[12px] text-gray-500">
                                    Estimated delivery by{' '}
                                    <strong className="text-gray-700 font-semibold">{estimatedDelivery.toDateString()}</strong>
                                </span>
                            </div>

                        </div>
                        {/* end RIGHT */}

                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductDetailsCard
