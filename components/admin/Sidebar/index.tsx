'use client'

import { GoBook } from 'react-icons/go'
import { IoHomeOutline } from 'react-icons/io5'
import { IoPeopleOutline } from 'react-icons/io5'
import { MdOutlineEvent } from 'react-icons/md'
import { RiFileListLine } from 'react-icons/ri'

import NavLink from '@/components/admin/Sidebar/NavLink'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export default function SideBar({ className }: { className?: string }) {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn('fixed left-0 top-0 z-30 h-screen w-16 border-r bg-white transition-all duration-300', className)}
      >
        {/* Sidebar content */}
        <div className="flex h-full flex-col gap-2 p-3">
          {/* Logo or title */}
          <div className={cn('flex h-16 items-center justify-center border-b px-2')}>
            <h1 className={cn('scale-0 text-xl font-bold text-primary transition-all')}>Admin</h1>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-2 py-4">
            <NavLink href={ROUTES.ADMIN.DASHBOARD.url} icon={<IoHomeOutline size={24} />} collapsed={true}>
              Dashboard
            </NavLink>
            <NavLink href={ROUTES.ADMIN.USER.url} icon={<IoPeopleOutline size={24} />} collapsed={true}>
              User
            </NavLink>
            <NavLink href={ROUTES.ADMIN.STUDY.url} icon={<GoBook size={24} />} collapsed={true}>
              Study
            </NavLink>
            <NavLink href={ROUTES.ADMIN.EVENTS.url} icon={<MdOutlineEvent size={24} />} collapsed={true}>
              Events
            </NavLink>
            <NavLink href={ROUTES.ADMIN.POSTS.url} icon={<RiFileListLine size={24} />} collapsed={true}>
              Posts
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Spacer div to push content */}
      <div className={cn('w-16 transition-all duration-300')} />
    </>
  )
}
