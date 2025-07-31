"use client"

import type React from "react"

import { useAuth } from "@/components/providers"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
  userRole?: string
}

export function MainLayout({ children, userRole }: MainLayoutProps) {
  const { loading, isSupabaseConfigured } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {!isSupabaseConfigured && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Demo Mode:</strong> Supabase is not configured. Add your Supabase environment variables to
                enable full functionality.
                <br />
                <code className="text-xs bg-yellow-100 px-1 py-0.5 rounded mt-1 inline-block">
                  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>
              </AlertDescription>
            </Alert>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
