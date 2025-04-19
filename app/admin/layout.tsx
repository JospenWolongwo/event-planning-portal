"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"

// Admin layout with no protection - any authenticated user can access
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No loading state needed since we're not checking authentication
  return (
    <div>
      {children}
    </div>
  )
}
