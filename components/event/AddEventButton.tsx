'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MdAdd } from 'react-icons/md'

import { Button } from '@/components/ui/button'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponse } from '@/lib/response'
import { User } from '@/types'

export default function AddEventButton() {
  const router = useRouter()
  const session = useSession()
  const [isStaff, setIsStaff] = useState(false)

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!session?.data?.accessToken || !session?.data?.username) return

      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.STAFF_LIST as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          }
        })

        if (!res.ok) {
          throw new Error('Failed to fetch staff list')
        }

        const json: CustomResponse = await res.json()
        const staffList: User[] = json.data
        const currentUsername = session.data.username

        // Check if current user is in the staff list
        setIsStaff(staffList.some((staff) => staff.username === currentUsername))
      } catch (error) {
        console.error('Failed to check staff status:', error)
      }
    }

    checkStaffStatus()
  }, [session])

  if (!isStaff) return null

  return (
    <div className="flex justify-end">
      <Button onClick={() => router.push('/event/create')} className="flex items-center gap-2">
        <MdAdd className="h-5 w-5" />
        행사 추가
      </Button>
    </div>
  )
}
