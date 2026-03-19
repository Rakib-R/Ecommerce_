'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useStore } from '../../store/authStore'
import useUser from '../../hooks/useUser'
import { useLocationTracking } from '../../hooks/useLocationTracking'
import useDeviceTracking from '../../hooks/useDeviceTracking'
import type { Product } from '../../store/authStore'

const CartPage = () => {
  const { user } = useUser()
  const location = useLocationTracking()
  const deviceInfo = useDeviceTracking()
  
  const cart = useStore((state: any) => state.cart)
  const removeFromCart = useStore((state: any) => state.removeFromCart)
  const addToWishlist = useStore((state: any) => state.addToWishlist)

  // Discount state
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percent: number} | null>(null)
  const [discountError, setDiscountError] = useState('')

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) => 
        item.id === id 
          ? { ...item, quantity: (item.quantity || 1) + 1 } 
          : item
      )
    }))
  }

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) } 
          : item
      )
    }))
  }

  const moveToWishlist = (item: Product) => {
    addToWishlist(item, user, location, deviceInfo)
    removeFromCart(item.id, user, location, deviceInfo)
  }

  const applyDiscount = () => {
    // Mock discount codes - replace with actual API call
    const validDiscounts: Record<string, number> = {
      'SAVE10': 10,
      'SAVE20': 20,
      'WELCOME15': 15,
      'FLASH25': 25
    }

    if (validDiscounts[discountCode.toUpperCase()]) {
      setAppliedDiscount({
        code: discountCode.toUpperCase(),
        percent: validDiscounts[discountCode.toUpperCase()]
      })
      setDiscountError('')
      setDiscountCode('')
    } else {
      setDiscountError('Invalid discount code')
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
  }

  // Calculate totals
  const subtotal = cart?.reduce((sum: number, item: any) => 
    sum + (item.sale_price * (item.quantity || 1)), 0
  ) || 0
  
  // Discount calculation
  const discountPercent = appliedDiscount?.percent || 0
  const discountAmount = (subtotal * discountPercent) / 100
  
  const shipping = subtotal > 100 ? 0 : 10
  const tax = (subtotal - discountAmount) * 0.1 // 10% tax after discount
  const total = subtotal - discountAmount + shipping + tax

  return (
    <main className="max-w-[1300px] mx-32 min-h-screen py-8">
      {/* Breadcrumb */}
      <section className="pb-5 w-[550px]">
        <h1 className="font-medium text-[44px] leading-[1.2] mb-2">Shopping Cart</h1>
        <div className="flex items-center text-sm">
          <Link href="/" className="hover:underline text-gray-600">
            Home
          </Link>
          <span className="inline-block w-1 h-1 mx-2 bg-gray-400 rounded-full"></span>
          <span className="text-gray-800">Shopping Cart</span>
        </div>
      </section>

      {/* Empty Cart */}
      {cart?.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Your cart is empty!</p>
          <Link 
            href="/products" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <section className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 pl-6 text-left font-semibold text-gray-700">Product</th>
                    <th className="py-4 text-left font-semibold text-gray-700">Price</th>
                    <th className="py-4 text-left font-semibold text-gray-700">Quantity</th>
                    <th className="py-4 text-left font-semibold text-gray-700">Total</th>
                    <th className="py-4 pr-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart?.map((item: any) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                      {/* Product */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                            <Image
                              src={item.images?.[0]?.url || '/placeholder.jpg'}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link 
                              href={`/product/${item.id}`}
                              className="font-medium hover:text-blue-600 transition">
                              {item.title}
                            </Link>
                            {item.selectedOptions?.size && (
                              <p className="text-sm text-gray-500">Size: {item.selectedOptions.size}</p>
                            )}
                            {item.selectedOptions?.color && (
                              <p className="text-sm text-gray-500">Color: {item.selectedOptions.color}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4">
                        <span className="font-medium">${item.sale_price?.toFixed(2)}</span>
                      </td>

                      {/* Quantity */}
                      <td className="py-4">
                        <div className="flex items-center border border-gray-300 rounded-md w-fit">
                          <button 
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            −
                          </button>
                          <span className="px-4 py-1 min-w-[40px] text-center">
                            {item.quantity || 1}
                          </span>
                          <button 
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                            onClick={() => increaseQuantity(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4">
                        <span className="font-semibold text-blue-600">
                          ${(item.sale_price * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6">
                        <div className="flex gap-2">
                          <button 
                            className="text-gray-400 hover:text-blue-600 transition"
                            onClick={() => moveToWishlist(item)}
                            title="Move to Wishlist"
                          >
                            ♥
                          </button>
                          <button 
                            className="text-gray-400 hover:text-red-600 transition"
                            onClick={() => removeFromCart(item.id, user, location, deviceInfo)}
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Continue Shopping */}
            <div className="mt-4">
              <Link href="/products" className="text-blue-600 hover:underline flex items-center gap-2">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <section className="lg:w-1/3 -mt-24">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Discount Code Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a discount code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyDiscount}
                    disabled={!discountCode || !!appliedDiscount}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
                {discountError && (
                  <p className="text-red-500 text-sm mt-1">{discountError}</p>
                )}
              </div>
              
              <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Discount Display */}
                {appliedDiscount && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium flex items-center gap-1">
                      <Tag size={16} />
                      Discount ({appliedDiscount.percent}%)
                    </span>
                    <span className="font-semibold">
                      - ${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Applied Discount Badge */}
              {appliedDiscount && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-green-700">
                    Code <span className="font-bold">{appliedDiscount.code}</span> applied
                  </span>
                  <button
                    onClick={removeDiscount}
                    className="text-green-700 hover:text-green-900 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              <div className="flex justify-between pt-4 text-lg font-semibold">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
              
              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Free shipping on orders over $100
              </p>
            </div>
          </section>
        </section>
      )}
    </main>
  )
}

export default CartPage