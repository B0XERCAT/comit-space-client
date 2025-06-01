import PostSidebar from './PostSidebar'

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <PostSidebar />
      <div className="flex-1 bg-gray-100">{children}</div>
    </div>
  )
}
