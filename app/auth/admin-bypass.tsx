'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function AdminBypass() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAdminBypass = async () => {
    setIsLoading(true)
    try {
      // Create a simple admin session object
      const adminSession = {
        user: {
          id: 'test-admin-id',
          email: 'admin@eventportal.com',
          role: 'admin',
          app_metadata: { role: 'admin' },
          user_metadata: { full_name: 'Test Admin' },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        },
        access_token: 'test-admin-token',
        refresh_token: 'test-admin-refresh',
        expires_at: Date.now() + 3600000
      }

      // Store in localStorage
      localStorage.setItem('admin-bypass-session', JSON.stringify(adminSession))
      
      // Set a flag to bypass normal auth checks
      localStorage.setItem('admin-bypass-active', 'true')
      
      toast({
        title: 'Admin access granted',
        description: 'You now have temporary admin access for testing',
      })
      
      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard'
    } catch (error) {
      console.error('Admin bypass error:', error)
      toast({
        title: 'Error',
        description: 'Failed to grant admin access',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="secondary"
      className="w-full"
      onClick={handleAdminBypass}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Shield className="mr-2 h-4 w-4" />
      )}
      Test as Admin
    </Button>
  )
}
