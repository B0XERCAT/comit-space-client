'use client'

import { useRouter } from 'next/navigation'
import { GoTrash } from 'react-icons/go'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'

import { useToast } from '../ui/use-toast'

interface DeleteButtonProps {
  id: number
  type: 'study' | 'user' | 'event' | 'post' | 'comment'
}

const DeleteButton = ({ id, type }: DeleteButtonProps) => {
  const session = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    let apiEndpoint: ApiEndpoint

    if (type === 'study') {
      apiEndpoint = API_ENDPOINTS.ADMIN.STUDY.DELETE(id) as ApiEndpoint
    } else if (type === 'user') {
      apiEndpoint = API_ENDPOINTS.ADMIN.USER.DELETE(id) as ApiEndpoint
    } else if (type === 'event') {
      apiEndpoint = API_ENDPOINTS.ADMIN.EVENT.DELETE(id) as ApiEndpoint
    } else if (type === 'post') {
      apiEndpoint = API_ENDPOINTS.ADMIN.POST.DELETE(id) as ApiEndpoint
    } else if (type === 'comment') {
      apiEndpoint = API_ENDPOINTS.ADMIN.COMMENT.DELETE(id) as ApiEndpoint
    } else {
      console.error('Invalid type')
      return
    }

    const res = await fetchData(apiEndpoint, {
      cache: 'no-cache',
      headers: {
        Authorization: `Bearer ${session?.data?.accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!res.ok) {
      toast({
        title: '삭제 실패',
        description: '삭제 중 서버 오류 발생',
        variant: 'destructive'
      })
      return
    } else {
      toast({
        title: '삭제 완료',
        description: '성공적으로 삭제되었습니다!'
      })
      router.refresh()
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
          <GoTrash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>삭제하면 복구할 수 없습니다. 삭제하시겠습니까?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteButton
