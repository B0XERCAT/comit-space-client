'use client'

import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

import { zodResolver } from '@hookform/resolvers/zod'
import { Clock } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { notFound, redirect, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { MdHelpOutline } from 'react-icons/md'
import { z } from 'zod'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

import { HttpStatusCode } from '@/app/api/utils/httpConsts'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateToTime } from '@/components/ui/time-picker-utils'
import { TimePicker } from '@/components/ui/timepicker'
import { useToast } from '@/components/ui/use-toast'
import { API_ENDPOINTS } from '@/constants/apiEndpoint'
import { ROUTES } from '@/constants/routes'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { useSupabaseFile } from '@/lib/supabase/hooks'
import { Campus, Day, Level, Study } from '@/types'

const schema = z.object({
  imageSrc: z.string({
    required_error: '이미지를 업로드해주세요'
  }),
  title: z.string().min(1, { message: '스터디 제목을 입력해주세요' }),
  day: z.enum(['월', '화', '수', '목', '금', '토', '일'], {
    required_error: '요일을 선택해주세요'
  }),
  startTime: z.string({
    required_error: '스터디 시간을 입력해주세요'
  }),
  endTime: z.string({
    required_error: '스터디 시간을 입력해주세요'
  }),
  campus: z.enum(['율전', '명륜', '온라인'], {
    required_error: '캠퍼스를 선택해주세요'
  }),
  level: z.enum(['초급', '중급', '고급'], {
    required_error: '난이도를 선택해주세요'
  }),
  tags: z.array(z.string()).min(1, { message: '스택을 입력해주세요' }),
  description: z
    .string()
    .min(1, { message: '설명을 입력해주세요' })
    .max(800, { message: '설명은 800자 이내로 입력해주세요' })
})

const dayOptions: Day[] = ['월', '화', '수', '목', '금', '토', '일']
const campusOptions: Campus[] = ['율전', '명륜', '온라인']
const levelOptions: Level[] = ['초급', '중급', '고급']

interface StudyEditProps {
  params: {
    id: number
  }
}

type StudyForm = Omit<Study, 'id' | 'mentor' | 'isRecruiting'>

export default function StudyEditPage({ params }: StudyEditProps) {
  const session = useSession()
  const router = useRouter()
  const { id } = params
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const fileHandler = useSupabaseFile({ pathPrefix: `image/study/${id}` })

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
  } = useForm<StudyForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      tags: []
    }
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [image, setImage] = useState<string>('')
  const [stackError, setTagError] = useState<string>('')
  const [currentTag, setCurrentTag] = useState<string>('')
  const [startTime, setStartTime] = useState<Date | undefined>(undefined)
  const [endTime, setEndTime] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session || session.error) return

    const fetchStudy = async () => {
      try {
        const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.RETRIEVE(id), {
          cache: 'no-cache'
        })
        if (!res.ok) {
          switch (res.status) {
            case HttpStatusCode.NotFound:
              notFound()
            default:
              throw new Error('스터디 정보를 불러오는 중 오류가 발생했습니다.')
          }
        }
        const json = await res.json()
        const studyData = json.data

        // Set form values
        setValue('imageSrc', studyData.imageSrc)
        setValue('title', studyData.title)
        setValue('day', studyData.day)
        setValue('startTime', studyData.startTime)
        setValue('endTime', studyData.endTime)
        setValue('campus', studyData.campus)
        setValue('level', studyData.level)
        setValue('tags', studyData.tags)
        setValue('description', studyData.description)
        setDescription(studyData.description)
        setImage(studyData.imageSrc)

        // Set time pickers
        if (studyData.startTime) {
          const [hours, minutes] = studyData.startTime.split(':')
          const date = new Date()
          date.setHours(parseInt(hours), parseInt(minutes))
          setStartTime(date)
        }
        if (studyData.endTime) {
          const [hours, minutes] = studyData.endTime.split(':')
          const date = new Date()
          date.setHours(parseInt(hours), parseInt(minutes))
          setEndTime(date)
        }
      } catch (error) {
        console.error('Failed to load study:', error)
        toast({
          title: '스터디 정보 불러오기 실패',
          description: '스터디 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudy()
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

  const onSubmit = async (data: StudyForm) => {
    if (!session?.data?.accessToken) return

    try {
      let fileUrl = data.imageSrc
      if (imageFile) {
        const file = await fileHandler.upload(imageFile)
        fileUrl = file.supabaseFileData.url
      }

      const res = await fetchData(API_ENDPOINTS.CLIENT.STUDY.UPDATE(id), {
        body: JSON.stringify({ ...data, imageSrc: fileUrl, description }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.accessToken}`
        },
        credentials: 'include'
      })

      if (!res.ok) {
        if (imageFile) {
          const file = await fileHandler.upload(imageFile)
          await file.delete()
        }
        throw new Error('스터디 정보를 수정하는 중 오류가 발생했습니다.')
      }

      toast({
        title: '스터디 수정 완료',
        description: '스터디 내용이 성공적으로 수정되었습니다!'
      })
      router.push(`/mystudy/${id}`)
    } catch (error) {
      console.error('Failed to update study:', error)
      toast({
        title: '스터디 수정 실패',
        description: '스터디 정보를 수정하는 중 오류가 발생했습니다.',
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
      newTag !== '' ? setTagError('스택은 최대 4개까지만 입력 가능합니다') : setTagError('')
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
        message: '중복 스택이 존재합니다'
      })
    } else {
      clearErrors('tags')
      setValue('tags', getValues('tags') ? newTag : [currentTag])
    }
    setCurrentTag('')
  }

  // Time handling
  const onChangeStartTime = (date: Date | undefined) => {
    if (typeof date !== 'undefined') {
      setValue('startTime', formatDateToTime(date))
      setStartTime(date)
    }
  }

  const onChangeEndTime = (date: Date | undefined) => {
    if (typeof date !== 'undefined') {
      setValue('endTime', formatDateToTime(date))
      setEndTime(date)
    }
  }

  // Loading states
  if (session === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (session.error) {
    redirect(ROUTES.LOGIN.url)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-12">
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <p className="text-3xl font-semibold lg:text-5xl">스터디 수정</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 w-full max-w-2xl space-y-8 px-4">
        {/* 이미지 업로드 */}
        <div className="space-y-1">
          <Label>스터디 이미지</Label>
          <div className="flex justify-start">
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-48 w-48 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed"
            >
              {image ? (
                <Image src={image} alt="Study" fill className="object-cover" />
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

        {/* 제목 */}
        <div className="space-y-1">
          <Label>제목</Label>
          <Input {...register('title')} placeholder="스터디 제목을 입력해주세요" />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* 시간 */}
        <div className="space-y-1">
          <Label className="flex items-center">
            시간
            <Clock className="ml-2 h-4 w-4" />
          </Label>
          <div className="flex items-center justify-start gap-2 max-md:gap-4">
            <TimePicker date={startTime} setDate={onChangeStartTime} />
            <span>~</span>
            <TimePicker date={endTime} setDate={onChangeEndTime} />
          </div>
          {(errors.startTime || errors.endTime) && <p className="text-sm text-red-500">{errors.startTime?.message}</p>}
        </div>

        {/* 요일 */}
        <div className="space-y-1">
          <Label>요일</Label>
          <Controller
            control={control}
            name="day"
            render={({ field: { onChange, value } }) => (
              <Tabs value={value} onValueChange={onChange}>
                <TabsList>
                  {dayOptions.map((day) => (
                    <TabsTrigger key={day} value={day}>
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          />
          {errors.day && <p className="text-sm text-red-500">{errors.day.message}</p>}
        </div>

        {/* 캠퍼스 */}
        <div className="space-y-1">
          <Label>캠퍼스</Label>
          <Controller
            control={control}
            name="campus"
            render={({ field: { onChange, value } }) => (
              <Tabs value={value} onValueChange={onChange}>
                <TabsList>
                  {campusOptions.map((campus) => (
                    <TabsTrigger key={campus} value={campus}>
                      {campus}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          />
          {errors.campus && <p className="text-sm text-red-500">{errors.campus.message}</p>}
        </div>

        {/* 난이도 */}
        <div className="space-y-1">
          <Label>난이도</Label>
          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <Tabs value={value} onValueChange={onChange}>
                <TabsList>
                  {levelOptions.map((level) => (
                    <TabsTrigger key={level} value={level}>
                      {level}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          />
          {errors.level && <p className="text-sm text-red-500">{errors.level.message}</p>}
        </div>

        {/* 스택 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Label>주제 / 기술 스택</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button">
                  <MdHelpOutline className="hover:text-gray-600" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="mb-2 flex w-64 justify-center text-sm" side="top">
                <ul>
                  <li>최대 4개까지 입력 가능하며</li>
                  <li>첫번째 스택만 미리보기에 표시됩니다.</li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
          {stackError && <p className="text-sm text-red-500">{stackError}</p>}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  placeholder="주제를 입력해주세요"
                  value={currentTag}
                  onChange={handleTagChange}
                  onKeyUp={handleTagAdd}
                  className="w-60"
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
        <div className="space-y-1">
          <Label>설명</Label>
          <div data-color-mode="light">
            <MDEditor
              value={description}
              onChange={(value) => {
                setDescription(value || '')
                setValue('description', value || '')
              }}
              preview="edit"
              height={400}
            />
          </div>
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
