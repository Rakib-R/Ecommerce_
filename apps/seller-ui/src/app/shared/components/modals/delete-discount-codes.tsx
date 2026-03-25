

import React from 'react'
import { X } from 'lucide-react'

const DeleteDiscountCodeModal = ({discount, onClose, onConfirm}: {discount: any, onClose:() => void; onConfirm?: any}) => {
  return (
      <main className="flex flex-col items-center justify-center fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 backdrop-blur-sm">
        <div className='flex flex-col justify-center bg-zinc-900 border border-zinc-800 p-6 rounded-lg w-full max-w-[450px] shadow-lg'>

        <section className="bg-white p-6 rounded-lg shadow-lg border-4 border-red-700">
          {/* Header */}
          <div className="flex justify-between items-center ">
            <h3 className="text-black">Delete Code: <span className='text-red-600 font-medium'>{discount.discountCode}</span></h3>
            <button className="bg-red-500 text-center"
              onClick={onClose}>
              <X size={22} />
            </button>
          </div>
        </section>

        {/* Warning Message */}
        <section className=" py-3 text-sm text-center text-gray-300 leading-relaxed shadow-md">
          <p className='flex justify-center'>
            Are you sure you want to delete{" "}
            <span className="text-xl text-red-600 font-medium self-start px-1">
              {discount.public_name}
            </span>
            ?
          </p>

          <p className="mt-2 text-red-600 font-medium">
            This action cannot be undone.
          </p>
        </section>

        <section className="flex justify-center gap-4">
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
        </div>
        
      </main>
  )
}

export default DeleteDiscountCodeModal