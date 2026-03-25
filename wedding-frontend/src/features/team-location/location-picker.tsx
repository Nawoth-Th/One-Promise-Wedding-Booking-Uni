"use client"

import { useState, useEffect } from "react"
import { Globe, MapPin, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SRI_LANKA_PROVINCES } from "@/lib/sri-lanka"
import { api } from "@/lib/api"

interface LocationValue {
  name: string
  url?: string
  forEvent?: string
  mode?: "library" | "manual"
  province?: string
  district?: string
}

interface LocationPickerProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [libraryLocations, setLibraryLocations] = useState<any[]>([])

  useEffect(() => {
    api.getLocations()
      .then(setLibraryLocations)
      .catch(err => console.error("Failed to fetch library locations:", err))
  }, [])

  const handleUpdate = (updates: Partial<LocationValue>) => {
    onChange({ ...value, ...updates })
  }

  const currentProvince = SRI_LANKA_PROVINCES.find(p => p.name === value.province)
  const districts = currentProvince?.districts || []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Entry Mode */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Entry Mode</label>
          <div className="flex bg-muted p-1 rounded-md h-9">
            <button
              type="button"
              className={`flex-1 text-xs rounded-sm transition-all ${value.mode === 'library' ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}`}
              onClick={() => handleUpdate({ mode: 'library', name: '', url: '', province: '', district: '' })}
            >
              Library
            </button>
            <button
              type="button"
              className={`flex-1 text-xs rounded-sm transition-all ${value.mode === 'manual' ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}`}
              onClick={() => handleUpdate({ mode: 'manual', name: '', url: '', province: '', district: '' })}
            >
              Manual
            </button>
          </div>
        </div>

        {/* For Event */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">For Event</label>
          <Select 
            value={value.forEvent || "Wedding"} 
            onValueChange={(val) => handleUpdate({ forEvent: val })}
          >
            <SelectTrigger className="bg-background h-9">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Homecoming">Homecoming</SelectItem>
              <SelectItem value="Engagement">Engagement</SelectItem>
              <SelectItem value="Pre-Shoot">Pre-Shoot</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden md:block"></div>

        {value.mode === 'library' ? (
          <>
            {/* Province */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Province</label>
              <Select 
                value={value.province || ""} 
                onValueChange={(val) => handleUpdate({ province: val, district: '', name: '', url: '' })}
              >
                <SelectTrigger className="bg-background h-9 text-xs">
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  {SRI_LANKA_PROVINCES.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">District</label>
              <Select 
                value={value.district || ""} 
                onValueChange={(val) => handleUpdate({ district: val, name: '', url: '' })}
                disabled={!value.province}
              >
                <SelectTrigger className="bg-background h-9 text-xs">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Venue */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Venue</label>
              <Select 
                value={value.name || ""} 
                onValueChange={(val) => {
                  const loc = libraryLocations.find(l => l.name === val)
                  handleUpdate({ name: val, url: loc?.googleMapLink || "" })
                }}
                disabled={!value.district}
              >
                <SelectTrigger className="bg-background h-9 text-xs">
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent>
                  {libraryLocations
                    .filter(l => l.province === value.province && l.district === value.district)
                    .map(l => <SelectItem key={l._id} value={l.name}>{l.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            {/* Manual Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Location Name</label>
              <Input 
                placeholder="Enter venue name" 
                value={value.name || ""} 
                onChange={(e) => handleUpdate({ name: e.target.value })} 
                className="bg-background h-9 text-xs"
              />
            </div>

            {/* Manual URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Google Map Link</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="https://maps.google.com/..." 
                  value={value.url || ""} 
                  onChange={(e) => handleUpdate({ url: e.target.value })} 
                  className="pl-9 bg-background h-9 text-xs"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {value.url && (
        <div className="flex items-center gap-2 text-[10px] text-primary bg-primary/5 p-1 px-2 rounded-md w-fit border border-primary/20">
          <MapPin className="h-3 w-3" />
          <a href={value.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 font-medium">
            Google Map Link Attached <ExternalLink className="h-2 w-2" />
          </a>
        </div>
      )}
    </div>
  )
}
