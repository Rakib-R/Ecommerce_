

import React from 'react'
import { X } from 'lucide-react'

const DeleteDiscountCodeModal = ({discount, onClose, onConfirm}: {discount: any, onClose:() => void; onConfirm?: any}) => {
  return (
      <section className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h3 className="text-white">Delete Discount Code</h3>
            <button className="hover:text-white">
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

        <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
      </section>
  )
}

export default DeleteDiscountCodeModal