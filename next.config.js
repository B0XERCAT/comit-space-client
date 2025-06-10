/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'ufxqvhvxvxvxvxvx.supabase.co'
      },
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_SUPABASE_REFRENCE_ID}.supabase.co`,
        pathname: '/**'
      }
    ]
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: '*' }
        ]
      }
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader'
    })
    return config
  },
  staticPageGenerationTimeout: 1000,
  experimental: {
    workerThreads: true,
    cpus: 4
  },
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

// 전역 fetch 캐시 설정
const fetchConfig = {
  fetchCache: false,
  revalidate: 0,
  runtime: 'nodejs'
}

module.exports = {
  ...nextConfig,
  ...fetchConfig
}
