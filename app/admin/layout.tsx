import Header from '@/components/admin/Header'
import SideBar from '@/components/admin/Sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerHeight = '5rem'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - fixed at top */}
      <div className="fixed left-0 right-0 top-0 z-40">
        <Header height={headerHeight} />
      </div>

      {/* Main layout with sidebar and content */}
      <div className="flex min-h-screen">
        {/* Sidebar component handles both the fixed sidebar and the spacer */}
        <SideBar />

        {/* Main content area - starts below header */}
        <div className="flex-1">
          <main className="px-8 py-6" style={{ paddingTop: `calc(${headerHeight} + 1.5rem)` }}>
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
