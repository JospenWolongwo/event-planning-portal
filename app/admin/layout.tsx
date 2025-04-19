"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/SupabaseProvider"
import { useAuth } from "@/hooks/useAuth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple check - if user exists, they can access admin
    if (user) {
      // User is authenticated, allow admin access
      setIsLoading(false);
    } else {
      // No user, redirect to login
      router.push('/auth?redirectTo=/admin');
    }
  }, [router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      {children}
    </div>
  )
}
