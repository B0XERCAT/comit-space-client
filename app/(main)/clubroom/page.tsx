import ClubroomMainContent from '@/components/clubroom/ClubroomMainContent'
import ReservationCalendar from '@/components/clubroom/ReservationCalendar'
import SectionBanner from '@/components/common/SectionBanner'

export default function Clubroom() {
  return (
    <>
      <SectionBanner title="Clubroom" description="CoMit의 동아리방을 소개합니다!" />
      <ClubroomMainContent />
      <div className="flex w-full justify-center">
        <ReservationCalendar />
      </div>
    </>
  )
}
