'use client'

import { useState } from 'react'
import { GoBook } from 'react-icons/go'
import { IoHomeOutline } from 'react-icons/io5'
import { IoPeopleOutline } from 'react-icons/io5'
import { LiaAngleDoubleLeftSolid, LiaAngleDoubleRightSolid } from 'react-icons/lia'

import NavLink from '@/components/admin/Sidebar/NavLink'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export default function SideBar({ className }: { className?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen border-r bg-white transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md"
        >
          {isCollapsed ? <LiaAngleDoubleRightSolid size={16} /> : <LiaAngleDoubleLeftSolid size={16} />}
        </button>

        {/* Sidebar content */}
        <div className="flex h-full flex-col gap-2 p-3">
          {/* Logo or title */}
          <div className={cn('flex h-16 items-center justify-center border-b', isCollapsed ? 'px-2' : 'px-4')}>
            <h1 className={cn('text-xl font-bold text-primary transition-all', isCollapsed ? 'scale-0' : 'scale-100')}>
              Admin
            </h1>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-2 py-4">
            <NavLink href={ROUTES.ADMIN.DASHBOARD.url} icon={<IoHomeOutline size={24} />} collapsed={isCollapsed}>
              Dashboard
            </NavLink>
            <NavLink href={ROUTES.ADMIN.STUDY.url} icon={<GoBook size={24} />} collapsed={isCollapsed}>
              Study
            </NavLink>
            <NavLink href={ROUTES.ADMIN.USER.url} icon={<IoPeopleOutline size={24} />} collapsed={isCollapsed}>
              User
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Spacer div to push content */}
      <div className={cn('transition-all duration-300', isCollapsed ? 'w-16' : 'w-64')} />
    </>
  )
}
