'use client'

import { useEffect, useState } from 'react'
import { FaSchoolFlag } from 'react-icons/fa6'
import { IoPersonSharp } from 'react-icons/io5'
import { MdOutlineSignalCellularAlt } from 'react-icons/md'
import { RiStackOverflowLine } from 'react-icons/ri'

import StudyCard from '@/components/common/StudyCard'
import UserHoverCard from '@/components/common/User/HoverCard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Study } from '@/types'

const StudyList = () => {
  const [studies, setStudies] = useState<Study[]>([])
  const [isJoinedMap, setIsJoinedMap] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const session = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const loadStudies = async () => {
      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.LIST as ApiEndpoint)
        if (!res.ok) {
          throw new Error('스터디 목록을 불러오는 중 오류가 발생했습니다.')
        }

        const json: CustomResponse = await res.json()
        const studiesData: Study[] = json.data ?? []
        setStudies(studiesData)

        // Check join status for each study if user is logged in
        if (session?.data?.accessToken) {
          const joinStatusMap: Record<number, boolean> = {}
          await Promise.all(
            studiesData.map(async (study) => {
              try {
                const joinRes = await fetchData(API_ENDPOINTS.CLIENT.STUDY.IS_JOINED(study.id) as ApiEndpoint, {
                  headers: {
                    Authorization: `Bearer ${session.data.accessToken}`
                  }
                })
                if (joinRes.ok) {
                  const joinJson = await joinRes.json()
                  joinStatusMap[study.id] = joinJson.data
                }
              } catch (error) {
                console.error(`Failed to check join status for study ${study.id}:`, error)
              }
            })
          )
          setIsJoinedMap(joinStatusMap)
        }
      } catch (error) {
        console.error('Failed to load studies:', error)
        toast({
          variant: 'destructive',
          description: '스터디 목록을 불러오는데 실패했습니다.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStudies()
  }, [session])

  const handleJoinStudy = async (studyId: number) => {
    if (!session?.data?.accessToken) {
      toast({
        variant: 'destructive',
        description: '스터디에 참여하려면 로그인이 필요합니다.'
      })
      return
    }

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.JOIN(studyId) as ApiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('스터디 참여에 실패했습니다.')
      }

      setIsJoinedMap((prev) => ({ ...prev, [studyId]: true }))
      toast({
        description: '스터디 참여가 완료되었습니다.'
      })
    } catch (error) {
      console.error('Failed to join study:', error)
      toast({
        variant: 'destructive',
        description: '스터디 참여에 실패했습니다.'
      })
    }
  }

  const handleLeaveStudy = async (studyId: number) => {
    if (!session?.data?.accessToken) return

    try {
      const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.LEAVE(studyId) as ApiEndpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        throw new Error('스터디 참여 취소에 실패했습니다.')
      }

      setIsJoinedMap((prev) => ({ ...prev, [studyId]: false }))
      toast({
        description: '스터디 참여가 취소되었습니다.'
      })
    } catch (error) {
      console.error('Failed to leave study:', error)
      toast({
        variant: 'destructive',
        description: '스터디 참여 취소에 실패했습니다.'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!studies || studies.length === 0) {
    return (
      <div className="flex justify-center">
        <p className="text-lg text-gray-500">개설된 스터디가 없습니다!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-20 grid grid-cols-2 gap-3 max-sm:px-2 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-14">
        {studies.map((study) => (
          <Dialog key={study.id}>
            <DialogTrigger className="flex justify-center">
              <StudyCard
                study={study}
                imageSize={144}
                showStatus={true}
                imageWrapperClassName="mb-8 mt-4 h-24 w-24 overflow-hidden sm:h-36 sm:w-36"
              />
            </DialogTrigger>
            <DialogContent className="w-[324px] rounded-xl p-6 sm:w-[480px] sm:p-8">
              <DialogTitle className="break-words text-2xl font-bold">{study.title}</DialogTitle>
              {!study.day ? null : !study.startTime || !study.endTime ? (
                <div className="flex gap-3 break-words text-lg text-gray-600">
                  {study.day}요일 <span className="text-base text-red-500">(시간 미정)</span>
                </div>
              ) : (
                <div className="break-words text-lg text-gray-600">
                  {study.day} {study.startTime.substring(0, 5)} ~ {study.endTime.substring(0, 5)}
                </div>
              )}
              <div className="leading-snug">
                <div className="flex gap-6">
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
                <div className="mb-4 mt-1 flex items-center gap-2 break-words">
                  <RiStackOverflowLine />
                  {study.tags?.join(', ') || '태그 없음'}
                </div>
                <DialogDescription className="whitespace-pre-line break-keep">{study.description}</DialogDescription>
                {study.isRecruiting && session?.data?.accessToken && (
                  <div className="mt-6 flex justify-end">
                    {isJoinedMap[study.id] ? (
                      <Button variant="outline" onClick={() => handleLeaveStudy(study.id)}>
                        참여 취소
                      </Button>
                    ) : (
                      <Button onClick={() => handleJoinStudy(study.id)}>참여하기</Button>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

export default StudyList
