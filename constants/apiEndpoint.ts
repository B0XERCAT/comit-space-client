import { HttpMethod } from '@/app/api/utils/httpConsts'

const baseURL =
  process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_LOCAL_URL : process.env.NEXT_PUBLIC_DEPLOY_URL

const API_PREFIX = 'api'

export interface ApiEndpoint {
  url: string
  method: HttpMethod
}

const JSP_ENDPOINTS = {
  ADMIN: {
    USER: {
      RETRIEVE: (id: number) => ({ url: `${baseURL}/${API_PREFIX}/admin/users/${id}`, method: 'GET' as HttpMethod }),
      LIST: { url: `${baseURL}/${API_PREFIX}/admin/users`, method: 'GET' as HttpMethod },
      ROLE_UPDATE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/admin/users/${id}/role`,
        method: 'PATCH' as HttpMethod
      }),
      STAFF_UPDATE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/admin/users/${id}/isStaff`,
        method: 'PATCH' as HttpMethod
      }),
      POSITION_UPDATE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/admin/users/${id}/position`,
        method: 'PATCH' as HttpMethod
      }),
      DELETE: (id: number) => ({ url: `${baseURL}/${API_PREFIX}/admin/users/${id}`, method: 'DELETE' as HttpMethod })
    },
    STUDY: {
      CREATE: { url: `${baseURL}/${API_PREFIX}/admin/studies`, method: 'POST' as HttpMethod },
      RETRIEVE: (id: number) => ({ url: `${baseURL}/${API_PREFIX}/admin/studies/${id}`, method: 'GET' as HttpMethod }),
      LIST: { url: `${baseURL}/${API_PREFIX}/admin/studies`, method: 'GET' as HttpMethod },
      UPDATE_ISRECRUITING: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/admin/studies/${id}`,
        method: 'PATCH' as HttpMethod
      }),
      DELETE: (id: number) => ({ url: `${baseURL}/${API_PREFIX}/admin/studies/${id}`, method: 'DELETE' as HttpMethod })
    }
  },
  CLIENT: {
    STUDY: {
      CREATE: { url: `${baseURL}/${API_PREFIX}/studies`, method: 'POST' as HttpMethod },
      RETRIEVE: (id: number) => ({ url: `${baseURL}/${API_PREFIX}/studies/${id}`, method: 'GET' as HttpMethod }),
      LIST: { url: `${baseURL}/${API_PREFIX}/studies`, method: 'GET' as HttpMethod },
      UPDATE: (id: number) => ({ url: `${baseURL}/${API_PREFIX}/studies/${id}`, method: 'PATCH' as HttpMethod }),
      IS_JOINED: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/studies/${id}/isJoined`,
        method: 'GET' as HttpMethod
      }),
      JOIN: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/studies/${id}/join`,
        method: 'POST' as HttpMethod
      }),
      LEAVE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/studies/${id}/leave`,
        method: 'DELETE' as HttpMethod
      }),
      MEMBERS: (id: number, state: 'ACCEPT' | 'WAIT') => ({
        url: `${baseURL}/${API_PREFIX}/studies/${id}/members?state=${state}`,
        method: 'GET' as HttpMethod
      }),
      UPDATE_MEMBER_STATE: (studyId: number, userId: number) => ({
        url: `${baseURL}/${API_PREFIX}/studies/${studyId}/${userId}`,
        method: 'PATCH' as HttpMethod
      })
    },
    POST: {
      LIST: (groupType: 'STUDY' | 'EVENT') => ({
        url: `${baseURL}/${API_PREFIX}/posts?groupType=${groupType}`,
        method: 'GET' as HttpMethod
      }),
      RETRIEVE: (id: number) => ({ url: `${baseURL}/${API_PREFIX}/posts/${id}`, method: 'GET' as HttpMethod }),
      CREATE: (groupType: 'STUDY' | 'EVENT', groupId: number) => ({
        url: `${baseURL}/${API_PREFIX}/posts/${groupType}/${groupId}`,
        method: 'POST' as HttpMethod
      }),
      UPDATE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/posts/${id}`,
        method: 'PUT' as HttpMethod
      }),
      DELETE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/posts/${id}`,
        method: 'DELETE' as HttpMethod
      }),
      COMMENT: {
        CREATE: (postId: number) => ({
          url: `${baseURL}/${API_PREFIX}/posts/${postId}/comments`,
          method: 'POST' as HttpMethod
        }),
        DELETE: (commentId: number) => ({
          url: `${baseURL}/${API_PREFIX}/comments/${commentId}`,
          method: 'DELETE' as HttpMethod
        })
      }
    },
    EVENT: {
      LIST: { url: `${baseURL}/${API_PREFIX}/events`, method: 'GET' as HttpMethod },
      JOIN: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/events/${id}/join`,
        method: 'POST' as HttpMethod
      }),
      LEAVE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/events/${id}/leave`,
        method: 'DELETE' as HttpMethod
      }),
      IS_JOINED: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/events/${id}/isJoined`,
        method: 'GET' as HttpMethod
      })
    },
    RESERVATION: {
      LIST: (year: number, month: number) => ({
        url: `${baseURL}/${API_PREFIX}/reservations?year=${year}&month=${month}`,
        method: 'GET' as HttpMethod
      }),
      CREATE: { url: `${baseURL}/${API_PREFIX}/reservations`, method: 'POST' as HttpMethod },
      MY: (year: number, month: number) => ({
        url: `${baseURL}/${API_PREFIX}/reservations/my?year=${year}&month=${month}`,
        method: 'GET' as HttpMethod
      }),
      DELETE: (id: number) => ({
        url: `${baseURL}/${API_PREFIX}/reservations/${id}`,
        method: 'DELETE' as HttpMethod
      })
    },
    STAFF_LIST: { url: `${baseURL}/${API_PREFIX}/staffs`, method: 'GET' as HttpMethod },
    PROFILE: {
      RETRIEVE: { url: `${baseURL}/${API_PREFIX}/profile`, method: 'GET' as HttpMethod },
      UPDATE: { url: `${baseURL}/${API_PREFIX}/profile`, method: 'PATCH' as HttpMethod },
      DELETE: { url: `${baseURL}/${API_PREFIX}/profile`, method: 'DELETE' as HttpMethod },
      CREATED_STUDY: { url: `${baseURL}/${API_PREFIX}/profile/created-studies`, method: 'GET' as HttpMethod },
      JOINED_STUDY: { url: `${baseURL}/${API_PREFIX}/profile/joined-studies`, method: 'GET' as HttpMethod }
    }
  },
  AUTH: {
    LOGIN: { url: `${baseURL}/${API_PREFIX}/login`, method: 'POST' as HttpMethod },
    LOGOUT: { url: `${baseURL}/${API_PREFIX}/logout`, method: 'POST' as HttpMethod },
    REISSUE: { url: `${baseURL}/${API_PREFIX}/reissue`, method: 'POST' as HttpMethod },
    SIGNUP: { url: `${baseURL}/${API_PREFIX}/join`, method: 'POST' as HttpMethod }
  }
}

export const API_ENDPOINTS = JSP_ENDPOINTS
