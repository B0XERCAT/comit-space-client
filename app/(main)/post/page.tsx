'use client'

import { Suspense } from 'react'

import PostBoard from './PostBoard'

export default function PostPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <PostBoard />
    </Suspense>
  )
}
