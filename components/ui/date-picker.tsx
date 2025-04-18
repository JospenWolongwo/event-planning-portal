"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date | undefined
  setDate?: (date: Date | undefined) => void
  // Alternative prop names for compatibility
  value?: Date | undefined
  onSelect?: (date: Date | undefined) => void
  onChange?: (date: Date | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function DatePicker({
  date,
  setDate,
  value,
  onSelect,
  onChange,
  className,
  placeholder = "Pick a date",
  disabled = false,
  id,
}: DatePickerProps) {
  // Use either date or value, preferring date if both are provided
  const currentDate = date !== undefined ? date : value;
  
  // Use either setDate, onSelect, or onChange, preferring in that order
  const updateDate = React.useCallback((newDate: Date | undefined) => {
    if (setDate) {
      setDate(newDate);
    } else if (onSelect) {
      onSelect(newDate);
    } else if (onChange) {
      onChange(newDate);
    }
  }, [setDate, onSelect, onChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !currentDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {currentDate ? format(currentDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background" align="start">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={updateDate}
          initialFocus
          className="border-none shadow-none"
        />
      </PopoverContent>
    </Popover>
  )
}
