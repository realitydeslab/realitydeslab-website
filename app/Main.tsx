'use client'
// import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function Main({ children }: { children: ReactNode }) {
  return (
    <main className="x-main flex flex-1 flex-col overflow-y-auto p-5 !pb-0 lg:p-10">
      {children}
    </main>
  )
}
