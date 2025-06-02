import { Suspense } from 'react'

import PostSidebar from './PostSidebar'

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-64 border-r bg-gray-50">Loading...</div>}>
        <PostSidebar />
      </Suspense>
      <div className="flex-1 bg-gray-100">{children}</div>
    </div>
  )
}
