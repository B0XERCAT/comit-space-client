'use client'

import MDEditor from '@uiw/react-md-editor'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import CommentForm from '@/components/post/CommentForm'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Post } from '@/types'

export default function PostDetail() {
  const params = useParams()
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchPost = async () => {
    if (!session?.data?.accessToken) {
      toast({
        variant: 'destructive',
        description: '게시글을 보려면 로그인이 필요합니다.'
      })
      return
    }

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.POST.RETRIEVE(Number(params.id)) as ApiEndpoint, {
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다.')
      }

      const json: CustomResponse = await res.json()
      setPost(json.data)
    } catch (error) {
      console.error('Failed to load post:', error)
      toast({
        variant: 'destructive',
        description: '게시글을 불러오는데 실패했습니다.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: number, authorId: number) => {
    if (!session?.data?.accessToken) {
      toast({
        variant: 'destructive',
        description: '댓글을 삭제하려면 로그인이 필요합니다.'
      })
      return
    }

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.POST.COMMENT.DELETE(commentId) as ApiEndpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('댓글 삭제에 실패했습니다.')
      }

      fetchPost()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast({
        variant: 'destructive',
        description: '댓글 삭제에 실패했습니다.'
      })
    }
  }

  const handleDelete = async () => {
    if (!session?.data?.accessToken || !post) return

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.POST.DELETE(post.id) as ApiEndpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('게시글 삭제에 실패했습니다.')
      }

      toast({
        title: '게시글이 삭제되었습니다.',
        variant: 'default'
      })

      // Redirect to the post list page
      router.push(`/post?id=${post.groupId}&groupType=${post.groupType.toLowerCase()}`)
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast({
        variant: 'destructive',
        description: '게시글 삭제에 실패했습니다.'
      })
    }
  }

  useEffect(() => {
    fetchPost()
  }, [params.id, session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">게시글을 찾을 수 없습니다.</div>
      </div>
    )
  }

  const isAuthor = session?.data?.username === post.author.username

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        {/* Author info and actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.author.profileImage ? (
              <Image
                src={post.author.profileImage}
                alt={post.author.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200" />
            )}
            <div>
              <div className="font-medium">{post.author.username}</div>
              <div className="text-sm text-gray-500">{post.author.position}</div>
            </div>
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/post/${post.id}/edit`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>수정하기</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>삭제하기</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post content */}
        <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
        {post.imageSrc && (
          <div className="mb-6">
            <Image src={post.imageSrc} alt={post.title} width={800} height={400} className="rounded-lg object-cover" />
          </div>
        )}
        <div data-color-mode="light" className="mb-8">
          <MDEditor.Markdown source={post.content} />
        </div>

        {/* Post info */}
        <div className="mb-8 flex items-center gap-4 text-sm text-gray-500">
          <span>좋아요 {post.likeCount}</span>
          <span>댓글 {post.comments.length}</span>
        </div>

        {/* Comments section */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">댓글</h2>

          {/* Comment form */}
          <CommentForm postId={post.id} onCommentAdded={fetchPost} />

          {/* Comment list */}
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {comment.author.profileImage ? (
                      <Image
                        src={comment.author.profileImage}
                        alt={comment.author.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                    )}
                    <span className="font-medium">{comment.author.username}</span>
                    <span className="text-sm text-gray-500">· {comment.author.position}</span>
                  </div>
                  {session?.data?.username === comment.author.username && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteComment(comment.id, comment.author.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
            {post.comments.length === 0 && (
              <div className="text-center text-gray-500">아직 작성된 댓글이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Delete confirmation dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
