
  import React from 'react'

  const Loading = () => {
    return (
      <main className='fixed inset-0 flex flex-col justify-center items-center mx-auto'>
  
        <div className='scale-50'>  
          <section className='three-body fixed inset-0 flex items-center justify-center'>
              <div className='three-body__dot'></div>
              <div className='three-body__dot'></div>
              <div className='three-body__dot'></div>
          </section>
        </div>

        <h1 className='font-mono -my-6 text-xl bg-sidebar-primary/70'>
          Loading 
        </h1>
      </main>
    )
  }

  export default Loading