"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Settings, BarChart, CreditCard, User } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()

  const adminModules = [
    {
      title: "Event Management",
      description: "Create and manage events on the platform",
      icon: Calendar,
      href: "/admin/events",
    },
    {
      title: "Organizer Management",
      description: "Review and manage event organizers",
      icon: Users,
      href: "/admin/organizers",
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: User,
      href: "/admin/users",
    },
    {
      title: "Payment Management",
      description: "Track and manage event payments",
      icon: CreditCard,
      href: "/admin/payments",
    },
    {
      title: "Analytics",
      description: "View platform statistics and reports",
      icon: BarChart,
      href: "/admin/analytics",
    },
    {
      title: "Settings",
      description: "Configure platform settings",
      icon: Settings,
      href: "/admin/settings",
    }
  ]

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your event platform and users from here.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminModules.map((module) => (
          <Card
            key={module.title}
            className="p-6 hover:bg-accent transition-colors cursor-pointer"
            onClick={() => router.push(module.href)}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <module.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{module.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
