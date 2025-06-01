import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ระบบเช็คชื่อนักเรียน',
  description: 'ระบบเช็คชื่อนักเรียนสำหรับครู',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pb-20 md:pb-8">
            {children}
          </div>
          <MobileBottomNav />
        </div>
      </body>
    </html>
  )
}
