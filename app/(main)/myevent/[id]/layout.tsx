import React from 'react'

const MyEventDetailLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main className="w-full">
        <section className="mx-auto flex max-w-7xl px-4 pb-12 pt-[18px] max-sm:flex-col sm:px-8 sm:pb-16 sm:pt-8">
          {children}
        </section>
      </main>
    </>
  )
}

export default MyEventDetailLayout
