'use client'

import '@uiw/react-markdown-preview/markdown.css'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false })

import { HttpStatusCode } from '@/app/api/utils/httpConsts'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { Event, User } from '@/types'

interface Member extends User {
  joinState: 'Accept' | 'Wait' | 'Reject'
}

interface EventDetailProps {
  params: {
    id: number
  }
}

export default function EventDetailPage({ params }: EventDetailProps) {
  const session = useSession()
  const router = useRouter()
  const { id } = params
  const { toast } = useToast()

  const [event, setEvent] = useState<Event>()
  const [acceptedMembers, setAcceptedMembers] = useState<Member[]>([])
  const [waitingMembers, setWaitingMembers] = useState<Member[]>([])
  const [rejectedMembers, setRejectedMembers] = useState<Member[]>([])
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    const fetchStaffStatus = async () => {
      if (!session?.data?.accessToken) return

      try {
        const staffRes = await fetchData(API_ENDPOINTS.CLIENT.STAFF_LIST as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          }
        })

        if (staffRes.ok) {
          const staffJson = await staffRes.json()
          const staffList: User[] = staffJson.data
          setIsStaff(staffList.some((staff) => staff.username === session.data.username))
        }
      } catch (error) {
        console.error('Failed to fetch staff status:', error)
      }
    }

    const loadEvent = async () => {
      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.RETRIEVE(id), {
          cache: 'no-cache'
        })
        if (!res.ok) {
          switch (res.status) {
            case HttpStatusCode.NotFound:
              router.push(ROUTES.EVENT.index.url)
              return
            default:
              throw new Error('행사 정보를 불러오는 중 오류가 발생했습니다.')
          }
        }
        const json = await res.json()
        setEvent(json.data)
      } catch (error) {
        toast({
          title: '행사 정보 불러오기 실패',
          description: '행사 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive'
        })
      }
    }

    const loadMembers = async () => {
      if (!session?.data?.accessToken) return

      try {
        const [acceptRes, waitRes, rejectRes] = await Promise.all([
          fetchData(API_ENDPOINTS.CLIENT.EVENT.MEMBERS(id, 'Accept') as ApiEndpoint, {
            headers: {
              Authorization: `Bearer ${session.data.accessToken}`
            }
          }),
          fetchData(API_ENDPOINTS.CLIENT.EVENT.MEMBERS(id, 'Wait') as ApiEndpoint, {
            headers: {
              Authorization: `Bearer ${session.data.accessToken}`
            }
          }),
          fetchData(API_ENDPOINTS.CLIENT.EVENT.MEMBERS(id, 'Reject') as ApiEndpoint, {
            headers: {
              Authorization: `Bearer ${session.data.accessToken}`
            }
          })
        ])

        if (acceptRes.ok) {
          const json = await acceptRes.json()
          setAcceptedMembers(json.data)
        }

        if (waitRes.ok) {
          const json = await waitRes.json()
          setWaitingMembers(json.data)
        }

        if (rejectRes.ok) {
          const json = await rejectRes.json()
          setRejectedMembers(json.data)
        }
      } catch (error) {
        console.error('Failed to load members:', error)
      }
    }

    fetchStaffStatus()
    loadEvent()
    loadMembers()
  }, [id, session, router, toast])

  const handleMemberStateUpdate = async (userId: number, state: 'Accept' | 'Reject') => {
    if (!session?.data?.accessToken) return

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.UPDATE_MEMBER_STATE(id, userId) as ApiEndpoint, {
        method: 'PATCH',
        body: JSON.stringify({ joinState: state }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('멤버 상태 업데이트에 실패했습니다.')
      }

      // Update local state
      if (state === 'Accept') {
        const member = waitingMembers.find((m) => m.id === userId)
        if (member) {
          setWaitingMembers(waitingMembers.filter((m) => m.id !== userId))
          setAcceptedMembers([...acceptedMembers, { ...member, joinState: 'Accept' }])
        }
      } else {
        setWaitingMembers(waitingMembers.filter((m) => m.id !== userId))
        const member = waitingMembers.find((m) => m.id === userId)
        if (member) {
          setRejectedMembers([...rejectedMembers, { ...member, joinState: 'Reject' }])
        }
      }

      toast({
        description: state === 'Accept' ? '행사 참여가 승인되었습니다.' : '행사 참여가 거절되었습니다.'
      })
    } catch (error) {
      console.error('Failed to update member state:', error)
      toast({
        variant: 'destructive',
        description: '멤버 상태 업데이트에 실패했습니다.'
      })
    }
  }

  // 세션이 로드되기 전까지는 로딩 상태 표시
  if (session === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // 세션 에러가 있을 때만 로그인 페이지로 리다이렉트
  if (session.error) {
    router.push(ROUTES.LOGIN.url)
    return null
  }

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4">
                {event.imageSrc && (
                  <Image
                    src={event.imageSrc}
                    alt={event.title}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">장소:</span>
                    <span className="text-sm text-gray-500">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">일시:</span>
                    <span className="text-sm text-gray-500">
                      {event.startDate} ~ {event.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">시간:</span>
                    <span className="text-sm text-gray-500">
                      {event.startTime} ~ {event.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">학기:</span>
                    <span className="text-sm text-gray-500">
                      {event.year}년 {event.semester}
                    </span>
                  </div>
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <MarkdownPreview source={event.description} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle>참여자 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="waiting" className="w-full">
              <TabsList>
                <TabsTrigger value="waiting">대기 ({waitingMembers.length})</TabsTrigger>
                <TabsTrigger value="accepted">승인 ({acceptedMembers.length})</TabsTrigger>
                <TabsTrigger value="rejected">거절 ({rejectedMembers.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="waiting" className="mt-4">
                <div className="space-y-4">
                  {waitingMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        {member.profileImage && (
                          <Image
                            src={member.profileImage}
                            alt={member.username}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-sm text-gray-500">{member.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleMemberStateUpdate(member.id, 'Accept')}>승인</Button>
                        <Button variant="outline" onClick={() => handleMemberStateUpdate(member.id, 'Reject')}>
                          거절
                        </Button>
                      </div>
                    </div>
                  ))}
                  {waitingMembers.length === 0 && (
                    <p className="text-center text-gray-500">대기 중인 멤버가 없습니다.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="accepted" className="mt-4">
                <div className="space-y-4">
                  {acceptedMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        {member.profileImage && (
                          <Image
                            src={member.profileImage}
                            alt={member.username}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-sm text-gray-500">{member.position}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {acceptedMembers.length === 0 && <p className="text-center text-gray-500">승인된 멤버가 없습니다.</p>}
                </div>
              </TabsContent>

              <TabsContent value="rejected" className="mt-4">
                <div className="space-y-4">
                  {rejectedMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        {member.profileImage && (
                          <Image
                            src={member.profileImage}
                            alt={member.username}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-sm text-gray-500">{member.position}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {rejectedMembers.length === 0 && <p className="text-center text-gray-500">거절된 멤버가 없습니다.</p>}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
