'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { useSupabaseFile } from '@/lib/supabase/hooks'

const schema = z.object({
  title: z.string().min(1, { message: '제목을 입력해주세요' }),
  content: z
    .string()
    .min(1, { message: '내용을 입력해주세요' })
    .max(2000, { message: '내용은 2000자 이내로 입력해주세요' }),
  imageSrc: z.string().optional()
})

type PostForm = z.infer<typeof schema>

function CreatePostForm() {
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('id')
  const groupType = searchParams.get('groupType')?.toUpperCase()
  const fileHandler = useSupabaseFile({ pathPrefix: 'image/post' })
  const fileRef = useRef<HTMLInputElement>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [image, setImage] = useState<string>('')

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PostForm>({
    resolver: zodResolver(schema)
  })

  // 로그인 체크
  if (!session?.data?.accessToken) {
    return null
  }

  // 파라미터 체크
  if (!groupId || !groupType) {
    router.back()
    return null
  }

  const handleFileChange = (e: React.ChangeEvent) => {
    const targetFiles = (e.target as HTMLInputElement).files as FileList
    if (targetFiles.length) {
      const selectedFile = URL.createObjectURL(targetFiles[0])
      setImage(selectedFile)
      setValue('imageSrc', selectedFile)
      setImageFile(targetFiles[0])
    }
  }

  const onSubmit = async (data: PostForm) => {
    try {
      let fileUrl = ''
      if (imageFile) {
        const file = await fileHandler.upload(imageFile)
        fileUrl = file.supabaseFileData.url
      }

      console.log(data)

      const res = await fetchData(
        API_ENDPOINTS.CLIENT.POST.CREATE(groupType as 'STUDY' | 'EVENT', Number(groupId)) as ApiEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.accessToken}`
          },
          body: JSON.stringify({
            ...data,
            imageSrc: fileUrl
          })
        }
      )

      if (!res.ok) {
        console.log(res)
        throw new Error('게시글 작성에 실패했습니다.')
      }

      toast({
        title: '게시글 작성 완료',
        description: '게시글이 성공적으로 작성되었습니다.'
      })

      // 작성 완료 후 목록으로 이동
      router.push(`/post?id=${groupId}&groupType=${groupType.toLowerCase()}`)
    } catch (error) {
      console.error('Failed to create post:', error)
      toast({
        title: '게시글 작성 실패',
        description: '게시글 작성 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex flex-col items-center py-12">
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <p className="text-3xl font-semibold lg:text-5xl">게시글 작성</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full max-w-2xl space-y-8 px-4">
        {/* 이미지 업로드 */}
        <div className="space-y-1">
          <Label>이미지 (선택)</Label>
          <div className="flex justify-start">
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-48 w-48 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed"
            >
              {image ? (
                <Image src={image} alt="Post" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-gray-500">이미지 업로드</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleFileChange} />
            </div>
          </div>
        </div>

        {/* 제목 */}
        <div className="space-y-1">
          <Label>제목</Label>
          <Input {...register('title')} placeholder="제목을 입력하세요" />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* 내용 */}
        <div className="space-y-1">
          <Label>내용</Label>
          <Textarea {...register('content')} placeholder="내용을 입력하세요" className="h-64" />
          {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <Button type="submit" className="px-8" disabled={isSubmitting}>
            {isSubmitting ? '작성 중...' : '작성하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreatePost() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <CreatePostForm />
    </Suspense>
  )
}
