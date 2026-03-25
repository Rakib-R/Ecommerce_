'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageUrl = productDetails?.images?.[0]?.url;

  if (!imageUrl) return <div>No image available</div>;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="py-5">
      <div className="w-full bg-white mx-auto pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Thumbnails (optional) */}
        <div className="flex gap-4">
          <div className="w-20 flex flex-col gap-2">
            {productDetails?.images?.map((img: any, idx: number) => (
              <div
                key={idx}
                className="relative w-20 h-20 border rounded-md overflow-hidden cursor-pointer hover:border-blue-500">
                <Image
                  src={img.url}
                  alt={`thumbnail-${idx}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image with zoom */}
          <div
            className="relative w-full h-[500px] overflow-hidden cursor-crosshair"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={imageUrl}
              alt={productDetails?.title || 'Product image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {isZoomed && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                  backgroundSize: '200%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
          </div>
        </div>

        {/* Right column - Product info */}
        <div>
          <h1 className="text-2xl font-bold">{productDetails?.title}</h1>
          <p className="text-gray-600 mt-2">{productDetails?.description}</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-blue-600">
              ${productDetails?.sale_price}
            </span>
            {productDetails?.regular_price && (
              <span className="ml-2 text-gray-400 line-through">
                ${productDetails?.regular_price}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;