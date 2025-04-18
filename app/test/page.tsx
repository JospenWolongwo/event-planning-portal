'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      <p className="mb-4">This is a simple test page to verify that the Next.js setup is working correctly.</p>
      <p className="mb-4">Page loaded: {isLoaded ? 'Yes' : 'No'}</p>
      <Button>Test Button</Button>
    </div>
  )
}
