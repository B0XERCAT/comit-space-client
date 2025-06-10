'use client'

import { ColumnDef } from '@tanstack/react-table'

import { Post } from '@/types'

import DeleteButton from '../../DeleteButton'

function CommentSection({ comments }: { comments: Post['comments'] }) {
  return (
    <div className="mt-4 space-y-3 border-t pt-4" onClick={(e) => e.stopPropagation()}>
      <div className="text-sm font-medium text-gray-500">댓글 {comments.length}개</div>
      <div className="space-y-1">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <span className="text-sm font-medium">{comment.author.username}</span>
              <div className="text-sm text-gray-700">{comment.content}</div>
            </div>
            <DeleteButton id={comment.id} type="comment" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 70
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => {
      const post = row.original
      return (
        <div className="cursor-pointer space-y-2 py-2" onClick={() => row.toggleExpanded()}>
          <div className="font-medium">{post.title}</div>
          {row.getIsExpanded() && <CommentSection comments={post.comments} />}
        </div>
      )
    }
  },
  {
    accessorKey: 'author.username',
    header: '작성자',
    size: 100,
    cell: ({ row }) => {
      const author = row.original.author
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{author.username}</div>
          <div className="text-xs text-gray-500">{author.position}</div>
        </div>
      )
    }
  },
  {
    accessorKey: 'groupType',
    header: '그룹 타입',
    size: 100,
    cell: ({ row }) => {
      const type = row.getValue('groupType') as string
      return (
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
          {type === 'STUDY' ? '스터디' : '행사'}
        </span>
      )
    }
  },
  {
    accessorKey: 'likeCount',
    header: '좋아요',
    size: 80
  },
  {
    accessorKey: 'comments',
    header: '댓글',
    size: 80,
    cell: ({ row }) => {
      const comments = row.getValue('comments') as Post['comments']
      return comments.length
    }
  },
  {
    id: 'delete',
    header: () => <p className="text-center text-sm">삭제</p>,
    size: 70,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DeleteButton id={row.original.id} type="post" />
      </div>
    )
  }
]
