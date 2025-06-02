'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Study } from '@/types'

export default function MyStudy() {
  const session = useSession()
  const [activeTab, setActiveTab] = useState<'joined' | 'created'>('joined')
  const [joinedStudies, setJoinedStudies] = useState<Study[]>([])
  const [createdStudies, setCreatedStudies] = useState<Study[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const renderStudyList = (studies: Study[], type: 'joined' | 'created') => {
    if (studies.length === 0) {
      return null
    }

    return (
      <div id="studylist-container" className="mb-10">
        {studies.map((study, index) => (
          <Link href={`/mystudy/${study.id}`} className="cursor-pointer" key={index}>
            <div className="border-b-solid flex border-b border-b-[#dee2e6] px-0 py-[18px] sm:px-4">
              <div className="flex-auto">
                <div className="mb-1 flex-col items-center sm:flex sm:flex-row">
                  <div className="mb-2 mr-2 flex items-center sm:mb-0">
                    <span className="inline-block whitespace-nowrap rounded-xl bg-purple-600 px-[7.8px] py-[4.2px] text-center align-baseline text-xs font-bold leading-none text-white sm:px-2 sm:py-1">
                      {type === 'created' ? '스터디장' : '스터디원'}
                    </span>
                  </div>

                  <h3 className="flex-1 overflow-hidden whitespace-nowrap text-[16px]/[25px] font-bold text-[#212529] sm:text-[18px]">
                    {study.title}
                  </h3>
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
                  {study.tags.map((stack, index) => (
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
          </Link>
        ))}
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
    <div id="mystudy-body__content" className="flex max-w-full flex-1 flex-col pb-16 sm:pt-8">
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
