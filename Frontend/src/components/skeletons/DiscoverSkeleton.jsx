import React from 'react'
import PostSkeleton from './PostSkeleton'

function DiscoverSkeleton() {
  return (
    <div className='h-full w-full flex flex-col gap-y-5 items-center justify-center'>
      <PostSkeleton/>
      <PostSkeleton/>
      <PostSkeleton/>
    </div>
  )
}

export default DiscoverSkeleton