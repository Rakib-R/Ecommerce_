
import React from 'react'
import Link from 'next/link';

const page = () => {
  return (
    <main className='m-16'>
      <div className='text-2xl font-semibold w-1/2 tracking-wider'>
        Seller Page
      </div>
      <div className='w-1/2 ml-12 mt-4'>
         <p>
          Dashboard: <Link className='underline font-light text-blue-600' href={'/dashboard'}>/dashboard</Link>
        </p> <p>
          login: <Link className='underline font-light text-blue-600' href={'/seller-login'}>/seller-login</Link>
        </p> <p>
          signup: <Link className='underline font-light text-blue-600' href={'/seller-signup'}>/seller-signup</Link>
        </p> <p>
        </p>
      </div>
    </main>
  )
}

export default page