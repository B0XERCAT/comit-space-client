'use client'

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

const userCheckedColumns = ['delete', 'id', 'username', 'isStaff', 'phoneNumber', 'position', 'role', 'studentId']
const studyCheckedColums = ['delete', 'id', 'title', 'mentor', 'level', 'campus', 'semester', 'isRecruiting']
const eventCheckedColumns = ['delete', 'id', 'title', 'location', 'startDate', 'endDate', 'semester', 'isRecruiting']
const postCheckedColumns = ['delete', 'id', 'title']

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const pathname = usePathname()
  const defaultCheckedColumns = pathname.includes('users')
    ? userCheckedColumns
    : pathname.includes('events')
      ? eventCheckedColumns
      : pathname.includes('posts')
        ? postCheckedColumns
        : studyCheckedColums
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultCheckedColumns)

  useEffect(() => {
    const defaultCheckedColumns = pathname.includes('users')
      ? userCheckedColumns
      : pathname.includes('events')
        ? eventCheckedColumns
        : pathname.includes('posts')
          ? postCheckedColumns
          : studyCheckedColums
    setVisibleColumns(defaultCheckedColumns)

    table.getAllColumns().forEach((column) => {
      if (defaultCheckedColumns.includes(column.id)) {
        column.toggleVisibility(true)
      } else {
        column.toggleVisibility(false)
      }
    })
  }, [table, pathname])

  const handleCheckedChange = (columnId: string, isChecked: boolean) => {
    setVisibleColumns((prev) => {
      if (isChecked) {
        return [...prev, columnId]
      } else {
        return prev.filter((id) => id !== columnId)
      }
    })

    const column = table.getColumn(columnId)
    if (column) {
      column.toggleVisibility(isChecked)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden h-8 lg:flex">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={visibleColumns.includes(column.id)}
                onCheckedChange={(value) => handleCheckedChange(column.id, value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
