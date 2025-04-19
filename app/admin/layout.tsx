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
  const { supabase } = useSupabase()
  const { user, session } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Redirect to login if no user
        if (!user) {
          router.push('/auth?redirectTo=/admin');
          return;
        }
        
        // For testing purposes, allow all authenticated users to access admin functionality
        console.log('User authenticated, granting admin access for testing');
        
        // Set admin status to true for any authenticated user
        const adminAccess = true;
        
        // User has admin access
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin access:", error);
        router.push("/");
      }
    }

    checkAdminAccess()
  }, [router, supabase, user])

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
