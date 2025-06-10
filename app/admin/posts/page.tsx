import { AdminDataTable } from '@/components/admin/DataTable'
import { columns } from '@/components/admin/DataTable/columns/Post'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { auth } from '@/lib/auth/auth'
import { fetchData } from '@/lib/fetch'
import { Post } from '@/types'

const PostManagePage = async () => {
  const session = await auth()
  const res = await fetchData(API_ENDPOINTS.ADMIN.POST.LIST as ApiEndpoint, {
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`
    },
    credentials: 'include'
  })
  const posts = (await res.json()).data as Post[]

  return (
    <div className="overflow-auto px-5 py-12" style={{ scrollbarWidth: 'thin', scrollbarColor: 'gray transparent' }}>
      <p className="mb-3 flex w-full items-center justify-start text-3xl font-semibold">게시글 관리</p>
      <AdminDataTable columns={columns} data={posts} />
    </div>
  )
}

export default PostManagePage
