'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { notFound, redirect, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { MdHelpOutline } from 'react-icons/md'
import { z } from 'zod'

import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS } from '@/constants/apiEndpoint'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { useSupabaseFile } from '@/lib/supabase/hooks'
import { Event } from '@/types'

const schema = z.object({
  imageSrc: z.string({
    required_error: '이미지를 업로드해주세요'
  }),
  title: z.string().min(1, { message: '행사 제목을 입력해주세요' }),
  startDate: z.string({
    required_error: '시작 날짜를 입력해주세요'
  }),
  endDate: z.string({
    required_error: '종료 날짜를 입력해주세요'
  }),
  location: z.string().min(1, { message: '장소를 입력해주세요' }),
  tags: z.array(z.string()).min(1, { message: '태그를 입력해주세요' }),
  description: z
    .string()
    .min(1, { message: '설명을 입력해주세요' })
    .max(800, { message: '설명은 800자 이내로 입력해주세요' })
})

interface EventEditProps {
  params: {
    id: number
  }
}

type EventForm = Omit<Event, 'id' | 'isRecruiting'>

export default function EventEditPage({ params }: EventEditProps) {
  const session = useSession()
  const router = useRouter()
  const { id } = params
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const fileHandler = useSupabaseFile({ pathPrefix: `image/event/${id}` })

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<EventForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      tags: []
    }
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [image, setImage] = useState<string>('')
  const [tagError, setTagError] = useState<string>('')
  const [currentTag, setCurrentTag] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRecruiting, setIsRecruiting] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.RETRIEVE(id), {
          cache: 'no-cache'
        })
        if (!res.ok) {
          switch (res.status) {
            case 404:
              notFound()
            default:
              throw new Error('행사 정보를 불러오는 중 오류가 발생했습니다.')
          }
        }
        const json = await res.json()
        const eventData = json.data

        // Set form values
        setValue('imageSrc', eventData.imageSrc)
        setValue('title', eventData.title)
        setValue('startDate', eventData.startDate)
        setValue('endDate', eventData.endDate)
        setValue('location', eventData.location)
        setValue('tags', eventData.tags)
        setValue('description', eventData.description)
        setDescription(eventData.description)
        setImage(eventData.imageSrc)
        setIsRecruiting(eventData.isRecruiting)
      } catch (error) {
        console.error('Failed to load event:', error)
        toast({
          title: '행사 정보 불러오기 실패',
          description: '행사 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [id, session, setValue, toast])

  const handleFileChange = (e: React.ChangeEvent) => {
    const targetFiles = (e.target as HTMLInputElement).files as FileList
    if (targetFiles.length) {
      const selectedFile = URL.createObjectURL(targetFiles[0])
      setImage(selectedFile)
      setValue('imageSrc', selectedFile)
      setImageFile(targetFiles[0])
    }
  }

  const onSubmit = async (data: EventForm) => {
    if (!session?.data?.accessToken) return

    try {
      let fileUrl = data.imageSrc
      if (imageFile) {
        const file = await fileHandler.upload(imageFile)
        fileUrl = file.supabaseFileData.url
      }

      const submitData = {
        title: data.title,
        imageSrc: fileUrl,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: '15:00',
        endTime: '22:00',
        tags: data.tags,
        location: data.location,
        description: data.description,
        isRecruiting: isRecruiting,
        semester: 'Spring',
        year: 2025
      }

      console.log('Submitting data:', submitData)

      const res = await fetchData(API_ENDPOINTS.CLIENT.EVENT.UPDATE(id), {
        method: 'PUT',
        body: JSON.stringify(submitData),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.accessToken}`
        }
      })

      if (!res.ok) {
        if (imageFile) {
          const file = await fileHandler.upload(imageFile)
          await file.delete()
        }
        throw new Error('행사 정보를 수정하는 중 오류가 발생했습니다.')
      }

      toast({
        title: '행사 수정 완료',
        description: '행사 내용이 성공적으로 수정되었습니다!'
      })
      router.push(`/myevent/${id}`)
    } catch (error) {
      console.error('Failed to update event:', error)
      toast({
        title: '행사 수정 실패',
        description: '행사 정보를 수정하는 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    }
  }

  // Tag handling
  const watchedTags = watch('tags')

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTag(e.target.value)
  }

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const newTag = e.currentTarget.value.trim()

    if (watchedTags.length === 4) {
      newTag !== '' ? setTagError('태그는 최대 4개까지만 입력 가능합니다') : setTagError('')
    }

    if (e.key === 'Enter' && newTag !== '') {
      watchedTags.length !== 4 ? handleDuplicateTag() : setCurrentTag('')
    }
  }

  const handleDuplicateTag = () => {
    const newTag = getValues('tags').concat(currentTag)

    if (new Set(newTag).size === getValues('tags').length) {
      setError('tags', {
        type: 'Duplicate',
        message: '중복 태그가 존재합니다'
      })
    } else {
      clearErrors('tags')
      setValue('tags', getValues('tags') ? newTag : [currentTag])
    }
    setCurrentTag('')
  }

  // Loading states
  if (session === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (session.error) {
    redirect(ROUTES.LOGIN.url)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">행사 수정</h1>
        <Button onClick={() => window.history.back()}>뒤로 가기</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <div className="grid grid-cols-[300px_1fr] gap-8">
          {/* 이미지 업로드 */}
          <div className="flex flex-col gap-4">
            <Label>행사 이미지</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex h-[300px] w-[300px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border"
            >
              {image ? (
                <Image src={image} width={300} height={300} alt="Event" className="h-full w-full object-cover" />
              ) : (
                <p className="text-5xl font-light text-slate-300">+</p>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleFileChange} />
            </div>
            {errors.imageSrc && <p className="text-sm text-red-500">{errors.imageSrc.message}</p>}
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="flex flex-col gap-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label>제목</Label>
              <Input {...register('title')} placeholder="행사 제목을 입력해주세요" />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작 날짜</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>종료 날짜</Label>
                <Input type="date" {...register('endDate')} />
                {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
              </div>
            </div>

            {/* 장소 */}
            <div className="space-y-2">
              <Label>장소</Label>
              <Input {...register('location')} placeholder="행사 장소를 입력해주세요" />
              {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
            </div>

            {/* 모집 상태 */}
            <div className="space-y-2">
              <Label>모집 상태</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isRecruiting ? 'default' : 'outline'}
                  onClick={() => setIsRecruiting(true)}
                >
                  모집 중
                </Button>
                <Button
                  type="button"
                  variant={!isRecruiting ? 'default' : 'outline'}
                  onClick={() => setIsRecruiting(false)}
                >
                  모집 마감
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 태그 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>태그</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button">
                  <MdHelpOutline className="hover:text-gray-600" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="mb-2 flex w-64 justify-center text-sm" side="top">
                <ul>
                  <li>최대 4개까지 입력 가능합니다.</li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
          {tagError && <p className="text-sm text-red-500">{tagError}</p>}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-[400px]">
                <Input
                  placeholder="태그를 입력해주세요"
                  value={currentTag}
                  onChange={handleTagChange}
                  onKeyUp={handleTagAdd}
                />
                <Button
                  type="button"
                  className="absolute right-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 p-3 text-xl"
                  disabled={currentTag.trim() === '' || (watchedTags && watchedTags.length >= 4)}
                  onClick={handleDuplicateTag}
                >
                  +
                </Button>
              </div>
              <Button
                variant="secondary"
                className="p-3"
                type="button"
                onClick={() => {
                  setTagError('')
                  clearErrors('tags')
                  setValue('tags', [])
                }}
              >
                Reset
              </Button>
            </div>
            {errors.tags && <p className="-mt-2 text-sm text-red-500">{errors.tags.message}</p>}
            <div className="flex gap-4">
              {watchedTags &&
                watchedTags.map((tag, index) => (
                  <Badge variant="secondary" key={index}>
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="space-y-2">
          <Label>설명</Label>
          <Textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setValue('description', e.target.value)
            }}
            placeholder="행사 설명을 입력해주세요"
            className="min-h-[300px]"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
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
