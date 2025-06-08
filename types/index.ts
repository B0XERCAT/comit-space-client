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
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  imageSrc: string
  tags: string[]
  isRecruiting: boolean
  semester: string
  year: number
  organizer?: User
  createdAt?: string
  updatedAt?: string
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

export interface Post {
  id: number
  groupId: number
  groupType: 'STUDY' | 'EVENT'
  title: string
  content: string
  author: User
  imageSrc: string | null
  likeCount: number
  comments: Comment[]
}

export interface Comment {
  id: number
  postId: number
  content: string
  author: User
}
