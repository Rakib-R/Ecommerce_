
import { queryClient } from 'apps/utils/queryClient';
import React from 'react'

const page = () => {
  
   queryClient.setQueryData(['user'], null); // clears RQ cache

  return (
    <div>DashBoard default page
      
    </div>
  )
}

export default page