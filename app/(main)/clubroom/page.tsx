import ClubroomMainContent from '@/components/clubroom/ClubroomMainContent'
import ReservationSection from '@/components/clubroom/ReservationSection'
import SectionBanner from '@/components/common/SectionBanner'

export default function Clubroom() {
  return (
    <>
      <SectionBanner title="Clubroom" description="CoMit의 동아리방을 소개합니다!" />
      <ClubroomMainContent />
      <p className="mb-12 mt-32 text-center text-4xl font-bold">동아리방 스케줄 표</p>
      <ReservationSection />
    </>
  )
}
