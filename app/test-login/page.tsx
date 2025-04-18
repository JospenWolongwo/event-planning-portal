'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { TEST_CREDENTIALS } from '@/lib/test-auth'
import { Shield, User, Loader2 } from 'lucide-react'

export default function TestLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithCredentials } = useAuth()
  const { toast } = useToast()

  const handleTestLogin = async (role: 'admin' | 'user') => {
    setIsLoading(true)
    try {
      const credentials = role === 'admin' 
        ? TEST_CREDENTIALS.ADMIN 
        : TEST_CREDENTIALS.USER

      const { error } = await signInWithCredentials(
        credentials.email,
        credentials.password
      )

      if (error) {
        throw new Error(error)
      }

      toast({
        title: 'Test login successful',
        description: `You are now logged in as a test ${role}`,
      })
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Test Login</CardTitle>
          <CardDescription className="text-center">
            Access the application with test credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="admin">Admin Credentials</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="admin"
                  value={TEST_CREDENTIALS.ADMIN.email}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => handleTestLogin('admin')}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  Login as Admin
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Provides access to admin dashboard and all admin features
              </p>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="user">Regular User Credentials</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="user"
                  value={TEST_CREDENTIALS.USER.email}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => handleTestLogin('user')}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  Login as User
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Regular user access with standard permissions
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground mt-2">
            This page is for testing purposes only. No password required.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
