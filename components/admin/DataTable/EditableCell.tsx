'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { ApiEndpoint } from '@/constants/apiEndpoint'
import { useSession } from '@/lib/auth/SessionProvider'
import { fetchData } from '@/lib/fetch'
import { CustomResponseDTO } from '@/lib/response'
import { cn } from '@/lib/utils'

const roleOptions = [
  {
    value: 'ROLE_MEMBER',
    label: '회원'
  },
  {
    value: 'ROLE_VERIFIED',
    label: '부원'
  },
  {
    value: 'ROLE_ADMIN',
    label: '관리자'
  }
]

interface EditableCellProps {
  fieldName: any
  row: {
    original: any
  }
  readonly?: boolean
  submitApiEndpoint: ApiEndpoint
}

const EditableCell: React.FC<EditableCellProps> = ({ fieldName, row, readonly, submitApiEndpoint }) => {
  const session = useSession()
  const { toast } = useToast()
  const initialValue = row.original[fieldName]
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<any>(initialValue ?? '')
  const [inputValue, setInputValue] = useState<any>(initialValue ?? '')
  const id = row.original.id

  const formatDisplayValue = (val: any) => {
    if (fieldName === 'role') {
      const roleOption = roleOptions.find((role) => role.value === val)
      return roleOption?.label || val
    }
    if (fieldName === 'isStaff') {
      return val ? 'O' : 'X'
    }
    if (fieldName === 'isRecruiting') {
      return val ? '모집중' : '모집마감'
    }
    return val.toString()
  }

  const getCellWidth = () => {
    if (fieldName === 'isStaff') return 'w-12'
    if (fieldName === 'role') return 'w-20'
    if (fieldName === 'isRecruiting') return 'w-24'
    if (fieldName === 'position') return 'w-32'
    return 'w-40'
  }

  const getPopoverWidth = () => {
    if (fieldName === 'isStaff') return 'w-32'
    if (fieldName === 'role') return 'w-48'
    if (fieldName === 'isRecruiting') return 'w-48'
    if (fieldName === 'position') return 'w-56'
    return 'w-64'
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValue(inputValue)
    setOpen(false)

    const res = await fetchData(submitApiEndpoint, {
      body: JSON.stringify({ [fieldName]: inputValue }),
      cache: 'no-cache',
      headers: {
        Authorization: `Bearer ${session?.data?.accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (!res.ok) {
      toast({
        title: '수정 실패',
        description: '수정 중 서버 에러 발생, 로그를 확인해주세요!',
        variant: 'destructive'
      })
      console.error('Failed to update', fieldName, id, inputValue)
      return
    }
    toast({
      title: '수정 완료',
      description: '성공적으로 수정되었습니다!'
    })
    const data: CustomResponseDTO = await res.json()
    const updatedFieldResult = data.data[fieldName]
    setValue(updatedFieldResult) // 실제 업데이트
  }

  const inputClass = 'py-1 m-0 h-8 text-xs'

  return (
    <Popover open={open} onOpenChange={() => setOpen(!readonly && true)}>
      <PopoverTrigger className={cn('m-1 h-full rounded border hover:bg-slate-200', getCellWidth())}>
        <div className="overflow-hidden whitespace-nowrap px-2 text-center">{formatDisplayValue(value)}</div>
      </PopoverTrigger>
      <PopoverContent className={cn('p-2', getPopoverWidth())} onEscapeKeyDown={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          {typeof inputValue === 'boolean' ? (
            <Tabs
              value={inputValue ? 'true' : 'false'}
              onValueChange={(e) => {
                const newValue = e === 'true'
                setInputValue(newValue)
                setValue(newValue)
              }}
            >
              <TabsList className="w-full">
                {fieldName === 'isRecruiting' ? (
                  <>
                    <TabsTrigger value="true" className="flex-1">
                      모집중
                    </TabsTrigger>
                    <TabsTrigger value="false" className="flex-1">
                      모집마감
                    </TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="true" className="flex-1">
                      O
                    </TabsTrigger>
                    <TabsTrigger value="false" className="flex-1">
                      X
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </Tabs>
          ) : fieldName === 'role' ? (
            <Tabs
              value={value}
              onValueChange={(e) => {
                setInputValue(e)
                setValue(e)
              }}
            >
              <TabsList>
                {roleOptions.map((role) => (
                  <TabsTrigger key={role.value} value={role.value}>
                    {role.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} className={inputClass} />
          )}
          <div className="mt-2 flex justify-end gap-x-2">
            <Button variant="ghost" type="reset" onClick={() => setOpen(false)} className="h-8 p-2 text-sm">
              취소
            </Button>
            <Button type="submit" className="h-8 p-2 text-sm">
              저장
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default EditableCell
