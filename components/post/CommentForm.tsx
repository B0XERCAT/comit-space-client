'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'

interface CommentFormProps {
  postId: number
  onCommentAdded: () => void
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const session = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.data?.accessToken) {
      toast({
        variant: 'destructive',
        description: '댓글을 작성하려면 로그인이 필요합니다.'
      })
      return
    }

    if (!content.trim()) {
      toast({
        variant: 'destructive',
        description: '댓글 내용을 입력해주세요.'
      })
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetchData(API_ENDPOINTS.CLIENT.POST.COMMENT.CREATE(postId) as ApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.accessToken}`
        },
        body: JSON.stringify({ content })
      })

      if (!res.ok) {
        throw new Error('댓글 작성에 실패했습니다.')
      }

      // 입력 필드 초기화
      setContent('')
      // 부모 컴포넌트에 댓글이 추가되었음을 알림
      onCommentAdded()
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast({
        variant: 'destructive',
        description: '댓글 작성 중 오류가 발생했습니다.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <Textarea
        placeholder="댓글을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '작성 중...' : '댓글 작성'}
        </Button>
      </div>
    </form>
  )
}
