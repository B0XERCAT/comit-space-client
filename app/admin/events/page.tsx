import { AdminDataTable } from '@/components/admin/DataTable'
import { columns } from '@/components/admin/DataTable/columns/Event'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { auth } from '@/lib/auth/auth'
import { fetchData } from '@/lib/fetch'
import { Event } from '@/types'

const EventManagePage = async () => {
  const session = await auth()
  const res = await fetchData(API_ENDPOINTS.ADMIN.EVENT.LIST as ApiEndpoint, {
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`
    },
    credentials: 'include'
  })
  const events = (await res.json()).data as Event[]

  return (
    <div className="overflow-auto px-5 py-12" style={{ scrollbarWidth: 'thin', scrollbarColor: 'gray transparent' }}>
      <p className="mb-3 flex w-full items-center justify-start text-3xl font-semibold">행사 관리</p>
      <AdminDataTable columns={columns} data={events} />
    </div>
  )
}

export default EventManagePage
