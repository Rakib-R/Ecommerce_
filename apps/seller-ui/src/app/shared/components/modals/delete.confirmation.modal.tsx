
import React from 'react';
import { X } from 'lucide-react';

const DeleteConfirmationModal = ({ product, onClose, onConfirm, onRestore }: any) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg w-full max-w-[450px] shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
          <h3 className="text-xl font-bold text-white">
            {product?.isDeleted ? "Restore Product" : "Delete Product"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="text-gray-300">
          <p className='text-md'>
            Are you sure you want to {product?.isDeleted ? "restore" : "delete"}{" "}
            <span className="font-semibold text-white">"{product?.title}"</span>?
          </p>
          
          {!product?.isDeleted && (
            <p className="mt-3 text-sm text-gray-400">
              This product will be moved to a <span className="text-yellow-500 italic">trash state</span> and permanently 
              removed <span className="font-bold">after 24 hours</span>. You can recover it within this time.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-transparent border border-zinc-700 text-gray-300 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          
          <button
            onClick={product?.isDeleted ? onRestore : onConfirm}
            className={`px-4 py-2 rounded-md text-white font-semibold transition ${
              product?.isDeleted 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {product?.isDeleted ? "Restore" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;