
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Ratings from '../../components/Ratings'
import {
    MapPin, MessageCircle, X, ShoppingCart,
    Heart, Truck, Shield, RotateCcw,CircleArrowRight, CircleArrowLeft 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import useUser from 'src/app/hooks/useUser'
import { useStore } from 'src/app/store/authStore'
import { useLocationTracking } from 'src/app/hooks/useLocationTracking'
import useDeviceTracking from 'src/app/hooks/useDeviceTracking'
import type { Store, Product } from 'src/app/store/authStore'
import ProductCard from '../../components/product-card'
import axiosInstance from 'src/app/utils/axios'

const ProductDetailsCard = ({
    data,}: { data: any}) => {

    const [isZoomed, setIsZoomed]             = useState(false)
    const [mousePos, setMousePos]             = useState({ x: 50, y: 50 })
    const router                              = useRouter()
    const [isSelected, setIsSelected]         = useState(data?.colors?.[0] || '')
    const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || '')
    const [quantity, setQuantity]             = useState(1)
    const [priceRange, setPriceRange]         = useState([data?.salePrice, 1199])
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [currentIndex, setCurrentIndex]     =         useState<number>(0);  
    const [currentImage, setCurrentImage]           = useState<[]>([]);

    const addToCart     = useStore((state: Store) => state.addToCart)
    const addToWishlist = useStore((state: Store) => state.addToWishlist)
    const removeFromWishlist = useStore((state: Store) => state.removeFromWishlist)
    const wishlist      = useStore((state: Store) => state.wishlist)
    const isWishlisted  = wishlist?.some((item: Product) => item.id === data.id)
    const cart          = useStore((state: Store) => state.cart)
    const isInCart      = cart?.some((item: Product) => item.id === data.id)

    const { user }   = useUser()
    const location   = useLocationTracking()
    const deviceInfo = useDeviceTracking()

    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
    
    // Navigate to Previous Image
    const prevImage = () => {
    if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setCurrentImage(data?.images[currentIndex - 1]);
        }
    };

    // Navigate to Next Image
    const nextImage = () => {
    if (currentIndex < data?.images?.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentImage(data?.images[currentIndex + 1]);
    }
    };
    const toggleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(data.id, user, location?.country ?? '', deviceInfo);
        } else {
            addToWishlist({ ...data, quantity, selectedOptions: { color: isSelected, size: isSizeSelected } },
            user, 
            location?.country ?? '', 
            deviceInfo
            );
        }
    };
        const discountPct = (() => {
        const regular = data?.regularPrice;
        const sale = data?.salePrice;
        if (!regular || !sale || regular <= sale) return 0;
        return Math.round(((regular - sale) / regular) * 100);
    })();

    const activeImageUrl = data?.images?.[currentIndex]?.url || '/active.web'

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        setMousePos({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100,
        })
    }
    
    const fetchFilteredProducts = async () => {
    try {
        const query = new URLSearchParams();
        query.set("priceRange", priceRange.join(","));
        query.set("limit", "5");
        
        const res = await axiosInstance.get(`/product/api/get-filtered-products?${query.toString()}`);
        setRecommendedProducts(res.data.products);
    } catch (error) {
        console.error("Failed to fetch filtered products", error);
    }
    };

    useEffect(() => {
        fetchFilteredProducts();
        // return
    },[priceRange])

    if (!data) return null

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Outfit:wght@300;400;500;600&display=swap');
                .pdp-font  { font-family: 'Outfit', sans-serif; }
                // .pdp-serif { font-family: 'Instrument Serif', serif; }

                @keyframes pdp-in {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .pdp-card { animation: pdp-in .3s cubic-bezier(.16,1,.3,1) both; }

                @keyframes pdp-pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
                .pdp-dot { animation: pdp-pulse 1.8s infinite; }

                /* Zoom lens cursor on the image */
                .pdp-zoom-trigger { cursor: crosshair; }

                /*
                  Aside zoom panel — floats over the right side of the card.
                  Positioned relative to .pdp-card (which has position:relative).
                  left: 42% aligns it right at the boundary of the left/right panels.
                */
                .pdp-zoom-aside {
                    pointer-events: none;
                    position: absolute;
                    left: calc(42% + 12px);
                    top: 50%;
                    transform: translateY(-50%);
                    width: 255px;
                    height: 255px;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1.5px solid #a7f3d0;
                    box-shadow: 0 12px 40px rgba(5,150,105,0.2), 0 0 0 4px rgba(255,255,255,0.8);
                    z-index: 35;
                    transition: opacity .15s ease, transform .15s ease;
                    background: #fff;
                }
                .pdp-zoom-aside.visible {
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                }
                .pdp-zoom-aside.hidden {
                    opacity: 0;
                    transform: translateY(-50%) scale(0.96);
                }

                /* Hide aside zoom on small screens (no room) */
                @media (max-width: 767px) {
                    .pdp-zoom-aside { display: none; }
                }
            `}</style>

            <main
                className="pdp-font w-screen z-50 overflow-y-auto backdrop-blur-sm bg-gray-100 ">
                <div className="flex justify-start p-5 py-6 min-h-full items-start md:items-center md:p-3 ml-24">

                    {/* ── TOTAL CARD ── */}
                    <div className="pdp-card relative flex flex-col w-full bg-white rounded-2xl shadow-xl 
                                    overflow-hidden md:max-w-[1320px] md:flex-row"
                        onClick={(e) => e.stopPropagation()}>

                        {/* ASIDE ZOOM PANEL */}
                        <div
                            className={`pdp-zoom-aside ${isZoomed ? 'visible' : 'hidden'}`}
                            style={{
                                backgroundImage:    `url(${activeImageUrl})`,
                                backgroundSize:     '320%',
                                backgroundRepeat:   'no-repeat',
                                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                            }}>
                            <div className="absolute bottom-0 left-0 right-0 py-1.5 text-center
                                            text-[10px] font-semibold text-emerald-700
                                            bg-white/80 backdrop-blur-sm border-t border-emerald-100 tracking-wide uppercase">
                                Zoomed View
                            </div>
                        </div>

                        {/* ══════════ LEFT — IMAGES (42%) ══════════ */}
                        <section className="w-full md:w-[42%] flex-shrink-0 p-5 flex flex-col gap-4">
                            <div className="flex gap-2.5">
                                {/* Vertical thumbnails */}
                                {data?.images?.length > 1 && (
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        {data.images.map((img: any, index: number) => (
                                            <button
                                                key={index}
                                                   onClick={() => {
                                                        setCurrentIndex(index) 
                                                    }}
                                                className={`relative w-[50px] h-[50px] rounded-lg overflow-hidden border-2
                                                    flex-shrink-0 bg-white transition-all cursor-pointer
                                                    ${currentIndex === index
                                                    ? 'border-emerald-500 scale-105 shadow-sm'
                                                    : 'border-gray-200 hover:border-emerald-300'}`}>
                                                <Image
                                                    src={img?.url || '/placeholder.webp'}
                                                    alt={`thumb-${index}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="50px"
                                                    onError={(e) => { e.currentTarget.src = '/placeholder.webp' }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Main image — zoom trigger */}
                                <div
                                    className="pdp-zoom-trigger relative flex-1 aspect-square rounded-xl
                                                overflow-hidden  border border-emerald-100"
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                    onMouseMove={handleMouseMove}>
                                      {currentIndex > 0 && (
                                        <CircleArrowLeft 
                                        onClick={prevImage} 
                                        size={28} 
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white drop-shadow-lg hover:scale-110 transition cursor-pointer" />
                                    )}
                                    <Image
                                        src={activeImageUrl}
                                        alt={data?.title || 'Product'}
                                        fill
                                        className="object-contain p-4"
                                        sizes="(max-width: 768px) 100vw, 38vw"
                                        onError={(e) => { e.currentTarget.src = '/placeholder.webp' }}
                                        unoptimized={process.env.NODE_ENV === 'development'}/>

                                     {/* Right Arrow */}
                                        {currentIndex < (data?.images?.length || 0) - 1 && (
                                            <CircleArrowRight 
                                            onClick={nextImage} 
                                            size={28} 
                                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-red-500 drop-shadow-lg hover:scale-110 transition cursor-pointer" />
                                        )}

                                    {data?.salePrice && discountPct > 0 ? (
                                        <div className="absolute top-2.5 left-2.5 z-10 bg-emerald-600 text-white
                                                        text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                                            -{discountPct}%
                                        </div>
                                        ) :  <></>
                                    }

                                    <div className={`absolute bottom-2 right-2 flex items-center gap-1 bg-white/85 backdrop-blur-sm text-[10px] 
                                                    px-2 py-1 rounded-lg border border-gray-100 transition-opacity duration-200
                                                    ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
                                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                                            <circle cx="5" cy="5" r="4" stroke="#9ca3af" strokeWidth="1.5"/>
                                            <line x1="8.5" y1="8.5" x2="11" y2="11" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                        Hover to zoom
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ══════════ MIDDLE — MAIN INFO (38%) ══════════ */}
                        <section className="w-full md:w-[38%] flex-shrink-0 flex flex-col p-5 sm:p-6 min-w-0">
                            {/* Shop First row */}
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
                                            className="text-[13px] font-semibold text-gray-800
                                                        hover:text-emerald-700 transition block truncate">
                                            {data?.Shop?.name || 'Shop Name'}
                                        </Link>
                                        <div className="mt-0.5">
                                            <Ratings rating={data?.Shop?.ratings || 0} />
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                            <MapPin size={10} />
                                            <span className="truncate">
                                                {data?.Shop?.address || 'Location unavailable'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/inbox?shopId=${data?.Shop?.id}`)}
                                    className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg
                                                text-xs font-medium bg-emerald-50 text-emerald-700
                                                border border-emerald-200 hover:bg-emerald-100 transition">
                                    <MessageCircle size={12} />
                                    Chat Seller
                                </button>
                            </div>

                            {/* Title */}
                            <div className='flex items-center mt-4'>
                                <h2 className="pdp-serif w-1/2 text-[1.55rem] leading-snug text-gray-900">
                                    {data?.title || 'Product Title'}
                                </h2>
                                <span className={`flex ml-auto items-center gap-2 transition-opacity duration-300 ease-in-out ${isWishlisted ? 'opacity-100' : 'opacity-0'}`}>
                                    <button
                                        onClick={toggleWishlist}
                                        className={`inline flex-shrink-0 rounded-xl border transition-all
                                            ${isWishlisted
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-200'}`}>
                                        <Heart size={16}
                                            fill={isWishlisted ? '#ef4444' : 'transparent'}
                                            color={isWishlisted ? '#ef4444' : '#9ca3af'} />
                                    </button>
                                    Wishlisted 
                                </span>
                                
                            </div>
                            {/* Stock */}
                            {data?.stock > 0 && (
                                <div className="flex items-center gap-1.5 mt-2 w-fit text-[11px] font-medium
                                                text-emerald-700 bg-emerald-50 border border-emerald-200
                                                px-2.5 py-1 rounded-full">
                                    <span className="pdp-dot w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                    In Stock · {data.stock} units left
                                </div>
                            )}

                            {/* Description */}
                            <p className="mt-3 text-[13.5px] text-gray-600 leading-[1.75]">
                                {data?.short_description || data?.description || 'No description available.'}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-2.5 mt-4 flex-wrap">

                            {data.salePrice ? 
                            <>
                                 <span className="pdp-serif text-[2rem] leading-none text-emerald-700">
                                    ${data?.salePrice?.toFixed(2) ?? '0.00'}
                                </span>
                                {data?.regularPrice > data?.salePrice && (
                                    <span className="text-[15px] text-gray-400 line-through">
                                        ${data.regularPrice.toFixed(2)}
                                    </span>
                                )}
                                {data?.salePrice && discountPct > 0 && (
                                    <span className="text-[11px] font-semibold text-emerald-700
                                                        bg-emerald-50 border border-emerald-200
                                                        px-2 py-0.5 rounded-full">
                                        Save {discountPct}%
                                    </span>
                                )}
                            </>
                            : 
                            <span className="pdp-serif text-[2rem] leading-none text-emerald-700">
                                    ${data?.regularPrice?.toFixed(2) ?? '0.00'}
                                </span>
                            }
                            {data.sizes && (
                                data.sizes.map((size : any)=> {
                                    <span className=''>{size}</span>
                                })
                            )}
                            </div>

                            <hr className="my-4 border-gray-100" />

                            {/* Size */}
                            {data?.sizes?.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Size</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {data.sizes.map((size: string, i: number) => (
                                            <button key={i} onClick={() => setIsSizeSelected(size)}
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
                                            <button key={i} onClick={() => setIsSelected(color)}
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

                            {/* Quantity + Actions */}
                            <div className="mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Quantity</p>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                                        <button onClick={() => setQuantity(p => Math.max(1, p - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500
                                                        hover:bg-emerald-50 hover:text-emerald-700 transition font-light text-xl">−</button>
                                        <span className="w-10 h-10 flex items-center justify-center text-[14px]
                                                            font-semibold text-gray-800 border-x border-gray-200">
                                            {quantity}
                                        </span>
                                        <button onClick={() => setQuantity(p => p + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-500
                                                        hover:bg-emerald-50 hover:text-emerald-700 transition font-light text-xl">+</button>
                                    </div>

                                <button
                                    onClick={toggleWishlist}
                                    className={`w-10 h-10 flex-shrink-0 rounded-xl border flex items-center
                                                justify-center transition-all
                                        ${isWishlisted
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-200'}`}>
                                    <Heart size={16}
                                        fill={isWishlisted ? '#ef4444' : 'transparent'}
                                        color={isWishlisted ? '#ef4444' : '#9ca3af'} />
                                </button>

                                <button
                                    disabled={isInCart}
                                    onClick={() => {
                                        if (!location) return
                                        addToCart(
                                            { ...data, quantity, selectedOptions: { color: isSelected, size: isSizeSelected } },
                                            user, location.country, deviceInfo
                                        )
                                    }}
                                        className={`flex-1 min-w-[120px] h-10 flex items-center justify-center gap-2
                                                    rounded-xl text-[13px] font-semibold transition-all
                                            ${isInCart
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[.98] text-white shadow-sm shadow-emerald-100'}`}>
                                        <ShoppingCart size={14} />
                                        {isInCart ? 'Added to Cart' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ══════════ RIGHT — ADDITIONAL INFO (20%) ══════════ */}
                        <section className="w-full md:w-[20%] flex-shrink-0 p-5 border-l border-gray-100">
                            {/* Delivery Location */}
                            <div className="flex items-start gap-3 mb-4">
                                <Truck size={18} className="text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Delivery Option</p>
                                    <p className="text-sm text-gray-500">
                                        {data?.Shop?.city || 'Petaling Jaya'}, {data?.Shop?.country || 'Malaysia'}
                                    </p>
                                </div>
                            </div>

                            {/* Return & Warranty */}
                            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <RotateCcw size={16} className="text-emerald-600" />
                                    <div>
                                        <p className="text-xs font-medium text-gray-700">Returns</p>
                                        <p className="text-xs text-gray-500">{data?.returnPolicy || '7 Days Returns'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-emerald-600" />
                                    <div>
                                        <p className="text-xs font-medium text-gray-700">Warranty</p>
                                        <p className="text-xs text-gray-500">{data?.warranty || 'Warranty not available'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Seller Info Card */}
                            <div className="border border-gray-100 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                        <Image
                                            src={data?.Shop?.avatar || '/default-shop.jpg'}
                                            alt={data?.Shop?.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Sold by</p>
                                        <p className="text-sm text-gray-600">{data?.Shop?.name || 'Becodemy'}</p>
                                    </div>
                                </div>
                                
                                {/* Seller Ratings */}
                                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500">Positive Seller Ratings</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {data?.Shop?.positiveRating || '100'}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Ship on Time Rate</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {data?.Shop?.shipOnTime || '100'}%
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={`/shop/${data?.Shop?.id}`}
                                    className="mt-3 block text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                                    GO TO STORE →
                                </Link>
                            </div>

                            {/* Product Details Section */}
                            {data?.specifications && Object.keys(data.specifications).length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Product details</h3>
                                    <div className="space-y-1">
                                        {Object.entries(data.specifications).map(([key, value]) => (
                                            <p key={key} className="text-xs text-gray-500">
                                                <span className="text-gray-600">{key}:</span> {String(value)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* If specifications is an array of stories */}
                            {data?.stories && data.stories.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Product details</h3>
                                    <div className="space-y-1">
                                        {data.stories.slice(0, 10).map((story: string, idx: number) => (
                                            <p key={idx} className="text-xs text-gray-500">{story}</p>
                                        ))}
                                        {data.stories.length > 10 && (
                                            <button className="text-xs text-emerald-600 hover:underline mt-1">
                                                View all {data.stories.length} details →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                 {/* SECOND ROW - BLOCK */}
                <section className='block'>
                    <aside className='ml-8'>
                        <h3 className="my-8 text-xl font-medium underline text-cyan-800">Product details of {data?.title}
                    </h3>
                    <div className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: data?.detailed_description }}
                    />
                    </aside>
                    <aside className="mx-auto bg-white min-h-[50vh] h-full mt-5">
                        <div className="p-4">
                            <h3 className="my-8 text-xl font-medium underline text-cyan-800">Ratings & Reviews of {data?.title}</h3>
                        </div>
                    </aside>

                    <aside>
                        <div className="container mx-auto px-4 py-8">
                        <h3 className="my-8 text-3xl font-medium text-cyan-800 text-center">You May Also Like</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {recommendedProducts.map((product) => (
                            <ProductCard key={data.id || data._id} product={product} />
                            ))}
                        </div>
                        </div>
                    </aside>
                </section>
            </main>
        </>
    )
}

export default ProductDetailsCard
