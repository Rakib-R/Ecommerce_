
import React from 'react'

const Loading = () => {
  return (
    <main className='relative h-96 flex items-center'>
     <h1 className='mx-auto my-0 p-4 text-xl max-w-content bg-sidebar-primary/70 backdrop-blur-lg border-2 text-white'>
          Loading 
         <span className='font-planet mx-2'>S
        <span className="bg-gradient-to-r from-white from-20% via-blue-500 
           via-50% to-purple-600 bg-clip-text text-transparent">
                </span>hop</span>
      </h1>
     <section className='three-body fixed inset-0 items-center justify-center'>
        <div className='three-body__dot'></div>
        <div className='three-body__dot'></div>
        <div className='three-body__dot'></div>
     </section>
    </main>
  )
}

export default Loading