import { AdminDataTable } from '@/components/admin/DataTable'
import { columns } from '@/components/admin/DataTable/columns/User'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { auth } from '@/lib/auth/auth'
import { fetchData } from '@/lib/fetch'
import { User } from '@/types'

const UserManagePage = async () => {
  const session = await auth()
  const res = await fetchData(API_ENDPOINTS.ADMIN.USER.LIST as ApiEndpoint, {
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`
    },
    credentials: 'include'
  })
  const users = (await res.json()).data as User[]

  return (
    <div className="overflow-auto px-5 py-12" style={{ scrollbarWidth: 'thin', scrollbarColor: 'gray transparent' }}>
      <p className="mb-3 flex w-full items-center justify-start text-3xl font-semibold">유저 관리</p>
      <AdminDataTable columns={columns} data={users} />
    </div>
  )
}

export default UserManagePage
