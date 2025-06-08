'use client'

import '@uiw/react-markdown-preview/markdown.css'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaSchoolFlag } from 'react-icons/fa6'
import { IoPersonSharp } from 'react-icons/io5'
import { MdOutlineSignalCellularAlt } from 'react-icons/md'
import { RiStackOverflowLine } from 'react-icons/ri'

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false })

import { HttpStatusCode } from '@/app/api/utils/httpConsts'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import UserHoverCard from '@/components/common/User/HoverCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { Study, User } from '@/types'

interface StudyDetailProps {
  params: {
    id: number
  }
}

interface Member extends User {
  joinState: 'Accept' | 'Wait' | 'Reject'
}

export default function StudyDetailPage({ params }: StudyDetailProps) {
  const session = useSession()
  const router = useRouter()
  const { id } = params
  const { toast } = useToast()

  const [study, setStudy] = useState<Study>()
  const [acceptedMembers, setAcceptedMembers] = useState<Member[]>([])
  const [waitingMembers, setWaitingMembers] = useState<Member[]>([])

  useEffect(() => {
    if (!session || session.error) return

    const loadStudy = async () => {
      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.RETRIEVE(id), {
          cache: 'no-cache'
        })
        if (!res.ok) {
          switch (res.status) {
            case HttpStatusCode.NotFound:
              router.push(ROUTES.STUDY.index.url)
              return
            default:
              throw new Error('스터디 정보를 불러오는 중 오류가 발생했습니다.')
          }
        }
        const json = await res.json()
        setStudy(json.data)
      } catch (error) {
        toast({
          title: '스터디 정보 불러오기 실패',
          description: '스터디 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive'
        })
      }
    }

    const loadMembers = async () => {
      try {
        const [acceptRes, waitRes] = await Promise.all([
          fetchData(API_ENDPOINTS.CLIENT.STUDY.MEMBERS(id, 'Accept') as ApiEndpoint, {
            headers: {
              Authorization: `Bearer ${session.data.accessToken}`
            }
          }),
          fetchData(API_ENDPOINTS.CLIENT.STUDY.MEMBERS(id, 'Wait') as ApiEndpoint, {
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
      } catch (error) {
        console.error('Failed to load members:', error)
      }
    }

    loadStudy()
    loadMembers()
  }, [id, session, router, toast])

  const handleMemberStateUpdate = async (userId: number, state: 'Accept' | 'Reject') => {
    if (!session?.data?.accessToken) return

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.UPDATE_MEMBER_STATE(id, userId) as ApiEndpoint, {
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
      }

      toast({
        description: state === 'Accept' ? '스터디 참여가 승인되었습니다.' : '스터디 참여가 거절되었습니다.'
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

  if (!study) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{study.title}</h1>
        <Button onClick={() => router.push(`/mystudy/${id}/edit`)}>스터디 수정</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>스터디 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Basic Info */}
            <div className="flex items-start gap-6">
              <Image
                src={study.imageSrc || '/empty-300x240.jpg'}
                alt={study.title}
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <IoPersonSharp />
                    <UserHoverCard user={study.mentor} />
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineSignalCellularAlt />
                    {study.level}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaSchoolFlag />
                    {study.campus}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RiStackOverflowLine />
                  {study.tags?.join(', ') || '태그 없음'}
                </div>
                <div>
                  {!study.day ? null : !study.startTime || !study.endTime ? (
                    <div className="flex gap-3 text-lg text-gray-600">
                      {study.day}요일 <span className="text-base text-red-500">(시간 미정)</span>
                    </div>
                  ) : (
                    <div className="text-lg text-gray-600">
                      {study.day} {study.startTime.substring(0, 5)} ~ {study.endTime.substring(0, 5)}
                    </div>
                  )}
                </div>
                <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {study.isRecruiting ? '모집 중' : '모집 마감'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <div data-color-mode="light">
                <MarkdownPreview source={study.description} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>멤버 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="accepted">
            <TabsList>
              <TabsTrigger value="accepted">참여 중인 멤버 ({acceptedMembers.length})</TabsTrigger>
              <TabsTrigger value="waiting">대기 중인 멤버 ({waitingMembers.length})</TabsTrigger>
            </TabsList>
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
                {acceptedMembers.length === 0 && (
                  <p className="text-center text-gray-500">참여 중인 멤버가 없습니다.</p>
                )}
              </div>
            </TabsContent>
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
                    <div className="flex gap-2">
                      <Button onClick={() => handleMemberStateUpdate(member.id, 'Accept')}>승인</Button>
                      <Button variant="outline" onClick={() => handleMemberStateUpdate(member.id, 'Reject')}>
                        거절
                      </Button>
                    </div>
                  </div>
                ))}
                {waitingMembers.length === 0 && <p className="text-center text-gray-500">대기 중인 멤버가 없습니다.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
