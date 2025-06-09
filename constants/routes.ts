/**
 * Route vs ApiEndpoint
 * - Route: 클라이언트에서 사용하는 path
 * - ApiEndpoint: 서버와 접속하기 위한 path
 */
export interface Route {
  name: string
  url: string
}

export const ROUTES = {
  HOME: {
    name: '홈',
    url: '/'
  },
  ABOUT: {
    name: '소개',
    url: '/about'
  },
  STUDY: {
    index: {
      name: '스터디',
      url: '/study'
    },
    OPEN: {
      name: '스터디 개설',
      url: '/study/open'
    },
    SIGNUP: (id: string) => ({
      name: '스터디 신청',
      url: `/study/${id}/signup`
    })
  },
  EVENT: {
    index: {
      name: '행사',
      url: '/event'
    },
    OPEN: {
      name: '행사 개설',
      url: '/event/open'
    }
  },
  POST: {
    index: {
      name: '게시판',
      url: '/post'
    },
    CREATE: {
      name: '게시글 작성',
      url: '/post/create'
    }
  },
  CLUBROOM: {
    name: '동아리방',
    url: '/clubroom'
  },
  LOGIN: {
    name: '로그인',
    url: '/login'
  },
  SIGNUP: {
    name: '회원가입',
    url: '/signup'
  },
  MYSTUDY: {
    name: '나의 스터디',
    url: '/mystudy'
  },
  MYEVENT: {
    name: '행사 관리',
    url: '/myevent'
  },
  PROFILE: {
    name: '프로필',
    url: '/profile'
  },
  ADMIN: {
    DASHBOARD: {
      name: '대시보드',
      url: '/admin'
    },
    STUDY: {
      name: '스터디',
      url: '/admin/studies'
    },
    USER: {
      name: '유저',
      url: '/admin/users'
    }
  }
}
