'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  icon: ReactNode
  children: ReactNode
  className?: string
  onClick?: () => void
  collapsed?: boolean
}

export default function NavLink({ href, icon, children, className, onClick, collapsed }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-lg py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-primary',
        isActive && 'bg-gray-100 text-primary',
        collapsed && 'justify-center',
        className
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={cn('transition-all', collapsed ? 'w-0 scale-0 opacity-0' : 'w-auto scale-100 opacity-100')}>
        {children}
      </span>
    </Link>
  )
}
