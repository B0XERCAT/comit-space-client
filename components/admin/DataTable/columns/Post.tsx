'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Post } from '@/types'

import DeleteButton from '../../DeleteButton'

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'title',
    header: '제목'
  },
  {
    accessorKey: 'author.username',
    header: '작성자'
  },
  {
    accessorKey: 'groupType',
    header: '그룹 타입',
    cell: ({ row }) => {
      const type = row.getValue('groupType') as string
      return type === 'STUDY' ? '스터디' : '행사'
    }
  },
  {
    accessorKey: 'likeCount',
    header: '좋아요'
  },
  {
    accessorKey: 'comments',
    header: '댓글',
    cell: ({ row }) => {
      const comments = row.getValue('comments') as any[]
      return comments.length
    }
  },
  {
    id: 'delete',
    header: () => <p className="text-center text-sm">삭제</p>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DeleteButton id={row.original.id} type="post" />
      </div>
    )
  }
]
