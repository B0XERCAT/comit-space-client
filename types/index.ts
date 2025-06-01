export type Role = 'ROLE_MEMBER' | 'ROLE_VERIFIED' | 'ROLE_ADMIN'
export type User = {
  bio?: string
  blog?: string
  createdDate?: string
  email: string
  github?: string
  id: number
  isStaff: boolean
  modifiedDate?: string
  phoneNumber: string
  position: string
  profileImage?: string
  role: Role
  studentId: string
  username: string
}

export type UserProfile = Omit<User, 'createdDate' | 'isStaff' | 'modifiedDate' | 'role'>

export type Level = '초급' | '중급' | '고급'
export type Campus = '공통' | '온라인' | '명륜' | '율전'
export type Day = '월' | '화' | '수' | '목' | '금' | '토' | '일'
export type Study = {
  id: number
  campus: Campus
  day: Day
  description: string
  endTime: string
  imageSrc: string
  isRecruiting: boolean
  level: Level
  mentor: User
  semester: string
  tags: string[]
  startTime: string
  title: string
}

export interface Event {
  id: number
  title: string
  imageSrc: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  tags: string[]
  description: string
  isRecruiting: boolean
  semester: string
  year: number
}

export type ReservationStatus = 'WAIT' | 'ACCEPT' | 'DECLINE'

export interface Reservation {
  id: number
  studyId: number
  startTime: string
  endTime: string
  reserver: User
  title: string
  description: string
  isVerified: ReservationStatus
}
