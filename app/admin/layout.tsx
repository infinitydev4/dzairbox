"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex">
        <AdminSidebar 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        <main className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-8">
            <AdminBreadcrumb />
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
} 