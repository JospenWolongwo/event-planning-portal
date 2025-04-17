'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { format, parse } from 'date-fns'
import { Event } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface EventFormProps {
  event?: Event
  onSubmit: (data: Partial<Event>) => void
  onCancel: () => void
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const { supabase, user } = useSupabase()
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [location, setLocation] = useState(event?.location || '')
  const [category, setCategory] = useState(event?.category || '')
  const [price, setPrice] = useState(event?.price?.toString() || '0')
  const [capacity, setCapacity] = useState(event?.capacity?.toString() || '50')
  const [eventDate, setEventDate] = useState<Date | undefined>(
    event?.event_date ? parse(event.event_date, 'yyyy-MM-dd', new Date()) : undefined
  )
  const [eventTime, setEventTime] = useState<string>(event?.event_time || '18:00')
  const [imageUrl, setImageUrl] = useState(event?.image_url || '')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('event_categories')
          .select('name')
          .order('name')

        if (error) throw error

        setCategories(data.map(cat => cat.name))
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [supabase])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      setUploading(true)
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath)

      setImageUrl(data.publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description || !location || !eventDate || !eventTime) {
      return
    }

    setLoading(true)

    const formattedDate = format(eventDate, 'yyyy-MM-dd')
    
    const eventData: Partial<Event> = {
      title,
      description,
      location,
      category,
      price: parseFloat(price),
      capacity: parseInt(capacity),
      event_date: formattedDate,
      event_time: eventTime,
      image_url: imageUrl,
      organizer_id: user?.id,
      status: 'active'
    }

    onSubmit(eventData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price (FCFA)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="event-date">Event Date</Label>
          <DatePicker
            id="event-date"
            date={eventDate}
            onSelect={setEventDate}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-time">Event Time</Label>
          <TimePicker
            value={eventTime}
            onChange={setEventTime}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Event Image</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {uploading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Event preview"
              className="h-40 w-auto object-cover rounded-md"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || uploading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Event'
          )}
        </Button>
      </div>
    </form>
  )
}
