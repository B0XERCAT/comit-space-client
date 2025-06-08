'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import MDEditor from '@uiw/react-md-editor'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { useSupabaseFile } from '@/lib/supabase/hooks'
import { Post } from '@/types'

const schema = z.object({
  title: z.string().min(1, { message: '제목을 입력해주세요' }),
  content: z
    .string()
    .min(1, { message: '내용을 입력해주세요' })
    .max(10000, { message: '내용은 10000자 이내로 입력해주세요' }),
  imageSrc: z.string().optional()
})

type PostForm = z.infer<typeof schema>

export default function EditPost() {
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()
  const fileHandler = useSupabaseFile({ pathPrefix: 'image/post' })
  const fileRef = useRef<HTMLInputElement>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [image, setImage] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PostForm>({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    const fetchPost = async () => {
      if (!session?.data?.accessToken) {
        router.push('/login')
        return
      }

      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.POST.RETRIEVE(Number(params.id)) as ApiEndpoint, {
          headers: {
            Authorization: `Bearer ${session.data.accessToken}`
          }
        })

        if (!res.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.')
        }

        const json = await res.json()
        const post: Post = json.data

        // Check if the user is the author
        if (session.data.username !== post.author.username) {
          toast({
            variant: 'destructive',
            description: '게시글을 수정할 권한이 없습니다.'
          })
          router.back()
          return
        }

        // Set form values
        setValue('title', post.title)
        setValue('content', post.content)
        setContent(post.content)
        if (post.imageSrc) {
          setImage(post.imageSrc)
          setValue('imageSrc', post.imageSrc)
        }
      } catch (error) {
        console.error('Failed to load post:', error)
        toast({
          variant: 'destructive',
          description: '게시글을 불러오는데 실패했습니다.'
        })
        router.back()
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id, session, router, setValue, toast])

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
    if (!session?.data?.accessToken) return

    try {
      let fileUrl = data.imageSrc
      if (imageFile) {
        const file = await fileHandler.upload(imageFile)
        fileUrl = file.supabaseFileData.url
      }

      const res = await fetchData(API_ENDPOINTS.CLIENT.POST.UPDATE(Number(params.id)) as ApiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.accessToken}`
        },
        body: JSON.stringify({
          ...data,
          content,
          imageSrc: fileUrl
        })
      })

      if (!res.ok) {
        throw new Error('게시글 수정에 실패했습니다.')
      }

      toast({
        title: '게시글 수정 완료',
        description: '게시글이 성공적으로 수정되었습니다.'
      })

      // 수정 완료 후 상세 페이지로 이동
      router.push(`/post/${params.id}`)
    } catch (error) {
      console.error('Failed to update post:', error)
      toast({
        title: '게시글 수정 실패',
        description: '게시글 수정 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-12">
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <p className="text-3xl font-semibold lg:text-5xl">게시글 수정</p>
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
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(value) => {
                setContent(value || '')
                setValue('content', value || '')
              }}
              preview="edit"
              height={400}
            />
          </div>
          {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <Button type="submit" className="px-8" disabled={isSubmitting}>
            {isSubmitting ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}
