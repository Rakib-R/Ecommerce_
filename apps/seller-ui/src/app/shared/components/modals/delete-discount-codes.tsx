

import React from 'react'
import { X } from 'lucide-react'

const DeleteDiscountCodeModal = ({discount, onClose, onConfirm}: {discount: any, onClose:() => void; onConfirm?: any}) => {
  return (
      <main className=" flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full bg-black/60 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-red-700">
          {/* Header */}
          <div className="flex w-[16vw] justify-between items-center ">
            <h3 className="text-black">Delete Code: {discount.discountCode}</h3>
            <button className="bg-red-500"
              onClick={onClose}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-4 text-sm text-gray-300 leading-relaxed">
          <p>
            Are you sure you want to delete{" "}
            <span className="text-red-400 font-semibold">
              {discount.public_name}
            </span>
            ?
          </p>

          <p className="mt-2 text-red-500 font-medium">
            This action cannot be undone.
          </p>
        </div>

        <section className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition"
              onClick={onClose}>
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </section>
      </main>
  )
}

export default DeleteDiscountCodeModal