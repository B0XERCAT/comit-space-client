import { Suspense } from 'react'

import LoadingSpinner from '@/components/common/LoadingSpinner'
import SectionBanner from '@/components/common/SectionBanner'

export default function Post() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex max-w-7xl flex-col items-center justify-center">
        <section className="flex w-full max-w-6xl flex-col justify-start">
          <SectionBanner
            title="CoMit 게시판"
            description="스터디와 행사 관련 정보를 공유해보세요!"
            className="h-40 w-full"
          />
        </section>

        <section className="mt-10 w-full max-w-7xl px-4">
          <div className="rounded-lg border bg-white p-6">
            {/* TODO!: 게시판 목록 컴포넌트 추가 예정 */}
            <Suspense fallback={<LoadingSpinner />}>
              <p className="text-gray-500">게시판 목록이 곧 추가될 예정입니다.</p>
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}
