"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TimePickerProps {
  // Support both naming conventions
  time?: string;
  setTime?: (time: string) => void;
  // Alternative prop names for compatibility
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

// Helper function to safely parse time string
const parseTimeString = (timeString: string | undefined): { hours: string | undefined, minutes: string | undefined } => {
  if (!timeString || timeString === "") {
    return { hours: undefined, minutes: undefined };
  }
  
  try {
    // Try standard HH:mm:ss format
    const date = parse(timeString, "HH:mm:ss", new Date());
    return {
      hours: format(date, "HH"),
      minutes: format(date, "mm")
    };
  } catch (e) {
    // Try alternative HH:mm format
    try {
      const date = parse(timeString, "HH:mm", new Date());
      return {
        hours: format(date, "HH"),
        minutes: format(date, "mm")
      };
    } catch (e) {
      console.error("Could not parse time string:", timeString);
      return { hours: undefined, minutes: undefined };
    }
  }
};

export function TimePicker({
  time,
  setTime,
  value,
  onChange,
  className,
  placeholder = "Pick a time",
  disabled = false,
}: TimePickerProps) {
  // Use either time or value, preferring time if both are provided
  const currentTime = time !== undefined ? time : value;
  
  // Use either setTime or onChange, preferring setTime if both are provided
  const updateTime = React.useCallback((newTime: string) => {
    if (setTime) {
      setTime(newTime);
    } else if (onChange) {
      onChange(newTime);
    }
  }, [setTime, onChange]);

  // Parse the time string safely
  const { hours: initialHours, minutes: initialMinutes } = React.useMemo(
    () => parseTimeString(currentTime),
    [currentTime]
  );

  const [hours, setHours] = React.useState<string | undefined>(initialHours);
  const [minutes, setMinutes] = React.useState<string | undefined>(initialMinutes);

  // Update hours and minutes when currentTime changes
  React.useEffect(() => {
    const { hours: newHours, minutes: newMinutes } = parseTimeString(currentTime);
    setHours(newHours);
    setMinutes(newMinutes);
  }, [currentTime]);

  React.useEffect(() => {
    if (hours && minutes) {
      updateTime(`${hours}:${minutes}:00`);
    } else {
      // Use empty string instead of undefined to avoid type errors
      updateTime("");
    }
  }, [hours, minutes, updateTime]);

  // Format the display time safely
  const displayTime = React.useMemo(() => {
    if (!currentTime || currentTime === "") return null;
    
    try {
      // Try standard HH:mm:ss format
      return format(parse(currentTime, "HH:mm:ss", new Date()), "h:mm a");
    } catch (e) {
      // Try alternative HH:mm format
      try {
        return format(parse(currentTime, "HH:mm", new Date()), "h:mm a");
      } catch (e) {
        return currentTime; // Fallback to raw string if parsing fails
      }
    }
  }, [currentTime]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !currentTime && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime ? (
            displayTime
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex gap-2 items-end">
          <div className="grid gap-1">
            <div className="text-sm font-medium">Hour</div>
            <Select
              value={hours}
              onValueChange={setHours}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }).map((_, i) => (
                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <div className="text-sm font-medium">Minute</div>
            <Select
              value={minutes}
              onValueChange={setMinutes}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }).map((_, i) => (
                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => {
              setHours(undefined);
              setMinutes(undefined);
            }}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
