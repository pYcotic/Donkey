import { createFileRoute, Outlet } from '@tanstack/react-router'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import Footer from '@/components/footer'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#C8C8D0] flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}