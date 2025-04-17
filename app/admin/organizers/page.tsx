"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/providers/SupabaseProvider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Users } from "lucide-react"

interface OrganizerProfile {
  id: string
  full_name: string
  phone: string
  avatar_url?: string
  role: string
  created_at: string
  events_count: number
  status?: string
}

export default function AdminOrganizersPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    checkAdminAccess()
    loadOrganizers()
  }, [])

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || data?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive"
      })
      router.push('/')
    }
  }

  const loadOrganizers = async () => {
    setLoading(true)
    try {
      // Get all admin users
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          avatar_url,
          role,
          created_at
        `)
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Get event counts for each organizer
      const organizersWithEventCounts = await Promise.all(
        data.map(async (organizer) => {
          const { count } = await supabase
            .from('events')
            .select('*', { count: 'exact' })
            .eq('organizer_id', organizer.id)

          return {
            ...organizer,
            events_count: count || 0,
            status: 'active' // Default status
          }
        })
      )

      setOrganizers(organizersWithEventCounts)
    } catch (error) {
      console.error('Error loading organizers:', error)
      toast({
        title: "Error",
        description: "Failed to load organizers. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteToOrganizer = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User has been promoted to organizer.",
      })
      
      loadOrganizers()
    } catch (error) {
      console.error('Error promoting user:', error)
      toast({
        title: "Error",
        description: "Failed to promote user. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRemoveOrganizer = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Organizer privileges have been revoked.",
      })
      
      loadOrganizers()
    } catch (error) {
      console.error('Error removing organizer:', error)
      toast({
        title: "Error",
        description: "Failed to remove organizer. Please try again.",
        variant: "destructive"
      })
    }
  }

  const filteredOrganizers = organizers.filter(organizer => {
    // Filter by search query
    if (searchQuery && !organizer.full_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filter by tab
    if (activeTab === 'active' && organizer.status !== 'active') {
      return false
    }
    if (activeTab === 'inactive' && organizer.status !== 'inactive') {
      return false
    }
    
    return true
  })

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Organizers</h1>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search organizers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={() => router.push('/admin/users')}>
          Promote User to Organizer
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Organizers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <p>Loading organizers...</p>
          </div>
        ) : filteredOrganizers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10">
            <p className="text-muted-foreground mb-4">No organizers found</p>
            <Button onClick={() => router.push('/admin/users')}>
              Promote User to Organizer
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizers.map((organizer) => (
                <TableRow key={organizer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={organizer.avatar_url || ''} alt={organizer.full_name} />
                        <AvatarFallback>
                          {organizer.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{organizer.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{organizer.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{organizer.events_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={organizer.status === 'active' ? 'default' : 'secondary'}>
                      {organizer.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(organizer.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/organizers/${organizer.id}`)}
                      >
                        View
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Organizer Privileges</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will revoke admin privileges from {organizer.full_name}. They will no longer be able to create or manage events. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveOrganizer(organizer.id)}
                            >
                              Remove Privileges
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
