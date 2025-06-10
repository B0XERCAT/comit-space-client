import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { ROUTES } from '@/constants/routes'
import { auth } from '@/lib/auth/auth'
import { fetchData } from '@/lib/fetch'
import { Event, Post,Study, User } from '@/types'

const Admin = async () => {
  const session = await auth()
  const studyRes = await fetchData(API_ENDPOINTS.ADMIN.STUDY.LIST as ApiEndpoint, {
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`
    },
    credentials: 'include'
  })
  if (!studyRes.ok) {
    switch (studyRes.status) {
      default:
      // redirect('/error')
    }
  }
  const studyJSON = await studyRes.json()
  const studyList: Study[] = studyJSON.data

  const userRes = await fetchData(API_ENDPOINTS.ADMIN.USER.LIST as ApiEndpoint, {
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`
    },
    credentials: 'include'
  })
  if (!userRes.ok) {
    switch (userRes.status) {
      default:
      // redirect('/error')
    }
  }
  const userJSON = await userRes.json()
  const userList: User[] = userJSON.data

  const eventRes = await fetchData(API_ENDPOINTS.ADMIN.EVENT.LIST as ApiEndpoint, {
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`
    },
    credentials: 'include'
  })
  if (!eventRes.ok) {
    switch (eventRes.status) {
      default:
      // redirect('/error')
    }
  }
  const eventJSON = await eventRes.json()
  const eventList: Event[] = eventJSON.data

  const postRes = await fetchData(API_ENDPOINTS.ADMIN.POST.LIST as ApiEndpoint, {
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`
    },
    credentials: 'include'
  })
  if (!postRes.ok) {
    switch (postRes.status) {
      default:
      // redirect('/error')
    }
  }
  const postJSON = await postRes.json()
  const postList: Post[] = postJSON.data

  return (
    <div className="p-5">
      <p className="mb-3 flex w-full items-center justify-start py-7 text-3xl font-semibold">Dashboard</p>
      <div className="grid grid-cols-4 gap-6">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>유저 관리</CardTitle>
            <CardDescription>가입된 유저 확인 및 관리</CardDescription>
          </CardHeader>

          <CardContent className="flex-col gap-y-2 md:flex">
            <p className="text-lg">
              전체:&nbsp;
              <Link href={ROUTES.ADMIN.USER.url} className="text-primary underline">
                {userList.length}
              </Link>
              명
            </p>
            <p className="text-lg">
              관리자:&nbsp;
              <Link href={ROUTES.ADMIN.USER.url} className="text-primary underline">
                {userList.filter((user) => user.role === 'ROLE_ADMIN').length}
              </Link>
              명
            </p>
            <p className="text-lg">
              일반 부원:&nbsp;
              <Link href={ROUTES.ADMIN.USER.url} className="text-primary underline">
                {userList.filter((user) => user.role === 'ROLE_VERIFIED').length}
              </Link>
              명
            </p>
            <p className="text-lg">
              승인 대기:&nbsp;
              <Link href={ROUTES.ADMIN.USER.url} className="text-primary underline">
                {userList.filter((user) => user.role === 'ROLE_MEMBER').length}
              </Link>
              명
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>스터디 관리</CardTitle>
            <CardDescription>스터디 확인 및 관리</CardDescription>
          </CardHeader>

          <CardContent className="flex-col gap-y-4 md:flex">
            <p className="text-lg">
              전체 스터디:&nbsp;
              <Link href={ROUTES.ADMIN.STUDY.url} className="text-primary underline">
                {studyList.length}
              </Link>
              개
            </p>
            <p className="text-lg">
              열린 스터디:&nbsp;
              <Link href={ROUTES.ADMIN.STUDY.url} className="text-primary underline">
                {studyList.filter((study) => study.isRecruiting).length}
              </Link>
              개
            </p>
            <p className="text-lg">
              종료된 스터디:&nbsp;
              <Link href={ROUTES.ADMIN.STUDY.url} className="text-primary underline">
                {studyList.filter((study) => !study.isRecruiting).length}
              </Link>
              개
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>행사 관리</CardTitle>
            <CardDescription>행사 확인 및 관리</CardDescription>
          </CardHeader>

          <CardContent className="flex-col gap-y-4 md:flex">
            <p className="text-lg">
              전체 행사:&nbsp;
              <Link href={ROUTES.ADMIN.EVENTS.url} className="text-primary underline">
                {eventList.length}
              </Link>
              개
            </p>
            <p className="text-lg">
              열린 행사:&nbsp;
              <Link href={ROUTES.ADMIN.EVENTS.url} className="text-primary underline">
                {eventList.filter((event) => event.isRecruiting).length}
              </Link>
              개
            </p>
            <p className="text-lg">
              종료된 행사:&nbsp;
              <Link href={ROUTES.ADMIN.EVENTS.url} className="text-primary underline">
                {eventList.filter((event) => !event.isRecruiting).length}
              </Link>
              개
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>게시글 관리</CardTitle>
            <CardDescription>게시글 확인 및 관리</CardDescription>
          </CardHeader>

          <CardContent className="flex-col gap-y-4 md:flex">
            <p className="text-lg">
              전체 게시글:&nbsp;
              <Link href={ROUTES.ADMIN.POSTS.url} className="text-primary underline">
                {postList.length}
              </Link>
              개
            </p>
            <p className="text-lg">
              스터디 게시글:&nbsp;
              <Link href={ROUTES.ADMIN.POSTS.url} className="text-primary underline">
                {postList.filter((post) => post.groupType === 'STUDY').length}
              </Link>
              개
            </p>
            <p className="text-lg">
              행사 게시글:&nbsp;
              <Link href={ROUTES.ADMIN.POSTS.url} className="text-primary underline">
                {postList.filter((post) => post.groupType === 'EVENT').length}
              </Link>
              개
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default Admin
