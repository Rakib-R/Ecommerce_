
import React from 'react'
import Login from '../../forms/loginForm'

const page = () => {
  return (
    <main className="relative bg-gray-200">
    
    <div className="absolute top-24 left-4 w-1/4 h-20 p-2 text-lg font-mono z-50 bg-amber-500 text-black  rounded-lg shadow-lg animate-bounce">
      🔐 Demo Access: <span className="font-bold">admin@email.com</span> / <span className="font-bold">admin</span>
    </div>

      <h1 className="text-4xl mb-8 font-Poppins font-semibold text-black text-center">
        {/* Ecommerce_ */}
      </h1>

      <Login />
    </main>
  )
}

export default page