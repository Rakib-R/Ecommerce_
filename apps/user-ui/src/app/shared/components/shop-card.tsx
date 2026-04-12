import React from 'react'
import Image from 'next/image';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import Link from "next/link";

interface ShopProps {
  shop: {
    id: string;
    name: string;
    category: string;
    coverBanner: string;
    avatar: string;
    description?: string;
    address?: string;
    followers?: string[];
    rating?: number;
  };
}

const ShopCard = ({ shop }: ShopProps) => {

  const avatarSrc =
  shop.avatar === "string" && shop.avatar.trim() !== ""
      ? shop.avatar: "https://ik.imagekit.io/hasanRakib/Person/avater.webp?updatedAt=1775922329704";

  return (
    <main className="w-full rounded-xl cursor-pointer bg-white border border-gray-200 shadow-md hover:shadow-lg transition overflow-hidden">

      {/* Banner */}
      <div className="relative w-full h-[110px]">
        <Image
          src={avatarSrc}
          alt="Cover"
          fill
          className="object-cover"
        />
      </div>

      {/* Avatar (floating center) */}
      <div className="relative flex justify-center">
        <div className="absolute -top-8 w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-md bg-white">
          <Image
            src={avatarSrc}
            alt={shop.name}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Info */}
      <div className="pt-10 pb-4 text-center px-3">
        <h3 className="text-base font-semibold">{shop.name}</h3>

        <p className="text-xs text-gray-500 mt-1">
          {shop.followers?.length || 0} Followers
        </p>

        {/* Address */}
        {shop.address && (
          <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-1">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[140px]">
              {shop.address}
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center justify-center gap-1">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className='text-md'>
            {shop.rating ?? "N/A"}
          </span>
        </div>

        {/* Category */}
        {shop.category && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="bg-blue-500 text-white capitalize px-2 py-0.5 rounded-full text-xs">
              {shop.category}
            </span>
          </div>
        )}

        
        <div className="mt-4">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline transition">
             Visit Shop
            <ArrowRight className="h-4 w-4 mt-[1px]" />
          </Link>
        </div>


      </div>
    </main>
  );
};

export default ShopCard;