import { ApiEndpoint } from '@/constants/apiEndpoint'

export async function fetchData(route: ApiEndpoint, init?: RequestInit) {
  const requestInit: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      ...(init?.headers || {})
    },
    method: route.method,
    cache: 'no-store',
    next: {
      revalidate: 0
    },
    ...init
  }

  return await fetch(route.url, requestInit)
}
