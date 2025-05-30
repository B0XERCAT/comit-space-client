'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import StudyCard from '@/components/common/StudyCard'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { Study } from '@/types'

export const ExampleStudyList = () => {
  const [studyList, setStudyList] = useState<Study[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStudies = async () => {
      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.LIST as ApiEndpoint)
        if (!res.ok) {
          throw new Error(`Failed to fetch studies: ${res.status}`)
        }

        const json: CustomResponse = await res.json()
        setStudyList(json.data ?? [])
      } catch (error) {
        console.error('Failed to load studies:', error)
        setError('스터디 목록을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadStudies()
  }, [])

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <p className="text-lg text-gray-500">로딩중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 flex justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    )
  }

  if (studyList.length === 0) {
    return (
      <div className="mt-8 flex justify-center">
        <p className="text-lg text-gray-500">현재 진행중인 스터디가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-12 xl:mb-32 xl:grid-cols-4">
      {studyList.map((study) => (
        <div className="col-span-2 flex justify-center sm:col-span-1" key={study.id}>
          <Link key={study.id} href="study/">
            <StudyCard
              study={study}
              imageSize={176}
              showStatus={false}
              imageWrapperClassName="mb-8 mt-4 h-24 w-24 overflow-hidden sm:h-44 sm:w-44"
            />
          </Link>
        </div>
      ))}
    </div>
  )
}

export default ExampleStudyList
