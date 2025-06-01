'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { redirect, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdCalendarMonth, MdLocationOn } from 'react-icons/md'
import { z } from 'zod'

import SectionBanner from '@/components/common/SectionBanner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS, ApiEndpoint } from '@/constants/apiEndpoint'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { useSupabaseFile } from '@/lib/supabase/hooks'
import { Event, User } from '@/types'

const schema = z.object({
  imageSrc: z.string({
    required_error: '이미지를 업로드해주세요'
  }),
  title: z.string().min(1, { message: '행사 제목을 입력하세요' }),
  startDate: z.string({
    required_error: '시작 날짜를 선택해주세요'
  }),
  endDate: z.string({
    required_error: '종료 날짜를 선택해주세요'
  }),
  location: z.string().min(1, { message: '장소를 입력해주세요' }),
  tags: z.array(z.string()).min(1, { message: '태그를 입력해주세요' }),
  description: z
    .string()
    .min(1, { message: '설명을 입력해주세요' })
    .max(800, { message: '설명은 800자 이내로 입력해주세요' })
})

type EventForm = Omit<Event, 'id' | 'isRecruiting' | 'startTime' | 'endTime' | 'semester' | 'year'>

export default function CreateEvent() {
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const fileHandler = useSupabaseFile({ pathPrefix: 'image/event' })
  const fileRef = useRef<HTMLInputElement>(null)

  // Form handling
  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<EventForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      tags: []
    }
  })

  // State management
  const [isStaff, setIsStaff] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [image, setImage] = useState<string>('')
  const [tagError, setTagError] = useState<string>('')
  const [currentTag, setCurrentTag] = useState<string>('')

  // Authentication check
  if (!session || session.error) {
    redirect(ROUTES.LOGIN.url)
  }

  // Staff check
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

        const json = await res.json()
        const staffList: User[] = json.data
        const currentUsername = session.data.username

        setIsStaff(staffList.some((staff: User) => staff.username === currentUsername))
      } catch (error) {
        console.error('Failed to check staff status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkStaffStatus()
  }, [session])

  if (isLoading) {
    return null
  }

  if (!isStaff) {
    redirect(ROUTES.EVENT.index.url)
  }

  const watchedTags: string[] = watch('tags')

  const handleFileChange = (e: React.ChangeEvent) => {
    const targetFiles = (e.target as HTMLInputElement).files as FileList
    if (targetFiles.length) {
      const selectedFile = URL.createObjectURL(targetFiles[0])
      setImage(selectedFile)
      setValue('imageSrc', selectedFile)
      setImageFile(targetFiles[0])
    }
  }

  const handleTagChange = (e: { target: { value: string } }) => {
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

  const removeTag = (indexToRemove: number) => {
    const newTags = watchedTags.filter((_, index) => index !== indexToRemove)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: EventForm) => {
    if (!imageFile) return

    try {
      const file = await fileHandler.upload(imageFile)
      const fileUrl = file.supabaseFileData.url

      const res = await fetchData(
        {
          url: `${API_ENDPOINTS.CLIENT.EVENT.LIST.url}`,
          method: 'POST'
        } as ApiEndpoint,
        {
          body: JSON.stringify({
            ...data,
            imageSrc: fileUrl,
            startTime: '15:00',
            endTime: '22:00',
            isRecruiting: true,
            semester: 'Spring',
            year: 2025
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.accessToken}`
          },
          credentials: 'include'
        }
      )

      if (!res.ok) {
        await file.delete()
        throw new Error('Failed to create event')
      }

      file.commit()
      toast({
        title: '행사 생성 완료',
        description: '행사가 성공적으로 생성되었습니다.'
      })
      router.push(ROUTES.EVENT.index.url)
    } catch (error) {
      console.error('Failed to create event:', error)
      toast({
        title: '행사 생성 실패',
        description: '행사 생성 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex flex-col items-center">
      <SectionBanner title="Create Event" description="새로운 행사를 등록해주세요!" />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full max-w-2xl space-y-8 px-4">
        {/* Image Upload */}
        <div className="space-y-1">
          <Label>행사 이미지</Label>
          <div className="flex justify-start">
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-48 w-48 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed"
            >
              {image ? (
                <Image src={image} alt="Event" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-gray-500">이미지 업로드</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleFileChange} />
            </div>
          </div>
          {errors.imageSrc && <p className="text-sm text-red-500">{errors.imageSrc.message}</p>}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <Label>행사 제목</Label>
          <Input {...register('title')} placeholder="행사 제목을 입력하세요" />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* Date Selection */}
        <div className="space-y-1">
          <Label>행사 기간</Label>
          <div className="flex gap-4">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MdCalendarMonth className="mr-2" />
                      {field.value || '시작 날짜'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MdCalendarMonth className="mr-2" />
                      {field.value || '종료 날짜'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          {(errors.startDate || errors.endDate) && (
            <p className="text-sm text-red-500">{errors.startDate?.message || errors.endDate?.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-1">
          <Label>장소</Label>
          <div className="flex items-center gap-2">
            <MdLocationOn className="text-xl text-gray-500" />
            <Input {...register('location')} placeholder="행사 장소를 입력하세요" />
          </div>
          {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <Label>태그</Label>
          <div className="flex flex-wrap gap-2">
            {watchedTags.map((tag, index) => (
              <span key={index} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            value={currentTag}
            onChange={handleTagChange}
            onKeyDown={handleTagAdd}
            placeholder="태그를 입력하고 Enter를 누르세요"
          />
          {tagError && <p className="text-sm text-red-500">{tagError}</p>}
          {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label>설명</Label>
          <Textarea {...register('description')} placeholder="행사에 대한 설명을 입력하세요" className="h-32" />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="mb-10 px-8">
            행사 등록
          </Button>
        </div>
      </form>
    </div>
  )
}
