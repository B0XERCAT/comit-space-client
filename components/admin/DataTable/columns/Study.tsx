'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { GoPencil } from 'react-icons/go'
import { MdContentCopy } from 'react-icons/md'

import EditableCell from '@/components/admin/DataTable/EditableCell'
import { DataTableColumnHeader } from '@/components/common/DataTable/ColumnHeader'
import rowSelect from '@/components/common/DataTable/Columns/RowSelect'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { API_ENDPOINTS } from '@/constants/apiEndpoint'
import { ROUTES } from '@/constants/routes'
import { Study } from '@/types'

import DeleteButton from '../../DeleteButton'

export const columns: ColumnDef<Study>[] = [
  {
    id: 'actions',
    cell: ({ row }) => {
      const study = row.original

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(study.id.toString())}>
                <MdContentCopy size={13} />
                &nbsp;ID 복사
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.STUDY.SIGNUP(row.original.id.toString()).url}>
                  <GoPencil size={13} />
                  &nbsp;링크
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  },
  rowSelect as ColumnDef<Study>,
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="text-center">{row.original.id}</div>
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="이름" />,
    cell: ({ row }) => <div className="text-center">{row.original.title}</div>
  },
  {
    accessorKey: 'stack',
    header: ({ column }) => <DataTableColumnHeader column={column} title="스택" />,
    cell: ({ row }) => <div className="text-center">{row.original.tags}</div>
  },
  {
    accessorKey: 'day',
    header: ({ column }) => <DataTableColumnHeader column={column} title="요일" />,
    cell: ({ row }) => <div className="text-center">{row.original.day}</div>
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="시작시간" />,
    cell: ({ row }) => <div className="text-center">{row.original.startTime}</div>
  },
  {
    accessorKey: 'endTime',
    header: ({ column }) => <DataTableColumnHeader column={column} title="종료시간" />,
    cell: ({ row }) => <div className="text-center">{row.original.endTime}</div>
  },
  {
    accessorKey: 'level',
    header: ({ column }) => <DataTableColumnHeader column={column} title="난이도" />,
    cell: ({ row }) => <div className="text-center">{row.original.level}</div>
  },
  {
    accessorKey: 'campus',
    header: ({ column }) => <DataTableColumnHeader column={column} title="캠퍼스" />,
    cell: ({ row }) => <div className="text-center">{row.original.campus}</div>
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="설명" />,
    cell: ({ row }) => <div className="text-center">{row.original.description}</div>
  },
  {
    accessorKey: 'isRecruiting',
    header: ({ column }) => <DataTableColumnHeader column={column} title="모집 여부" />,
    cell: ({ row }) => (
      <div className="text-center">
        <EditableCell
          submitApiEndpoint={API_ENDPOINTS.ADMIN.STUDY.UPDATE_ISRECRUITING(row.original.id)}
          row={row}
          fieldName="isRecruiting"
        />
      </div>
    )
  },
  {
    accessorKey: 'imageSrc',
    header: ({ column }) => <DataTableColumnHeader column={column} title="이미지" />,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <img src={row.original.imageSrc} alt={row.original.title} className="h-10 w-10" />
      </div>
    )
  },
  {
    accessorKey: 'mentor',
    header: ({ column }) => <DataTableColumnHeader column={column} title="스터디장" />,
    cell: ({ row }) => <div className="text-center">{row.original.mentor.username}</div>
  },
  {
    accessorKey: 'semester',
    header: ({ column }) => <DataTableColumnHeader column={column} title="학기" />,
    cell: ({ row }) => <div className="text-center">{row.original.semester}</div>
  },
  {
    id: 'delete',
    header: () => <p className="text-center text-sm">삭제</p>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DeleteButton id={row.original.id} type="study" />
      </div>
    )
  }
]
