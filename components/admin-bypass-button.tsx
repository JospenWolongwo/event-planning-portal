'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { enableAdminBypass } from '@/lib/admin-bypass'

export default function AdminBypassButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAdminBypass = () => {
    setIsLoading(true)
    try {
      // Enable admin bypass
      enableAdminBypass()
      
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
