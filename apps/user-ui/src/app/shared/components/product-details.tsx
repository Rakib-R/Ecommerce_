import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Ratings from './Ratings'
import { MapPin, MessageCircle, X, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Heart, Warehouse  } from 'lucide-react'
import useUser from '../../hooks/useUser'
import { useStore } from '../../store/authStore'
import { useLocationTracking } from '../../hooks/useLocationTracking'
import useDeviceTracking from '../../hooks/useDeviceTracking'
import type { Store, Product } from '../../store/authStore'



const ProductDetailsCard = ({ data, setOpen }: { data: any; setOpen: (open: boolean) => void }) => {

    const [activeImage, setActiveImage] = useState(0)
    const router = useRouter()
    const [isSelected, setIsSelected] = useState(data?.colors?.[0] || '')
    const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || '')
    const [quantity, setQuantity] = useState(1)

    const addToCart = useStore((state: Store) => state.addToCart)
    const removeToCart = useStore((state: Store) => state.removeFromCart)
    const addToWishlist = useStore((state: Store) => state.addToWishlist)
    const removeFromWishlist = useStore((state: Store) => state.removeFromWishlist)
    const wishlist = useStore((state : Store) => state.wishlist)
    const isWishlisted = wishlist?.some((item : Product) => item.id === data.id)
    const cart = useStore((state : Store) => state.cart)
    const isInCart = cart?.some((item : Product) => item.id === data.id)
    
    const {user} = useUser() 
    const location = useLocationTracking()
    const deviceInfo = useDeviceTracking()
    
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    if (!data) return null
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
            onClick={() => setOpen(false)}>
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    onClick={() => setOpen(false)}
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* ── Left: Images ── */}
                    <div className="w-full md:w-[45%] p-6 bg-gray-50 rounded-tl-2xl rounded-bl-2xl">
                        {/* Main Image */}
                        <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-white">
                            <Image
                                src={data?.images?.[activeImage]?.url || '/placeholder-image.jpg'}
                                alt={data?.title || 'Product image'}
                                fill
                                className="object-contain p-4"
                                sizes="(max-width: 768px) 100vw, 45vw"
                                onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg' }}
                                unoptimized={process.env.NODE_ENV === 'development'}
                            />
                        </div>

                        {/* Thumbnails */}
                        {data?.images?.length > 0 && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {data.images.map((img: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index)}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                            activeImage === index
                                                ? 'border-blue-500 shadow-md scale-105'
                                                : 'border-gray-200 hover:border-gray-400'
                                        }`}>
                                        <Image
                                            src={img?.url || '/placeholder-image.jpg'}
                                            alt={`thumb-${index}`}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                            onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg' }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Details ── */}
                    <div className="w-full md:w-[55%] p-6 flex flex-col">

                        {/* Shop Info Row */}
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                                    <Image
                                        src={data?.Shop?.avatar || '/default-shop-logo.png'}
                                        alt="Shop"
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                        onError={(e) => { e.currentTarget.src = '/default-shop-logo.png' }}
                                    />
                                </div>
                                <div>
                                    <Link
                                        href={`/shop/${data?.Shop?.id}`}
                                        className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm"
                                    >
                                        {data?.Shop?.name || 'Shop Name'}
                                    </Link>
                                    <div className="mt-0.5">
                                        <Ratings rating={data?.Shop?.ratings || 0} />
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                                        <MapPin size={12} />
                                        <span>{data?.Shop?.address || 'Location Not Available'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chat with Seller */}
                            <button
                                onClick={() => router.push(`/inbox?shopId=${data?.Shop?.id}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap flex-shrink-0">
                                <MessageCircle size={15} />
                                Chat with Seller
                            </button>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 mt-4">
                            {data?.title || 'Product Title'}
                        </h2>

                        {/* Description */}
                        <p className="mt-2 text-gray-500 text-sm leading-relaxed line-clamp-3">
                            {data?.short_description || data?.description || 'No description available'}
                        </p>

                        {/* Price */}
                        <section className="flex items-baseline gap-3 mt-4">
                            <span className="text-3xl font-bold text-blue-600">
                                ${data?.sale_price?.toFixed(2) || '0.00'}
                            </span>
                            {data?.regular_price > data?.sale_price && (
                                <span className="text-lg text-gray-400 line-through">
                                    ${data.regular_price.toFixed(2)}
                                </span>
                            )}
                            {data?.regular_price > data?.sale_price && (
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {Math.round(((data.regular_price - data.sale_price) / data.regular_price) * 100)}% off
                                </span>
                            )}
                        </section>

                        {/* Size */}
                        {data?.sizes?.length > 0 && (
                            <section className="mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
                                <div className="flex gap-2 flex-wrap">
                                    {data.sizes.map((size: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setIsSizeSelected(size)}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                                isSizeSelected === size
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Color */}
                        {data?.colors?.length > 0 && (
                            <section className="mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
                                <div className="flex gap-2 flex-wrap">
                                    {data.colors.map((color: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setIsSelected(color)}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                                isSelected === color
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                                            }`}>
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Quantity + Add to Cart */}
                        <section className="flex items-center gap-4 mt-6">
                            {/* Quantity */}
                            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                                <button
                                    className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition"
                                    onClick={() => setQuantity((p) => Math.max(1, p - 1))}>
                                    −
                                </button>
                                <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-gray-800 bg-white">
                                    {quantity}
                                </span>
                                <button
                                    className="w-9 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition"
                                    onClick={() => setQuantity((p) => p + 1)}>
                                    +
                                </button>
                            </div>
                           {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                                <Warehouse size={18} />
                            </button> */}

                            <button className="opacity-[.7] cursor-pointer" onClick={() => {
                                 addToWishlist(
                                {...data,
                                quantity,
                                selectedOptions: { color: isSelected, size: isSizeSelected,}},
                                user,
                                location?.country ?? "", 
                                deviceInfo
                            )
                            }}>
                                <Heart size={30} fill={isWishlisted ? 'red' : 'transparent'} 
                                    color={isWishlisted ? 'red' : 'black'}/>
                            </button>
                                                        {/* Add to Cart */}
                            <button 
                            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl text-white font-semibold transition-all
                                ${isInCart  ? "bg-gray-400 cursor-not-allowed opacity-60" 
                                : "bg-orange-600 hover:bg-blue-700 active:scale-95 cursor-pointer"}`}
                                disabled={isInCart}
                            onClick={() => {
                            if (!location) return; // guard against null
                            addToCart(
                                {...data,
                                quantity,
                                selectedOptions: { color: isSelected, size: isSizeSelected,}},
                                user,
                                location.country,  // now guaranteed non-null
                                deviceInfo
                            )}} >
                                <ShoppingCart size={16} />
                                Add to Cart
                            </button>

                            {data?.product?.stock > 0 ? (
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                                {data?.product?.stock.length}
                            </button>
                            ) : (
                            <button className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed" disabled>
                                Out of Stock
                            </button>
                        )}
                        </section>
                        <section>
                        <div className="mt-3 text-sm">
                            <strong>Estimated Delivery:</strong> {new Date().toDateString()}
                        </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailsCard