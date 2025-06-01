'use client'

import { Suspense } from 'react'

import PostBoard from './PostBoard'

export default function PostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen">
          <div className="w-64 border-r bg-gray-50" />
          <div className="flex-1 bg-gray-100 p-8">
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          </div>
        </div>
      }
    >
      <PostBoard />
    </Suspense>
  )
}
