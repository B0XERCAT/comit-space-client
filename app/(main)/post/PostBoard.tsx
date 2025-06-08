'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Event, Study } from '@/types'

interface Author {
  id: number
  username: string
  phoneNumber: string
  studentId: string
  email: string
  position: string
  bio: string | null
  github: string | null
  blog: string | null
  profileImage: string | null
}

interface Comment {
  id: number
  postId: number
  content: string
  author: Author
}

interface Post {
  id: number
  groupId: number
  groupType: 'STUDY' | 'EVENT'
  title: string
  content: string
  author: Author
  imageSrc: string | null
  likeCount: number
  comments: Comment[]
}

interface Group {
  id: number
  title: string
  type: 'study' | 'event'
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter()
  const session = useSession()

  const handlePostClick = () => {
    if (!session?.data?.accessToken) {
      toast({
        variant: 'destructive',
        description: '게시글을 보려면 로그인이 필요합니다.'
      })
      return
    }

    router.push(`/post/${post.id}`)
  }

  return (
    <div
      className="mb-8 cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={handlePostClick}
    >
      <div className="flex p-6">
        <div className="flex-1">
          {/* Author info */}
          <div className="mb-3 flex items-center gap-2">
            {post.author.profileImage ? (
              <Image
                src={post.author.profileImage}
                alt={post.author.username}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200" />
            )}
            <span className="font-medium">{post.author.username}</span>
            <span className="text-sm text-gray-500">· {post.author.position}</span>
          </div>

          {/* Title and content */}
          <h3 className="mb-2 text-xl font-bold">{post.title}</h3>
          <p className="mb-4 line-clamp-3 text-gray-600">{post.content}</p>

          {/* Post info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>좋아요 {post.likeCount}</span>
            <span>댓글 {post.comments.length}</span>
          </div>
        </div>

        {/* Thumbnail */}
        {post.imageSrc && (
          <div className="ml-4 flex-shrink-0">
            <Image src={post.imageSrc} alt={post.title} width={120} height={120} className="rounded-lg object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function PostBoard() {
  const [groups, setGroups] = useState<Group[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isPostsLoading, setIsPostsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')
  const selectedType = searchParams.get('groupType')
  const router = useRouter()
  const session = useSession()

  // Load groups first
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetch studies
        const studyRes = await fetchData(API_ENDPOINTS.CLIENT.STUDY.LIST as ApiEndpoint)
        if (!studyRes.ok) {
          throw new Error('스터디 목록을 불러오는 중 오류가 발생했습니다.')
        }
        const studyJson: CustomResponse = await studyRes.json()
        const studies: Study[] = studyJson.data
        const studyGroups: Group[] = studies.map((study) => ({
          id: study.id,
          title: study.title,
          type: 'study'
        }))

        // Fetch events
        const eventRes = await fetchData(API_ENDPOINTS.CLIENT.EVENT.LIST as ApiEndpoint)
        if (!eventRes.ok) {
          throw new Error('이벤트 목록을 불러오는 중 오류가 발생했습니다.')
        }
        const eventJson: CustomResponse = await eventRes.json()
        const events: Event[] = eventJson.data
        const eventGroups: Group[] = events.map((event) => ({
          id: event.id,
          title: event.title,
          type: 'event'
        }))

        // Combine and set groups
        const allGroups = [...studyGroups, ...eventGroups]

        if (allGroups.length === 0) {
          setError('현재 등록된 스터디나 이벤트가 없습니다.')
        } else {
          setGroups(allGroups)
          // If no item is selected, redirect to the first item
          if (!selectedId && !selectedType) {
            const firstGroup = allGroups[0]
            router.push(`/post?id=${firstGroup.id}&groupType=${firstGroup.type}`)
          }
        }
      } catch (error) {
        console.error('Error fetching groups:', error)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      }
    }

    fetchGroups()
  }, []) // Only run once on mount

  // Load posts when selection changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedType || !selectedId) return

      try {
        setIsPostsLoading(true)
        const groupType = selectedType.toUpperCase() as 'STUDY' | 'EVENT'
        const res = await fetchData(API_ENDPOINTS.CLIENT.POST.LIST(groupType))

        if (!res.ok) {
          throw new Error('게시글을 불러오는 중 오류가 발생했습니다.')
        }
        const json: CustomResponse = await res.json()
        const allPosts: Post[] = json.data
        // Filter posts by selected group
        setPosts(allPosts.filter((post) => post.groupId.toString() === selectedId))
      } catch (error) {
        console.error('Error fetching posts:', error)
        setError('게시글을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsPostsLoading(false)
      }
    }

    fetchPosts()
  }, [selectedId, selectedType])

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {selectedId && selectedType ? (
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{groups.find((g) => g.id.toString() === selectedId)?.title}</h1>
            <Button
              onClick={async () => {
                if (!session?.data?.accessToken) {
                  toast({
                    variant: 'destructive',
                    description: '게시글을 작성하려면 로그인이 필요합니다.'
                  })
                  return
                }

                if (selectedType === 'study') {
                  try {
                    const res = await fetchData(
                      API_ENDPOINTS.CLIENT.STUDY.IS_JOINED(Number(selectedId)) as ApiEndpoint,
                      {
                        headers: {
                          Authorization: `Bearer ${session.data.accessToken}`
                        }
                      }
                    )

                    if (!res.ok) {
                      throw new Error('스터디 참여 여부를 확인하는데 실패했습니다.')
                    }

                    const json = await res.json()
                    if (!json.data) {
                      toast({
                        variant: 'destructive',
                        description: '스터디에 참여하지 않아 게시글을 작성할 수 없습니다.'
                      })
                      return
                    }
                  } catch (error) {
                    console.error('Failed to check study membership:', error)
                    toast({
                      variant: 'destructive',
                      description: '스터디 참여 여부를 확인하는데 실패했습니다.'
                    })
                    return
                  }
                }

                router.push(`/post/create?id=${selectedId}&groupType=${selectedType}`)
              }}
            >
              게시글 작성
            </Button>
          </div>
          <div className="space-y-4">
            {isPostsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center text-gray-500">아직 작성된 게시글이 없습니다.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">게시판을 선택해주세요</div>
      )}
    </div>
  )
}
