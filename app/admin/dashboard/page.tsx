'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Calendar, Users, BarChart3, Clock, AlertCircle, Settings, PlusCircle } from 'lucide-react'
import { isAdmin } from '@/lib/utils/admin'
import { isAdminBypassActive, getAdminTestUser } from '@/lib/admin-bypass'

export default function AdminDashboard() {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
  })

  useEffect(() => {
    const checkAdmin = async () => {
      // First check for admin bypass - this is the simplest and most direct check
      if (isAdminBypassActive()) {
        console.log('Admin bypass active in dashboard, granting access')
        setLoading(false)
        
        // Load some placeholder stats for testing
        setStats({
          totalEvents: 12,
          activeEvents: 8,
          totalUsers: 45,
          totalRegistrations: 67,
        })
        return
      }

      if (!user) {
        router.push('/auth?redirectTo=/admin/dashboard')
        return
      }

      // Check if user is admin
      if (!isAdmin(user)) {
        router.push('/')
        return
      }

      // Fetch dashboard stats
      try {
        const [eventsResponse, activeEventsResponse, usersResponse, registrationsResponse] = await Promise.all([
          supabase.from('events').select('id', { count: 'exact' }),
          supabase.from('events').select('id', { count: 'exact' }).eq('status', 'active'),
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('event_registrations').select('id', { count: 'exact' }),
        ])

        setStats({
          totalEvents: eventsResponse.count || 0,
          activeEvents: activeEventsResponse.count || 0,
          totalUsers: usersResponse.count || 0,
          totalRegistrations: registrationsResponse.count || 0,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [supabase, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your event portal platform</p>
        </div>
        <Button onClick={() => router.push('/admin/events')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEvents} active events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Platform users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Event registrations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Welcome to the admin dashboard!</AlertTitle>
            <AlertDescription>
              This is where you can manage all aspects of your Event Portal platform.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => router.push('/admin/events')}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/users')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/admin/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>All systems operational</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <span className="flex items-center text-green-500">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authentication</span>
                    <span className="flex items-center text-green-500">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage</span>
                    <span className="flex items-center text-green-500">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      Online
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Account</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                Create and manage events on your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>This section will allow you to manage all events on the platform.</p>
              <Button onClick={() => router.push('/admin/events')}>
                Go to Event Management
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>This section will allow you to manage users and their permissions.</p>
              <Button onClick={() => router.push('/admin/users')}>
                Go to User Management
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure your Event Portal platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>This section will allow you to configure platform-wide settings.</p>
              <Button onClick={() => router.push('/admin/settings')}>
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
