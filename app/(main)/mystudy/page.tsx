'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

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
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Study } from '@/types'

interface StudyWithState {
  study: Study
  state: 'Accept' | 'Wait' | 'Reject'
}

export default function MyStudy() {
  const session = useSession()
  const [activeTab, setActiveTab] = useState<'joined' | 'created'>('joined')
  const [joinedStudies, setJoinedStudies] = useState<StudyWithState[]>([])
  const [createdStudies, setCreatedStudies] = useState<Study[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStudies = async () => {
      if (!session?.data?.accessToken) {
        return
      }

      try {
        // Fetch created studies
        const createdStudiesRes = await fetchData(API_ENDPOINTS.CLIENT.PROFILE.CREATED_STUDY as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          },
          credentials: 'include',
          cache: 'no-cache'
        })
        if (!createdStudiesRes.ok) {
          throw new Error('스터디 정보를 불러오는 중 오류가 발생했습니다.')
        }

        const createdStudiesJson: CustomResponse = await createdStudiesRes.json()
        setCreatedStudies(createdStudiesJson.data)

        // Fetch joined studies
        const joinedStudiesRes = await fetchData(API_ENDPOINTS.CLIENT.PROFILE.JOINED_STUDY as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          },
          credentials: 'include',
          cache: 'no-cache'
        })
        if (!joinedStudiesRes.ok) {
          throw new Error('스터디 정보를 불러오는 중 오류가 발생했습니다.')
        }

        const joinedStudiesJson: CustomResponse = await joinedStudiesRes.json()
        setJoinedStudies(joinedStudiesJson.data)
      } catch (error) {
        console.error('Failed to fetch studies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudies()
  }, [session])

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
        throw new Error('스터디를 목록에서 삭제에 실패했습니다.')
      }

      // Remove the study from joinedStudies
      setJoinedStudies((prev) => prev.filter((study) => study.study.id !== studyId))

      toast({
        description: '스터디를 목록에서 삭제했습니다.'
      })
    } catch (error) {
      console.error('Failed to delete study:', error)
      toast({
        variant: 'destructive',
        description: '스터디를 목록에서 삭제에 실패했습니다.'
      })
    }
  }

  const StudyContent = ({ study, state, type }: { study: Study; state: string | null; type: 'joined' | 'created' }) => (
    <div className="border-b-solid flex border-b border-b-[#dee2e6] px-0 py-[18px] sm:px-4">
      <div className="flex-auto">
        <div className="mb-1 flex-col items-center gap-2 sm:flex sm:flex-row">
          <h3 className="overflow-hidden whitespace-nowrap text-[16px]/[25px] font-bold text-[#212529] sm:text-[18px]">
            {study.title}
          </h3>
          {state && (
            <span
              className={`inline-block whitespace-nowrap rounded-xl px-[7.8px] py-[4.2px] text-center align-baseline text-xs font-bold leading-none sm:px-2 sm:py-1 ${
                state === 'Wait'
                  ? 'bg-yellow-100 text-yellow-800'
                  : state === 'Accept'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {state === 'Wait' ? '대기중' : state === 'Accept' ? '승인됨' : '거절됨'}
            </span>
          )}
          {type === 'joined' && state === 'Reject' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="ml-auto">
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>스터디를 목록에서 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 이 스터디를 목록에서 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleLeaveStudy(study.id)}>확인</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="max-h-18 overflow-hidden text-ellipsis whitespace-normal text-left text-[14px] text-[#495057]">
          {study.description}
        </div>
        <div className="mt-2 flex flex-wrap">
          <button className="m-0 mb-[5px] mr-2 flex h-[26px] w-fit items-center whitespace-nowrap rounded border-none bg-[#eff3fa] px-2 py-1 text-[13px] leading-[1.38rem]">
            <span className="text-[#3e4042]">{study.campus}</span>
          </button>
          <button className="m-0 mb-[5px] mr-2 flex h-[26px] w-fit items-center whitespace-nowrap rounded border-none bg-[#eff3fa] px-2 py-1 text-[13px] leading-[1.38rem]">
            <span className="text-[#3e4042]">{study.level}</span>
          </button>
          {(study.tags ?? []).map((stack, index) => (
            <button
              key={index}
              className="m-0 mb-[5px] mr-2 flex h-[26px] w-fit items-center whitespace-nowrap rounded border-none bg-[#eff3fa] px-2 py-1 text-[13px] leading-[1.38rem]"
            >
              <span className="text-[#3e4042]">{stack}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-between overflow-auto text-ellipsis whitespace-nowrap text-sm font-normal text-[#868e96]">
          <div className="max-w-lg flex-auto">
            <span className="flex-shrink overflow-hidden text-ellipsis whitespace-nowrap"></span>
            <span>{study.mentor.username}</span>
            <span> · </span>
            <span>
              {study.day} {study.startTime}
              {study.startTime && '~'}
              {study.endTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStudyList = (studies: Study[] | StudyWithState[], type: 'joined' | 'created') => {
    if (studies.length === 0) {
      return (
        <div className="flex h-40 items-center justify-center">
          <p className="text-gray-500">표시할 스터디가 없습니다.</p>
        </div>
      )
    }

    return (
      <div id="studylist-container" className="mb-10">
        {studies.map((studyData, index) => {
          const study = type === 'joined' ? (studyData as StudyWithState).study : (studyData as Study)
          const state = type === 'joined' ? (studyData as StudyWithState).state : null

          return type === 'created' ? (
            <Link href={`/mystudy/${study.id}`} className="cursor-pointer" key={index}>
              <StudyContent study={study} state={state} type={type} />
            </Link>
          ) : (
            <div key={index}>
              <StudyContent study={study} state={state} type={type} />
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-500">로딩중...</p>
      </div>
    )
  }

  return (
    <div id="mystudy-body__content" className="flex max-w-full flex-1 flex-col pb-16 sm:pt-4">
      <div className="flex border-b border-[#dee2e6]">
        <button
          onClick={() => setActiveTab('joined')}
          className={`h-[45px] px-3 text-[16px] font-bold text-[#1b1c1d] ${
            activeTab === 'joined' ? 'border-b border-[#1b1c1d]' : ''
          }`}
        >
          스터디원
        </button>
        <button
          onClick={() => setActiveTab('created')}
          className={`h-[45px] px-3 text-[16px] font-bold text-[#1b1c1d] ${
            activeTab === 'created' ? 'border-b border-[#1b1c1d]' : ''
          }`}
        >
          스터디장
        </button>
      </div>
      {activeTab === 'joined' ? renderStudyList(joinedStudies, 'joined') : renderStudyList(createdStudies, 'created')}
    </div>
  )
}
